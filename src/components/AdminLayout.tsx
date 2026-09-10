import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, User, Activity, Calendar, FolderHeart, BookOpen, Image, HeartHandshake, Mail, Layers, Target, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const memberDoc = await getDoc(doc(db, 'members', user.uid));
        if (memberDoc.exists() && memberDoc.data().role === 'admin' && memberDoc.data().status === 'approved') {
          setIsAdmin(true);
        } else {
          await signOut(auth);
          navigate('/admin/login', { state: { error: 'Access Denied: Your account does not have an approved Administrator role.' } });
        }
      } catch (err) {
        console.error(err);
        await signOut(auth);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0b1221] flex items-center justify-center text-[#d4af37]">Loading...</div>;
  }

  if (!isAdmin) return null;

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Blood Bank / Members', path: '/admin/bloodbank', icon: Activity },
    { name: 'Programs', path: '/admin/programs', icon: Layers },
    { name: 'Projects', path: '/admin/projects', icon: Target },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Team', path: '/admin/cabinet', icon: Users },
    { name: 'Stories', path: '/admin/stories', icon: FileText },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Volunteers', path: '/admin/volunteers', icon: HeartHandshake },
    { name: 'Newsletters', path: '/admin/newsletters', icon: Mail },
    { name: 'Global Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0b1221] text-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2a4a] border-r border-[#263c69] transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-[#263c69]">
          <span className="text-xl font-bold bg-gradient-to-r from-[#f3d472] to-[#d4af37] bg-clip-text text-transparent">
            Zwanan Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#d4af37]/10 text-[#f3d472]" 
                  : "text-slate-400 hover:text-slate-50 hover:bg-[#263c69]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-[#263c69]">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          
          <div className="mt-4 text-center">
            <a href="#" onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }} className="text-xs text-slate-500 hover:text-slate-400">
              &larr; View Public Site
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#1a2a4a] border-b border-[#263c69] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-50"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#263c69] flex items-center justify-center border border-[#33508a]">
                  <User className="w-4 h-4" />
                </div>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a2a4a] border border-[#263c69] rounded-lg shadow-xl z-50 py-1">
                    <div className="px-4 py-2 border-b border-[#263c69]">
                      <p className="text-sm font-medium text-slate-50">{auth.currentUser?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
