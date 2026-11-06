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

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where
} from
"https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// FIREBASE STORAGE
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDlKo9XxLwWyknxdpbrpQ9ld1bZEoRdKwE",
    authDomain: "gen-z-15330.firebaseapp.com",
    projectId: "gen-z-15330",
    storageBucket: "gen-z-15330.firebasestorage.app",
    messagingSenderId: "22910967267",
    appId: "1:22910967267:web:0de9c9ff6ad89d2eea14d6",
    measurementId: "G-NZV8GGSX2S"
};


// CONNECT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const $ = id => document.getElementById(id);

let confirmationResult = null;
let editingAdId = null;
let isAdmin = false;


// MESSAGE
function message(text) {
    $("message").textContent = text;
}


// SHOW BOX
function showBox(boxId) {
    [
        "welcome",
        "registerBox",
        "loginBox",
        "phoneBox",
        "accountBox"
    ].forEach(id => $(id).classList.add("hidden"));

    $(boxId).classList.remove("hidden");
    message("");
}


// NAVIGATION
$("showRegister").onclick = () => showBox("registerBox");
$("showLogin").onclick = () => showBox("loginBox");
$("backRegister").onclick = () => showBox("welcome");
$("backLogin").onclick = () => showBox("welcome");
$("backPhone").onclick = () => showBox("welcome");


// REGISTER
$("registerForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        const name = $("fullName").value.trim();

        const username = $("username").value
            .trim()
            .replace(/^@/, "")
            .toLowerCase();

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            message("Username must be 3-20 characters: letters, numbers or _");
            return;
        }

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
                { size: "normal" }
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


// VERIFY OTP
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


// CHECK ADMIN PERMISSION
async function checkAdmin(user) {
    try {
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        return adminSnap.exists() &&
            adminSnap.data().role === "admin";

    } catch (error) {
        console.error("Admin check error:", error);
        return false;
    }
}


// CREATE ADVERTISEMENT CARD
function createAdCard(ad, id, adminMode = false) {
    const card = document.createElement("div");
    card.className = "ad-card";

    const title = document.createElement("h3");
    title.textContent = ad.title || "Advertisement";
    card.appendChild(title);

    const description = document.createElement("p");
    description.textContent = ad.description || "";
    card.appendChild(description);

    if (ad.imageUrl) {
        const image = document.createElement("img");
        image.src = ad.imageUrl;
        image.alt = ad.title || "Advertisement";
        image.style.width = "100%";
        image.style.borderRadius = "12px";
        image.loading = "lazy";
        card.appendChild(image);
    }

    if (ad.link) {
        try {
            const url = new URL(ad.link);

            if (url.protocol === "https:" || url.protocol === "http:") {
                const link = document.createElement("a");
                link.href = url.href;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "Visit Advertisement";

                card.appendChild(link);
            }
        } catch (error) {
            console.warn("Invalid advertisement link");
        }
    }

    if (adminMode) {
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editAd(id, ad);
        card.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "secondary";

        deleteButton.onclick = () => deleteAd(id);

        card.appendChild(deleteButton);

        const status = document.createElement("p");
        status.textContent = ad.active ? "Published" : "Unpublished";
        card.appendChild(status);
    }

    return card;
}


// LOAD PUBLIC ADVERTISEMENTS
async function loadAdvertisements() {
    const list = $("adsList");
    list.replaceChildren();

    try {
        const adsQuery = query(
            collection(db, "advertisements"),
            where("active", "==", true)
        );

        const snapshot = await getDocs(adsQuery);

        if (snapshot.empty) {
            list.textContent = "No advertisements available.";
            return;
        }

        snapshot.forEach(item => {
            list.appendChild(
                createAdCard(item.data(), item.id)
            );
        });

    } catch (error) {
        list.textContent = "Unable to load advertisements.";
        console.error(error);
    }
}


// LOAD ADMIN ADVERTISEMENTS
async function loadAdminAds() {
    const list = $("adminAdsList");
    list.replaceChildren();

    try {
        const snapshot = await getDocs(
            collection(db, "advertisements")
        );

        if (snapshot.empty) {
            list.textContent = "No advertisements yet.";
            return;
        }

        snapshot.forEach(item => {
            list.appendChild(
                createAdCard(item.data(), item.id, true)
            );
        });

    } catch (error) {
        list.textContent = "Unable to load admin advertisements.";
        console.error(error);
    }
}
// SAVE ADVERTISEMENT
$("adForm").addEventListener("submit", async event => {
    event.preventDefault();

    if (!auth.currentUser || !isAdmin) {
        message("Admin permission required.");
        return;
    }

    try {
        message("Saving advertisement...");

        const file = $("adImageFile").files[0];

        let imageUrl = $("adImageUrl").value.trim();

        // CHECK IMAGE
        if (file) {
            if (!file.type.startsWith("image/")) {
                message("Please select an image.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                message("Image must not exceed 5MB.");
                return;
            }

            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

            const imageRef = ref(
                storage,
                "advertisements/" +
                auth.currentUser.uid + "/" +
                Date.now() + "_" + safeName
            );

            await uploadBytes(imageRef, file);

            imageUrl = await getDownloadURL(imageRef);
        }

        const ad = {
            title: $("adTitle").value.trim(),
            description: $("adDescription").value.trim(),
            imageUrl: imageUrl,
            link: $("adLink").value.trim(),
            active: $("adActive").checked
        };

        if (editingAdId) {
            await updateDoc(
                doc(db, "advertisements", editingAdId),
                ad
            );

            message("Advertisement updated!");

        } else {
            await addDoc(
                collection(db, "advertisements"),
                {
                    ...ad,
                    createdAt: serverTimestamp()
                }
            );

            message("Advertisement created!");
        }

        resetAdForm();

        await loadAdvertisements();
        await loadAdminAds();

    } catch (error) {
        console.error(error);
        message("Error: " + error.message);
    }
});

// EDIT ADVERTISEMENT
function editAd(id, ad) {
    if (!isAdmin) return;

    editingAdId = id;

    $("adTitle").value = ad.title || "";
    $("adDescription").value = ad.description || "";
    $("adImageUrl").value = ad.imageUrl || "";
    $("adLink").value = ad.link || "";
    $("adActive").checked = !!ad.active;

    $("saveAdButton").textContent = "Update Advertisement";
    $("cancelEdit").classList.remove("hidden");

    window.scrollTo(0, 0);
}


// RESET FORM
function resetAdForm() {
    $("adForm").reset();
    editingAdId = null;

    $("saveAdButton").textContent = "Save Advertisement";
    $("cancelEdit").classList.add("hidden");
}


// CANCEL EDIT
$("cancelEdit").onclick = resetAdForm;


// DELETE ADVERTISEMENT
async function deleteAd(id) {
    if (!isAdmin) return;

    if (!confirm("Are you sure you want to delete this advertisement?")) {
        return;
    }

    try {
        await deleteDoc(
            doc(db, "advertisements", id)
        );

        message("Advertisement deleted!");

        await loadAdvertisements();
        await loadAdminAds();

    } catch (error) {
        message(error.message);
    }
}


// LOGOUT
$("logoutButton").onclick = async () => {
    try {
        await signOut(auth);
        isAdmin = false;
        showBox("welcome");
    } catch (error) {
        message(error.message);
    }
};


// CHECK LOGIN STATUS
onAuthStateChanged(auth, async user => {
    if (user) {
        showBox("accountBox");

        $("userDetails").textContent =
            "Logged in as: " +
            (user.displayName || user.email || user.phoneNumber);

        isAdmin = await checkAdmin(user);

        if (isAdmin) {
            $("adminPanel").classList.remove("hidden");
        } else {
            $("adminPanel").classList.add("hidden");
        }

    } else {
        isAdmin = false;
        $("adminPanel").classList.add("hidden");
        showBox("welcome");
    }

    await loadAdvertisements();

    if (isAdmin) {
        await loadAdminAds();
    }
});


// LOAD ADS WHEN PAGE OPENS
loadAdvertisements();
