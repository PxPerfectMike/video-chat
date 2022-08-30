import { initializeApp } from 'firebase/app';
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    query,
    getDocs,
    collection,
    where,
    addDoc
}
    from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyAEjv2I7NWUxW3u7sUhsOVj6ZipiAifMKI",
    authDomain: "video-chat-24dc2.firebaseapp.com",
    projectId: "video-chat-24dc2",
    storageBucket: "video-chat-24dc2.appspot.com",
    messagingSenderId: "370117072425",
    appId: "1:370117072425:web:6ebd7d33c89c544ae32e38",
    measurementId: "G-0P46DFZTEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
                photoURL: user.photoURL,
                createdAt: new Date(),
            });
        }
    } catch (err) {
        console.error(err);
        console.log(err.message);
    }
};

const logout = () => {
    signOut(auth);
};

export {
    auth,
    db,
    signInWithGoogle,
    logout,
};