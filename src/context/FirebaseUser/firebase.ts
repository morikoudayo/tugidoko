// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhwsddG4Vf4BIhusV9N1aDj10XF9HVmuM",
  authDomain: "nginx-app-109380428695.asia-northeast1.run.app",
  projectId: "tugidoko-dev",
  storageBucket: "tugidoko-dev.firebasestorage.app",
  messagingSenderId: "109380428695",
  appId: "1:109380428695:web:10d0420d24e0f6a892dad2"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
