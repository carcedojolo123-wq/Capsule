import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ── Firebase config ──
const firebaseConfig = {
    apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
    authDomain: "capsule-d556e.firebaseapp.com",
    projectId: "capsule-d556e",
    storageBucket: "capsule-d556e.firebasestorage.app",
    messagingSenderId: "667845284113",
    appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0",
    databaseURL: "https://capsule-d556e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ── Supabase config ──
const supabaseUrl = "https://rzzqxbgfqvuteksuxbuo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6enF4YmdmcXZ1dGVrc3V4YnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODU5NzksImV4cCI6MjA4NTY2MTk3OX0.4tO65GU8mXkWj6JcTtUw6iaGTIuUTSTjgnGJb1xHuPI";

// ── Init ──
const firebaseApp     = initializeApp(firebaseConfig);
const auth            = getAuth(firebaseApp);
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ HELPER — Convert local datetime-local value to proper ISO string
// Kini ang nag-solve sa timezone problem —
// Ang datetime-local input nag-give og "2026-03-14T22:03" (wala timezone)
// I-treat nato siya as Philippine Time (UTC+8) ug i-convert sa UTC para sa Supabase
function toManilaISO(localDatetimeStr) {
    // Idugang ang ":00+08:00" para ma-treat as Philippine Time
    return new Date(localDatetimeStr + ':00+08:00').toISOString();
}

// ── Auth state logger (para sa debugging) ──
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.email, "| UID:", user.uid);
    } else {
        console.log("No user logged in");
    }
});

// ── WALA NAY SEAL BUTTON LOGIC DIRI ──
// Ang tanan nga seal logic naa sa Capsuleinside.html
// Dili pwede mag-duplicate ang event listener
