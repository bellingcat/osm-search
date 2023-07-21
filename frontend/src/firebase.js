import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBN5oJ8c_VGhcfesAxXPVmuVnJ_V5MM8JM",
  authDomain: "osm-search-364115.firebaseapp.com",
  projectId: "osm-search-364115",
  storageBucket: "osm-search-364115.appspot.com",
  messagingSenderId: "919009657823",
  appId: "1:919009657823:web:f3be7f8470a6c36665ba6a",
};

const firebaseApp = initializeApp(firebaseConfig);

const firebaseAuth = getAuth(firebaseApp);

const firebaseFirestore = getFirestore(firebaseApp);

export { firebaseApp, firebaseAuth, firebaseFirestore, firebaseConfig };
