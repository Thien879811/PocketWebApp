import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { supabase } from "@/utils/supabase";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
let messaging: any = null;

try {
  // Messaging only works in browser environments that support it
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn("FCM messaging is not supported in this browser:", error);
}

/**
 * Registers the client for Firebase Cloud Messaging push notifications.
 * Requests notification permissions, retrieves the FCM registration token (FID),
 * and registers/upserts the token in the Supabase database for the logged-in user.
 * 
 * @param userId - The authenticated user's ID from Supabase Auth
 */
export async function registerFCM(userId: string): Promise<void> {
  if (!messaging) {
    console.warn("FCM registration skipped: messaging is not supported or initialized.");
    return;
  }

  try {
    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was denied by the user.");
      return;
    }

    // 2. Retrieve FCM Registration Token
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("VITE_FIREBASE_VAPID_KEY environment variable is not defined.");
      return;
    }

    // Construct the service worker URL with Firebase configuration from environment variables
    const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin);
    if (firebaseConfig.apiKey) swUrl.searchParams.set('apiKey', firebaseConfig.apiKey);
    if (firebaseConfig.authDomain) swUrl.searchParams.set('authDomain', firebaseConfig.authDomain);
    if (firebaseConfig.projectId) swUrl.searchParams.set('projectId', firebaseConfig.projectId);
    if (firebaseConfig.storageBucket) swUrl.searchParams.set('storageBucket', firebaseConfig.storageBucket);
    if (firebaseConfig.messagingSenderId) swUrl.searchParams.set('messagingSenderId', firebaseConfig.messagingSenderId);
    if (firebaseConfig.appId) swUrl.searchParams.set('appId', firebaseConfig.appId);

    // Register the service worker manually so the query parameters are used
    const registration = await navigator.serviceWorker.register(swUrl.toString());

    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: registration 
    });
    
    if (!token) {
      console.warn("No FCM registration token available. Request permission or check configuration.");
      return;
    }

    console.log("FCM registration token retrieved:", token);

    // 3. Upsert Token to Supabase Database
    const { error } = await supabase
      .from("fcm_tokens")
      .upsert(
        {
          user_id: userId,
          token: token,
          device_type: "web",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );

    if (error) {
      console.error("Failed to store FCM token in Supabase database:", error);
    } else {
      console.log("FCM token successfully registered to Supabase.");
    }
  } catch (error) {
    console.error("An error occurred during FCM registration:", error);
  }
}