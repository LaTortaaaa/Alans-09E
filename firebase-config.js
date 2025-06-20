import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXH-u-Ig7HqFIN3tRM-ozzzswVwC2u53E",
  authDomain: "tareas-4ee35.firebaseapp.com",
  projectId: "tareas-4ee35",
  storageBucket: "tareas-4ee35.appspot.com",
  messagingSenderId: "616055203467",
  appId: "1:616055203467:web:443aba9175c2b02a46d68e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
