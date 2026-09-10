import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

export async function initPublicSite() {
  if (window.location.hash.startsWith('#/admin') || window.location.pathname.startsWith('/admin')) {
    return;
  }

  // Handle syncing of volunteers and newsletter subscribers from localStorage to Firestore
  window.addEventListener('zwanana:sync', async () => {
    try {
      const vols = JSON.parse(localStorage.getItem('zj-vols') || '[]');
      const news = JSON.parse(localStorage.getItem('zj-news') || '[]');
      
      // Save volunteers
      if (vols.length > 0) {
        for (const v of vols) {
          const id = encodeURIComponent(v.p || v.n || Date.now().toString());
          await setDoc(doc(db, 'volunteers', id), v, { merge: true });
        }
      }

      // Save newsletter subscribers
      if (news.length > 0) {
        for (const email of news) {
          const id = encodeURIComponent(email);
          await setDoc(doc(db, 'newsletterSubscribers', id), { email, subscribedAt: new Date().toISOString() }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Firebase sync failed', e);
    }
  });

  // Fetch all collections and merge into zj-site-content
  try {
    const [
      settingsSnap, programsSnap, projectsSnap, eventsSnap,
      cabinetSnap, storiesSnap, gallerySnap, newsSnap, faqsSnap
    ] = await Promise.all([
      getDoc(doc(db, 'siteSettings', 'public')),
      getDocs(collection(db, 'programs')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'cabinet')),
      getDocs(collection(db, 'stories')),
      getDocs(collection(db, 'gallery')),
      getDocs(collection(db, 'news')),
      getDocs(collection(db, 'faqs')),
    ]);

    const data: any = {
      settings: settingsSnap.exists() ? settingsSnap.data() : null,
      PROGRAMS: programsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      PROJECTS: projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      EVENTS: eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      TEAM: cabinetSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      STORIES: storiesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      GALLERY: gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })),
      NEWS: newsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      FAQS: faqsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    };

    // Remove empty arrays so the fallback mock data works if a collection is empty
    Object.keys(data).forEach(k => {
      if (Array.isArray(data[k]) && data[k].length === 0) {
        delete data[k];
      }
    });

    const current = localStorage.getItem('zj-site-content');
    const next = JSON.stringify(data);

    if (current !== next) {
      localStorage.setItem('zj-site-content', next);
      window.location.reload();
    }
  } catch (error) {
    console.error('Failed to load content from Firestore', error);
  }
}
