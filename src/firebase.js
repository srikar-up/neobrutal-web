// Google Firebase (Cloud Firestore) Integration for Opinawaz Universal Public School
// Uses official Google Firebase modular SDK v10 via ES Module imports

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  limit,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const STORAGE_KEY = 'opnawaz_firebase_config';

// Load stored or env config
export function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved firebase config", e);
      }
    }
  }

  return {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyBuizG8eBYv0v-F3uzS3TUBhrm2h9VYn2E',
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'opnawazschool.firebaseapp.com',
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'opnawazschool',
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'opnawazschool.firebasestorage.app',
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '316272521255',
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:316272521255:web:4fe6918c3b081666f85e02',
    measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-NTFT52RXPQ'
  };
}

export function isFirebaseConfigured(config = getFirebaseConfig()) {
  return Boolean(
    config &&
    config.apiKey &&
    config.apiKey !== 'YOUR_API_KEY' &&
    config.projectId &&
    config.projectId !== 'YOUR_PROJECT_ID'
  );
}

let app = null;
let db = null;
let auth = null;
let googleProvider = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || getFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    console.info("[Firebase] Credentials not yet configured. Operating in Local Mode.");
    return { app: null, db: null, auth: null, isConfigured: false };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.info(`[Firebase] Initialized Firestore & Auth for project: ${config.projectId}`);
    return { app, db, auth, isConfigured: true };
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
    return { app: null, db: null, auth: null, isConfigured: false, error: err.message };
  }
}

// Initialize on load
initFirebase();

export function saveFirebaseConfig(newConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }
  return initFirebase(newConfig);
}

// -----------------------------------------------------------------------------
// GOOGLE FIREBASE AUTHENTICATION HELPERS
// -----------------------------------------------------------------------------

export function getFirebaseAuth() {
  if (!auth) initFirebase();
  return auth;
}

export function subscribeToAuth(onUserChanged) {
  if (!auth) initFirebase();
  if (!auth) {
    if (onUserChanged) onUserChanged(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUserChanged);
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) {
    initFirebase();
  }
  if (!auth || !googleProvider) {
    throw new Error("Firebase Authentication could not be initialized. Please check credentials.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("[Firebase Auth] Google Sign-In error:", err);
    throw err;
  }
}

export async function logoutUser() {
  if (!auth) initFirebase();
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[Firebase Auth] Logout error:", err);
    throw err;
  }
}

// Tests if the signed-in user has permission to read private administrative records in Firestore
export async function verifyAdminFirestoreAccess() {
  if (!db) initFirebase();
  if (!db) return true;
  try {
    const q = query(collection(db, 'inquiries'), limit(1));
    await getDocs(q);
    return true;
  } catch (err) {
    console.warn("[Firestore Security Rule Check]", err.code, err.message);
    if (err.code === 'permission-denied' || err.message?.toLowerCase().includes('permission')) {
      return false;
    }
    return true;
  }
}

// -----------------------------------------------------------------------------
// REAL-TIME FIRESTORE SUBSCRIBERS
// -----------------------------------------------------------------------------

export function subscribeToInquiries(onData, onError) {
  if (!db) return () => {};
  try {
    if (!auth?.currentUser) {
      return () => {};
    }
    const colRef = collection(db, 'inquiries');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      // Sort newest first
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      onData(items);
    }, (err) => {
      if (err.code !== 'permission-denied') {
        console.warn("[Firebase] Inquiries subscriber notice:", err.message);
      }
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToInquiries error:", e);
    return () => {};
  }
}

export function subscribeToNotices(onData, onError) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'announcements');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      onData(items);
    }, (err) => {
      console.warn("[Firebase] Notices subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToNotices error:", e);
    return () => {};
  }
}

export function subscribeToToppers(onData, onError) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'toppers');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      onData(items);
    }, (err) => {
      console.warn("[Firebase] Toppers subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToToppers error:", e);
    return () => {};
  }
}

export function subscribeToActivities(onData, onError) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'activities');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    }, (err) => {
      console.warn("[Firebase] Activities subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToActivities error:", e);
    return () => {};
  }
}

export function subscribeToFaqs(onData, onError) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'faqs');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    }, (err) => {
      console.warn("[Firebase] FAQs subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToFaqs error:", e);
    return () => {};
  }
}

export function subscribeToEmergencyBanner(onData, onError) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'settings', 'emergencyBanner');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data());
      }
    }, (err) => {
      console.warn("[Firebase] Banner subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToEmergencyBanner error:", e);
    return () => {};
  }
}

export function subscribeToContactInfo(onData, onError) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, 'settings', 'contactInfo');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data());
      }
    }, (err) => {
      console.warn("[Firebase] Contact info subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToContactInfo error:", e);
    return () => {};
  }
}

export function subscribeToHeroSlides(onData, onError) {
  if (!db) return () => {};
  try {
    const colRef = collection(db, 'heroSlides');
    return onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), _docId: d.id }));
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onData(items);
    }, (err) => {
      console.warn("[Firebase] HeroSlides subscriber notice:", err.message);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn("[Firebase] subscribeToHeroSlides error:", e);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// FIRESTORE MUTATION FUNCTIONS
// -----------------------------------------------------------------------------

export async function addInquiryDoc(inquiry) {
  if (!db) return null;
  try {
    const docId = inquiry.id || `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const docRef = doc(db, 'inquiries', docId);
    const data = {
      ...inquiry,
      id: docId,
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, data);
    console.info(`[Firebase] Inquiry ${docId} stored in Firestore`);
    return docId;
  } catch (err) {
    console.error("[Firebase] addInquiryDoc error:", err);
    throw err;
  }
}

export async function updateInquiryStatusDoc(docId, newStatus) {
  if (!db) return;
  try {
    const docRef = doc(db, 'inquiries', docId);
    await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] updateInquiryStatusDoc error:", err);
    throw err;
  }
}

export async function deleteInquiryDoc(docId) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'inquiries', docId));
  } catch (err) {
    console.error("[Firebase] deleteInquiryDoc error:", err);
    throw err;
  }
}

export async function saveNoticeDoc(notice) {
  if (!db) return;
  try {
    const docId = notice.id || `NOT-${Math.floor(2600 + Math.random() * 900)}`;
    const docRef = doc(db, 'announcements', docId);
    await setDoc(docRef, { ...notice, id: docId, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveNoticeDoc error:", err);
    throw err;
  }
}

export async function deleteNoticeDoc(docId) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'announcements', docId));
  } catch (err) {
    console.error("[Firebase] deleteNoticeDoc error:", err);
    throw err;
  }
}

export async function saveTopperDoc(topper) {
  if (!db) return;
  try {
    // Use student name as normalized document id
    const docId = topper.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const docRef = doc(db, 'toppers', docId);
    await setDoc(docRef, { ...topper, docId, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveTopperDoc error:", err);
    throw err;
  }
}

export async function deleteTopperDoc(name) {
  if (!db) return;
  try {
    const docId = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    await deleteDoc(doc(db, 'toppers', docId));
  } catch (err) {
    console.error("[Firebase] deleteTopperDoc error:", err);
    throw err;
  }
}

export async function saveActivityDoc(activity, idx = 0) {
  if (!db) return;
  try {
    const docId = activity.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 40);
    const docRef = doc(db, 'activities', docId);
    await setDoc(docRef, { ...activity, order: idx, docId, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveActivityDoc error:", err);
    throw err;
  }
}

export async function deleteActivityDoc(title) {
  if (!db) return;
  try {
    const docId = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 40);
    await deleteDoc(doc(db, 'activities', docId));
  } catch (err) {
    console.error("[Firebase] deleteActivityDoc error:", err);
    throw err;
  }
}

export async function saveFaqDoc(faq, idx = 0) {
  if (!db) return;
  try {
    const docId = faq.q.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 40);
    const docRef = doc(db, 'faqs', docId);
    await setDoc(docRef, { ...faq, order: idx, docId, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveFaqDoc error:", err);
    throw err;
  }
}

export async function deleteFaqDoc(question) {
  if (!db) return;
  try {
    const docId = question.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 40);
    await deleteDoc(doc(db, 'faqs', docId));
  } catch (err) {
    console.error("[Firebase] deleteFaqDoc error:", err);
    throw err;
  }
}

export async function saveEmergencyBannerDoc(banner) {
  if (!db) return;
  try {
    const docRef = doc(db, 'settings', 'emergencyBanner');
    await setDoc(docRef, { ...banner, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveEmergencyBannerDoc error:", err);
    throw err;
  }
}

export async function saveContactInfoDoc(contactData) {
  if (!db) return;
  try {
    const docRef = doc(db, 'settings', 'contactInfo');
    await setDoc(docRef, { ...contactData, updatedAt: serverTimestamp() });
    console.info("[Firebase] saveContactInfoDoc updated successfully");
  } catch (err) {
    console.error("[Firebase] saveContactInfoDoc error:", err);
    throw err;
  }
}

export async function saveHeroSlideDoc(slide, idx = 0) {
  if (!db) return;
  try {
    const docId = slide.id || `slide_${idx + 1}`;
    const docRef = doc(db, 'heroSlides', docId);
    await setDoc(docRef, { ...slide, id: docId, order: idx, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("[Firebase] saveHeroSlideDoc error:", err);
    throw err;
  }
}

export async function deleteHeroSlideDoc(slideId) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'heroSlides', slideId));
  } catch (err) {
    console.error("[Firebase] deleteHeroSlideDoc error:", err);
    throw err;
  }
}

export async function saveAllHeroSlidesDoc(slides) {
  if (!db) return;
  try {
    const docRef = doc(db, 'settings', 'heroSlides');
    await setDoc(docRef, { slides, updatedAt: serverTimestamp() });
    for (let i = 0; i < slides.length; i++) {
      await saveHeroSlideDoc(slides[i], i);
    }
  } catch (err) {
    console.error("[Firebase] saveAllHeroSlidesDoc error:", err);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// ONE-CLICK CLOUD SEEDER: POPULATES STANDARD SCHOOL DATA TO FIRESTORE
// -----------------------------------------------------------------------------
export async function seedInitialDataToFirestore({
  inquiries = [],
  announcements = [],
  toppers = [],
  activities = [],
  faqs = [],
  emergencyBanner = {},
  contactInfo = {},
  heroSlides = []
}) {
  if (!db) {
    throw new Error("Firestore is not initialized. Please verify your Firebase project credentials.");
  }

  console.info("[Firebase] Seeding initial Opinawaz Universal Public School data to Cloud Firestore...");

  // 1. Seed Inquiries
  for (const inq of inquiries) {
    await addInquiryDoc(inq);
  }

  // 2. Seed Announcements
  for (const item of announcements) {
    await saveNoticeDoc(item);
  }

  // 3. Seed Toppers
  for (const t of toppers) {
    await saveTopperDoc(t);
  }

  // 4. Seed Activities
  for (let i = 0; i < activities.length; i++) {
    await saveActivityDoc(activities[i], i);
  }

  // 5. Seed FAQs
  for (let i = 0; i < faqs.length; i++) {
    await saveFaqDoc(faqs[i], i);
  }

  // 6. Seed Emergency Banner
  await saveEmergencyBannerDoc(emergencyBanner);

  // 7. Seed Contact & Socials Info
  if (contactInfo && Object.keys(contactInfo).length > 0) {
    await saveContactInfoDoc(contactInfo);
  }

  // 8. Seed Hero Slides
  if (heroSlides && heroSlides.length > 0) {
    await saveAllHeroSlidesDoc(heroSlides);
  }

  console.info("[Firebase] Seeding completed successfully!");
  return true;
}
