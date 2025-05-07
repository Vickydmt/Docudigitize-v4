import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAW2lapzV00nxutaXCHuNwsYNXnTMgnKzE",
  authDomain: "login-78e38.firebaseapp.com",
  projectId: "login-78e38",
  storageBucket: "login-78e38.appspot.com",
  messagingSenderId: "739641169342",
  appId: "1:739641169342:web:04b6fef292ebe0acee15ef",
  measurementId: "G-3W0ED5YDKE",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, db, googleProvider }
