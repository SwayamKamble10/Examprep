// This is a simple in-memory cache to simulate a database for the prototype.
// Data will be lost on server restart. This is being replaced by firestore implementation.
// This file is kept for type reference but is no longer actively used for session storage.

import type { PracticeSession } from './types';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

// A server-side only utility to get an admin-authenticated firestore instance.
function getAdminFirestore() {
    const { firestore } = getSdks();
    return firestore;
}

export async function getSession(id: string, userId: string): Promise<PracticeSession | undefined> {
  const firestore = getAdminFirestore();
  const sessionRef = doc(firestore, 'users', userId, 'practiceSessions', id);
  const docSnap = await getDoc(sessionRef);

  if (docSnap.exists()) {
    // We need to handle the server timestamp
    const data = docSnap.data();
    const session: PracticeSession = {
      ...data,
      id: docSnap.id,
      startTime: data.startTime,
      createdAt: data.createdAt?.toDate()?.getTime() || Date.now(), // Convert timestamp
    } as PracticeSession;
    return session;
  }
  return undefined;
}
