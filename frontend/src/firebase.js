import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

const firebaseFirestore = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firebaseFirestore, firebaseConfig };
