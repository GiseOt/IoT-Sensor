import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
	apiKey: "AIzaSyANF3g_i7hoeYOF9kPhKpNMrC07Df8Sh2I",
	authDomain: "iot-sensor-657c9.firebaseapp.com",
	projectId: "iot-sensor-657c9",
	storageBucket: "iot-sensor-657c9.appspot.com",
	messagingSenderId: "1047384883613",
	appId: "1:1047384883613:web:81b5c26c8801311c37ef74",
	measurementId: "G-GBXV1QWX8Y",
};

// Inicializar

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);
export { app, analytics, getFirestore, db };
