
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Note: These NEXT_PUBLIC_ prefixed variables are now expected to be defined
// directly with these names in your apphosting.yaml for deployed environments,
// or in your local .env file for local development.

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
  // This error will be thrown if essential Firebase config is missing during build/runtime
  // It should provide a clearer message in the build logs if this is the cause of failure.
  throw new Error(
    `Firebase initialization failed: Missing required environment variables: ${missingVars.join(', ')}. ` +
    `Please ensure these are correctly defined in your apphosting.yaml with 'BUILD' and 'RUNTIME' availability, ` +
    `and that your local .env file is correctly populated if running locally.`
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

// IMPORTANT: For Firestore to work correctly, especially with client-side operations,
// you MUST set up appropriate Firestore Security Rules in your Firebase project console.
// Example (restrictive, for user-specific data):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Users can only read/write their own documents in the 'users' collection
//     match /users/{userId}/{document=**} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//     // Activity and AI analysis data also restricted to the owner
//     match /users/{userId}/activities/{activityId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//     match /users/{userId}/aiAnalyses/{analysisId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
// If you are not using Firebase Authentication, your security rules will need to be
// adapted to your custom authentication mechanism or be more permissive (NOT recommended for production).

export { app, db, storage };
