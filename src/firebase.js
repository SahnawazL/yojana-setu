// firebase.js — YojanaSetu Firebase initialisation
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4NoFNKDpH52eU2ZrqIeZHo1lacHu48vk",
  authDomain: "yojanasetu-e24bb.firebaseapp.com",
  projectId: "yojanasetu-e24bb",
  storageBucket: "yojanasetu-e24bb.firebasestorage.app",
  messagingSenderId: "889660603092",
  appId: "1:889660603092:web:a988f9b87f915855dd9941",
  measurementId: "G-4ZZQ77LG0R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
