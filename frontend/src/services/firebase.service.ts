import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_VUE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_VUE_APP_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

const firebaseFirestore = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firebaseFirestore, firebaseConfig };
