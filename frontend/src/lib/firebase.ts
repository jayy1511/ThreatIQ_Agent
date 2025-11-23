import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBn3FVP55eHFhEqH4nJb6qrgdzTikU_CZA",
  authDomain: "threatiq-dc99e.firebaseapp.com",
  projectId: "threatiq-dc99e",
  storageBucket: "threatiq-dc99e.appspot.com",
  messagingSenderId: "229250264596",
  appId: "1:229250264596:web:a2090adc2e7a4f95e90101",
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase apiKey is missing in firebaseConfig.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
