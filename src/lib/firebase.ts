
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
let initializationError: string | null = null;

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
  initializationError =
    `Firebase initialization failed: Missing required environment variables: ${missingVarsArray.join(', ')}. ` +
    `Please ensure these are correctly defined in your apphosting.yaml with 'BUILD' and 'RUNTIME' availability, ` +
    `and that your local .env file is correctly populated if running locally.`;
  
  // Log the error clearly in the client console as well before potentially throwing
  if (typeof window !== 'undefined') {
    console.error("[FirebaseInit Client Error]", initializationError);
  }
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
    console.log("[FirebaseInit Client] Firebase config object created successfully from process.env.NEXT_PUBLIC_ variables.");
  }
}

if (initializationError && !firebaseConfig) {
  // If we have an error and firebaseConfig is still not set, throw the error.
  // This will happen if individual NEXT_PUBLIC_FIREBASE_... vars are missing.
  throw new Error(initializationError);
}

if (!firebaseConfig) {
  // This case should ideally not be reached if the above logic is sound,
  // but it's a final safeguard.
  const finalErrorMsg = "Firebase configuration object could not be created. Ensure environment variables are correctly set and accessible.";
  if (typeof window !== 'undefined') {
    console.error("[FirebaseInit Client Error]", finalErrorMsg);
  }
  throw new Error(finalErrorMsg);
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig); 
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
