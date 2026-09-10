const fs = require('fs');
let code = fs.readFileSync('src/public-site.ts', 'utf8');

const validationCode = `
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

          const storageRef = ref(storage, \`profileImages/\${user.uid}_\${Date.now()}\`);
`;

code = code.replace(`
        // 2. Handle Photo Upload
        let photoURL = '';
        if (photoInput.files && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const storageRef = ref(storage, \`profileImages/\${user.uid}_\${Date.now()}\`);`, validationCode);

fs.writeFileSync('src/public-site.ts', code);
