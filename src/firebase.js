import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  where,
  getDocs,
  query,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbfa5GMoN4GMIYp4Y3oH7a1TSL00QDWV0",
  authDomain: "midsonreferal.firebaseapp.com",
  projectId: "midsonreferal",
  storageBucket: "midsonreferal.appspot.com",
  messagingSenderId: "1042419945834",
  appId:"1:1042419945834:web:9e6b7c6768c7d6a5ff5513",
  measurementId: "G-0YM8F6B20D",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export const checkAdminCredentials = async (email, password) => {
  try {
    const q = query(collection(db, "admins"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    const adminData = querySnapshot.docs[0].data();

    if (adminData.password === password) {
      return { success: true };
    } else {
      return { error: "Incorrect password" };
    }
  } catch (error) {
    console.error("Error checking admin credentials:", error);
    return { error: "An error occurred" };
  }
};

export { db, storage };
