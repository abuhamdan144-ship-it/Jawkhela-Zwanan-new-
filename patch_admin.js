const fs = require('fs');

// Fix AdminLayout.tsx
let layout = fs.readFileSync('src/components/AdminLayout.tsx', 'utf8');
layout = layout.replace(/import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, User } from 'lucide-react';/, "import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, User, Activity } from 'lucide-react';");
fs.writeFileSync('src/components/AdminLayout.tsx', layout);

// Fix CollectionManager.tsx
let manager = fs.readFileSync('src/pages/admin/CollectionManager.tsx', 'utf8');
manager = manager.replace(/function ItemEditor\(\{ item, onSave, onDelete, saving \}: \{ item: any, onSave: \(v: any\) => void, onDelete: \(\) => void, saving: boolean \}\)/, "function ItemEditor({ item, onSave, onDelete, saving }: { item: any, onSave: (v: any) => void, onDelete: () => void, saving: boolean })");
// Well, `key` is intrinsic to React. If we define the type using a standard React.FC or similar it would be fine, but the error says Property 'key' does not exist. That's weird because React elements allow 'key' implicitly. Let's just remove the explicit type definition and rely on inference or change it.
// Actually, no, the error is inside the map function:
// <ItemEditor key={item._id || `new-${index}`} item={item} ... />
// In React 18 with TS, `key` is sometimes not picked up properly if the tsconfig is old.
// Let's just pass `key` as `itemKey` to make it happy or suppress it.
// Actually, wait, let's just use an interface.
