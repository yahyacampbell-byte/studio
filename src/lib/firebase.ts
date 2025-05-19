
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

let firebaseConfig: FirebaseOptions | null = null;
let initializationError: string | null = null;

// Prioritize individual NEXT_PUBLIC_ variables.
// These should be automatically inlined by Next.js if available in process.env at build time.
const requiredEnvVars: (keyof NodeJS.ProcessEnv)[] = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  // NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is optional for core SDK initialization
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  initializationError = 
    `Firebase initialization failed: Missing required environment variables: ${missingVars.join(', ')}. ` +
    `Please ensure these are correctly defined in your apphosting.yaml with 'BUILD' and 'RUNTIME' availability, ` +
    `and that your local .env file is correctly populated if running locally.`;
} else {
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  console.log("Firebase configured using individual NEXT_PUBLIC_ variables.");
}


if (initializationError && !firebaseConfig) {
  // If we have an error and firebaseConfig is still not set, throw the error.
  throw new Error(initializationError);
}

if (!firebaseConfig) {
  // This case should ideally not be reached if the above logic is sound,
  // but acts as a final guard.
  throw new Error("Firebase configuration could not be determined. Check environment variables and apphosting.yaml.");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig as FirebaseOptions);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
