// This is a simple in-memory cache to simulate a database for the prototype.
// Data will be lost on server restart.

import type { PracticeSession, PracticeQuestion } from './types';

const sessionCache = new Map<string, PracticeSession>();

export function getSession(id: string): PracticeSession | undefined {
  return sessionCache.get(id);
}

export function createSession(id: string, data: Omit<PracticeSession, 'id' | 'userAnswers' | 'status' | 'startTime'>): PracticeSession {
  const sessionData: PracticeSession = {
    ...data,
    id,
    userAnswers: {},
    status: 'ongoing',
    startTime: Date.now(),
  };
  sessionCache.set(id, sessionData);
  return sessionData;
}

export function updateSession(id: string, updates: Partial<PracticeSession>): PracticeSession | undefined {
    const session = sessionCache.get(id);
    if (!session) {
        return undefined;
    }
    const updatedSession = { ...session, ...updates };
    sessionCache.set(id, updatedSession);
    return updatedSession;
}
