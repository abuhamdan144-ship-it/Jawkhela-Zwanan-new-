const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importBloodBank = `import { BloodBank } from './pages/admin/BloodBank';\nimport { Settings } from './pages/admin/Settings';`;
code = code.replace(`import { Settings } from './pages/admin/Settings';`, importBloodBank);

const routeBloodBank = `<Route path="bloodbank" element={<BloodBank />} />\n          <Route path="programs" element={<CollectionManager`;
code = code.replace(`<Route path="programs" element={<CollectionManager`, routeBloodBank);

fs.writeFileSync('src/App.tsx', code);
