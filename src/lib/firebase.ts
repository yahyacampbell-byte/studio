
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This console.log can be helpful for debugging what process.env looks like on the client.
// It should only show NEXT_PUBLIC_ prefixed variables.
if (typeof window !== 'undefined') {
  console.log("CLIENT_SIDE_PROCESS_ENV:", JSON.stringify(process.env, null, 2));
}

let firebaseConfig: FirebaseOptions | null = null;
const missingVarsArray: string[] = [];

// Directly check each required environment variable
const clientApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const clientAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const clientMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const clientAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const clientMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

if (!clientApiKey) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!clientAuthDomain) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!clientProjectId) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!clientStorageBucket) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!clientMessagingSenderId) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!clientAppId) missingVarsArray.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVarsArray.length > 0) {
  const errorMessage =
    `Firebase initialization failed: Client-side code is missing required environment variables: ${missingVarsArray.join(', ')}. ` +
    `Please ensure these are correctly defined in your apphosting.yaml with 'availability: [BUILD, RUNTIME]' (for deployed environments) ` +
    `or in your .env file (for local development) and that your Next.js server has been restarted.`;
  
  // Log the error clearly in the client console as well before throwing
  if (typeof window !== 'undefined') {
    console.error("Firebase Initialization Error:", errorMessage);
    console.error("Current NEXT_PUBLIC_FIREBASE_API_KEY on client:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  }
  throw new Error(errorMessage);
} else {
  firebaseConfig = {
    apiKey: clientApiKey!,
    authDomain: clientAuthDomain!,
    projectId: clientProjectId!,
    storageBucket: clientStorageBucket!,
    messagingSenderId: clientMessagingSenderId!,
    appId: clientAppId!,
  };
  if (clientMeasurementId) {
    firebaseConfig.measurementId = clientMeasurementId;
  }
  if (typeof window !== 'undefined') {
    console.log("[FirebaseInit Client] Firebase config object created successfully.");
  }
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig); // firebaseConfig is guaranteed to be non-null here if no error was thrown
  if (typeof window !== 'undefined') {
    console.log("[FirebaseInit Client] Firebase app initialized successfully.");
  }
} else {
  app = getApp();
  if (typeof window !== 'undefined') {
    console.log("[FirebaseInit Client] Existing Firebase app retrieved.");
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
