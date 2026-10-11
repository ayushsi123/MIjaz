import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDi3NFifEqczv7_md1Ne-n90fxsfsxAMT8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mijaz-luxury.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mijaz-luxury",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mijaz-luxury.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "155931894467",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:155931894467:web:6e809aa0090e90d5cd7876"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
