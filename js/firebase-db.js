// Firebase Database Integration Module using Modular SDK v10+ via Browser ESM
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { config } from "./config.js";

// Initialize Firebase App
let app = null;
let db = null;
let isFirebaseActive = false;

try {
  const firebaseConfig = config.firebase;
  
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "REDACTED") {
    // Initialize standard Firebase App
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseActive = true;
    console.log("Firebase initialized successfully with Firestore active.");
  } else {
    console.warn(
      "Firebase database is currently inactive: Please set a valid 'apiKey' in 'vanilla/js/config.js' to enable Firestore data replication."
    );
  }
} catch (error) {
  console.error("Error initializing Firebase Web SDK:", error);
}

/**
 * Saves a contact form message to the Firestore 'messages' collection.
 * Maintains exact data structure from firebase-blueprint.json:
 * properties: name (string), email (string), message (string), createdAt (timestamp)
 * 
 * @param {string} name - Name of the sender
 * @param {string} email - Email of the sender
 * @param {string} message - The message body
 * @returns {Promise<{success: boolean, docId?: string, error?: any}>}
 */
export async function saveContactMessage(name, email, message) {
  // If Firebase is not configured, resolve gracefully to not disrupt Web3Forms submissions
  if (!isFirebaseActive) {
    console.info("Firestore is currently inactive (apiKey is Redacted). Simulating database write.");
    return { success: true, simulated: true };
  }

  try {
    const messagesCollection = collection(db, "messages");
    const docRef = await addDoc(messagesCollection, {
      name: name,
      email: email,
      message: message,
      createdAt: serverTimestamp() // Generates standard server-side timestamp
    });
    
    console.log("Message successfully stored in Firestore with ID:", docRef.id);
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error("Firestore database write failed:", error);
    return { success: false, error: error };
  }
}
