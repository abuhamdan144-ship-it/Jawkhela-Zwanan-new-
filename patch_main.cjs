const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(/function renderApp\(\) \{/, 'let isAdminMounted = false;\n\nfunction renderApp() {');
code = code.replace(/if \(window\.location\.hash\.startsWith\('#\/admin'\) \|\| window\.location\.pathname\.startsWith\('\/admin'\)\) \{/, 'if (window.location.hash.startsWith(\'#/admin\') || window.location.pathname.startsWith(\'/admin\')) {\n    isAdminMounted = true;');

code = code.replace(/window\.addEventListener\('hashchange', \(\) => \{\n  if \(window\.location\.hash\.startsWith\('#\/admin'\)\) \{\n    window\.location\.reload\(\);\n  \}\n\}\);/, `window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#/admin') && !isAdminMounted) {
    window.location.reload();
  }
});`);

fs.writeFileSync('src/main.tsx', code);
