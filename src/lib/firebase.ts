import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDi3NFifEqczv7_md1Ne-n90fxsfsxAMT8",
  authDomain: "mijaz-luxury.firebaseapp.com",
  projectId: "mijaz-luxury",
  storageBucket: "mijaz-luxury.firebasestorage.app",
  messagingSenderId: "155931894467",
  appId: "1:155931894467:web:6e809aa0090e90d5cd7876"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
