import React, { useState, useEffect } from 'react';
import { getCroppedImageStyle, getTopperImageStyle } from './imageHelper';

export default function AdminPanel({
  schoolLogo,
  nobgLogo,
  inquiries = [],
  setInquiries,
  announcements = [],
  setAnnouncements,
  toppers = [],
  setToppers,
  activities = [],
  setActivities,
  faqs = [],
  setFaqs,
  emergencyBanner = { active: false, text: '' },
  setEmergencyBanner,
  contactInfo = {},
  setContactInfo,
  saveContactInfoDoc,
  heroSlides = [],
  setHeroSlides,
  saveHeroSlideDoc,
  deleteHeroSlideDoc,
  saveAllHeroSlidesDoc,
  onBackToWebsite,
  // Firebase Cloud Sync Props
  isFirebaseConnected = false,
  firebaseConfigState = {},
  setFirebaseConfigState,
  saveFirebaseConfig,
  seedInitialDataToFirestore,
  addInquiryDoc,
  updateInquiryStatusDoc,
  deleteInquiryDoc,
  saveNoticeDoc,
  deleteNoticeDoc,
  saveTopperDoc,
  deleteTopperDoc,
  saveActivityDoc,
  deleteActivityDoc,
  saveFaqDoc,
  deleteFaqDoc,
  saveEmergencyBannerDoc,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  verifyAdminFirestoreAccess,
  initialTemplates = {}
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeTab, setActiveTab] = useState('INQUIRIES');

  // Default fallback contact information
  const defaultContactValues = {
    phone: '+91 94190 28723',
    altPhone: '+91 1931 260000',
    email: 'opnawazschool@gmail.com',
    address: 'Karewa, Kulgam, Jammu & Kashmir — 192231',
    timing: 'Mon–Sat (9:00 AM - 3:30 PM)',
    facebook: 'https://facebook.com/opnawazschool',
    instagram: 'https://instagram.com/opnawazschool',
    youtube: 'https://youtube.com/@opnawazschool',
    twitter: 'https://twitter.com/opnawazschool',
    whatsapp: 'https://wa.me/919419028723'
  };

  // Contact Information Form State
  const [tempContact, setTempContact] = useState(() => ({
    phone: contactInfo?.phone || defaultContactValues.phone,
    altPhone: contactInfo?.altPhone !== undefined ? contactInfo.altPhone : defaultContactValues.altPhone,
    email: contactInfo?.email || defaultContactValues.email,
    address: contactInfo?.address || defaultContactValues.address,
    timing: contactInfo?.timing || defaultContactValues.timing,
    facebook: contactInfo?.facebook || defaultContactValues.facebook,
    instagram: contactInfo?.instagram || defaultContactValues.instagram,
    youtube: contactInfo?.youtube || defaultContactValues.youtube,
    twitter: contactInfo?.twitter || defaultContactValues.twitter,
    whatsapp: contactInfo?.whatsapp || defaultContactValues.whatsapp
  }));
  const [contactFeedback, setContactFeedback] = useState(null);

  useEffect(() => {
    if (contactInfo && Object.keys(contactInfo).length > 0) {
      setTempContact(prev => ({
        ...prev,
        phone: contactInfo.phone || prev.phone || defaultContactValues.phone,
        altPhone: contactInfo.altPhone !== undefined ? contactInfo.altPhone : prev.altPhone,
        email: contactInfo.email || prev.email || defaultContactValues.email,
        address: contactInfo.address || prev.address || defaultContactValues.address,
        timing: contactInfo.timing || prev.timing || defaultContactValues.timing,
        facebook: contactInfo.facebook || prev.facebook || defaultContactValues.facebook,
        instagram: contactInfo.instagram || prev.instagram || defaultContactValues.instagram,
        youtube: contactInfo.youtube || prev.youtube || defaultContactValues.youtube,
        twitter: contactInfo.twitter || prev.twitter || defaultContactValues.twitter,
        whatsapp: contactInfo.whatsapp || prev.whatsapp || defaultContactValues.whatsapp
      }));
    }
  }, [contactInfo]);

  // Real-time Firebase Auth state listener with Firestore security rule verification
  useEffect(() => {
    if (subscribeToAuth) {
      const unsub = subscribeToAuth(async (user) => {
        if (user) {
          if (verifyAdminFirestoreAccess) {
            const hasAccess = await verifyAdminFirestoreAccess();
            if (!hasAccess) {
              console.warn("[Auth Guard] User rejected by Firestore security rules. Logging out and redirecting home.");
              if (logoutUser) await logoutUser();
              setCurrentUser(null);
              if (onBackToWebsite) onBackToWebsite();
              return;
            }
          }
          setCurrentUser(user);
          setAuthError(null);
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsub && unsub();
    }
  }, [subscribeToAuth, verifyAdminFirestoreAccess, onBackToWebsite]);

  const isAuthenticated = Boolean(currentUser);

  // Search & Filter
  const [searchInquiry, setSearchInquiry] = useState('');

  // 1. Notices Form State
  const [newNotice, setNewNotice] = useState({ title: '', tag: 'NOTICE', date: 'SEPTEMBER 2026' });

  // 2. Topper Form State (With Image URL & Face Cropping / Focal Point Controls)
  const defaultTopperImg = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
  const [newTopper, setNewTopper] = useState({
    name: '',
    rank: 'School Merit',
    grade: 'Class 10th (JKBOSE)',
    score: '',
    badge: '',
    img: defaultTopperImg,
    focalY: 20, // 20% from top (Face / Hairline)
    focalX: 50, // 50% horizontal center
    zoom: 1.0   // 1.0x default
  });
  const [editingTopperIdx, setEditingTopperIdx] = useState(null);

  // 3. Activities / School Events Form State
  const defaultActivityImg = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80";
  const [newActivity, setNewActivity] = useState({
    title: '',
    date: 'SEPTEMBER 2026',
    category: 'SPORTS',
    desc: '',
    img: defaultActivityImg,
    gallery: [defaultActivityImg],
    focalX: 50,
    focalY: 50,
    zoom: 1.0
  });
  const [editingActivityIdx, setEditingActivityIdx] = useState(null);
  const [newGalleryPhotoUrl, setNewGalleryPhotoUrl] = useState('');

  // 4. FAQ Form State
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [editingFaqIdx, setEditingFaqIdx] = useState(null);
  const [previewFaqOpen, setPreviewFaqOpen] = useState(0);

  // 5. Hero Slideshow Form State
  const defaultSlideImg = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80';
  const [newSlide, setNewSlide] = useState({
    url: defaultSlideImg,
    label: 'MAIN CAMPUS & ADMINISTRATIVE BLOCK — KULGAM'
  });
  const [editingSlideIdx, setEditingSlideIdx] = useState(null);
  const [slideFeedback, setSlideFeedback] = useState(null);

  // Authentication Handlers (Google Sign In with Firestore Security Rule Verification)
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (loginWithGoogle) {
        const user = await loginWithGoogle();
        // Verify against Firestore security rules:
        if (verifyAdminFirestoreAccess) {
          const hasAccess = await verifyAdminFirestoreAccess();
          if (!hasAccess) {
            console.warn("[Auth Guard] User rejected by Firestore security rules. Logging out and redirecting home.");
            if (logoutUser) await logoutUser();
            setCurrentUser(null);
            if (onBackToWebsite) onBackToWebsite();
            return;
          }
        }
        setCurrentUser(user);
      } else {
        throw new Error("Google Login service is not initialized.");
      }
    } catch (err) {
      console.error("[Google Auth Error]", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in window was closed before completing authentication. Please click the button to try again.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError("Multiple login requests detected. Please click once.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Google Sign-in is not enabled yet in your Firebase Console. Go to Firebase Console → Authentication → Sign-in method → Enable Google.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError("This domain is not authorized in Firebase. Add 'localhost' under Firebase Console → Authentication → Settings → Authorized domains.");
      } else {
        setAuthError(err.message || "Failed to authenticate with Google. Check Firebase Console settings.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      if (logoutUser) {
        await logoutUser();
      }
      setCurrentUser(null);
    } catch (err) {
      console.error("[Logout Error]", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- INQUIRIES HANDLERS ---
  const exportInquiriesCSV = () => {
    const headers = "ID,Date,Student Name,Parent Name,Grade,Phone,Locality,Status\n";
    const rows = inquiries.map(i => `"${i.id}","${i.date}","${i.studentName}","${i.parentName}","${i.grade}","${i.phone}","${i.locality}","${i.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opnawaz-admission-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (id, newStatus) => {
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
    if (updateInquiryStatusDoc) {
      updateInquiryStatusDoc(id, newStatus).catch(e => console.warn("[Firebase] Inquiry status update warning:", e));
    }
  };

  const handleDeleteInquiry = (id) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (deleteInquiryDoc) {
      deleteInquiryDoc(id).catch(e => console.warn("[Firebase] Inquiry delete warning:", e));
    }
  };

  const filteredInquiries = inquiries.filter(i =>
    i.studentName?.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    i.parentName?.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    i.locality?.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    i.id?.toLowerCase().includes(searchInquiry.toLowerCase())
  );

  // --- NOTICES HANDLERS ---
  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNotice.title.trim()) return;
    const item = {
      id: `NOT-${Math.floor(2600 + Math.random() * 900)}`,
      date: newNotice.date || "SEPTEMBER 2026",
      title: newNotice.title,
      tag: newNotice.tag
    };
    setAnnouncements((prev) => [item, ...prev]);
    setNewNotice({ title: '', tag: 'NOTICE', date: 'SEPTEMBER 2026' });
    if (saveNoticeDoc) {
      saveNoticeDoc(item).catch(e => console.warn("[Firebase] Notice save warning:", e));
    }
  };

  const handleDeleteNotice = (id) => {
    setAnnouncements((prev) => prev.filter((n) => n.id !== id));
    if (deleteNoticeDoc) {
      deleteNoticeDoc(id).catch(e => console.warn("[Firebase] Notice delete warning:", e));
    }
  };

  // --- TOPPERS HANDLERS (With Face Cropping) ---
  const handleSaveTopper = (e) => {
    e.preventDefault();
    if (!newTopper.name || !newTopper.score) return;
    const item = {
      name: newTopper.name.trim(),
      rank: newTopper.rank ? newTopper.rank.trim() : "1st Position",
      grade: newTopper.grade ? newTopper.grade.trim() : "Class 10th (JKBOSE)",
      score: newTopper.score.trim(), // Versatile: percentage, GPA, grade, marks, rank, etc.
      badge: newTopper.badge ? newTopper.badge.trim() : "Academic Merit",
      img: newTopper.img?.trim() || defaultTopperImg,
      focalY: Number(newTopper.focalY) !== undefined ? Number(newTopper.focalY) : 20,
      focalX: Number(newTopper.focalX) !== undefined ? Number(newTopper.focalX) : 50,
      zoom: Number(newTopper.zoom) || 1.0
    };

    if (editingTopperIdx !== null) {
      setToppers((prev) => prev.map((t, idx) => idx === editingTopperIdx ? item : t));
      setEditingTopperIdx(null);
    } else {
      setToppers((prev) => [item, ...prev]);
    }

    if (saveTopperDoc) {
      saveTopperDoc(item).catch(e => console.warn("[Firebase] Topper save warning:", e));
    }

    setNewTopper({
      name: '',
      rank: '1st Position',
      grade: 'Class 10th (JKBOSE)',
      score: '',
      badge: '',
      img: defaultTopperImg,
      focalY: 20,
      focalX: 50,
      zoom: 1.0
    });
  };

  const handleEditTopper = (idx) => {
    const t = toppers[idx];
    setNewTopper({
      name: t.name || '',
      rank: t.rank || '1st Position',
      grade: t.grade || 'Class 10th (JKBOSE)',
      score: t.score || '',
      badge: t.badge || '',
      img: t.img || defaultTopperImg,
      focalY: t.focalY !== undefined ? t.focalY : 20,
      focalX: t.focalX !== undefined ? t.focalX : 50,
      zoom: t.zoom !== undefined ? t.zoom : 1.0
    });
    setEditingTopperIdx(idx);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteTopper = (name) => {
    setToppers((prev) => prev.filter((t) => t.name !== name));
    if (deleteTopperDoc) {
      deleteTopperDoc(name).catch(e => console.warn("[Firebase] Topper delete warning:", e));
    }
  };

  // --- ACTIVITIES / RECENT PROGRAMMES HANDLERS ---
  const handleAddPhotoToActivity = (photoUrl) => {
    const url = (photoUrl || newGalleryPhotoUrl).trim();
    if (!url) return;
    setNewActivity(prev => {
      const existing = prev.gallery || (prev.img ? [prev.img] : []);
      if (existing.includes(url)) return prev;
      return {
        ...prev,
        gallery: [...existing, url]
      };
    });
    setNewGalleryPhotoUrl('');
  };

  const handleRemovePhotoFromActivity = (photoIdx) => {
    setNewActivity(prev => {
      const existing = prev.gallery || (prev.img ? [prev.img] : []);
      const updated = existing.filter((_, i) => i !== photoIdx);
      return {
        ...prev,
        gallery: updated,
        img: (prev.img === existing[photoIdx] && updated.length > 0) ? updated[0] : prev.img
      };
    });
  };

  const handleSetActivityCoverPhoto = (photoUrl) => {
    setNewActivity(prev => ({
      ...prev,
      img: photoUrl
    }));
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.desc) return;
    const item = {
      title: newActivity.title.trim(),
      date: newActivity.date?.trim() || "SEPTEMBER 2026",
      category: newActivity.category || "SPORTS",
      desc: newActivity.desc.trim(),
      img: newActivity.img?.trim() || defaultActivityImg,
      gallery: (newActivity.gallery && newActivity.gallery.length > 0)
        ? newActivity.gallery
        : [newActivity.img?.trim() || defaultActivityImg],
      focalX: Number(newActivity.focalX) !== undefined ? Number(newActivity.focalX) : 50,
      focalY: Number(newActivity.focalY) !== undefined ? Number(newActivity.focalY) : 50,
      zoom: Number(newActivity.zoom) || 1.0
    };

    const targetIdx = editingActivityIdx !== null ? editingActivityIdx : 0;
    if (editingActivityIdx !== null) {
      setActivities((prev) => prev.map((ev, idx) => idx === editingActivityIdx ? item : ev));
      setEditingActivityIdx(null);
    } else {
      setActivities((prev) => [item, ...prev]);
    }

    if (saveActivityDoc) {
      saveActivityDoc(item, targetIdx).catch(e => console.warn("[Firebase] Activity save warning:", e));
    }

    setNewActivity({
      title: '',
      date: 'SEPTEMBER 2026',
      category: 'SPORTS',
      desc: '',
      img: defaultActivityImg,
      gallery: [defaultActivityImg],
      focalX: 50,
      focalY: 50,
      zoom: 1.0
    });
    setNewGalleryPhotoUrl('');
  };

  const handleEditActivity = (idx) => {
    const a = activities[idx];
    setNewActivity({
      title: a.title || '',
      date: a.date || 'SEPTEMBER 2026',
      category: a.category || 'SPORTS',
      desc: a.desc || '',
      img: a.img || defaultActivityImg,
      gallery: a.gallery ? [...a.gallery] : (a.img ? [a.img] : [defaultActivityImg]),
      focalX: a.focalX !== undefined ? a.focalX : 50,
      focalY: a.focalY !== undefined ? a.focalY : 50,
      zoom: a.zoom !== undefined ? a.zoom : 1.0
    });
    setEditingActivityIdx(idx);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // --- CONTACT & SOCIALS HANDLER ---
  const handleSaveContact = (e) => {
    e.preventDefault();
    if (setContactInfo) setContactInfo(tempContact);
    if (saveContactInfoDoc) {
      saveContactInfoDoc(tempContact)
        .then(() => {
          setContactFeedback({ type: 'success', msg: '✓ School Contact & Social media details saved and published across the entire website!' });
          setTimeout(() => setContactFeedback(null), 4000);
        })
        .catch((err) => {
          setContactFeedback({ type: 'error', msg: `Save failed: ${err.message}` });
        });
    } else {
      setContactFeedback({ type: 'success', msg: '✓ Contact details saved in current session!' });
      setTimeout(() => setContactFeedback(null), 3000);
    }
  };

  const handleDeleteActivity = (idx) => {
    const target = activities[idx];
    setActivities((prev) => prev.filter((_, i) => i !== idx));
    if (deleteActivityDoc && target?.title) {
      deleteActivityDoc(target.title).catch(e => console.warn("[Firebase] Activity delete warning:", e));
    }
  };

  const moveActivity = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= activities.length) return;
    const copy = [...activities];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setActivities(copy);
    if (saveActivityDoc) {
      copy.forEach((act, i) => saveActivityDoc(act, i).catch(() => {}));
    }
  };

  // --- FAQS HANDLERS ---
  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!newFaq.q || !newFaq.a) return;
    const item = { q: newFaq.q.trim(), a: newFaq.a.trim() };
    const targetIdx = editingFaqIdx !== null ? editingFaqIdx : faqs.length;

    if (editingFaqIdx !== null) {
      setFaqs((prev) => prev.map((f, idx) => idx === editingFaqIdx ? item : f));
      setEditingFaqIdx(null);
    } else {
      setFaqs((prev) => [...prev, item]);
    }

    if (saveFaqDoc) {
      saveFaqDoc(item, targetIdx).catch(e => console.warn("[Firebase] FAQ save warning:", e));
    }

    setNewFaq({ q: '', a: '' });
  };

  const handleEditFaq = (idx) => {
    const f = faqs[idx];
    setNewFaq({ q: f.q, a: f.a });
    setEditingFaqIdx(idx);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteFaq = (idx) => {
    const target = faqs[idx];
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
    if (deleteFaqDoc && target?.q) {
      deleteFaqDoc(target.q).catch(e => console.warn("[Firebase] FAQ delete warning:", e));
    }
  };

  const moveFaq = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;
    const copy = [...faqs];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFaqs(copy);
    if (saveFaqDoc) {
      copy.forEach((fq, i) => saveFaqDoc(fq, i).catch(() => {}));
    }
  };

  const handleToggleEmergencyBanner = () => {
    const updated = { ...emergencyBanner, active: !emergencyBanner.active };
    setEmergencyBanner(updated);
    if (saveEmergencyBannerDoc) {
      saveEmergencyBannerDoc(updated).catch(e => console.warn("[Firebase] Banner sync warning:", e));
    }
  };

  const handleUpdateEmergencyText = (text) => {
    const updated = { ...emergencyBanner, text };
    setEmergencyBanner(updated);
    if (saveEmergencyBannerDoc) {
      saveEmergencyBannerDoc(updated).catch(e => console.warn("[Firebase] Banner text sync warning:", e));
    }
  };

  // --- HERO SLIDESHOW HANDLERS & PRESETS ---
  const heroPresets = [
    {
      title: "Campus Block",
      url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80",
      label: "MAIN CAMPUS & ADMINISTRATIVE BLOCK — KULGAM"
    },
    {
      title: "Smart Classroom",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1920&q=80",
      label: "ACTIVE CLASSROOM LEARNING & INTERACTION"
    },
    {
      title: "Science & Computer Lab",
      url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
      label: "MODERN SCIENCE & COMPUTER LABS"
    },
    {
      title: "Central Library",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=80",
      label: "CENTRAL KNOWLEDGE LIBRARY & READING CORRIDORS"
    },
    {
      title: "Sports Grounds",
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80",
      label: "OUTDOOR SPORTS COMPLEX & ATHLETIC TRAINING"
    },
    {
      title: "Morning Assembly",
      url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1920&q=80",
      label: "STUDENT MORNING ASSEMBLY & CULTURAL PROGRAMMES"
    }
  ];

  const handleSaveHeroSlide = (e) => {
    e.preventDefault();
    if (!newSlide.url || !newSlide.label) return;
    const slideItem = {
      id: editingSlideIdx !== null ? (heroSlides[editingSlideIdx]?.id || `slide-${Date.now()}`) : `slide-${Date.now()}`,
      url: newSlide.url.trim(),
      label: newSlide.label.trim().toUpperCase()
    };

    let updatedSlides = [];
    if (editingSlideIdx !== null) {
      updatedSlides = heroSlides.map((s, idx) => idx === editingSlideIdx ? slideItem : s);
      setEditingSlideIdx(null);
    } else {
      updatedSlides = [...heroSlides, slideItem];
    }

    setHeroSlides(updatedSlides);
    try {
      localStorage.setItem('opnawaz_hero_slides', JSON.stringify(updatedSlides));
    } catch (err) {}

    if (saveAllHeroSlidesDoc) {
      saveAllHeroSlidesDoc(updatedSlides).catch(e => console.warn("[Firebase] Hero slide save warning:", e));
    }

    setNewSlide({
      url: heroPresets[0].url,
      label: heroPresets[0].label
    });
    setSlideFeedback({ type: 'success', msg: '✓ Hero slide saved and updated live on the website!' });
    setTimeout(() => setSlideFeedback(null), 3500);
  };

  const handleEditHeroSlide = (idx) => {
    const s = heroSlides[idx];
    if (!s) return;
    setNewSlide({
      url: s.url || '',
      label: s.label || ''
    });
    setEditingSlideIdx(idx);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleDeleteHeroSlide = (idx) => {
    if (heroSlides.length <= 1) {
      alert("At least one hero slide must remain active in the slideshow.");
      return;
    }
    const slideToDelete = heroSlides[idx];
    const updated = heroSlides.filter((_, i) => i !== idx);
    setHeroSlides(updated);
    try {
      localStorage.setItem('opnawaz_hero_slides', JSON.stringify(updated));
    } catch (err) {}

    if (deleteHeroSlideDoc && slideToDelete?.id) {
      deleteHeroSlideDoc(slideToDelete.id).catch(e => console.warn("[Firebase] Hero slide delete warning:", e));
    }
    if (saveAllHeroSlidesDoc) {
      saveAllHeroSlidesDoc(updated).catch(e => console.warn("[Firebase] Hero slide sync warning:", e));
    }

    if (editingSlideIdx === idx) {
      setEditingSlideIdx(null);
      setNewSlide({ url: defaultSlideImg, label: 'MAIN CAMPUS & ADMINISTRATIVE BLOCK — KULGAM' });
    }
    setSlideFeedback({ type: 'success', msg: '✓ Slide removed from hero slideshow.' });
    setTimeout(() => setSlideFeedback(null), 3000);
  };

  const handleMoveHeroSlide = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
    const copy = [...heroSlides];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setHeroSlides(copy);
    try {
      localStorage.setItem('opnawaz_hero_slides', JSON.stringify(copy));
    } catch (err) {}
    if (saveAllHeroSlidesDoc) {
      saveAllHeroSlidesDoc(copy).catch(e => console.warn("[Firebase] Hero slide reorder warning:", e));
    }
  };

  const handleResetHeroSlides = () => {
    if (initialTemplates?.heroSlides) {
      setHeroSlides(initialTemplates.heroSlides);
      try {
        localStorage.setItem('opnawaz_hero_slides', JSON.stringify(initialTemplates.heroSlides));
      } catch (err) {}
      if (saveAllHeroSlidesDoc) {
        saveAllHeroSlidesDoc(initialTemplates.heroSlides).catch(e => console.warn("[Firebase] Hero slide reset warning:", e));
      }
      setSlideFeedback({ type: 'success', msg: '✓ Hero slides reset to default initial templates!' });
      setTimeout(() => setSlideFeedback(null), 3500);
    }
  };

  // --- GOOGLE SIGN IN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#122818] text-white flex flex-col justify-between font-mono selection:bg-[#52B788] selection:text-[#122818]">
        {/* Top Header */}
        <div className="border-b-2 border-white/20 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={schoolLogo}
              alt="Opinawaz Universal Public School Logo"
              className="w-10 h-10 object-contain rounded border-2 border-white bg-white p-0.5"
            />
            <div>
              <h2 className="font-extrabold text-sm sm:text-base uppercase tracking-tight">Opinawaz Universal Public School</h2>
              <p className="text-[10px] text-[#95D5B2] uppercase">Administrative Access Gateway // Kulgam</p>
            </div>
          </div>
          <button
            onClick={onBackToWebsite}
            className="bg-white/10 hover:bg-white hover:text-[#122818] text-xs font-bold px-4 py-2 border border-white transition-all cursor-pointer"
          >
            ← Back to Public Website
          </button>
        </div>

        {/* Google Authentication Box */}
        <div className="max-w-lg w-full mx-auto px-6 py-12">
          <div className="bg-[#F7F9F5] text-[#122818] border-4 border-[#122818] p-8 shadow-[8px_8px_0px_#52B788]">
            {/* Top Icon / Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 bg-[#52B788] text-[#122818] text-[10px] font-black px-2.5 py-1 border border-[#122818] mb-3 uppercase tracking-wider">
                <span>🔒</span>
                <span>RESTRICTED PERSONNEL ONLY</span>
              </div>
              <h3 className="font-black text-2xl uppercase tracking-tight text-[#122818]">
                School Admin Sign In
              </h3>
              <p className="text-xs text-neutral-600 mt-1 font-sans leading-relaxed">
                Sign in with an authorized institutional account to access the administrative console. Unauthorized sign-in attempts will be redirected to the home page.
              </p>
            </div>

            {/* Institutional Access Notice (No hardcoded email shown) */}
            <div className="bg-[#E9EFE6] border-2 border-[#122818] p-3 text-xs mb-4 shadow-[2px_2px_0px_#122818] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span className="font-bold text-[11px] text-[#122818]">Authorized institutional accounts only</span>
              </div>
              <span className="text-[9px] bg-[#122818] text-[#D8F3DC] font-bold px-1.5 py-0.5">LOCKED</span>
            </div>

            {/* Error Message Box (if any) */}
            {authError && (
              <div className="mb-6 p-4 bg-red-100 border-3 border-[#D90429] text-[#D90429] text-xs space-y-1.5 shadow-[3px_3px_0px_#D90429]">
                <div className="flex items-center gap-1.5 font-black uppercase text-xs">
                  <span>🚫 AUTHENTICATION NOTICE</span>
                </div>
                <p className="font-sans leading-relaxed text-xs text-neutral-900 font-semibold">
                  {authError}
                </p>
              </div>
            )}

            {/* Primary Google Login Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-white hover:bg-neutral-50 text-[#122818] font-black py-4 px-6 uppercase border-3 border-[#122818] shadow-[5px_5px_0px_#122818] hover:shadow-[2px_2px_0px_#122818] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-3 text-sm disabled:opacity-60"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
              </button>

              {/* Status and Project Tag */}
              <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 font-mono border-t border-neutral-300">
                <span>PROJECT: <strong>opnawazschool</strong></span>
                <span className="text-[#2D6A4F] font-bold">● Google Auth Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 p-4 text-center text-xs text-neutral-400">
          Opinawaz Universal Public School, Karewa, Kulgam • Protected Administrative System
        </div>
      </div>
    );
  }

  // --- FULL ADMINISTRATIVE DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#F7F9F5] text-[#122818] font-mono selection:bg-[#52B788] selection:text-[#122818] flex flex-col">
      {/* Top Banner & Institutional Bar */}
      <header className="bg-[#122818] text-white border-b-2 border-[#122818] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={schoolLogo}
              alt="Opinawaz Universal Public School Logo"
              className="w-10 h-10 object-contain rounded border-2 border-white bg-white p-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#52B788] text-[#122818] text-[9px] font-bold px-1.5 py-0.5 uppercase">
                  ACTIVE SESSION 2026–27
                </span>
                <span className="text-[10px] text-neutral-400">RESTRICTED CONSOLE</span>
              </div>
              <h1 className="font-extrabold text-base md:text-lg uppercase tracking-tight text-white">
                Opinawaz Universal Public School — Administration Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 bg-white/10 p-1.5 pr-3 border border-white/30 rounded">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Admin'}
                    className="w-7 h-7 rounded-full border border-white object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#52B788] text-[#122818] font-bold text-xs flex items-center justify-center border border-white">
                    {currentUser.displayName?.[0] || 'G'}
                  </div>
                )}
                <div className="hidden md:block text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[11px] text-white">
                      {currentUser.displayName || 'Google Admin'}
                    </span>
                    <span className="bg-[#52B788] text-[#122818] text-[8px] font-black px-1 rounded uppercase">
                      Google
                    </span>
                  </div>
                  <span className="text-[9px] text-neutral-300 font-mono block truncate max-w-[150px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="bg-red-900/50 hover:bg-[#D90429] text-white text-xs font-bold px-3 py-1.5 border border-red-400 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Google"
            >
              <span>🔒</span>
              <span>Sign Out</span>
            </button>
            <button
              onClick={onBackToWebsite}
              className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white text-xs font-bold px-4 py-1.5 border-2 border-white shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
            >
              ← Back to Public Website
            </button>
          </div>
        </div>
      </header>

      {/* Main Administrative Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-1 flex flex-col gap-6">
        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">INQUIRIES</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#122818]">{inquiries.length}</span>
              <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#D8F3DC] px-1.5 py-0.5 border border-[#122818]">
                {inquiries.filter(i => i.status === 'Pending').length} Pnd
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">NOTICES</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#122818]">{announcements.length}</span>
              <span className="text-[10px] font-bold bg-[#FFE600] text-[#122818] px-1.5 py-0.5 border border-[#122818]">
                Live
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">TOPPERS</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#122818]">{toppers.length}</span>
              <span className="text-[10px] font-bold bg-[#38E5FF] text-[#122818] px-1.5 py-0.5 border border-[#122818]">
                Merit
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">ACTIVITIES</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#122818]">{activities.length}</span>
              <span className="text-[10px] font-bold bg-[#D8F3DC] text-[#2D6A4F] px-1.5 py-0.5 border border-[#122818]">
                Events
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">FAQS</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#122818]">{faqs.length}</span>
              <span className="text-[10px] font-bold bg-[#E9EFE6] text-[#122818] px-1.5 py-0.5 border border-[#122818]">
                Topics
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">ALERT BANNER</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xs font-black ${emergencyBanner.active ? 'text-[#D90429]' : 'text-neutral-500'}`}>
                {emergencyBanner.active ? '● ACTIVE' : '○ OFF'}
              </span>
              <button
                onClick={handleToggleEmergencyBanner}
                className={`text-[9px] font-bold px-1.5 py-0.5 border border-[#122818] cursor-pointer ${
                  emergencyBanner.active ? 'bg-[#D90429] text-white' : 'bg-neutral-200'
                }`}
              >
                Toggle
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-[#122818] p-3 shadow-[3px_3px_0px_#122818]">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block mb-1">CONTACT & SOCIALS</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black text-[#2D6A4F]">READY</span>
              <button
                onClick={() => setActiveTab('CONTACT')}
                className="text-[9px] font-bold px-1.5 py-0.5 border border-[#122818] bg-[#D8F3DC] text-[#122818] cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2 border-b-2 border-[#122818] pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('INQUIRIES')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'INQUIRIES' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            📋 Leads & Inquiries ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('NOTICES')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'NOTICES' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            📢 Circulars & Notices ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('TOPPERS')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'TOPPERS' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            ★ Toppers & Face Crop ({toppers.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVITIES')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'ACTIVITIES' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            🗓 School Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('FAQS')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'FAQS' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            💬 Website FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'BROADCAST' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            🚨 Emergency Alert Strip
          </button>
          <button
            onClick={() => setActiveTab('CONTACT')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'CONTACT' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            🏢 Contact & Socials
          </button>
          <button
            onClick={() => setActiveTab('SLIDES')}
            className={`px-3.5 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer uppercase ${
              activeTab === 'SLIDES' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#E9EFE6]'
            }`}
          >
            🖼️ Hero Slideshow ({heroSlides?.length || 0})
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: INQUIRIES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'INQUIRIES' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-[#122818] p-4 shadow-[4px_4px_0px_#122818] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by student, parent, phone, locality, or ref ID..."
                  value={searchInquiry}
                  onChange={(e) => setSearchInquiry(e.target.value)}
                  className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2 text-xs focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Showing {filteredInquiries.length} of {inquiries.length}</span>
                <button
                  onClick={exportInquiriesCSV}
                  className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold px-4 py-2 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] transition-all cursor-pointer text-xs uppercase"
                >
                  ⬇ Export All to CSV
                </button>
              </div>
            </div>

            <div className="border-2 border-[#122818] bg-white overflow-x-auto shadow-[4px_4px_0px_#122818]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#122818] text-[#D8F3DC] border-b-2 border-[#122818] text-[11px]">
                    <th className="p-3">REF</th>
                    <th className="p-3">SUBMISSION DATE</th>
                    <th className="p-3">STUDENT FULL NAME</th>
                    <th className="p-3">PARENT / GUARDIAN</th>
                    <th className="p-3">REQUESTED GRADE</th>
                    <th className="p-3">CONTACT PHONE</th>
                    <th className="p-3">LOCALITY / ADDRESS</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">MANAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-xs">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-neutral-500 font-bold">
                        No inquiries matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-[#F7F9F5]">
                        <td className="p-3 font-bold text-[#2D6A4F]">{inq.id}</td>
                        <td className="p-3 text-neutral-500 whitespace-nowrap">{inq.date}</td>
                        <td className="p-3 font-bold text-[#122818]">{inq.studentName}</td>
                        <td className="p-3">{inq.parentName}</td>
                        <td className="p-3 whitespace-nowrap bg-[#D8F3DC]/50 font-semibold">{inq.grade}</td>
                        <td className="p-3 font-mono">
                          <a href={`tel:${inq.phone}`} className="hover:underline font-bold text-[#2D6A4F]">{inq.phone}</a>
                        </td>
                        <td className="p-3 text-neutral-600 max-w-[160px] truncate">{inq.locality}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 border text-[10px] font-bold ${
                              inq.status === 'Approved'
                                ? 'bg-[#52B788] text-[#122818] border-[#122818]'
                                : inq.status === 'Contacted'
                                ? 'bg-[#38E5FF] text-[#122818] border-[#122818]'
                                : 'bg-[#FFE600] text-[#122818] border-[#122818]'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleStatusChange(inq.id, 'Contacted')}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-400 text-[11px] font-bold cursor-pointer"
                            title="Mark Contacted"
                          >
                            📞 Call Made
                          </button>
                          <button
                            onClick={() => handleStatusChange(inq.id, 'Approved')}
                            className="px-2.5 py-1 bg-[#52B788] hover:bg-[#2D6A4F] hover:text-white border border-[#122818] text-[11px] font-bold cursor-pointer"
                            title="Approve / Enroll"
                          >
                            ✓ Enroll
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="px-2 py-1 bg-red-100 hover:bg-[#D90429] hover:text-white border border-red-300 text-[11px] font-bold cursor-pointer"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: NOTICES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'NOTICES' && (
          <div className="space-y-6">
            <form onSubmit={handleAddNotice} className="bg-white border-2 border-[#122818] p-6 shadow-[4px_4px_0px_#122818] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#122818] pb-2">
                <h3 className="font-extrabold text-sm uppercase text-[#122818]">Create & Publish Public Bulletin Notice</h3>
                <span className="text-[10px] text-neutral-500">Syncs live to the website notices strip</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-bold uppercase mb-1">Circular / Notice Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Parent Teacher Meet for Primary Wing scheduled on Saturday"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase mb-1">Category Badge</label>
                  <select
                    value={newNotice.tag}
                    onChange={(e) => setNewNotice({ ...newNotice, tag: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white text-xs font-bold"
                  >
                    <option>ADMISSION</option>
                    <option>NOTICE</option>
                    <option>EVENT</option>
                    <option>FACILITY</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase mb-1">Date / Month</label>
                  <input
                    type="text"
                    value={newNotice.date}
                    onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-2.5 px-6 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] cursor-pointer text-xs"
              >
                + Publish Notice to Live Website
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#122818] uppercase">Currently Published Notices ({announcements.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-white border-2 border-[#122818] p-4 shadow-[3px_3px_0px_#122818] flex justify-between items-start gap-4">
                    <div>
                      <div className="flex gap-2 items-center text-[10px] mb-1.5 font-bold">
                        <span className="bg-[#D8F3DC] px-2 py-0.5 border border-[#122818]">{item.tag}</span>
                        <span className="text-neutral-500">{item.date}</span>
                        <span className="text-neutral-400">REF: {item.id}</span>
                      </div>
                      <p className="font-bold text-xs text-[#122818] leading-snug">{item.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(item.id)}
                      className="bg-red-100 hover:bg-[#D90429] hover:text-white px-2.5 py-1.5 border border-red-400 text-xs font-bold cursor-pointer"
                      title="Delete Notice"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TOPPERS MANAGEMENT (With Image Link & Face Crop) */}
        {/* ========================================================= */}
        {activeTab === 'TOPPERS' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveTopper} className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#122818] pb-3">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-[#122818]">
                    {editingTopperIdx !== null ? `Edit Academic Topper Record (#${editingTopperIdx + 1})` : "Register New Student Topper"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Add student details, paste an image link (Imgur / Postimages / Web), and adjust face cropping so the head is never cut off!
                  </p>
                </div>
                {editingTopperIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTopperIdx(null);
                      setNewTopper({
                        name: '',
                        rank: 'School Merit',
                        grade: 'Class 10th (JKBOSE)',
                        score: '',
                        badge: '',
                        img: defaultTopperImg,
                        focalY: 20,
                        focalX: 50,
                        zoom: 1.0
                      });
                    }}
                    className="text-xs font-bold text-neutral-600 underline cursor-pointer"
                  >
                    ✕ Cancel Edit
                  </button>
                )}
              </div>

              {/* Text Inputs (Highly versatile: GPA, Grade, Rank 1st/2nd, Marks, etc.) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                {/* 1. Full Name */}
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tahir Hussain"
                    value={newTopper.name}
                    onChange={(e) => setNewTopper({ ...newTopper, name: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-bold"
                  />
                </div>

                {/* 2. Class / Grade / Stream */}
                <div className="sm:col-span-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase">Class / Stream *</label>
                    <span className="text-[9px] text-neutral-400">Class or Board</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Class 10th (JKBOSE)"
                    value={newTopper.grade}
                    onChange={(e) => setNewTopper({ ...newTopper, grade: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["Class 10th", "Class 12th (Sci)", "Class 12th (Arts)", "Class 8th"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTopper(prev => ({ ...prev, grade: c }))}
                        className="text-[9px] bg-neutral-100 hover:bg-[#D8F3DC] text-neutral-700 px-1.5 py-0.5 border border-neutral-300 cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Rank / Position */}
                <div className="sm:col-span-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase">Rank / Position</label>
                    <span className="text-[9px] text-neutral-400">1st, 2nd, Rank #1...</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., 1st Position, 2nd, Rank #1"
                    value={newTopper.rank}
                    onChange={(e) => setNewTopper({ ...newTopper, rank: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["1st", "2nd", "3rd", "1st Position", "District 1st", "Merit"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewTopper(prev => ({ ...prev, rank: r }))}
                        className="text-[9px] bg-neutral-100 hover:bg-[#D8F3DC] text-neutral-700 px-1.5 py-0.5 border border-neutral-300 cursor-pointer"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Score / GPA / Grade / Marks */}
                <div className="sm:col-span-6">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-[#122818]">
                      Score / GPA / Grade / Marks *
                    </label>
                    <span className="text-[9px] text-[#2D6A4F] font-bold">Any Format Accepted</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 98.4% or GPA 4.0 or Grade A+ or 495/500"
                    value={newTopper.score}
                    onChange={(e) => setNewTopper({ ...newTopper, score: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono font-bold text-sm"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[9px] text-neutral-500 self-center">Quick formats:</span>
                    {[
                      { label: "98.4%", val: "98.4%" },
                      { label: "GPA 4.0", val: "GPA 4.0" },
                      { label: "3.95 GPA", val: "3.95 GPA" },
                      { label: "Grade A+", val: "Grade A+" },
                      { label: "492 / 500", val: "492 / 500" },
                      { label: "10 CGPA", val: "10 CGPA" }
                    ].map((f) => (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => setNewTopper(prev => ({ ...prev, score: f.val }))}
                        className="text-[9px] bg-white hover:bg-[#52B788] hover:text-[#122818] text-neutral-800 px-2 py-0.5 border border-[#122818] cursor-pointer font-mono"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Award / Honor Badge */}
                <div className="sm:col-span-6">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase">Award / Honor Badge</label>
                    <span className="text-[9px] text-neutral-400">Card Badge Tag</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Gold Medalist in Science"
                    value={newTopper.badge}
                    onChange={(e) => setNewTopper({ ...newTopper, badge: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["Gold Medalist", "Math 100/100", "Science Distinction", "State Top Ranker", "Principal's Roll"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setNewTopper(prev => ({ ...prev, badge: b }))}
                        className="text-[9px] bg-neutral-100 hover:bg-[#D8F3DC] text-neutral-700 px-1.5 py-0.5 border border-neutral-300 cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image URL & Live Face-Crop / Focal Point Control */}
              <div className="p-4 bg-[#F7F9F5] border-2 border-[#122818] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-[#122818]">
                        Student Photo Link & Face-Crop Alignment
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Supports links from Imgur (i.imgur.com), Postimages (i.postimg.cc), Unsplash, or direct image URLs.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTopper(prev => ({
                        ...prev,
                        img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                        focalY: 20
                      }))}
                      className="text-[10px] bg-white border border-[#122818] px-2 py-1 font-bold hover:bg-[#D8F3DC] cursor-pointer"
                    >
                      Sample Girl Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTopper(prev => ({
                        ...prev,
                        img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
                        focalY: 20
                      }))}
                      className="text-[10px] bg-white border border-[#122818] px-2 py-1 font-bold hover:bg-[#D8F3DC] cursor-pointer"
                    >
                      Sample Boy Photo
                    </button>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">
                    Image Link URL (Imgur / Postimages / Web URL)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://i.imgur.com/... or https://i.postimg.cc/... or web link"
                    value={newTopper.img}
                    onChange={(e) => setNewTopper({ ...newTopper, img: e.target.value })}
                    className="w-full bg-white border-2 border-[#122818] p-2.5 text-xs font-mono"
                  />
                </div>

                {/* Two-Column Interactive Face-Cropper & Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left: Sliders & Quick Presets */}
                  <div className="lg:col-span-7 space-y-4 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase mb-1.5 text-neutral-700">
                        1. QUICK PRESET FOCUS:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewTopper(prev => ({ ...prev, focalY: 15, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newTopper.focalY <= 20 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          👤 Face Focus (15%)
                          <span className="block text-[9px] font-normal text-neutral-600">Prevents head cut</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewTopper(prev => ({ ...prev, focalY: 30, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newTopper.focalY > 20 && newTopper.focalY <= 40 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          👔 Upper Body (30%)
                          <span className="block text-[9px] font-normal text-neutral-600">Shoulders & Face</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewTopper(prev => ({ ...prev, focalY: 50, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newTopper.focalY > 40 && newTopper.focalY <= 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          🎯 Center (50%)
                          <span className="block text-[9px] font-normal text-neutral-600">Standard Center</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewTopper(prev => ({ ...prev, focalY: 75, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newTopper.focalY > 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          👟 Lower (75%)
                          <span className="block text-[9px] font-normal text-neutral-600">Torso / Trophies</span>
                        </button>
                      </div>
                    </div>

                    {/* Fine Tuning Sliders */}
                    <div className="bg-white p-4 border-2 border-[#122818] space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Vertical Focal Height (Y-Axis): <span className="text-[#2D6A4F]">{newTopper.focalY}%</span>
                          </label>
                          <span className="text-[10px] text-neutral-500">
                            {newTopper.focalY <= 25 ? 'Top / Face Protected' : newTopper.focalY <= 60 ? 'Mid Body' : 'Lower Body'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={newTopper.focalY}
                          onChange={(e) => setNewTopper({ ...newTopper, focalY: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                          <span>0% (Hairline / Top)</span>
                          <span className="font-bold text-[#2D6A4F]">▲ Recommended: 15%–25%</span>
                          <span>100% (Feet)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Zoom / Crop Scale: <span className="text-[#2D6A4F]">{newTopper.zoom}x</span>
                          </label>
                          <span className="text-[10px] text-neutral-500">Zoom in on distant faces</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="1.8"
                          step="0.05"
                          value={newTopper.zoom}
                          onChange={(e) => setNewTopper({ ...newTopper, zoom: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Horizontal Center (X-Axis): <span className="text-[#2D6A4F]">{newTopper.focalX}%</span>
                          </label>
                          <span className="text-[10px] font-bold text-neutral-600">
                            {newTopper.focalX <= 35 ? '◄ Left Subject' : newTopper.focalX >= 65 ? 'Right Subject ►' : '● Center (50%)'}
                          </span>
                        </div>
                        {/* Quick Presets for Horizontal Alignment */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setNewTopper(prev => ({ ...prev, focalX: 25 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              newTopper.focalX <= 35 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            ◄ Left (25%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTopper(prev => ({ ...prev, focalX: 50 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              newTopper.focalX > 35 && newTopper.focalX < 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            ● Center (50%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTopper(prev => ({ ...prev, focalX: 75 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              newTopper.focalX >= 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            Right (75%) ►
                          </button>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={newTopper.focalX}
                          onChange={(e) => setNewTopper({ ...newTopper, focalX: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                          <span>0% (Far Left)</span>
                          <span className="font-bold text-[#2D6A4F]">50% Center</span>
                          <span>100% (Far Right)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Interactive Card & Avatar Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <span className="block text-[10px] font-bold uppercase text-neutral-700">
                      2. LIVE WEBSITE CARD & AVATAR PREVIEW:
                    </span>

                    {/* Exact Card Preview */}
                    <div className="bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] overflow-hidden">
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-200 border-b-2 border-[#122818]">
                        <img
                          src={newTopper.img || defaultTopperImg}
                          alt="Topper Live Card Preview"
                          className="w-full h-full object-cover transition-all"
                          style={getTopperImageStyle(newTopper)}
                        />
                        <span className="absolute top-2 left-2 bg-[#122818] text-[#D8F3DC] text-[10px] font-mono font-bold px-2 py-0.5 border border-white">
                          {newTopper.rank || "1st Position"}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-[#52B788] text-[#122818] font-black text-sm font-mono px-2 py-0.5 border border-[#122818]">
                          {newTopper.score || "98.4%"}
                        </span>
                      </div>
                      <div className="p-3">
                        <span className="text-[9px] text-[#2D6A4F] font-bold uppercase block">{newTopper.grade || "Class 10th (JKBOSE)"}</span>
                        <h5 className="font-extrabold text-sm text-[#122818] leading-tight mt-0.5">{newTopper.name || "Student Name Preview"}</h5>
                        <p className="text-[10px] text-neutral-600 bg-[#D8F3DC]/50 p-1.5 border border-[#122818] mt-2 font-mono">
                          ★ {newTopper.badge || "Academic Merit"}
                        </p>
                      </div>
                    </div>

                    {/* Minimized Circular Avatar Test */}
                    <div className="bg-white border-2 border-[#122818] p-2.5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-[#122818] overflow-hidden bg-neutral-200 flex-shrink-0">
                        <img
                          src={newTopper.img || defaultTopperImg}
                          alt="Minimized Face Preview"
                          className="w-full h-full object-cover"
                          style={getTopperImageStyle(newTopper)}
                        />
                      </div>
                      <div className="text-[10px] leading-tight">
                        <span className="font-bold block text-[#122818]">Minimized Avatar Validation</span>
                        <span className="text-neutral-500">Face stays in frame without being cut off on mobile.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-3 px-8 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] cursor-pointer text-xs"
                >
                  {editingTopperIdx !== null ? "✓ Update Topper Record" : "+ Save & Publish Topper to Website"}
                </button>
              </div>
            </form>

            {/* List of Active Toppers with Edit / Delete */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#122818] uppercase">Published Academic Toppers ({toppers.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {toppers.map((t, idx) => (
                  <div key={idx} className="bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-200 border-b-2 border-[#122818]">
                        <img
                          src={t.img}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          style={getTopperImageStyle(t)}
                        />
                        <span className="absolute top-2 left-2 bg-[#122818] text-[#D8F3DC] text-[9px] font-mono font-bold px-1.5 py-0.5 border border-white">
                          {t.rank}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-[#52B788] text-[#122818] font-black text-xs font-mono px-1.5 py-0.5 border border-[#122818]">
                          {t.score}
                        </span>
                      </div>
                      <div className="p-3">
                        <h5 className="font-bold text-xs text-[#122818] leading-tight">{t.name}</h5>
                        <p className="text-[10px] text-neutral-500">{t.grade}</p>
                        <p className="text-[9px] text-[#2D6A4F] font-bold mt-1 bg-[#D8F3DC]/40 p-1 border border-[#122818]">
                          ★ {t.badge}
                        </p>
                        <p className="text-[9px] text-neutral-400 mt-1 font-mono">
                          Focal: {t.focalX !== undefined ? t.focalX : 50}% X, {t.focalY !== undefined ? t.focalY : 20}% Y | Zoom: {t.zoom || 1.0}x
                        </p>
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex gap-2">
                      <button
                        onClick={() => handleEditTopper(idx)}
                        className="flex-1 bg-neutral-100 hover:bg-[#52B788] hover:text-[#122818] border border-[#122818] py-1.5 text-[10px] font-bold cursor-pointer text-center"
                      >
                        ✏️ Edit / Recrop
                      </button>
                      <button
                        onClick={() => handleDeleteTopper(t.name)}
                        className="bg-red-100 hover:bg-[#D90429] hover:text-white border border-red-300 px-2.5 py-1.5 text-[10px] font-bold cursor-pointer"
                        title="Delete record"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SCHOOL ACTIVITIES & PROGRAMMES (NEW EDITABLE) */}
        {/* ========================================================= */}
        {activeTab === 'ACTIVITIES' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveActivity} className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#122818] pb-3">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-[#122818]">
                    {editingActivityIdx !== null ? `Edit School Activity (#${editingActivityIdx + 1})` : "Publish School Programme / Activity"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Displayed directly on the public site under "Recent School Programs & Events" tab.
                  </p>
                </div>
                {editingActivityIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivityIdx(null);
                      setNewActivity({
                        title: '',
                        date: 'SEPTEMBER 2026',
                        category: 'SPORTS',
                        desc: '',
                        img: defaultActivityImg,
                        focalY: 50
                      });
                    }}
                    className="text-xs font-bold text-neutral-600 underline cursor-pointer"
                  >
                    ✕ Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                <div className="sm:col-span-6">
                  <label className="block text-[10px] font-bold uppercase mb-1">Event / Programme Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Annual Sports Meet & Athletic Championship"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase mb-1">Category Badge</label>
                  <select
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-bold"
                  >
                    <option>SPORTS</option>
                    <option>ACADEMICS</option>
                    <option>CULTURE</option>
                    <option>EXHIBITION</option>
                    <option>COMMUNITY</option>
                    <option>WORKSHOP</option>
                    <option>FACILITY</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase mb-1">Event Date / Month</label>
                  <input
                    type="text"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[10px] font-bold uppercase mb-1">Event Summary / Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed summary of student participation, activities conducted, and achievements..."
                  value={newActivity.desc}
                  onChange={(e) => setNewActivity({ ...newActivity, desc: e.target.value })}
                  className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-sans text-xs"
                />
              </div>

              {/* Activity Image URL & Live Interactive Cropping / Alignment */}
              <div className="p-4 bg-[#F7F9F5] border-2 border-[#122818] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-[#122818]">
                        Activity Photo Link & Live Cropping Alignment
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Supports links from Imgur (i.imgur.com), Postimages (i.postimg.cc), Unsplash, or direct image URLs.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewActivity(prev => ({
                        ...prev,
                        img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
                        focalX: 50,
                        focalY: 50,
                        zoom: 1.0
                      }))}
                      className="text-[10px] bg-white border border-[#122818] px-2 py-1 font-bold hover:bg-[#D8F3DC] cursor-pointer"
                    >
                      Sample Sports
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewActivity(prev => ({
                        ...prev,
                        img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
                        focalX: 50,
                        focalY: 40,
                        zoom: 1.0
                      }))}
                      className="text-[10px] bg-white border border-[#122818] px-2 py-1 font-bold hover:bg-[#D8F3DC] cursor-pointer"
                    >
                      Sample Classroom
                    </button>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">
                    Image Link URL (Imgur / Postimages / Web URL)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... or hosted image link"
                    value={newActivity.img}
                    onChange={(e) => setNewActivity({ ...newActivity, img: e.target.value })}
                    className="w-full bg-white border-2 border-[#122818] p-2.5 text-xs font-mono"
                  />
                </div>

                {/* Two-Column Interactive Cropper & Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left: Sliders & Quick Presets */}
                  <div className="lg:col-span-7 space-y-4 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase mb-1.5 text-neutral-700">
                        1. VERTICAL FOCUS PRESETS:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewActivity(prev => ({ ...prev, focalY: 15, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newActivity.focalY <= 20 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          👤 Face / Top (15%)
                          <span className="block text-[9px] font-normal text-neutral-600">Portraits & Speakers</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewActivity(prev => ({ ...prev, focalY: 35, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newActivity.focalY > 20 && newActivity.focalY <= 45 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          👔 Upper Stage (35%)
                          <span className="block text-[9px] font-normal text-neutral-600">Stage Performances</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewActivity(prev => ({ ...prev, focalY: 50, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newActivity.focalY > 45 && newActivity.focalY <= 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          🎯 Center (50%)
                          <span className="block text-[9px] font-normal text-neutral-600">Standard Balance</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewActivity(prev => ({ ...prev, focalY: 75, zoom: 1.0 }))}
                          className={`p-2 border-2 text-[10px] font-bold cursor-pointer text-center ${
                            newActivity.focalY > 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300'
                          }`}
                        >
                          🏃 Field Action (75%)
                          <span className="block text-[9px] font-normal text-neutral-600">Ground / Sports action</span>
                        </button>
                      </div>
                    </div>

                    {/* Fine Tuning Sliders */}
                    <div className="bg-white p-4 border-2 border-[#122818] space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Vertical Focal Height (Y-Axis): <span className="text-[#2D6A4F]">{newActivity.focalY}%</span>
                          </label>
                          <span className="text-[10px] text-neutral-500 font-bold">
                            {newActivity.focalY <= 25 ? 'Top / Faces' : newActivity.focalY <= 60 ? 'Mid Scene' : 'Lower Ground'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={newActivity.focalY}
                          onChange={(e) => setNewActivity({ ...newActivity, focalY: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                          <span>0% (Top Horizon)</span>
                          <span className="font-bold text-[#2D6A4F]">50% Center</span>
                          <span>100% (Ground)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Zoom / Crop Scale: <span className="text-[#2D6A4F]">{newActivity.zoom || 1.0}x</span>
                          </label>
                          <span className="text-[10px] text-neutral-500">Zoom in on scene action</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="1.8"
                          step="0.05"
                          value={newActivity.zoom || 1.0}
                          onChange={(e) => setNewActivity({ ...newActivity, zoom: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold uppercase">
                            Horizontal Center (X-Axis): <span className="text-[#2D6A4F]">{newActivity.focalX || 50}%</span>
                          </label>
                          <span className="text-[10px] font-bold text-neutral-600">
                            {(newActivity.focalX || 50) <= 35 ? '◄ Left Subject' : (newActivity.focalX || 50) >= 65 ? 'Right Subject ►' : '● Center (50%)'}
                          </span>
                        </div>
                        {/* Quick Presets for Horizontal Alignment */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setNewActivity(prev => ({ ...prev, focalX: 25 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              (newActivity.focalX || 50) <= 35 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            ◄ Left (25%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewActivity(prev => ({ ...prev, focalX: 50 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              (newActivity.focalX || 50) > 35 && (newActivity.focalX || 50) < 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            ● Center (50%)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewActivity(prev => ({ ...prev, focalX: 75 }))}
                            className={`py-1 px-2 border text-[10px] font-bold cursor-pointer transition-colors ${
                              (newActivity.focalX || 50) >= 65 ? 'bg-[#52B788] border-[#122818] text-[#122818]' : 'bg-white border-neutral-300 text-neutral-700'
                            }`}
                          >
                            Right (75%) ►
                          </button>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={newActivity.focalX || 50}
                          onChange={(e) => setNewActivity({ ...newActivity, focalX: Number(e.target.value) })}
                          className="w-full accent-[#2D6A4F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5">
                          <span>0% (Far Left)</span>
                          <span className="font-bold text-[#2D6A4F]">50% Center</span>
                          <span>100% (Far Right)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Interactive Card Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <span className="block text-[10px] font-bold uppercase text-neutral-700">
                      2. LIVE WEBSITE CARD PREVIEW:
                    </span>

                    <div className="bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] overflow-hidden">
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-200 border-b-2 border-[#122818]">
                        <img
                          src={newActivity.img || defaultActivityImg}
                          alt="Activity Live Preview"
                          className="w-full h-full object-cover transition-all"
                          style={getCroppedImageStyle(newActivity, 50)}
                        />
                        <span className="absolute top-2 left-2 bg-[#52B788] text-[#122818] text-[9px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                          {newActivity.category || "SPORTS"}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-white text-[#122818] text-[9px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                          {newActivity.date || "SEPTEMBER 2026"}
                        </span>
                      </div>
                      <div className="p-4">
                        <h5 className="font-extrabold text-sm text-[#122818] mb-1.5 leading-snug">
                          {newActivity.title || "Activity Title Preview"}
                        </h5>
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-sans">
                          {newActivity.desc || "Event participation description preview..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Photo Gallery (Multi-Photo Album) */}
              <div className="p-4 bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#122818] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📸</span>
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-[#122818]">
                        Event Photo Gallery Album (Pop-Up Lightbox Photos)
                      </h4>
                      <p className="text-[11px] text-neutral-600">
                        Add multiple photos for this event. Visitors can view all photos in a full-screen pop-up gallery on the public website.
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#D8F3DC] text-[#122818] text-[10px] font-bold px-2 py-1 border border-[#122818] self-start sm:self-auto">
                    {(newActivity.gallery || []).length} Photos In Album
                  </span>
                </div>

                {/* Add Photo Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Paste photo direct image URL (https://...)"
                    value={newGalleryPhotoUrl}
                    onChange={(e) => setNewGalleryPhotoUrl(e.target.value)}
                    className="flex-1 bg-[#F7F9F5] border-2 border-[#122818] p-2 text-xs font-mono focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToActivity(newGalleryPhotoUrl)}
                    className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white px-4 py-2 text-xs font-bold uppercase border-2 border-[#122818] shadow-[2px_2px_0px_#122818] cursor-pointer whitespace-nowrap"
                  >
                    + Add to Gallery
                  </button>
                </div>

                {/* Gallery Presets for Quick Adding */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                  <span className="font-bold text-neutral-500 uppercase">⚡ Quick Add Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToActivity("https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80")}
                    className="bg-[#E9EFE6] hover:bg-[#D8F3DC] text-[#122818] border border-[#122818] px-2 py-0.5 cursor-pointer font-bold"
                  >
                    + Sports Match
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToActivity("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80")}
                    className="bg-[#E9EFE6] hover:bg-[#D8F3DC] text-[#122818] border border-[#122818] px-2 py-0.5 cursor-pointer font-bold"
                  >
                    + Athletic Field
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToActivity("https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80")}
                    className="bg-[#E9EFE6] hover:bg-[#D8F3DC] text-[#122818] border border-[#122818] px-2 py-0.5 cursor-pointer font-bold"
                  >
                    + Science Project
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPhotoToActivity("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80")}
                    className="bg-[#E9EFE6] hover:bg-[#D8F3DC] text-[#122818] border border-[#122818] px-2 py-0.5 cursor-pointer font-bold"
                  >
                    + Cultural Event
                  </button>
                </div>

                {/* Thumbnails of Current Gallery Photos */}
                {(newActivity.gallery && newActivity.gallery.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {newActivity.gallery.map((pUrl, pIdx) => (
                      <div
                        key={pIdx}
                        className={`relative border-2 ${
                          pUrl === newActivity.img ? 'border-[#2D6A4F] ring-2 ring-[#52B788]' : 'border-[#122818]'
                        } bg-neutral-100 overflow-hidden group`}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={pUrl}
                            alt={`Gallery photo ${pIdx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = defaultActivityImg; }}
                          />
                        </div>
                        {pUrl === newActivity.img && (
                          <span className="absolute top-1 left-1 bg-[#52B788] text-[#122818] text-[8px] font-black px-1 border border-[#122818]">
                            COVER
                          </span>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-mono px-1">
                          #{pIdx + 1}
                        </span>
                        <div className="p-1 bg-white border-t border-neutral-200 flex gap-1 justify-between">
                          {pUrl !== newActivity.img ? (
                            <button
                              type="button"
                              onClick={() => handleSetActivityCoverPhoto(pUrl)}
                              className="text-[9px] font-bold text-[#2D6A4F] hover:underline"
                              title="Set as Main Cover"
                            >
                              ★ Cover
                            </button>
                          ) : (
                            <span className="text-[9px] text-neutral-400">Main</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromActivity(pIdx)}
                            className="text-[9px] font-bold text-red-600 hover:underline"
                            title="Remove Photo"
                          >
                            ✕ Del
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#F7F9F5] border border-neutral-300 text-neutral-500 text-xs font-mono">
                    ℹ️ Only the main cover photo is currently set. Add more photo links above to create a multi-image gallery album for this event.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-2.5 px-6 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] cursor-pointer text-xs"
              >
                {editingActivityIdx !== null ? "✓ Update Event on Live Site" : "+ Publish Event to Live Website"}
              </button>
            </form>

            {/* List of Active Activities */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-[#122818] uppercase">Published School Activities ({activities.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activities.map((ev, idx) => (
                  <div key={idx} className="bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="relative aspect-square w-full border-b-2 border-[#122818] overflow-hidden bg-neutral-100">
                        <img
                          src={ev.img}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                          style={getCroppedImageStyle(ev, 50)}
                        />
                        <span className="absolute top-2 left-2 bg-[#52B788] text-[#122818] text-[9px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                          {ev.category}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-white text-[#122818] text-[9px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                          {ev.date}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold bg-[#D8F3DC] text-[#122818] px-1.5 py-0.5 border border-[#122818]">
                            📸 {ev.gallery?.length || 1} Photos
                          </span>
                        </div>
                        <h5 className="font-extrabold text-sm text-[#122818] mb-2 leading-snug">{ev.title}</h5>
                        <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed font-sans">{ev.desc}</p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveActivity(idx, -1)}
                          disabled={idx === 0}
                          className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 disabled:opacity-30 cursor-pointer font-bold"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveActivity(idx, 1)}
                          disabled={idx === activities.length - 1}
                          className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 disabled:opacity-30 cursor-pointer font-bold"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditActivity(idx)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-[#52B788] hover:text-[#122818] border border-[#122818] text-[10px] font-bold cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(idx)}
                          className="px-2 py-1 bg-red-100 hover:bg-[#D90429] hover:text-white border border-red-300 text-[10px] font-bold cursor-pointer"
                          title="Delete Activity"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: WEBSITE FAQS (NEW EDITABLE) */}
        {/* ========================================================= */}
        {activeTab === 'FAQS' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveFaq} className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#122818] pb-3">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-[#122818]">
                    {editingFaqIdx !== null ? `Edit FAQ Question (#${editingFaqIdx + 1})` : "Add New Frequently Asked Question"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Modifies the interactive FAQ accordion in Section 06 on the live public website.
                  </p>
                </div>
                {editingFaqIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqIdx(null);
                      setNewFaq({ q: '', a: '' });
                    }}
                    className="text-xs font-bold text-neutral-600 underline cursor-pointer"
                  >
                    ✕ Cancel Edit
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Question Prompt *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., What are the school bus timings and safety measures?"
                    value={newFaq.q}
                    onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Detailed Answer / Explanation *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Provide a clear, accurate, and reassuring answer for parents and guardians..."
                    value={newFaq.a}
                    onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-sans text-xs leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-2.5 px-6 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] cursor-pointer text-xs"
              >
                {editingFaqIdx !== null ? "✓ Update FAQ on Live Site" : "+ Save FAQ to Website"}
              </button>
            </form>

            {/* List & Live Accordion Preview */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-[#122818] uppercase">
                  Published FAQs ({faqs.length}) — Drag / Reorder with Arrows
                </h4>
                <span className="text-xs text-neutral-500">Live Interactive Accordion Preview Below</span>
              </div>

              <div className="space-y-3">
                {faqs.map((f, idx) => {
                  const isPreviewOpen = previewFaqOpen === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white border-2 border-[#122818] shadow-[3px_3px_0px_#122818] transition-all overflow-hidden"
                    >
                      {/* FAQ Header with controls */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                        <div
                          onClick={() => setPreviewFaqOpen(isPreviewOpen ? null : idx)}
                          className="flex items-start sm:items-center gap-3 flex-1 cursor-pointer"
                        >
                          <span className="text-xs font-mono font-black text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 border border-[#122818]">
                            Q{idx + 1}
                          </span>
                          <span className="font-bold text-sm text-[#122818] hover:text-[#2D6A4F] transition-colors">
                            {f.q}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => moveFaq(idx, -1)}
                            disabled={idx === 0}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-bold disabled:opacity-30 cursor-pointer"
                            title="Move Question Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveFaq(idx, 1)}
                            disabled={idx === faqs.length - 1}
                            className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-xs font-bold disabled:opacity-30 cursor-pointer"
                            title="Move Question Down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleEditFaq(idx)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-[#52B788] hover:text-[#122818] border border-[#122818] text-xs font-bold cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(idx)}
                            className="px-2 py-1 bg-red-100 hover:bg-[#D90429] hover:text-white border border-red-300 text-xs font-bold cursor-pointer"
                            title="Delete FAQ"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Accordion Answer Preview */}
                      {isPreviewOpen && (
                        <div className="px-5 pb-4 pt-2 border-t-2 border-[#122818] bg-[#F7F9F5] text-xs text-neutral-800 font-sans leading-relaxed">
                          <p>{f.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: EMERGENCY BROADCAST BANNER */}
        {/* ========================================================= */}
        {activeTab === 'BROADCAST' && (
          <div className="max-w-2xl bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-[#122818]">Emergency Top Alert Banner Configuration</h3>
            <p className="text-xs text-neutral-600">
              When activated, a high-priority red alert strip is shown across the very top of the public website for all incoming visitors.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Banner Announcement Text</label>
                <input
                  type="text"
                  value={emergencyBanner.text}
                  onChange={(e) => handleUpdateEmergencyText(e.target.value)}
                  placeholder="e.g., Campus closed on Monday due to heavy snowfall. Online classes active."
                  className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-3 focus:bg-white font-bold text-xs"
                />
              </div>

              <div className="p-4 bg-[#F7F9F5] border-2 border-[#122818]">
                <span className="text-[10px] uppercase text-neutral-500 block mb-1">LIVE PREVIEW ON PUBLIC SITE:</span>
                <div className="bg-[#D90429] text-white text-xs font-bold p-2.5 border border-[#122818] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>ALERT // {emergencyBanner.text || "No text specified"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleEmergencyBanner}
                className={`w-full py-3 font-bold uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] transition-all cursor-pointer text-xs ${
                  emergencyBanner.active
                    ? 'bg-[#D90429] text-white hover:bg-red-700'
                    : 'bg-[#52B788] text-[#122818] hover:bg-[#2D6A4F] hover:text-white'
                }`}
              >
                {emergencyBanner.active ? '● Banner is currently LIVE (Click to Turn OFF)' : '○ Banner is currently OFF (Click to Turn ON)'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CONTACT DETAILS & SOCIAL CHANNELS */}
        {/* ========================================================= */}
        {activeTab === 'CONTACT' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveContact} className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#122818] pb-3">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-[#122818]">
                    School Contact Information & Social Channels
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Changes made here automatically update the phone numbers, email address, physical location, and social media icons across the entire public website (top header, admissions desk, contact section, and footer).
                  </p>
                </div>
              </div>

              {contactFeedback && (
                <div className={`p-3 border-2 border-[#122818] text-xs font-bold ${
                  contactFeedback.type === 'success' ? 'bg-[#D8F3DC] text-[#122818]' : 'bg-red-100 text-[#D90429]'
                }`}>
                  {contactFeedback.msg}
                </div>
              )}

              {/* Section 1: Telephone & Email */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#122818] border-b border-neutral-200 pb-1">
                  📞 Official Telephones & Email Desk
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Primary Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94190 28723"
                      value={tempContact.phone}
                      onChange={(e) => setTempContact({ ...tempContact, phone: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono font-bold"
                    />
                    <span className="text-[9px] text-neutral-500 mt-1 block">Displayed in top bar, inquiry desk & footer</span>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Secondary / Landline / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+91 1931 260000"
                      value={tempContact.altPhone}
                      onChange={(e) => setTempContact({ ...tempContact, altPhone: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono"
                    />
                    <span className="text-[9px] text-neutral-500 mt-1 block">Optional secondary inquiry contact</span>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Official School Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="opnawazschool@gmail.com"
                      value={tempContact.email}
                      onChange={(e) => setTempContact({ ...tempContact, email: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono"
                    />
                    <span className="text-[9px] text-neutral-500 mt-1 block">Direct contact email for parents & admissions</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Physical Location & Timings */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#122818] border-b border-neutral-200 pb-1">
                  📍 Campus Address & Office Hours
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  <div className="sm:col-span-8">
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Campus Physical Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Karewa, Kulgam, Jammu & Kashmir — 192231"
                      value={tempContact.address}
                      onChange={(e) => setTempContact({ ...tempContact, address: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Office Timings
                    </label>
                    <input
                      type="text"
                      placeholder="Mon–Sat (9:00 AM - 3:30 PM)"
                      value={tempContact.timing}
                      onChange={(e) => setTempContact({ ...tempContact, timing: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Social Media Channels */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-[#122818] border-b border-neutral-200 pb-1">
                  🌐 Official Social Media Channels (Icons Displayed in Footer)
                </h4>
                <p className="text-[11px] text-neutral-600">
                  Enter your official profile or page URLs. The logos in the footer will automatically link to these pages!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  {/* Facebook */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
                      <span className="text-[#1877F2]">Facebook Page URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/opnawazschool"
                      value={tempContact.facebook}
                      onChange={(e) => setTempContact({ ...tempContact, facebook: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono text-xs"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
                      <span className="text-[#E1306C]">Instagram Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/opnawazschool"
                      value={tempContact.instagram}
                      onChange={(e) => setTempContact({ ...tempContact, instagram: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono text-xs"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
                      <span className="text-[#FF0000]">YouTube Channel URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@opnawazschool"
                      value={tempContact.youtube}
                      onChange={(e) => setTempContact({ ...tempContact, youtube: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono text-xs"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
                      <span>Twitter / X Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://twitter.com/opnawazschool"
                      value={tempContact.twitter}
                      onChange={(e) => setTempContact({ ...tempContact, twitter: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono text-xs"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="sm:col-span-12">
                    <label className="block text-[10px] font-bold uppercase mb-1 flex items-center gap-1.5">
                      <span className="text-[#25D366]">WhatsApp Direct Link or Number (https://wa.me/...)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://wa.me/919419028723 or 9419028723"
                      value={tempContact.whatsapp}
                      onChange={(e) => setTempContact({ ...tempContact, whatsapp: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-3 px-8 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] cursor-pointer text-xs transition-all"
                >
                  💾 Save & Publish Contact & Social Details
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: HERO SLIDESHOW IMAGERY & CAROUSEL */}
        {/* ========================================================= */}
        {activeTab === 'SLIDES' && (
          <div className="space-y-6">
            {/* Feedback Banner */}
            {slideFeedback && (
              <div className="p-3 bg-[#D8F3DC] border-2 border-[#122818] text-[#122818] font-bold text-xs shadow-[3px_3px_0px_#122818] flex items-center justify-between">
                <span>{slideFeedback.msg}</span>
                <button
                  onClick={() => setSlideFeedback(null)}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Add/Edit Slide Form */}
            <form onSubmit={handleSaveHeroSlide} className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#122818] pb-3">
                <div>
                  <h3 className="font-extrabold text-base uppercase text-[#122818]">
                    {editingSlideIdx !== null ? `Edit Hero Slide (#${editingSlideIdx + 1})` : "Add New Hero Slideshow Image"}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Control full-width background photographs and captions displayed on the public homepage hero section.
                  </p>
                </div>
                {editingSlideIdx !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlideIdx(null);
                      setNewSlide({
                        url: heroPresets[0].url,
                        label: heroPresets[0].label
                      });
                    }}
                    className="text-xs font-bold text-neutral-700 underline cursor-pointer self-start sm:self-auto"
                  >
                    ✕ Cancel Edit Mode
                  </button>
                )}
              </div>

              {/* Quick Presets Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#2D6A4F] mb-1.5">
                  ⚡ 1-Click Educational Photo Presets (Click to autofill)
                </label>
                <div className="flex flex-wrap gap-2">
                  {heroPresets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setNewSlide({ url: preset.url, label: preset.label })}
                      className="text-[11px] font-mono font-bold bg-[#E9EFE6] hover:bg-[#52B788] hover:text-[#122818] text-neutral-800 px-2.5 py-1 border border-[#122818] shadow-[1px_1px_0px_#122818] cursor-pointer transition-colors"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Hero Image Direct URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/... or https://domain.com/photo.jpg"
                      value={newSlide.url}
                      onChange={(e) => setNewSlide({ ...newSlide, url: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 font-mono text-xs focus:bg-white"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Recommended: High resolution landscape image (1920×1080 or wider).
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">
                      Slide Label / Tagline *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., MAIN CAMPUS & ADMINISTRATIVE BLOCK — KULGAM"
                      value={newSlide.label}
                      onChange={(e) => setNewSlide({ ...newSlide, label: e.target.value })}
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 font-mono text-xs focus:bg-white uppercase font-bold"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Displayed on the bottom strip of the homepage hero banner.
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-2.5 px-6 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] text-xs transition-all cursor-pointer"
                    >
                      💾 {editingSlideIdx !== null ? 'Save Slide Updates' : 'Add Slide to Carousel'}
                    </button>
                    {editingSlideIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlideIdx(null);
                          setNewSlide({
                            url: heroPresets[0].url,
                            label: heroPresets[0].label
                          });
                        }}
                        className="bg-neutral-200 hover:bg-neutral-300 text-[#122818] font-bold py-2.5 px-4 uppercase border-2 border-[#122818] text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Mockup Preview */}
                <div className="md:col-span-5">
                  <span className="block text-[10px] font-bold uppercase text-[#2D6A4F] mb-1">
                    Live Banner Mockup
                  </span>
                  <div className="relative aspect-video bg-[#122818] border-2 border-[#122818] shadow-[3px_3px_0px_#122818] overflow-hidden flex flex-col justify-between p-3 text-white">
                    {newSlide.url ? (
                      <img
                        src={newSlide.url}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[#122818]/75"></div>

                    <div className="relative z-10">
                      <span className="inline-block bg-[#D8F3DC] text-[#122818] text-[8px] font-black px-1.5 py-0.5 border border-[#122818] uppercase">
                        CAMPUS PREVIEW
                      </span>
                    </div>

                    <div className="relative z-10 border-t border-white/20 pt-1.5 flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[#95D5B2] font-bold truncate">
                        {newSlide.label || "SLIDE CAPTION"}
                      </span>
                      <span className="bg-[#52B788] text-[#122818] font-bold px-1 text-[8px]">
                        0{editingSlideIdx !== null ? editingSlideIdx + 1 : heroSlides.length + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* List of Active Hero Slides */}
            <div className="bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#122818] pb-3">
                <div>
                  <h4 className="font-extrabold text-sm uppercase text-[#122818]">
                    Active Slideshow Images ({heroSlides.length})
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Slides rotate automatically in sequential order. Use the up/down arrows to reorder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetHeroSlides}
                  className="bg-[#E9EFE6] hover:bg-[#D8F3DC] text-[#122818] text-xs font-mono font-bold px-3 py-1.5 border border-[#122818] shadow-[2px_2px_0px_#122818] cursor-pointer transition-colors self-start sm:self-auto"
                >
                  ↺ Reset Defaults
                </button>
              </div>

              {heroSlides.length === 0 ? (
                <div className="text-center p-8 bg-[#F7F9F5] border-2 border-dashed border-neutral-300 text-neutral-500 font-mono text-xs">
                  No hero slides found. Add your first hero slide above or click "Reset Defaults".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className={`border-2 border-[#122818] bg-[#F7F9F5] flex flex-col justify-between shadow-[3px_3px_0px_#122818] ${
                        editingSlideIdx === idx ? 'ring-2 ring-[#52B788]' : ''
                      }`}
                    >
                      <div>
                        {/* Slide Top Bar */}
                        <div className="bg-[#122818] text-white px-3 py-1.5 flex items-center justify-between text-[10px] font-mono border-b-2 border-[#122818]">
                          <span className="font-bold text-[#52B788]">SLIDE 0{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveHeroSlide(idx, -1)}
                              className="px-1.5 py-0.5 bg-white/20 hover:bg-white hover:text-[#122818] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Earlier"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === heroSlides.length - 1}
                              onClick={() => handleMoveHeroSlide(idx, 1)}
                              className="px-1.5 py-0.5 bg-white/20 hover:bg-white hover:text-[#122818] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Later"
                            >
                              ▼
                            </button>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div className="relative aspect-video bg-neutral-200 overflow-hidden border-b-2 border-[#122818]">
                          <img
                            src={slide.url}
                            alt={slide.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultSlideImg;
                            }}
                          />
                        </div>

                        {/* Caption info */}
                        <div className="p-3">
                          <p className="font-mono text-xs font-bold text-[#122818] uppercase leading-tight line-clamp-2">
                            {slide.label}
                          </p>
                          <span className="text-[10px] font-mono text-neutral-500 block truncate mt-1">
                            {slide.url}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-3 pt-0 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditHeroSlide(idx)}
                          className="flex-1 bg-white hover:bg-[#D8F3DC] text-[#122818] text-[11px] font-mono font-bold py-1.5 border border-[#122818] shadow-[1px_1px_0px_#122818] cursor-pointer transition-colors text-center"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHeroSlide(idx)}
                          disabled={heroSlides.length <= 1}
                          className="px-3 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-mono font-bold py-1.5 border border-[#122818] shadow-[1px_1px_0px_#122818] cursor-pointer transition-colors"
                          title="Delete Slide"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-[#122818] text-[#95D5B2] text-xs py-4 px-4 md:px-8 border-t-2 border-[#122818] text-center font-mono">
        Opinawaz Universal Public School, Kulgam • Administrative Portal • Protected Session
      </footer>
    </div>
  );
}
