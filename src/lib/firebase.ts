import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCZYZeOF8oS9K-8hRqMsSrvBaCK9es6uWA",
  authDomain: "data-1-d387e.firebaseapp.com",
  projectId: "data-1-d387e",
  storageBucket: "data-1-d387e.firebasestorage.app",
  messagingSenderId: "54009693633",
  appId: "1:54009693633:web:ea3626c01cc38d086c5b40",
  measurementId: "G-694ER56E89"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
export { analytics };
