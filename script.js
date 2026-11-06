import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    updateProfile
} from
"https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlKo9XxLwWyknxdpbrpQ9ld1bZEoRdKwE",
    authDomain: "gen-z-15330.firebaseapp.com",
    projectId: "gen-z-15330",
    storageBucket: "gen-z-15330.firebasestorage.app",
    messagingSenderId: "22910967267",
    appId: "1:22910967267:web:0de9c9ff6ad89d2eea14d6",
    measurementId: "G-NZV8GGSX2S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const $ = id => document.getElementById(id);

function message(text) {
    $("message").textContent = text;
}

function showBox(boxId) {
    ["welcome", "registerBox", "loginBox", "phoneBox", "accountBox"]
        .forEach(id => $(id).classList.add("hidden"));

    $(boxId).classList.remove("hidden");
    message("");
}

$("showRegister").onclick = () => showBox("registerBox");
$("showLogin").onclick = () => showBox("loginBox");
$("backRegister").onclick = () => showBox("welcome");
$("backLogin").onclick = () => showBox("welcome");
$("backPhone").onclick = () => showBox("welcome");


// CREATE ACCOUNT
$("registerForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        const name = $("fullName").value.trim();
        const username = $("username").value.trim();

        const result = await createUserWithEmailAndPassword(
            auth,
            $("registerEmail").value.trim(),
            $("registerPassword").value
        );

        await updateProfile(result.user, {
            displayName: name
        });

        message("Account created successfully!");

    } catch (error) {
        message(error.message);
    }
});


// EMAIL LOGIN
$("loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        await signInWithEmailAndPassword(
            auth,
            $("loginEmail").value.trim(),
            $("loginPassword").value
        );

        message("Login successful!");

    } catch (error) {
        message(error.message);
    }
});


// GOOGLE LOGIN
$("googleLogin").onclick = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        message("Google login successful!");

    } catch (error) {
        message(error.message);
    }
};


// PHONE LOGIN
let confirmationResult;

$("phoneNumber").placeholder = "+2557XXXXXXXX";

$("sendOTP").onclick = async () => {
    try {
        const phone = $("phoneNumber").value.trim();

        if (!phone.startsWith("+")) {
            message("Use full phone number, mfano +2557XXXXXXXX");
            return;
        }

        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "normal"
                }
            );
        }

        confirmationResult = await signInWithPhoneNumber(
            auth,
            phone,
            window.recaptchaVerifier
        );

        message("OTP sent to your phone.");

    } catch (error) {
        message(error.message);

        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
    }
};


$("verifyOTP").onclick = async () => {
    try {
        if (!confirmationResult) {
            message("Please request OTP first.");
            return;
        }

        await confirmationResult.confirm(
            $("otpCode").value.trim()
        );

        message("Phone verified successfully!");

    } catch (error) {
        message(error.message);
    }
};


// LOGOUT
$("logoutButton").onclick = async () => {
    await signOut(auth);
    showBox("welcome");
};


// CHECK LOGIN STATUS
onAuthStateChanged(auth, user => {
    if (user) {
        showBox("accountBox");

        $("userDetails").textContent =
            "Logged in as: " +
            (user.displayName || user.email || user.phoneNumber);
    } else {
        showBox("welcome");
    }
});
