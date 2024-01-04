import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

import {
  firebaseApiKey,
  firebaseAppId,
  firebaseAuthDomain,
  firebaseMeasurementId,
  firebaseMessagingSenderId,
  firebaseProjectId,
  firebaseStorageBucket,
} from '../utils/constants';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId,
};

// Initialize Firebase
export const firebaseInit = initializeApp(firebaseConfig);
export const storage = getStorage(firebaseInit);
