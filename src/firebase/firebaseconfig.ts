import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let auth: Auth;
let db: Firestore;

// Function to initialize Firebase
const initializeFirebase = (firebaseConfig: any) => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and Firestore
    auth = getAuth(app);
    db = getFirestore(app);

    return { auth, db };
};

// Export the initialization function and the services
export { initializeFirebase, auth, db };
