'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore'

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeServices() {
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic initialization failed, falling back to config.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}


// A server-side only utility to get an admin-authenticated firestore instance.
export function getSdks() {
    if (!firestore) {
        initializeServices();
    }
    return { auth, firestore, firebaseApp };
}

export function initializeFirebase() {
    if (firestore) {
        return {firebaseApp, auth, firestore}
    }
    return initializeServices();
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
