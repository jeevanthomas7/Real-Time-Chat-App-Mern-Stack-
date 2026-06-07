import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWEcJX0hq1yNWBPDPr9MPJefSUAWKaLPM",
  authDomain: "chatapp-f7cf3.firebaseapp.com",
  projectId: "chatapp-f7cf3",
  storageBucket: "chatapp-f7cf3.firebasestorage.app",
  messagingSenderId: "1055946671087",
  appId: "1:1055946671087:web:e0291dd41120434d672c1a",
  measurementId: "G-V1MJTTD7EQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
