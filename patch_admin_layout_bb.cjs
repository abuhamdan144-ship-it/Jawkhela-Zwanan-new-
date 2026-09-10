const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');

const imports = `import { LayoutDashboard, Users, Settings, LogOut, Activity } from 'lucide-react';`;
code = code.replace(/import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';/, imports);

const navItems = `const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Blood Bank / Members', path: '/admin/bloodbank', icon: Activity },
    { name: 'Programs', path: '/admin/programs', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: LayoutDashboard },
    { name: 'Events', path: '/admin/events', icon: LayoutDashboard },
    { name: 'Team', path: '/admin/cabinet', icon: Users },
    { name: 'Stories', path: '/admin/stories', icon: LayoutDashboard },
    { name: 'Gallery', path: '/admin/gallery', icon: LayoutDashboard },
    { name: 'Volunteers', path: '/admin/volunteers', icon: Users },
    { name: 'Newsletters', path: '/admin/newsletters', icon: Users },
    { name: 'Global Settings', path: '/admin/settings', icon: Settings },
  ];`;

code = code.replace(/const navItems = \[[\s\S]*?\];/, navItems);
fs.writeFileSync('src/components/AdminLayout.tsx', code);
