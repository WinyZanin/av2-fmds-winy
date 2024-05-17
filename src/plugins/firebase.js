// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "sua key aqui",
  authDomain: "av2-fmds.firebaseapp.com",
  projectId: "av2-fmds",
  storageBucket: "av2-fmds.appspot.com",
  messagingSenderId: "521802488259",
  appId: "1:521802488259:web:aba8fec1a4f117ae064576"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

export default db;