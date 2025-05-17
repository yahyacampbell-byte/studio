
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { getAuth } from 'firebase/auth'; // Not used for user creation/login in this iteration

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
// const auth = getAuth(app); // Export if using Firebase Auth for login/signup

// IMPORTANT: For a production application, configure Firestore Security Rules
// in your Firebase console to ensure users can only access their own data.
// Example rules for the 'users' collection might look like:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//       match /activities/{activityId} {
//         allow read, write: if request.auth != null && request.auth.uid == userId;
//       }
//       match /aiAnalyses/{analysisId} {
//         allow read, write: if request.auth != null && request.auth.uid == userId;
//       }
//     }
//   }
// }
// This example assumes you are using Firebase Authentication.
// If using custom auth, rules need to be adjusted accordingly.

export { app, db, storage };
