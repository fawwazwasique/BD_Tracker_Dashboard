import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check as per system instructions
async function testConnection() {
  try {
    // Attempt to get a dummy doc to verify connection
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase is offline. Please check your configuration.");
    } else {
      console.warn("Initial connection test result:", error);
    }
  }
}

testConnection();
