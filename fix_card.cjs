const fs = require('fs');
let code = fs.readFileSync('src/pages/member/MemberPortal.tsx', 'utf8');

code = code.replace(
  "link.download = \\`Zwanan_Member_\\${member.name.replace(/\\\\s+/g, '_')}.png\\`;",
  "link.download = `Zwanan_Member_${member.name.replace(/\\s+/g, '_')}.png`;"
);

fs.writeFileSync('src/pages/member/MemberPortal.tsx', code);
