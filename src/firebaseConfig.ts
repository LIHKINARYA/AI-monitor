import rawConfig from "../firebase-applet-config.json";

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const firebaseConfig: FirebaseAppConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig?.projectId || "ai-monitor-63bda",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig?.appId || "1:951362134694:web:98a87f0ef14dc761a74a67",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig?.apiKey || "AIzaSyCjo-3RJd0Ly5lL-PiToiPJqY0qRHddXyg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig?.authDomain || "ai-monitor-63bda.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig?.firestoreDatabaseId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig?.storageBucket || "ai-monitor-63bda.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig?.messagingSenderId || "951362134694",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || rawConfig?.measurementId || "G-EXVQ91PMYL",
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || rawConfig?.oAuthClientId || "",
  recaptchaSiteKey: import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || rawConfig?.recaptchaSiteKey || "",
};

export default firebaseConfig;
