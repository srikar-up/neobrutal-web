import React, { useState, useEffect } from 'react';
import schoolLogo from './assets/opnawazlogo.jpeg';
import nobgLogo from './assets/nobglogo.png';
import AdminPanel from './AdminPanel';
import { getTopperImageStyle, getCroppedImageStyle } from './imageHelper';
import {
  isFirebaseConfigured,
  getFirebaseConfig,
  saveFirebaseConfig,
  subscribeToInquiries,
  subscribeToNotices,
  subscribeToToppers,
  subscribeToActivities,
  subscribeToFaqs,
  subscribeToEmergencyBanner,
  subscribeToContactInfo,
  subscribeToHeroSlides,
  saveContactInfoDoc,
  saveHeroSlideDoc,
  deleteHeroSlideDoc,
  saveAllHeroSlidesDoc,
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
  seedInitialDataToFirestore,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  verifyAdminFirestoreAccess
} from './firebase';

const defaultContactInfo = {
  phone: "+91 94190 28723",
  altPhone: "+91 1931 260000",
  email: "opnawazschool@gmail.com",
  address: "Karewa, Kulgam, Jammu & Kashmir — 192231",
  timing: "Mon–Sat (9:00 AM - 3:30 PM)",
  facebook: "https://facebook.com/opnawazschool",
  instagram: "https://instagram.com/opnawazschool",
  youtube: "https://youtube.com/@opnawazschool",
  twitter: "https://twitter.com/opnawazschool",
  whatsapp: "https://wa.me/919419028723"
};

const initialHeroSlides = [
  {
    id: "slide-1",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80",
    label: "MAIN CAMPUS & ADMINISTRATIVE BLOCK — KULGAM"
  },
  {
    id: "slide-2",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1920&q=80",
    label: "ACTIVE CLASSROOM LEARNING & INTERACTION"
  },
  {
    id: "slide-3",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
    label: "MODERN SCIENCE & COMPUTER LABS"
  }
];

const liveAnnouncements = [
  { id: "NOT-2601", date: "SEPTEMBER 2026", title: "Registration forms open for Nursery to Grade 9 for Academic Session 2027.", tag: "ADMISSION" },
  { id: "NOT-2602", date: "AUGUST 2026", title: "Prospectus and syllabus outline available at school administrative counter.", tag: "NOTICE" },
  { id: "NOT-2603", date: "AUGUST 2026", title: "Parent-Teacher Orientation schedule declared for incoming primary batch.", tag: "EVENT" },
  { id: "NOT-2604", date: "JULY 2026", title: "Transport bus route allocation for Kulgam and adjoining regions updated.", tag: "FACILITY" }
];

const programs = [
  {
    stage: "STAGE 01",
    name: "Kindergarten & Primary Wing",
    grades: "Nursery to Grade 5",
    desc: "Child-centric activity-based learning focusing on language foundation, basic arithmetic, moral education, and creative play in a safe environment.",
    features: ["Smart Audio-Visual Classrooms", "Activity-Based Phonics", "Indoor Play & Toy Library"]
  },
  {
    stage: "STAGE 02",
    name: "Middle School Wing",
    grades: "Grade 6 to Grade 8",
    desc: "Transition towards structured core disciplines, scientific inquiry, practical mathematics, and building analytical writing abilities.",
    features: ["Hands-on Science Practical Labs", "Computer & Digital Literacy", "Debates & Language Clubs"]
  },
  {
    stage: "STAGE 03",
    name: "Secondary School Wing",
    grades: "Grade 9 and Grade 10",
    desc: "Rigorous board preparation, continuous evaluation, individual mentorship, and development of competitive problem-solving capabilities.",
    features: ["Board Examination Prep Support", "Career Guidance Seminars", "Remedial Doubt-Clearing Sessions"]
  }
];

// Academic Toppers Data
const toppersList = [
  {
    rank: "1st Position",
    name: "Aamir Suhail Rather",
    grade: "Class 10th (JKBOSE)",
    score: "98.4%",
    badge: "District Top Ranker",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    rank: "2nd Position",
    name: "Zehra Fatima",
    grade: "Class 10th (JKBOSE)",
    score: "97.6%",
    badge: "Gold Medalist in Maths",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
  },
  {
    rank: "3rd Position",
    name: "Mohd. Rayan Dar",
    grade: "Class 10th (JKBOSE)",
    score: "96.8%",
    badge: "Excellence in Science",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
  },
  {
    rank: "School Merit",
    name: "Mehak Jan",
    grade: "Class 8th (Middle Board)",
    score: "98.0%",
    badge: "All-Round Proficiency",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
  }
];

// Recent Events / Programmes Data
const recentEvents = [
  {
    title: "Annual Sports Meet & Athletic Championship",
    date: "AUGUST 2026",
    category: "SPORTS",
    desc: "Over 400 students participated across sprint runs, tug-of-war, relay races, and badminton finals with trophy presentations by local sports dignitaries.",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    title: "Science & Environmental Innovation Exhibition",
    date: "JULY 2026",
    category: "ACADEMICS",
    desc: "Students built 35+ working models on solar water purifiers, valley watershed preservation, and automated robotics in agriculture.",
    img: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    title: "Seerat Conference & Moral Values Symposium",
    date: "JUNE 2026",
    category: "CULTURE",
    desc: "Inspiring speeches and debate contests on ethics, moral discipline, and community development delivered by middle and high school students.",
    img: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

const admissionSteps = [
  {
    step: "01",
    title: "Obtain Application",
    desc: "Collect the registration form and prospectus directly from the administrative office or register intent online."
  },
  {
    step: "02",
    title: "Document Submission",
    desc: "Submit student birth certificate, transfer certificate (if applicable), previous marksheets, and passport photographs."
  },
  {
    step: "03",
    title: "Student & Parent Interaction",
    desc: "An informal interaction for primary grades or an aptitude review for higher grades to understand learning baseline."
  },
  {
    step: "04",
    title: "Seat Confirmation",
    desc: "Upon verification, complete admission formalities and verify transport/book requirements before session commencement."
  }
];

const facilities = [
  { title: "Well-Equipped Science Lab", desc: "Dedicated practical setups for Physics, Chemistry, and Biology to foster curiosity.", tag: "LAB" },
  { title: "Smart Computer Center", desc: "High-speed networked terminals providing fundamental computing skills.", tag: "IT" },
  { title: "Campus Library", desc: "Extensive selection of storybooks, reference encyclopedias, and literature.", tag: "BOOKS" },
  { title: "Safe Fleet Transport", desc: "Monitored buses covering Kulgam town and surrounding feeder villages.", tag: "TRANS" },
  { title: "Sports & Physical Ground", desc: "Courts and grounds for cricket, football, badminton, and annual sports days.", tag: "SPORTS" },
  { title: "Safe & Monitored Campus", desc: "24/7 CCTV surveillance, boundary-secured campus, and dedicated first-aid care.", tag: "SAFETY" }
];

const initialInquiries = [
  { id: "INQ-2601", date: "Sep 4, 2026", studentName: "Zahid Ahmad Mir", parentName: "Bashir Ahmad Mir", grade: "Grade 6 to 8", phone: "9419012345", locality: "Chawalgam, Kulgam", status: "Pending" },
  { id: "INQ-2602", date: "Sep 3, 2026", studentName: "Soliyah Jan", parentName: "Mohd. Shafi", grade: "Nursery / LKG / UKG", phone: "9797123456", locality: "Main Town, Kulgam", status: "Contacted" },
  { id: "INQ-2603", date: "Sep 1, 2026", studentName: "Faizan Farooq", parentName: "Farooq Ahmad Bhat", grade: "Grade 9 to 10", phone: "9906789012", locality: "Ashmuji", status: "Approved" },
];

const faqList = [
  {
    q: "What is the age criteria for Nursery and Kindergarten admissions?",
    a: "Children should typically be 3+ years old for Nursery, 4+ for LKG, and 5+ for UKG at the start of the academic session in accordance with JK education guidelines. An informal student-parent interaction helps gauge baseline readiness."
  },
  {
    q: "Which curriculum and examination board does the school follow?",
    a: "Opinawaz Universal Public School follows the recognized Jammu & Kashmir State Board (JKBOSE) curriculum, supplemented with modern interactive STEM modules, phonics-based English literacy, and computer education."
  },
  {
    q: "What feeder areas and routes are covered by the school buses?",
    a: "Our monitored bus fleet covers Kulgam Main Town, Karewa, Chawalgam, Ashmuji, Bugam, Mirhama, Yaripora link corridors, and adjacent village feeder points with trained drivers and conductors."
  },
  {
    q: "What is the teacher-to-student ratio in classes?",
    a: "We maintain an average ratio of 1:15 to 1:20 across classes, enabling personal mentorship, individual attention, and timely remedial doubt resolution for every student."
  },
  {
    q: "What documents are required during the final admission process?",
    a: "Parents need to submit a Municipal/Hospital birth certificate, original Transfer Certificate (for Grade 1 upwards), previous year marksheet, recent passport photos, and address/ID verification proof."
  },
  {
    q: "How are parents informed about academic progress and school events?",
    a: "We conduct scheduled Parent-Teacher Meetings (PTMs) after assessment cycles. In addition, report cards, fee receipts, and official circulars are shared directly via school notification channels."
  }
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hallView, setHallView] = useState('TOPPERS'); // 'TOPPERS' or 'EVENTS'
  const [formData, setFormData] = useState({ parentName: '', studentName: '', grade: 'Nursery', phone: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Event Gallery Lightbox Modal State
  const [activeGalleryEvent, setActiveGalleryEvent] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Keyboard navigation for pop-up gallery lightbox
  useEffect(() => {
    if (!activeGalleryEvent) return;
    const handleKeyDown = (e) => {
      const photos = (activeGalleryEvent.gallery && activeGalleryEvent.gallery.length > 0)
        ? activeGalleryEvent.gallery
        : [activeGalleryEvent.img].filter(Boolean);

      if (e.key === 'Escape') {
        setActiveGalleryEvent(null);
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryEvent]);

  // Live Stateful Entities for Admin Management
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [announcements, setAnnouncements] = useState(liveAnnouncements);
  const [toppers, setToppers] = useState(toppersList);
  const [activities, setActivities] = useState(recentEvents);
  const [faqs, setFaqs] = useState(faqList);
  const [emergencyBanner, setEmergencyBanner] = useState({ active: false, text: "Notice: Admissions counter is open on Sunday for outstation parents." });
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [heroSlides, setHeroSlides] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('opnawaz_hero_slides');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialHeroSlides;
  });

  // Firebase Configuration & Connection State
  const [firebaseConfigState, setFirebaseConfigState] = useState(getFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(isFirebaseConfigured());

  // Real-time Firestore Sync Effect
  useEffect(() => {
    const isConfigured = isFirebaseConfigured(firebaseConfigState);
    setIsFirebaseConnected(isConfigured);

    if (!isConfigured) {
      console.info("[Firebase] Running in Local Storage mode. Cloud sync pending Firebase project configuration.");
      return;
    }

    console.info("[Firebase] Connecting real-time Firestore listeners...");
    let unsubInquiries = () => {};
    const unsubAuth = subscribeToAuth((user) => {
      unsubInquiries();
      if (user) {
        unsubInquiries = subscribeToInquiries((data) => {
          if (data && data.length > 0) setInquiries(data);
        });
      }
    });

    const unsubNotices = subscribeToNotices((data) => {
      if (data && data.length > 0) setAnnouncements(data);
    });
    const unsubToppers = subscribeToToppers((data) => {
      if (data && data.length > 0) setToppers(data);
    });
    const unsubActivities = subscribeToActivities((data) => {
      if (data && data.length > 0) setActivities(data);
    });
    const unsubFaqs = subscribeToFaqs((data) => {
      if (data && data.length > 0) setFaqs(data);
    });
    const unsubBanner = subscribeToEmergencyBanner((data) => {
      if (data && data.text !== undefined) setEmergencyBanner(data);
    });
    const unsubContact = subscribeToContactInfo((data) => {
      if (data && typeof data === 'object') {
        setContactInfo((prev) => ({ ...prev, ...data }));
      }
    });
    const unsubHero = subscribeToHeroSlides((data) => {
      if (data && data.length > 0) {
        setHeroSlides(data);
        try {
          localStorage.setItem('opnawaz_hero_slides', JSON.stringify(data));
        } catch (e) {}
      }
    });

    return () => {
      unsubAuth();
      unsubInquiries();
      unsubNotices();
      unsubToppers();
      unsubActivities();
      unsubFaqs();
      unsubBanner();
      unsubContact();
      unsubHero();
    };
  }, [firebaseConfigState]);

  // Page Navigation State ('home' or 'admin')
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'home';
  });

  // Secret Click Handler (Click "All rights reserved" 7 times to navigate to Admin Page)
  const [clickCount, setClickCount] = useState(0);

  const handleCopyrightClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 7) {
        setCurrentPage('admin');
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '#admin');
        }
        window.scrollTo(0, 0);
        return 0;
      }
      return next;
    });
  };

  const handleBackToWebsite = () => {
    setCurrentPage('home');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', window.location.pathname.replace(/\/admin\/?$/, '') || '#');
    }
    window.scrollTo(0, 0);
  };

  // Sync with browser back/forward and hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleForm = async (e) => {
    e.preventDefault();
    const newEntry = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      studentName: formData.studentName,
      parentName: formData.parentName,
      grade: formData.grade,
      phone: formData.phone,
      locality: formData.message || 'Kulgam',
      status: 'Pending'
    };
    setInquiries((prev) => [newEntry, ...prev]);
    setFormSubmitted(true);

    // Write to Firebase Firestore if connected
    if (isFirebaseConfigured(firebaseConfigState)) {
      try {
        await addInquiryDoc(newEntry);
      } catch (err) {
        console.warn("[Firebase] Local inquiry logged, cloud sync noticed error:", err);
      }
    }
  };

  if (currentPage === 'admin') {
    return (
      <AdminPanel
        schoolLogo={schoolLogo}
        nobgLogo={nobgLogo}
        inquiries={inquiries}
        setInquiries={setInquiries}
        announcements={announcements}
        setAnnouncements={setAnnouncements}
        toppers={toppers}
        setToppers={setToppers}
        activities={activities}
        setActivities={setActivities}
        faqs={faqs}
        setFaqs={setFaqs}
        emergencyBanner={emergencyBanner}
        setEmergencyBanner={setEmergencyBanner}
        heroSlides={heroSlides}
        setHeroSlides={setHeroSlides}
        onBackToWebsite={handleBackToWebsite}
        // Firebase Cloud Sync Props
        isFirebaseConnected={isFirebaseConnected}
        firebaseConfigState={firebaseConfigState}
        setFirebaseConfigState={setFirebaseConfigState}
        saveFirebaseConfig={saveFirebaseConfig}
        seedInitialDataToFirestore={seedInitialDataToFirestore}
        addInquiryDoc={addInquiryDoc}
        updateInquiryStatusDoc={updateInquiryStatusDoc}
        deleteInquiryDoc={deleteInquiryDoc}
        saveNoticeDoc={saveNoticeDoc}
        deleteNoticeDoc={deleteNoticeDoc}
        saveTopperDoc={saveTopperDoc}
        deleteTopperDoc={deleteTopperDoc}
        saveActivityDoc={saveActivityDoc}
        deleteActivityDoc={deleteActivityDoc}
        saveFaqDoc={saveFaqDoc}
        deleteFaqDoc={deleteFaqDoc}
        saveEmergencyBannerDoc={saveEmergencyBannerDoc}
        saveHeroSlideDoc={saveHeroSlideDoc}
        deleteHeroSlideDoc={deleteHeroSlideDoc}
        saveAllHeroSlidesDoc={saveAllHeroSlidesDoc}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        saveContactInfoDoc={saveContactInfoDoc}
        loginWithGoogle={loginWithGoogle}
        logoutUser={logoutUser}
        subscribeToAuth={subscribeToAuth}
        verifyAdminFirestoreAccess={verifyAdminFirestoreAccess}
        initialTemplates={{
          inquiries: initialInquiries,
          announcements: liveAnnouncements,
          toppers: toppersList,
          activities: recentEvents,
          faqs: faqList,
          heroSlides: initialHeroSlides,
          emergencyBanner: { active: false, text: "Notice: Admissions counter is open on Sunday for outstation parents." },
          contactInfo: defaultContactInfo
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F5] text-[#122818] antialiased selection:bg-[#40916C] selection:text-white font-sans">

      {/* Emergency Administrative Broadcast Banner (if enabled) */}
      {emergencyBanner.active && emergencyBanner.text && (
        <div className="bg-[#D90429] text-white text-xs font-mono font-bold px-4 py-2 border-b-2 border-[#122818] flex items-center justify-between shadow-[0_2px_0px_#122818]">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>ALERT // {emergencyBanner.text}</span>
          </div>
          <button
            onClick={() => setEmergencyBanner({ ...emergencyBanner, active: false })}
            className="text-white hover:text-neutral-300 font-bold px-2 py-0.5 border border-white text-[10px] cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Topmost Institutional Strip */}
      <div className="bg-[#122818] text-[#D8F3DC] text-xs font-mono px-4 md:px-8 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 border-b-2 border-[#122818]">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="w-2 h-2 rounded-full bg-[#52B788] animate-ping"></span>
          <span>OFFICIAL PORTAL — OPINAWAZ UNIVERSAL PUBLIC SCHOOL, KULGAM (J&K)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono tracking-wider">
          <a
            href={`tel:${contactInfo.phone ? contactInfo.phone.replace(/[^0-9+]/g, '') : '+919419028723'}`}
            className="hover:underline flex items-center gap-1.5 text-white"
          >
            <span>📞 TEL:</span>
            <span className="font-bold">{contactInfo.phone || "+91 94190 28723"}</span>
          </a>
          <span className="hidden md:inline">|</span>
          <a
            href={`mailto:${contactInfo.email || 'opnawazschool@gmail.com'}`}
            className="hover:underline hidden sm:inline text-white"
          >
            ✉️ {contactInfo.email || "opnawazschool@gmail.com"}
          </a>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">AFFILIATION RECOGNIZED</span>
        </div>
      </div>

      {/* Sticky Main Navigation */}
      <header className="sticky top-0 z-50 bg-[#F7F9F5]/95 backdrop-blur-md border-b-2 border-[#122818]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 flex-shrink-0">
            <img
              src={nobgLogo}
              alt="Opinawaz Universal Public School Logo"
              className="h-10 sm:h-11 w-auto object-contain flex-shrink-0 group-hover:scale-105 transition-transform drop-shadow-sm"
            />
            <div className="min-w-0">
              <h1 className="font-extrabold tracking-tight text-xs sm:text-sm md:text-base leading-tight uppercase whitespace-nowrap">
                Opinawaz Universal Public School
              </h1>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-wider text-[#2D6A4F] uppercase mt-0.5 whitespace-nowrap">
                Kulgam, Jammu & Kashmir
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs font-bold uppercase">
            <a href="#about" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">About Us</a>
            <a href="#academics" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">Wings & Curriculum</a>
            <a href="#hall" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">Toppers & Events</a>
            <a href="#facilities" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">Facilities</a>
            <a href="#admissions" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">Admissions</a>
            <a href="#faq" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">FAQ</a>
            <a href="#location" className="px-3 py-1.5 rounded hover:text-[#122818] hover:bg-[#D8F3DC] transition-colors">Location</a>
          </nav>

          <div className="flex items-center">
            <a
              href="#admissions"
              className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-mono text-xs font-bold uppercase py-1.5 px-4 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Admissions Open
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Live Background Slideshow */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between border-b-2 border-[#122818] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } transition-transform`}
          >
            <img
              src={slide.url}
              alt={slide.label}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Simple Translucent Green Overlay */}
        <div className="absolute inset-0 bg-[#122818]/75"></div>

        {/* Hero Content - Centered */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full my-auto py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#D8F3DC] text-[#122818] border-2 border-[#122818] px-3 py-1 text-xs font-mono font-bold uppercase mb-6 shadow-[3px_3px_0px_#ffffff]">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
              OFFICIAL PUBLIC SCHOOL PORTAL // KULGAM
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1] mb-6">
              Empowering Minds, <br />
              <span className="text-[#95D5B2] underline decoration-4 decoration-[#52B788]">Enriching Values.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#D8F3DC] max-w-2xl font-normal leading-relaxed mb-8">
              Welcome to Opinawaz Universal Public School, Kulgam. Dedicated to cultivating intellectual excellence, disciplined character, and moral integrity for students from foundation years through higher grades.
            </p>

            <div className="flex flex-wrap gap-4 font-mono text-xs font-bold uppercase">
              <a
                href="#admissions"
                className="bg-[#52B788] text-[#122818] px-7 py-4 border-2 border-white shadow-[4px_4px_0px_#ffffff] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Apply for Admission 2026–27 →
              </a>
              <a
                href="#hall"
                className="bg-white/10 backdrop-blur-sm text-white px-7 py-4 border-2 border-white hover:bg-white hover:text-[#122818] transition-all"
              >
                View Toppers & Events
              </a>
            </div>
          </div>
        </div>

        {/* Animated Scroll Down Indicator (Displays until scrolled) */}
        <div
          className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 select-none ${
            hasScrolled ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
          }`}
          onClick={() => {
            const nextSec = document.getElementById('updates') || document.getElementById('about');
            nextSec?.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Scroll down to explore"
        >
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#122818]/90 text-[#D8F3DC] px-2.5 py-0.5 border border-white/80 shadow-[2px_2px_0px_#52B788] animate-pulse">
            SCROLL DOWN ↓
          </span>
          <div className="w-5 h-9 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center p-1 bg-[#122818]/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="w-1.5 h-2.5 bg-[#52B788] rounded-full animate-bounce mt-1"></div>
          </div>
        </div>

        {/* Hero Bottom Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pb-6 pt-4 border-t border-white/20 flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-[#D8F3DC]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#95D5B2] font-bold flex-shrink-0">[CAMPUS VIEW]</span>
            <span className="truncate">{heroSlides[currentSlide]?.label || heroSlides[0]?.label || "CAMPUS"}</span>
          </div>
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`px-3 py-1 border border-white font-bold transition-all ${
                  i === currentSlide ? "bg-[#52B788] text-[#122818]" : "bg-transparent text-white hover:bg-white/20"
                }`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker / Live Circulars */}
      <section id="updates" className="border-b-2 border-[#122818] bg-[#E9EFE6] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b-2 border-[#122818] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#122818] text-[#52B788] text-xs font-mono font-bold px-2 py-1 uppercase">
                PUBLIC NOTICES
              </span>
              <span className="text-xs font-mono text-[#2D6A4F] font-bold uppercase tracking-wider hidden sm:inline">
                OFFICIAL BULLETIN & CIRCULARS
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-600">SESSION: 2026–2027</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-[#122818] p-4 shadow-[3px_3px_0px_#122818] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2 font-bold">
                    <span className="text-[#122818] bg-[#D8F3DC] px-1.5 py-0.5 border border-[#122818]">{item.tag}</span>
                    <span className="text-neutral-500">{item.date}</span>
                  </div>
                  <p className="text-xs font-bold leading-snug text-[#122818]">{item.title}</p>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 mt-4 pt-2 border-t border-neutral-200 block">
                  REF: {item.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About School */}
      <section id="about" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818]">
        {/* Top Section: Institutional Profile (Left) + Square White Logo Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
                [ 01 — INSTITUTIONAL PROFILE ]
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Fostering Educational Growth in the Heart of Kulgam
              </h3>
              <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-4">
                Opinawaz Universal Public School was established with a singular objective: to deliver high-quality, modern, and value-driven education to the youth of Kulgam and surrounding areas.
              </p>
              <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-6">
                We bridge standard academic syllabi with life skills, moral foundations, and scientific temper. We place high importance on safe transport, disciplined study habits, and personalized attention by maintaining healthy teacher-student ratios.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-2 border-[#122818] bg-[#D8F3DC]/40 p-4 text-center font-mono">
              <div>
                <span className="block font-black text-2xl text-[#122818]">K-10</span>
                <span className="text-[10px] text-neutral-600 uppercase">Grades Offered</span>
              </div>
              <div className="border-l-2 border-[#122818]">
                <span className="block font-black text-2xl text-[#122818]">100%</span>
                <span className="text-[10px] text-neutral-600 uppercase">Dedicated Staff</span>
              </div>
              <div className="border-l-2 border-[#122818]">
                <span className="block font-black text-2xl text-[#122818]">15+</span>
                <span className="text-[10px] text-neutral-600 uppercase">Feeder Routes</span>
              </div>
              <div className="border-l-2 border-[#122818]">
                <span className="block font-black text-2xl text-[#122818]">1:15</span>
                <span className="text-[10px] text-neutral-600 uppercase">Teacher Ratio</span>
              </div>
            </div>
          </div>

          {/* Right: Square White Logo Emblem Card */}
          <div className="lg:col-span-5 flex">
            <div className="w-full bg-white text-[#122818] border-2 border-[#122818] p-6 sm:p-7 shadow-[5px_5px_0px_#122818] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono font-bold uppercase bg-[#52B788] text-[#122818] px-2.5 py-1 border border-[#122818] inline-block mb-3 shadow-[2px_2px_0px_#122818]">
                OFFICIAL EMBLEM & CREST
              </span>
              <div className="relative my-2 group">
                <img
                  src={nobgLogo}
                  alt="Opinawaz Universal Public School Official Crest"
                  className="w-32 sm:w-36 h-auto object-contain mx-auto drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg uppercase tracking-tight text-[#122818] mt-1">
                Opinawaz Universal Public School
              </h4>
              <p className="text-[11px] font-mono text-[#2D6A4F] font-bold mt-0.5 mb-2">
                ESTD. 2005 • KULGAM, J&K
              </p>
              <div className="bg-[#E9EFE6] border-2 border-[#122818] p-2.5 w-full my-1 font-mono text-xs shadow-[2px_2px_0px_#122818]">
                <div className="text-[#122818] font-bold text-xs uppercase tracking-wider">
                  "PATH BEYOND THE STARS"
                </div>
                <div className="text-[11px] text-[#2D6A4F] font-bold mt-0.5">
                  العلم نور — Knowledge is Light
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mt-2 font-sans">
                The official emblem symbolizes illuminated wisdom, moral character, and infinite aspiration for every learner.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Rectangle: Message from the Desk (Spread from Left to Right) */}
        <div className="w-full bg-white border-2 border-[#122818] p-6 md:p-8 shadow-[5px_5px_0px_#122818]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-mono font-bold uppercase bg-[#52B788] text-[#122818] px-2.5 py-1 border border-[#122818] inline-block mb-3 shadow-[2px_2px_0px_#122818]">
                MESSAGE FROM THE DESK
              </span>
              <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#122818]">
                "Every child brings unique potential to our classrooms."
              </h4>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-4xl">
                At Opinawaz Universal Public School, we consider schooling as a partnership between teachers, parents, and children. In today's competitive landscape, academic marks alone are not enough—our students must develop integrity, curiosity, and respect for their community.
              </p>
            </div>

            <div className="lg:col-span-4 lg:border-l-2 lg:border-[#122818] lg:pl-6 flex flex-col justify-between font-mono text-xs gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block">OFFICIAL DESK</span>
                <span className="font-bold text-sm text-[#122818] block mt-0.5">Administration & Principal</span>
                <span className="text-neutral-500 text-xs block">Opinawaz Universal Public School, Kulgam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#D8F3DC] text-[#122818] px-3 py-1 border border-[#122818] font-bold text-xs shadow-[2px_2px_0px_#122818]">
                  KULGAM, J&K
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">AFFILIATED JKBOSE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Wings / Curriculum */}
      <section id="academics" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818]">
        <div className="mb-10">
          <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
            [ 02 — ACADEMIC STRUCTURE ]
          </span>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Wings of Study</h3>
          <p className="text-neutral-600 text-sm mt-2 max-w-xl">Curriculum designed to nurture age-appropriate intellectual progression, practical skills, and exam readiness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog, idx) => (
            <div key={idx} className="bg-white border-2 border-[#122818] p-6 shadow-[4px_4px_0px_#122818] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold bg-[#E9EFE6] px-2 py-1 border border-[#122818]">{prog.stage}</span>
                  <span className="text-xs font-mono text-[#2D6A4F] font-bold">{prog.grades}</span>
                </div>
                <h4 className="text-xl font-bold mb-3">{prog.name}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed mb-6">{prog.desc}</p>
              </div>

              <div>
                <p className="text-[11px] font-mono font-bold uppercase text-[#2D6A4F] mb-2 border-t pt-3 border-neutral-200">Key Highlights:</p>
                <ul className="space-y-1.5 text-xs text-neutral-700 font-medium">
                  {prog.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className="text-[#52B788] font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: HALL OF EXCELLENCE (TOPPERS & RECENT PROGRAMMES) */}
      <section id="hall" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818] bg-[#EBF1E8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#122818] pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
              [ 03 — ACHIEVEMENTS & HAPPENINGS ]
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {hallView === 'TOPPERS' ? "Academic Merit & Toppers List" : "Recent School Programs & Events"}
            </h3>
            <p className="text-neutral-600 text-xs md:text-sm mt-1 max-w-xl font-mono">
              Celebrating scholastic achievements and vibrance on our campus grounds in Kulgam.
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex border-2 border-[#122818] bg-white shadow-[3px_3px_0px_#122818] font-mono text-xs font-bold">
            <button
              onClick={() => setHallView('TOPPERS')}
              className={`px-5 py-2.5 transition-colors ${hallView === 'TOPPERS' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#F7F9F5]'
                }`}
            >
              ★ RECENT TOPPERS
            </button>
            <button
              onClick={() => setHallView('EVENTS')}
              className={`px-5 py-2.5 border-l-2 border-[#122818] transition-colors ${hallView === 'EVENTS' ? 'bg-[#52B788] text-[#122818]' : 'bg-white text-neutral-700 hover:bg-[#F7F9F5]'
                }`}
            >
              🗓 RECENT PROGRAMS
            </button>
          </div>
        </div>

        {/* VIEW 1: TOPPERS GRID */}
        {hallView === 'TOPPERS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toppers.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-[#122818] shadow-[4px_4px_0px_#122818] flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-square w-full border-b-2 border-[#122818] overflow-hidden bg-neutral-100">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-full h-full object-cover transition-all"
                      style={getTopperImageStyle(t)}
                    />
                    <span className="absolute top-2 left-2 bg-[#122818] text-[#D8F3DC] text-[10px] font-mono font-bold px-2 py-0.5 border border-white">
                      {t.rank}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-[#52B788] text-[#122818] font-black text-sm font-mono px-2 py-0.5 border border-[#122818]">
                      {t.score}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-mono text-[#2D6A4F] uppercase font-bold block mb-1">
                      {t.grade}
                    </span>
                    <h4 className="font-extrabold text-base leading-tight mb-2">{t.name}</h4>
                    <p className="text-xs text-neutral-600 bg-[#D8F3DC]/50 p-2 border border-[#122818] font-mono">
                      Award: {t.badge}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0 text-[10px] font-mono text-neutral-400 border-t border-neutral-100 mt-2">
                  VERIFIED BY EXAMINATION WING
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: RECENT PROGRAMMES / ACTIVITIES */}
        {hallView === 'EVENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((ev, idx) => {
              const photoCount = (ev.gallery && ev.gallery.length > 0) ? ev.gallery.length : 1;
              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-[#122818] shadow-[4px_4px_0px_#122818] flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Clickable Image with Zoom Effect */}
                    <div
                      onClick={() => {
                        setActiveGalleryEvent(ev);
                        setActivePhotoIdx(0);
                      }}
                      className="relative aspect-square w-full border-b-2 border-[#122818] overflow-hidden bg-neutral-100 cursor-pointer"
                      title="Click to open full photo gallery"
                    >
                      <img
                        src={ev.img}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={getCroppedImageStyle(ev, 50)}
                      />
                      <span className="absolute top-2 left-2 bg-[#52B788] text-[#122818] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                        {ev.category}
                      </span>
                      <span className="absolute bottom-2 right-2 bg-white text-[#122818] text-[10px] font-mono font-bold px-2 py-0.5 border border-[#122818]">
                        {ev.date}
                      </span>
                      {/* Hover Overlay Badge */}
                      <div className="absolute inset-0 bg-[#122818]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-[#52B788] text-[#122818] text-xs font-mono font-bold px-3 py-1.5 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] uppercase">
                          🔍 View Gallery ({photoCount})
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h4
                        onClick={() => {
                          setActiveGalleryEvent(ev);
                          setActivePhotoIdx(0);
                        }}
                        className="font-extrabold text-lg leading-snug mb-3 hover:text-[#2D6A4F] cursor-pointer transition-colors"
                      >
                        {ev.title}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                        {ev.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Strip with View Gallery Button */}
                  <div className="p-5 pt-0 border-t border-neutral-100 flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-[#2D6A4F] text-[11px] uppercase tracking-wider">
                      CAMPUS EVENT
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGalleryEvent(ev);
                        setActivePhotoIdx(0);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white px-3 py-1.5 border-2 border-[#122818] shadow-[2px_2px_0px_#122818] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer font-mono font-bold text-xs uppercase"
                    >
                      <span>📸 View Gallery</span>
                      <span className="bg-[#122818] text-[#D8F3DC] text-[9px] px-1.5 py-0.5 rounded-none font-bold">
                        {photoCount}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Facilities & Infrastructure */}
      <section id="facilities" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818]">
        <div className="mb-10">
          <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
            [ 04 — INFRASTRUCTURE ]
          </span>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Campus Facilities</h3>
          <p className="text-neutral-600 text-sm mt-2 max-w-xl">Providing students with an orderly, resourceful, and secure learning environment.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => (
            <div key={idx} className="bg-white border-2 border-[#122818] p-5 shadow-[3px_3px_0px_#122818] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#D8F3DC] border border-[#122818] inline-block mb-3">
                  [{fac.tag}]
                </span>
                <h4 className="font-bold text-base mb-2">{fac.title}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{fac.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admissions Procedure & Inquiry Form */}
      <section id="admissions" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818]">
        <div className="mb-12">
          <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
            [ 05 — ADMISSIONS PROCESS ]
          </span>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Join Opinawaz Universal Public School</h3>
          <p className="text-neutral-600 text-sm mt-2 max-w-xl">A straightforward, transparent admission workflow for prospective students and guardians.</p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {admissionSteps.map((s, idx) => (
            <div key={idx} className="bg-[#E9EFE6] border-2 border-[#122818] p-5 shadow-[3px_3px_0px_#122818]">
              <span className="font-mono text-2xl font-black text-[#2D6A4F] block mb-2">{s.step}</span>
              <h5 className="font-bold text-sm mb-2">{s.title}</h5>
              <p className="text-xs text-neutral-700 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Form and Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border-2 border-[#122818] p-6 md:p-8 shadow-[5px_5px_0px_#122818]">
            <h4 className="text-xl font-bold mb-2">Submit an Admission Inquiry</h4>
            <p className="text-xs text-neutral-600 mb-6">Leave your details and our admission desk will connect with you regarding seats, fee structure, and prospectus dates.</p>

            {formSubmitted ? (
              <div className="bg-[#D8F3DC] border-2 border-[#122818] p-6 text-center">
                <span className="text-2xl block mb-2">✓</span>
                <p className="font-bold text-sm">Inquiry Received Successfully</p>
                <p className="text-xs text-neutral-700 mt-1">Our school administrative staff in Kulgam will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleForm} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mohd. Iqbal"
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:outline-none focus:bg-white"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Student's name"
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:outline-none focus:bg-white"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase mb-1">Applying for Grade *</label>
                    <select
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:outline-none focus:bg-white font-mono"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    >
                      <option>Nursery / LKG / UKG</option>
                      <option>Grade 1 to 3</option>
                      <option>Grade 4 to 5</option>
                      <option>Grade 6 to 8</option>
                      <option>Grade 9 to 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:outline-none focus:bg-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Address / Locality in Kulgam</label>
                  <input
                    type="text"
                    placeholder="e.g., Main Town, Chawalgam, Ashmuji, etc."
                    className="w-full bg-[#F7F9F5] border-2 border-[#122818] p-2.5 focus:outline-none focus:bg-white"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-bold py-3 uppercase border-2 border-[#122818] shadow-[3px_3px_0px_#122818] transition-all cursor-pointer"
                >
                  Submit Admission Inquiry →
                </button>
              </form>
            )}
          </div>

          {/* Mandatory Documents Checklist */}
          <div className="lg:col-span-5 bg-[#D8F3DC]/60 border-2 border-[#122818] p-6 md:p-8 shadow-[5px_5px_0px_#122818] flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase bg-[#122818] text-white px-2 py-1 inline-block mb-4">
                CHECKLIST
              </span>
              <h4 className="text-lg font-bold mb-3">Documents Required for Final Admission</h4>
              <ul className="space-y-3 text-xs text-neutral-800 font-mono">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#2D6A4F]">01.</span>
                  <span>Official Municipal / Hospital Birth Certificate copy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#2D6A4F]">02.</span>
                  <span>Original Transfer Certificate (TC) from the previous recognized institution (for Grade 1 upwards).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#2D6A4F]">03.</span>
                  <span>Marksheet / Achievement Card of the preceding academic year.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#2D6A4F]">04.</span>
                  <span>Four recent passport-size photographs of the student and two of parents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#2D6A4F]">05.</span>
                  <span>Address & Identity verification documents of parent/guardian.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#122818] text-xs font-mono text-[#2D6A4F]">
              <span className="font-bold">Need assistance?</span> Visit our administrative reception during working hours: Monday to Saturday (9:00 AM – 3:30 PM).
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818] bg-[#EBF1E8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#122818] pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
              [ 06 — PARENT INQUIRIES & CLARIFICATIONS ]
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
            <p className="text-neutral-600 text-xs md:text-sm mt-1 max-w-xl font-mono">
              Clear answers to common questions about admissions, bus transport, syllabus, and campus life in Kulgam.
            </p>
          </div>
          <span className="bg-white border-2 border-[#122818] px-3.5 py-1.5 text-xs font-mono font-bold shadow-[2px_2px_0px_#122818] self-start md:self-auto">
            HELP DESK : {faqs.length} TOPICS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Accordion List */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border-2 border-[#122818] shadow-[4px_4px_0px_#122818] transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base cursor-pointer hover:bg-[#F7F9F5] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-mono font-black text-[#2D6A4F] bg-[#D8F3DC] px-2 py-0.5 border border-[#122818]">
                        Q{idx + 1}
                      </span>
                      <span className="text-neutral-900">{item.q}</span>
                    </span>
                    <span
                      className={`w-7 h-7 flex-shrink-0 rounded-full border-2 border-[#122818] flex items-center justify-center font-mono font-black text-sm transition-transform duration-200 ${
                        isOpen ? "bg-[#122818] text-white rotate-45" : "bg-[#52B788] text-[#122818]"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans border-t-2 border-[#122818] bg-[#F7F9F5]">
                      <p className="mt-2">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Help Sidebar */}
          <div className="lg:col-span-4 bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818]">
            <span className="text-xs font-mono font-bold uppercase bg-[#52B788] text-[#122818] px-2.5 py-1 border border-[#122818] inline-block mb-4">
              STILL HAVE QUESTIONS?
            </span>
            <h4 className="text-xl font-bold mb-3">Speak Directly With Our Admission Desk</h4>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-mono">
              Our administrative office at Karewa, Kulgam is open Monday through Saturday for campus visits, prospectus collection, and personal counseling.
            </p>

            <div className="space-y-3 font-mono text-xs border-t-2 border-[#122818] pt-4 mb-6">
              <div>
                <span className="text-neutral-500 block text-[10px]">PHONE INQUIRY</span>
                <a
                  href={`tel:${contactInfo.phone ? contactInfo.phone.replace(/[^0-9+]/g, '') : '+919419028723'}`}
                  className="font-bold text-[#122818] hover:text-[#2D6A4F] hover:underline block"
                >
                  {contactInfo.phone || "+91 94190 28723"}
                </a>
                {contactInfo.altPhone && (
                  <a
                    href={`tel:${contactInfo.altPhone.replace(/[^0-9+]/g, '')}`}
                    className="text-[11px] text-neutral-600 hover:underline block mt-0.5"
                  >
                    Alt: {contactInfo.altPhone}
                  </a>
                )}
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">OFFICIAL EMAIL</span>
                <a
                  href={`mailto:${contactInfo.email || 'opnawazschool@gmail.com'}`}
                  className="font-bold text-[#122818] hover:text-[#2D6A4F] hover:underline block break-all"
                >
                  {contactInfo.email || "opnawazschool@gmail.com"}
                </a>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">CAMPUS RECEPTION</span>
                <span className="font-bold text-[#122818]">{contactInfo.timing || "9:00 AM – 3:30 PM (Mon-Sat)"}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">LOCATION</span>
                <span className="font-bold text-[#122818]">{contactInfo.address || "Karewa, Kulgam (PIN 192231)"}</span>
              </div>
            </div>

            <a
              href="#admissions"
              className="w-full text-center bg-[#122818] hover:bg-[#2D6A4F] text-[#D8F3DC] hover:text-white font-mono text-xs font-bold uppercase py-3 border-2 border-[#122818] shadow-[3px_3px_0px_#52B788] block transition-all"
            >
              Fill Online Inquiry Form →
            </a>
          </div>
        </div>
      </section>

      {/* Campus Location & Map Section */}
      <section id="location" className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto border-b-2 border-[#122818] bg-[#F7F9F5]">
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#2D6A4F] tracking-widest block mb-2">
                [ 07 — CAMPUS LOCATION & REACHABILITY ]
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Visit Our Campus</h3>
              <p className="text-neutral-600 text-sm mt-2 max-w-xl">
                Located on the Karewa plateau of Kulgam with serene surroundings and convenient road connectivity across the district.
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/w8F8QtUFDuxGiu3B6"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#52B788] hover:bg-[#2D6A4F] text-[#122818] hover:text-white font-mono text-xs font-bold uppercase py-3 px-6 border-2 border-[#122818] shadow-[3px_3px_0px_#122818] inline-flex items-center gap-2 transition-all"
            >
              <span>Open in Google Maps</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Frame */}
          <div className="lg:col-span-8 bg-white border-2 border-[#122818] shadow-[5px_5px_0px_#122818] overflow-hidden flex flex-col">
            <div className="bg-[#122818] text-[#D8F3DC] px-4 py-2.5 flex items-center justify-between text-xs font-mono border-b-2 border-[#122818]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse"></span>
                <span>OPINAWAZ UNIVERSAL PUBLIC SCHOOL — KAREWA, KULGAM</span>
              </div>
              <span className="text-[10px] text-[#95D5B2] font-bold hidden sm:inline">VERIFIED ON GOOGLE MAPS</span>
            </div>
            <div className="w-full h-[380px] sm:h-[460px] relative bg-neutral-100">
              <iframe
                title="Opinawaz Universal Public School Official Location Map"
                src="https://maps.google.com/maps?q=33.6450395,75.018005+(Opinawaz+Universal+Public+School)&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Location Info Card */}
          <div className="lg:col-span-4 bg-white border-2 border-[#122818] p-6 shadow-[5px_5px_0px_#122818] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold bg-[#D8F3DC] text-[#122818] px-2 py-1 border border-[#122818] inline-block mb-4">
                CAMPUS ADDRESS & DETAILS
              </span>

              <h4 className="font-extrabold text-xl mb-3 leading-snug">
                Opinawaz Universal Public School
              </h4>

              <div className="space-y-4 text-xs font-mono text-neutral-800">
                <div className="border-b border-neutral-200 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block mb-1">📍 Campus Address</span>
                  <p className="font-bold text-neutral-900 leading-relaxed whitespace-pre-line">
                    {contactInfo.address || "Karewa, Kulgam,\nJammu & Kashmir — 192231"}
                  </p>
                </div>

                <div className="border-b border-neutral-200 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block mb-1">🌐 Plus Code & Coordinates</span>
                  <p className="bg-[#E9EFE6] px-2.5 py-1 border border-[#122818] font-bold inline-block text-[11px] mb-1">
                    J2W9+266, Karewa, Kulgam
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    GPS: 33.6450° N, 75.0180° E
                  </p>
                </div>

                <div className="border-b border-neutral-200 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block mb-1">🚌 Transport & Bus Routes</span>
                  <p className="text-neutral-600 leading-normal">
                    Servicing Kulgam Town, Chawalgam, Bugam, Ashmuji, Mirhama, and surrounding feeder localities.
                  </p>
                </div>

                <div className="border-b border-neutral-200 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block mb-1">⏰ Office Visiting Hours</span>
                  <p className="text-neutral-700">
                    <span className="font-bold text-neutral-900">{contactInfo.timing || "Monday to Saturday (9:00 AM – 3:30 PM)"}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#2D6A4F] block mb-1">📞 Contact Channels</span>
                  <div className="text-neutral-700 space-y-0.5">
                    <span className="font-bold text-neutral-900 block">{contactInfo.phone || "+91 94190 28723"}</span>
                    {contactInfo.altPhone && <span className="block text-[11px] text-neutral-600">Alt: {contactInfo.altPhone}</span>}
                    <span className="block text-[11px] text-neutral-600 break-all">{contactInfo.email || "opnawazschool@gmail.com"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#122818]">
              <a
                href="https://maps.app.goo.gl/w8F8QtUFDuxGiu3B6"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#122818] hover:bg-[#2D6A4F] text-[#D8F3DC] text-center font-mono text-xs font-bold uppercase py-2.5 border-2 border-[#122818] inline-block transition-colors"
              >
                Get Directions on Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Official Footer with Full Contact Details */}
      <footer className="bg-[#122818] text-[#D8F3DC] py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={nobgLogo}
                alt="Opinawaz Universal Public School Logo"
                className="h-12 w-auto object-contain drop-shadow"
              />
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white uppercase">Opinawaz Universal Public School</span>
            </div>
            <p className="text-xs text-[#95D5B2] leading-relaxed max-w-md font-mono mb-4">
              Committed to providing an inspiring learning journey in Kulgam. Dedicated to nurturing disciplined, self-confident, and intellectually curious young individuals.
            </p>
            <p className="text-[11px] font-mono text-neutral-400 mb-6">
              {contactInfo.address || "District Kulgam, Jammu & Kashmir — PIN 192231"}
            </p>

            {/* Official Social Media Channels with Logos */}
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#95D5B2] block uppercase mb-3">
                [ OFFICIAL SOCIAL CHANNELS ]
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Facebook */}
                <a
                  href={contactInfo.facebook || "https://facebook.com/opnawazschool"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official Facebook Page"
                  className="inline-flex items-center gap-2 bg-[#1877F2] text-white hover:bg-white hover:text-[#1877F2] px-3 py-1.5 border-2 border-white shadow-[2px_2px_0px_#52B788] text-xs font-mono font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* Instagram */}
                <a
                  href={contactInfo.instagram || "https://instagram.com/opnawazschool"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official Instagram Profile"
                  className="inline-flex items-center gap-2 bg-[#E1306C] text-white hover:bg-white hover:text-[#E1306C] px-3 py-1.5 border-2 border-white shadow-[2px_2px_0px_#52B788] text-xs font-mono font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>

                {/* YouTube */}
                <a
                  href={contactInfo.youtube || "https://youtube.com/@opnawazschool"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official YouTube Channel"
                  className="inline-flex items-center gap-2 bg-[#FF0000] text-white hover:bg-white hover:text-[#FF0000] px-3 py-1.5 border-2 border-white shadow-[2px_2px_0px_#52B788] text-xs font-mono font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={contactInfo.twitter || "https://twitter.com/opnawazschool"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official X / Twitter"
                  className="inline-flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black px-3 py-1.5 border-2 border-white shadow-[2px_2px_0px_#52B788] text-xs font-mono font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter / X</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={
                    contactInfo.whatsapp
                      ? (contactInfo.whatsapp.startsWith('http')
                          ? contactInfo.whatsapp
                          : `https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`)
                      : "https://wa.me/919419028723"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Official WhatsApp Inquiry Desk"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white hover:bg-white hover:text-[#25D366] px-3 py-1.5 border-2 border-white shadow-[2px_2px_0px_#52B788] text-xs font-mono font-bold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 border-b border-[#52B788] pb-1 inline-block">[ NAVIGATE ]</h5>
            <ul className="space-y-2 text-[#95D5B2]">
              <li><a href="#about" className="hover:underline">About the School</a></li>
              <li><a href="#academics" className="hover:underline">Academic Wings & Classes</a></li>
              <li><a href="#hall" className="hover:underline">Toppers & Recent Events</a></li>
              <li><a href="#facilities" className="hover:underline">Campus Infrastructure</a></li>
              <li><a href="#admissions" className="hover:underline">Admission Guidelines</a></li>
              <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
              <li><a href="#location" className="hover:underline">Campus Location & Map</a></li>
            </ul>
          </div>

          <div className="font-mono text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider mb-4 border-b border-[#52B788] pb-1 inline-block">[ OFFICE CONTACT ]</h5>
            <div className="space-y-2 text-[#95D5B2]">
              <p>Campus: {contactInfo.address || "Karewa, Kulgam, J&K — 192231"}</p>
              <p>Plus Code: J2W9+266 Kulgam</p>
              <p>
                Inquiries:{' '}
                <a href={`mailto:${contactInfo.email || 'opnawazschool@gmail.com'}`} className="hover:underline text-white font-bold">
                  {contactInfo.email || "opnawazschool@gmail.com"}
                </a>
              </p>
              <p>
                Telephone:{' '}
                <a href={`tel:${contactInfo.phone ? contactInfo.phone.replace(/[^0-9+]/g, '') : '+919419028723'}`} className="hover:underline text-white font-bold">
                  {contactInfo.phone || "+91 94190 28723"}
                </a>
              </p>
              {contactInfo.altPhone && (
                <p>
                  Alternate:{' '}
                  <a href={`tel:${contactInfo.altPhone.replace(/[^0-9+]/g, '')}`} className="hover:underline text-white font-bold">
                    {contactInfo.altPhone}
                  </a>
                </p>
              )}
              <p>Office Hours: {contactInfo.timing || "Mon–Sat (9 AM - 3:30 PM)"}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#2D6A4F] flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-neutral-400 gap-2">
          <span
            onClick={handleCopyrightClick}
            className="cursor-default select-none"
          >
            © 2026 Opinawaz Universal Public School, Kulgam. All rights reserved.
          </span>
          <span>Official Public Institutional Website</span>
        </div>
      </footer>

      {/* Pop-Up Event Gallery Lightbox Modal */}
      {activeGalleryEvent && (
        <div
          className="fixed inset-0 z-[100] bg-[#122818]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveGalleryEvent(null)}
        >
          <div
            className="bg-[#F7F9F5] border-4 border-[#122818] shadow-[8px_8px_0px_#52B788] max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#122818] text-white p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#122818] gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="bg-[#52B788] text-[#122818] text-[10px] font-bold px-2 py-0.5 border border-[#122818] uppercase flex-shrink-0">
                  {activeGalleryEvent.category || "EVENT"}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight truncate text-[#D8F3DC]">
                  {activeGalleryEvent.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-[#95D5B2] hidden sm:inline font-bold">
                  {activeGalleryEvent.date}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveGalleryEvent(null)}
                  className="bg-white hover:bg-red-500 hover:text-white text-[#122818] border-2 border-[#122818] w-8 h-8 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#122818] cursor-pointer transition-colors"
                  title="Close Gallery (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Active High-Res Photo with Left/Right arrows */}
            {(() => {
              const photos = (activeGalleryEvent.gallery && activeGalleryEvent.gallery.length > 0)
                ? activeGalleryEvent.gallery
                : [activeGalleryEvent.img].filter(Boolean);
              const currentPhoto = photos[activePhotoIdx] || photos[0];

              return (
                <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
                  {/* Photo Canvas Container */}
                  <div className="relative w-full aspect-video sm:h-[440px] bg-black border-2 border-[#122818] shadow-[4px_4px_0px_#122818] overflow-hidden flex items-center justify-center group select-none">
                    <img
                      src={currentPhoto}
                      alt={`${activeGalleryEvent.title} - Photo ${activePhotoIdx + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {/* Left Navigation Arrow */}
                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#52B788] text-[#122818] border-2 border-[#122818] w-10 h-10 flex items-center justify-center font-black text-base shadow-[2px_2px_0px_#122818] cursor-pointer transition-all hover:scale-110"
                        title="Previous Photo (Left Arrow)"
                      >
                        ◀
                      </button>
                    )}

                    {/* Right Navigation Arrow */}
                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((prev) => (prev + 1) % photos.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#52B788] text-[#122818] border-2 border-[#122818] w-10 h-10 flex items-center justify-center font-black text-base shadow-[2px_2px_0px_#122818] cursor-pointer transition-all hover:scale-110"
                        title="Next Photo (Right Arrow)"
                      >
                        ▶
                      </button>
                    )}

                    {/* Counter Badge */}
                    <span className="absolute bottom-3 right-3 bg-[#122818]/90 text-white font-mono text-[11px] font-bold px-2.5 py-1 border border-white shadow-[2px_2px_0px_#52B788]">
                      PHOTO {activePhotoIdx + 1} OF {photos.length}
                    </span>
                  </div>

                  {/* Thumbnail Strip */}
                  {photos.length > 1 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-600 block mb-1.5">
                        ALBUM GALLERY ({photos.length} PHOTOS) — CLICK TO SWITCH:
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {photos.map((pUrl, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setActivePhotoIdx(pIdx)}
                            className={`relative flex-shrink-0 w-20 h-14 border-2 overflow-hidden cursor-pointer transition-all ${
                              pIdx === activePhotoIdx
                                ? "border-[#2D6A4F] shadow-[2px_2px_0px_#52B788] scale-105"
                                : "border-[#122818] opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={pUrl}
                              alt={`Thumbnail ${pIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-[#122818] text-white text-[8px] font-mono px-1">
                              0{pIdx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="bg-white border-2 border-[#122818] p-3 sm:p-4 text-xs font-sans text-neutral-800 leading-relaxed shadow-[2px_2px_0px_#122818]">
                    <div className="flex items-center gap-2 mb-1 text-[10px] font-mono font-bold text-[#2D6A4F] uppercase">
                      <span>📌 EVENT SUMMARY</span>
                      <span>•</span>
                      <span>{activeGalleryEvent.date}</span>
                    </div>
                    <p>{activeGalleryEvent.desc}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}