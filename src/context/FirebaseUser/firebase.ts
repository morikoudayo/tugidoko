// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhwsddG4Vf4BIhusV9N1aDj10XF9HVmuM",
  authDomain: "tugidoko.snowi.ng",
  projectId: "tugidoko-dev",
  storageBucket: "tugidoko-dev.firebasestorage.app",
  messagingSenderId: "109380428695",
  appId: "1:109380428695:web:24a931572e0fe75492dad2"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);