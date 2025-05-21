
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Log all process.env available on the client side FOR DIAGNOSTICS
if (typeof window !== 'undefined') {
  // Only log specific NEXT_PUBLIC_ variables to avoid exposing sensitive server-side vars
  // if any somehow make it to this client-side process.env object (they shouldn't with Next.js).
  const clientSideEnv: Record<string, string | undefined> = {};
  for (const key in process.env) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      clientSideEnv[key] = process.env[key];
    }
  }
  console.log("CLIENT_SIDE_ACCESSIBLE_PROCESS_ENV (NEXT_PUBLIC_ only):", JSON.stringify(clientSideEnv, null, 2));
}

let firebaseConfig: FirebaseOptions | null = null;
let initializationError: string | null = null;

const requiredEnvVars: string[] = [ // Explicitly type as string[]
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName as keyof NodeJS.ProcessEnv]; // Cast for process.env access
  if (typeof window !== 'undefined') {
    console.log(`[FirebaseInit] Checking var ${varName}: Value is '${String(value)}' (Type: ${typeof value})`);
  }
  return !value;
});

if (missingVars.length > 0) {
  initializationError =
    `Firebase initialization failed: Missing required environment variables: ${missingVars.join(', ')}. ` +
    `Please ensure these are correctly defined in your apphosting.yaml with 'BUILD' and 'RUNTIME' availability, ` +
    `and that your local .env file is correctly populated if running locally.`;
} else {
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional, can be undefined
  };
  console.log("[FirebaseInit] Firebase config object created successfully from individual NEXT_PUBLIC_ variables.");
}

if (initializationError && !firebaseConfig) {
  // This error will be thrown if essential Firebase config is missing during build/runtime
  // It should provide a clearer message in the build logs if this is the cause of failure.
  throw new Error(initializationError);
}

if (!firebaseConfig) {
  // This case should ideally not be reached if the above logic is sound,
  // but acts as a final guard.
  throw new Error("Firebase configuration could not be determined. Critical error in environment variable setup.");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("[FirebaseInit] Firebase app initialized successfully.");
} else {
  app = getApp();
  console.log("[FirebaseInit] Existing Firebase app retrieved.");
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
