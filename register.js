// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
  import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
  import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
  
  
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
  authDomain: "capsule-d556e.firebaseapp.com",
  projectId: "capsule-d556e",
  storageBucket: "capsule-d556e.firebasestorage.app",
  messagingSenderId: "667845284113",
  appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0",
  databaseURL: "https://capsule-d556e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication
const db = getDatabase(app); // Firebase Realtime Database

/* 🔽 ADDED: Firestore initialization */
const firestore = getFirestore(app);

const submitButton = document.getElementById("submit");

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  // Get values from the form fields
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate form fields
  if (username && email && password) {
    try {
      // First, create the user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Now, store the user data (username and email) in Firebase Realtime Database
      const userRef = ref(db, 'users/' + user.uid);  // Use the user's UID as the key
      await set(userRef, {
        username: username,
        email: email
      });

      /* 🔽 ADDED: Store same data in Firestore */
      await setDoc(doc(firestore, "users", user.uid), {
        username: username,
        email: email
      });


      alert("New player registered and data saved!");

      window.location.href="dashboard.html";

    } catch (error) {
      console.error("Error during sign-up:", error);
      alert("Error during registration: " + error.message);
    }
  } else {
    alert("Please fill in all fields.");
  }
});