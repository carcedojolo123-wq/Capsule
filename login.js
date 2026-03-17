// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
  authDomain: "capsule-d556e.firebaseapp.com",
  projectId: "capsule-d556e",
  storageBucket: "capsule-d556e.firebasestorage.app",
  messagingSenderId: "667845284113",
  appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0",
  databaseURL: "https://capsule-d556e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Login script loaded");

  const submit = document.getElementById("submitx");

  submit.addEventListener("click", async () => {
    const email = document.getElementById("emailx").value;
    const password = document.getElementById("passwordx").value;

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Welcome Player!");
      console.log("YAWA");
      window.location.href = "examplesignin.html";
    } catch (error) {
      console.error(error.code, error.message);
      alert(error.message);
    }
  });
});
