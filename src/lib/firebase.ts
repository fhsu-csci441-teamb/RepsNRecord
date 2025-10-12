// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This is the config Firebase gave you
const firebaseConfig = {
  apiKey: "AIzaSyBn7LBYmlWRhkIQ42AL9g3Uk1JxuTaZCW8",
  authDomain: "repsnrecord.firebaseapp.com",
  projectId: "repsnrecord",
  // IMPORTANT: fix bucket domain here
  storageBucket: "repsnrecord.appspot.com",
  appId: "1:631313812871:web:d4896baca3cbefba169722",
};

// Prevent re-init when Next.js hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export the services you’ll use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
