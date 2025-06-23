// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQrEjXn8NTsFBNhX5zhw6AVarRbd_j72g",
  authDomain: "intel-b848f.firebaseapp.com",
  projectId: "intel-b848f",
  storageBucket: "intel-b848f.firebasestorage.app",
  messagingSenderId: "496446702720",
  appId: "1:496446702720:web:8b2a846477ccd107ddd265",
  measurementId: "G-Y41P1K2MRF"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;