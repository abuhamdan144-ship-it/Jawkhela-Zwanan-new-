const fs = require('fs');
let code = fs.readFileSync('src/public-site.ts', 'utf8');

const importsToAdd = `
import { auth, storage } from './lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
`;

code = code.replace("import { db } from './lib/firebase';", "import { db } from './lib/firebase';" + importsToAdd);

const memberFormLogic = `
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
          const storageRef = ref(storage, \`members/\${user.uid}/profile_\${Date.now()}\`);
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
`;

code = code.replace("// Handle syncing", memberFormLogic + "\n  // Handle syncing");
fs.writeFileSync('src/public-site.ts', code);
