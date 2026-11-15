import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Trash2,
  Hash,
  ShieldCheck,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { UserSession } from '../types/news';
import {
  auth,
  CHAT_ROOMS,
  ChatMessageRecord,
  ChatRoomId,
  deleteFirestoreChatMessage,
  sendFirestoreChatMessage,
  subscribeRoomMessages,
} from '../firebase';
import { sound } from '../audio/soundEngine';

interface OnlineParticipant {
  uid: string;
  name: string;
  role: string;
  photo: string;
}

interface RoomChatViewProps {
  session: UserSession;
}

function formatWibClock(ms: number): string {
  try {
    return (
      new Date(ms).toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' WIB'
    );
  } catch {
    return '--:-- WIB';
  }
}

export const RoomChatView: React.FC<RoomChatViewProps> = ({ session }) => {
  const [activeRoom, setActiveRoom] = useState<ChatRoomId>('general');
  const [sseMessages, setSseMessages] = useState<ChatMessageRecord[]>([]);
  const [firestoreMessages, setFirestoreMessages] = useState<ChatMessageRecord[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [onlineUsers, setOnlineUsers] = useState<OnlineParticipant[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentRoomMeta = useMemo(
    () => CHAT_ROOMS.find((r) => r.id === activeRoom) || CHAT_ROOMS[0],
    [activeRoom]
  );

  // Merge SSE & Firestore messages idempotently by id
  const mergedMessages = useMemo(() => {
    const map = new Map<string, ChatMessageRecord>();
    for (const m of firestoreMessages) {
      if (!deletedIds.has(m.id)) {
        map.set(m.id, m);
      }
    }
    for (const m of sseMessages) {
      if (!deletedIds.has(m.id)) {
        map.set(m.id, m);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.createdAtMs - b.createdAtMs);
  }, [sseMessages, firestoreMessages, deletedIds]);

  // Subscribe to real-time SSE + REST fallback for the active room
  useEffect(() => {
    if (!session.uid) return;
    let cancelled = false;
    setLoadingInitial(true);
    setSseMessages([]);
    setFirestoreMessages([]);
    setDeletedIds(new Set());
    setOnlineUsers([]);
    setErrorMsg(null);

    const fetchInitialSnapshot = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.success) {
          if (Array.isArray(data.messages)) {
            setSseMessages(data.messages);
          }
          if (Array.isArray(data.onlineUsers)) {
            setOnlineUsers(data.onlineUsers);
          }
        }
      } catch {
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    };

    fetchInitialSnapshot();

    const params = new URLSearchParams({
      roomId: activeRoom,
      uid: session.uid,
      name: session.traderName || 'Trader',
      role: session.role || 'Verified Strategist',
      photo: session.photoURL || '',
    });

    const es = new EventSource(`/api/chat/stream?${params.toString()}`);

    es.onopen = () => {
      if (!cancelled) setSseConnected(true);
    };

    es.addEventListener('init', (ev: MessageEvent) => {
      if (cancelled) return;
      try {
        const payload = JSON.parse(ev.data);
        if (Array.isArray(payload.messages)) {
          setSseMessages(payload.messages);
        }
        if (Array.isArray(payload.onlineUsers)) {
          setOnlineUsers(payload.onlineUsers);
        }
        setSseConnected(true);
        setLoadingInitial(false);
      } catch {}
    });

    es.addEventListener('presence', (ev: MessageEvent) => {
      if (cancelled) return;
      try {
        const payload = JSON.parse(ev.data);
        if (Array.isArray(payload.onlineUsers)) {
          setOnlineUsers(payload.onlineUsers);
        }
      } catch {}
    });

    es.addEventListener('message', (ev: MessageEvent) => {
      if (cancelled) return;
      try {
        const msg = JSON.parse(ev.data) as ChatMessageRecord;
        setSseMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {}
    });

    es.addEventListener('delete', (ev: MessageEvent) => {
      if (cancelled) return;
      try {
        const payload = JSON.parse(ev.data);
        if (payload?.id) {
          setDeletedIds((prev) => {
            const next = new Set(prev);
            next.add(payload.id);
            return next;
          });
          setSseMessages((prev) => prev.filter((m) => m.id !== payload.id));
        }
      } catch {}
    });

    es.onerror = () => {
      if (!cancelled) {
        setSseConnected(false);
      }
    };

    // Attach Firestore real-time subscription if signed in via Google Auth
    const unsubscribeFirestore = auth.currentUser
      ? subscribeRoomMessages(
          activeRoom,
          (items) => {
            if (!cancelled) {
              setFirestoreMessages(items);
              setLoadingInitial(false);
            }
          },
          () => {}
        )
      : () => {};

    return () => {
      cancelled = true;
      setSseConnected(false);
      es.close();
      unsubscribeFirestore();
    };
  }, [activeRoom, session.uid, session.traderName, session.role, session.photoURL]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mergedMessages.length, activeRoom]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = draft.trim();
    if (!cleanText || sending || !session.uid) return;

    setSending(true);
    setErrorMsg(null);

    const newMessage: ChatMessageRecord = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      roomId: activeRoom,
      senderUid: session.uid,
      senderName: session.traderName || 'Trader',
      ...(session.email ? { senderEmail: session.email } : {}),
      ...(session.photoURL ? { senderPhoto: session.photoURL } : {}),
      ...(session.role ? { senderRole: session.role } : {}),
      text: cleanText.slice(0, 1000),
      createdAtMs: Date.now(),
    };

    setDraft('');
    setSseMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Gagal mengirim pesan ke server.');
      }

      if (auth.currentUser) {
        sendFirestoreChatMessage(newMessage).catch((err) => {
          console.warn('Firestore chat write skipped/deferred:', err);
        });
      }
      sound.playClick(1100);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim pesan. Coba lagi.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msg: ChatMessageRecord) => {
    if (!session.uid) return;
    const canDelete = msg.senderUid === session.uid || session.uid === 'owner-120403';
    if (!canDelete) return;

    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(msg.id);
      return next;
    });
    setSseMessages((prev) => prev.filter((m) => m.id !== msg.id));

    try {
      await fetch(
        `/api/chat/messages/${encodeURIComponent(msg.id)}?roomId=${encodeURIComponent(
          activeRoom
        )}&senderUid=${encodeURIComponent(session.uid)}`,
        { method: 'DELETE' }
      );
      if (auth.currentUser && msg.senderUid === auth.currentUser.uid) {
        await deleteFirestoreChatMessage(activeRoom, msg.id).catch(() => {});
      }
    } catch {
      setErrorMsg('Gagal menghapus pesan.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const effectiveOnlineList = useMemo(() => {
    if (onlineUsers.length > 0) return onlineUsers;
    if (!session.uid) return [];
    return [
      {
        uid: session.uid,
        name: session.traderName || 'Trader',
        role: session.role || 'Verified Strategist',
        photo: session.photoURL || '',
      },
    ];
  }, [onlineUsers, session]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#060911] text-slate-200 overflow-hidden font-mono">
      {/* Left Room Selector & Active Participants */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#080c16] border-b lg:border-b-0 lg:border-r border-[#182338] flex flex-col max-h-[210px] lg:max-h-full overflow-hidden">
        <div className="p-3.5 border-b border-[#182338] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-amber-200">
              ROOM CHAT DESK
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
              sseConnected
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                : 'bg-amber-950/70 text-amber-300 border-amber-700/50'
            }`}
          >
            <Radio className="w-2.5 h-2.5" />
            {sseConnected ? 'LIVE SYNC' : 'CONNECTING'}
          </span>
        </div>

        {/* Rooms List */}
        <div className="p-2.5 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto shrink-0">
          {CHAT_ROOMS.map((room) => {
            const isActive = activeRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => {
                  sound.playClick();
                  setActiveRoom(room.id);
                }}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 min-w-[165px] lg:min-w-0 ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-400/60 text-white shadow-md'
                    : 'bg-[#0c1220]/80 border-[#182338] text-slate-300 hover:bg-[#11192c] hover:border-[#263756]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                    <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{room.label}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#152036] text-slate-400'
                    }`}
                  >
                    {room.tag}
                  </span>
                </div>
                <p className="hidden lg:block text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {room.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Online Participants (Desktop) */}
        <div className="hidden lg:flex flex-col flex-1 min-h-0 border-t border-[#182338] p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pengguna Aktif</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              {effectiveOnlineList.length} ONLINE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {effectiveOnlineList.map((u) => {
              const isOwner = u.uid === 'owner-120403' || u.role === 'Terminal Owner';
              return (
                <div
                  key={u.uid}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0c1220] border border-[#182338]"
                >
                  {u.photo ? (
                    <img
                      src={u.photo}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-amber-400/50 shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isOwner ? 'bg-amber-400 text-black' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {u.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-100 truncate">
                        {u.name}
                      </span>
                      {u.uid === session.uid && (
                        <span className="text-[9px] text-amber-300">(Anda)</span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] uppercase tracking-wider block truncate ${
                        isOwner ? 'text-amber-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {isOwner ? 'OWNER' : 'GOOGLE USER'}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#060911]">
        {/* Room Header */}
        <div className="px-4 py-3 border-b border-[#182338] bg-[#090e1a] flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-sm font-bold text-white truncate">
                {currentRoomMeta.label}
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141f35] text-amber-300 border border-amber-500/30 font-bold">
                {currentRoomMeta.tag}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {currentRoomMeta.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1526] border border-[#1d2c48] text-slate-200">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{effectiveOnlineList.length}</span>
              <span className="hidden sm:inline text-slate-400">Online</span>
            </span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {loadingInitial && mergedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              <span>Memuat percakapan room...</span>
            </div>
          ) : mergedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-11 h-11 rounded-2xl bg-[#0e1628] border border-[#1d2b45] flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                Belum ada pesan di #{currentRoomMeta.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                Mulai diskusi real-time bersama sesama pengguna Google & Trader GHALI ON CHAIN di sini.
              </p>
            </div>
          ) : (
            mergedMessages.map((msg) => {
              const isMine = msg.senderUid === session.uid;
              const isOwnerMsg = msg.senderUid === 'owner-120403' || msg.senderRole === 'Terminal Owner';
              const canDelete = isMine || session.uid === 'owner-120403';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 group ${
                    isMine ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  {msg.senderPhoto ? (
                    <img
                      src={msg.senderPhoto}
                      alt={msg.senderName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-amber-400/50 shrink-0 mt-0.5"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isOwnerMsg
                          ? 'bg-amber-400 text-black'
                          : 'bg-[#152238] text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {msg.senderName.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 border ${
                      isMine
                        ? 'bg-[#172136] border-amber-500/40 text-slate-100'
                        : 'bg-[#0b111e] border-[#1b2840] text-slate-200'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 flex-wrap mb-1 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white">
                        {msg.senderName}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                          isOwnerMsg
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isOwnerMsg && <ShieldCheck className="w-2.5 h-2.5" />}
                        {isOwnerMsg ? 'OWNER' : 'GOOGLE'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatWibClock(msg.createdAtMs)}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMessage(msg)}
                          title="Hapus pesan"
                          className="opacity-70 hover:opacity-100 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error Toast */}
        {errorMsg && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-200 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 border-t border-[#182338] bg-[#080c16] shrink-0"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Kirim pesan ke #${currentRoomMeta.label} sebagai ${session.traderName || 'Trader'}... (Enter untuk kirim)`}
              rows={1}
              maxLength={1000}
              className="flex-1 bg-[#0c1220] border border-[#22314d] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none resize-none max-h-28 font-sans"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-[#1a2438] disabled:text-slate-500 text-black font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>KIRIM</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
