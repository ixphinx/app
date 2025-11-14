export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCyuG-6biVhdH-ienr0AgVFP68jTNQvZb4',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'reeva-560a7.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'reeva-560a7',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'reeva-560a7.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '223158751903',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:223158751903:android:c7bbfbdcd2967406b9c8aa',
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

