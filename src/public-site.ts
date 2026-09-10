import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { auth, storage } from './lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export async function initPublicSite() {
  if (window.location.hash.startsWith('#/admin') || window.location.pathname.startsWith('/admin')) {
    return;
  }

  
  const memberForm = document.getElementById('memberForm') as HTMLFormElement;
  if (memberForm) {
    memberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('memberSubmitBtn') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Registering...';
      }

      try {
        const nameInput = document.getElementById('mName') as HTMLInputElement;
        const emailInput = document.getElementById('mEmail') as HTMLInputElement;
        const phoneInput = document.getElementById('mPhone') as HTMLInputElement;
        const passInput = document.getElementById('mPassword') as HTMLInputElement;
        const idCardInput = document.getElementById('mIdCard') as HTMLInputElement;
        const bloodInput = document.getElementById('mBlood') as HTMLSelectElement;
        const photoInput = document.getElementById('mPhoto') as HTMLInputElement;
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passInput.value;
        const idCard = idCardInput.value.trim();
        const bloodGroup = bloodInput.value;

        if (!name || !email || !phone || !password || !idCard || !bloodGroup) {
          throw new Error('Please fill all required fields.');
        }

        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Handle Photo Upload
        let photoURL = '';
        if (photoInput.files && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          
          // Validate image
          if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file for your profile photo.');
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('Profile photo must be less than 5MB.');
          }

          const storageRef = ref(storage, `profileImages/${user.uid}_${Date.now()}`);

          const snapshot = await uploadBytes(storageRef, file);
          photoURL = await getDownloadURL(snapshot.ref);
        }

        // 3. Save to Firestore
        await setDoc(doc(db, 'members', user.uid), {
          name,
          email,
          phone,
          idCard,
          bloodGroup,
          photoURL,
          role: 'member',
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        // 4. Success UI
        memberForm.reset();
        (window as any).toast?.('Registration successful! Welcome to the community.');
      } catch (err: any) {
        console.error('Membership registration error:', err);
        (window as any).toast?.(err.message || 'Error registering member.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Register as Member →';
        }
      }
    });
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
