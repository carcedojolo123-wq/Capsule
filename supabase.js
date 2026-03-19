import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ✅ Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBtKdC5Po01JvwfC33AywIZKDZ-4-6SH9Y",
    authDomain: "capsule-d556e.firebaseapp.com",
    projectId: "capsule-d556e",
    storageBucket: "capsule-d556e.firebasestorage.app",
    messagingSenderId: "667845284113",
    appId: "1:667845284113:web:cf11b1d4b7ef99eb83fcb0",
    databaseURL: "https://capsule-d556e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ✅ Supabase config
const supabaseUrl = "https://rzzqxbgfqvuteksuxbuo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6enF4YmdmcXZ1dGVrc3V4YnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODU5NzksImV4cCI6MjA4NTY2MTk3OX0.4tO65GU8mXkWj6JcTtUw6iaGTIuUTSTjgnGJb1xHuPI";

// ✅ Init Firebase + Supabase
const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ HELPER — Convert local datetime-local value to proper ISO string
// Kini ang nag-solve sa timezone problem —
// Ang datetime-local input nag-give og "2026-03-14T22:03" (wala timezone)
// I-treat nato siya as Philippine Time (UTC+8) ug i-convert sa UTC para sa Supabase
function toManilaISO(localDatetimeStr) {
    // Idugang ang ":00+08:00" para ma-treat as Philippine Time
    return new Date(localDatetimeStr + ':00+08:00').toISOString();
}

// ✅ Seal Memory button


        const user = auth.currentUser;
        if (!user) {
            alert("Please log in first!");
            return;
        }

        const userId   = user.uid;
        const message  = document.getElementById("memoryText").value;
        const file     = document.getElementById("memoryFile").files[0];
        const openDate = document.getElementById("openDate").value;
        const status   = document.getElementById("status");

        if (!openDate) {
            status.innerText = "Please set a date!";
            return;
        }

        status.innerText = "Uploading...";

        let filePath = null;
        let fileUrl  = null;

        // ✅ Upload file kung naa
        if (file) {
            filePath = `${userId}/${Date.now()}-${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from("timecapsule")
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert:       false,
                    contentType:  file.type
                });

            if (uploadError) {
                console.error(uploadError);
                status.innerText = "Upload failed!";
                return;
            }

            const { data } = supabase.storage
                .from("timecapsule")
                .getPublicUrl(filePath);

            fileUrl = data.publicUrl;
        }

        // ✅ I-convert ang open date sa Philippine Time → UTC
        // Example: "2026-03-14T22:03" → "2026-03-14T14:03:00.000Z" (UTC)
        const openDateUTC = toManilaISO(openDate);

        const { error: dbError } = await supabase
            .from('memories')
            .insert({
                user_id:     userId,
                message:     message,
                file_path:   filePath,
                file_url:    fileUrl,
                open_date:   openDateUTC,
                is_notified: false
            });

        if (dbError) {
            console.error(dbError);
            status.innerText = "Save failed!";
            return;
        }

        status.innerText = "Memory sealed! 🎉 Redirecting...";
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

    });
}

// ✅ Auto-check kung naka-login
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.email, "| UID:", user.uid);
    } else {
        console.log("No user logged in");
    }
});
