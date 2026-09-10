const fs = require('fs');

// Fix AdminLayout.tsx
let layout = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');
layout = layout.replace(/import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, User } from 'lucide-react';/, "import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, User, Activity } from 'lucide-react';");
fs.writeFileSync('src/components/AdminLayout.tsx', layout);

// Fix CollectionManager.tsx
let manager = fs.readFileSync('src/pages/admin/CollectionManager.tsx', 'utf8');
// To fix the key issue, we can just define the component props type properly with React.FC:
manager = manager.replace(/function ItemEditor\(\{ item, onSave, onDelete, saving \}: \{ item: any, onSave: \(v: any\) => void, onDelete: \(\) => void, saving: boolean \}\) \{/, "const ItemEditor: React.FC<{ item: any, onSave: (v: any) => void, onDelete: () => void, saving: boolean }> = ({ item, onSave, onDelete, saving }) => {");
fs.writeFileSync('src/pages/admin/CollectionManager.tsx', manager);
