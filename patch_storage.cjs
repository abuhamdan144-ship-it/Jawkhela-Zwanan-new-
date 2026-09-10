const fs = require('fs');
let code = fs.readFileSync('src/public-site.ts', 'utf8');

code = code.replace(/members\/\$\{user.uid\}\/profile_\$\{Date.now\(\)\}/g, 'profileImages/${user.uid}_${Date.now()}');

fs.writeFileSync('src/public-site.ts', code);
