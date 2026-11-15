import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Syncs verified Google Account user profile into isolated Firestore document.
 */
export async function syncGoogleUserProfile(user: User): Promise<void> {
  if (!user || !user.uid) return;
  const resolvedEmail = (
    user.email ||
    user.providerData?.find((p) => p.email)?.email ||
    ''
  ).slice(0, 254);
  if (resolvedEmail.length < 3) return;

  const profilePath = `users/${user.uid}/private/profile`;
  const profileRef = doc(db, 'users', user.uid, 'private', 'profile');

  try {
    const existingSnap = await getDoc(profileRef).catch(() => null);
    const displayName = (user.displayName || resolvedEmail.split('@')[0] || 'Google User').slice(0, 120);
    const photoURL = (user.photoURL || '').slice(0, 512);

    if (existingSnap && existingSnap.exists()) {
      await setDoc(
        profileRef,
        {
          email: resolvedEmail,
          displayName,
          ...(photoURL ? { photoURL } : {}),
          role: existingSnap.data()?.role || 'Verified Google Strategist',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await setDoc(profileRef, {
        uid: user.uid,
        email: resolvedEmail,
        displayName,
        ...(photoURL ? { photoURL } : {}),
        role: 'Verified Google Strategist',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

/**
 * Authentic Google Sign-In via Firebase Auth Server (open to all Google accounts).
 */
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  if (!credential.user) {
    throw new Error('Autentikasi Google tidak mengembalikan data akun.');
  }
  syncGoogleUserProfile(credential.user).catch((err) => {
    console.warn('Firestore profile sync skipped/deferred:', err);
  });
  return credential.user;
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

// =========================================================================
// MULTI-USER REAL-TIME ROOM CHAT (CLOUD FIRESTORE)
// =========================================================================
export type ChatRoomId = 'general' | 'btc-alpha' | 'altcoins' | 'macro-fed';

export interface ChatRoomMeta {
  id: ChatRoomId;
  label: string;
  tag: string;
  description: string;
}

export const CHAT_ROOMS: ChatRoomMeta[] = [
  {
    id: 'general',
    label: 'General Lounge',
    tag: 'GLOBAL',
    description: 'Diskusi terbuka lintas semua trader & pengguna GHALI ON CHAIN',
  },
  {
    id: 'btc-alpha',
    label: 'Bitcoin & Cycle',
    tag: 'BTC',
    description: 'Analisis struktur siklus BTC, likuiditas spot ETF, dan arah makro',
  },
  {
    id: 'altcoins',
    label: 'Altcoin 5M & Movers',
    tag: 'ALTS',
    description: 'Pantauan rotasi altcoin, long/short squeeze, dan momentum 5M',
  },
  {
    id: 'macro-fed',
    label: 'Macro News Desk',
    tag: 'MACRO',
    description: 'Bahas berita FOMC, suku bunga Fed, DXY, inflasi CPI, & crypto 24J',
  },
];

export interface ChatMessageRecord {
  id: string;
  roomId: ChatRoomId;
  senderUid: string;
  senderName: string;
  senderEmail?: string;
  senderPhoto?: string;
  senderRole?: string;
  text: string;
  createdAtMs: number;
}

export function subscribeRoomMessages(
  roomId: ChatRoomId,
  onMessages: (messages: ChatMessageRecord[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }

  const messagesPath = `chatRooms/${roomId}/messages`;
  const q = query(
    collection(db, 'chatRooms', roomId, 'messages'),
    where('createdAtMs', '>', 0),
    orderBy('createdAtMs', 'desc'),
    limit(80)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ChatMessageRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && typeof d.text === 'string' && typeof d.senderUid === 'string') {
          items.push({
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            roomId: (d.roomId as ChatRoomId) || roomId,
            senderUid: d.senderUid,
            senderName: typeof d.senderName === 'string' ? d.senderName : 'Trader',
            ...(typeof d.senderEmail === 'string' ? { senderEmail: d.senderEmail } : {}),
            ...(typeof d.senderPhoto === 'string' ? { senderPhoto: d.senderPhoto } : {}),
            ...(typeof d.senderRole === 'string' ? { senderRole: d.senderRole } : {}),
            text: d.text,
            createdAtMs: typeof d.createdAtMs === 'number' ? d.createdAtMs : Date.now(),
          });
        }
      });
      items.sort((a, b) => a.createdAtMs - b.createdAtMs);
      onMessages(items);
    },
    (error) => {
      console.warn(`Firestore Room Chat listener warning (${messagesPath}):`, error?.message || error);
      onError?.(error);
    }
  );
}

export async function sendFirestoreChatMessage(msg: ChatMessageRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const messagePath = `chatRooms/${msg.roomId}/messages/${msg.id}`;
  const msgRef = doc(db, 'chatRooms', msg.roomId, 'messages', msg.id);

  try {
    await setDoc(msgRef, {
      id: msg.id,
      roomId: msg.roomId,
      senderUid: user.uid,
      senderName: msg.senderName.slice(0, 120),
      ...(msg.senderEmail ? { senderEmail: msg.senderEmail.slice(0, 254) } : {}),
      ...(msg.senderPhoto ? { senderPhoto: msg.senderPhoto.slice(0, 512) } : {}),
      ...(msg.senderRole ? { senderRole: msg.senderRole.slice(0, 80) } : {}),
      text: msg.text.slice(0, 1000),
      createdAtMs: msg.createdAtMs,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, messagePath);
  }
}

export async function deleteFirestoreChatMessage(roomId: ChatRoomId, messageId: string): Promise<void> {
  if (!auth.currentUser) return;
  const messagePath = `chatRooms/${roomId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'chatRooms', roomId, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, messagePath);
  }
}
