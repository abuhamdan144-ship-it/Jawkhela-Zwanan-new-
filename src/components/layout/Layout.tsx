import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/#about' },
  { name: 'Cabinet', path: '/#cabinet' },
  { name: 'Projects', path: '/projects' },
  { name: 'Blood Bank', path: '/blood-bank' },
  { name: 'Donations', path: '/donations' },
  { name: 'Join Us', path: '/register' },
];

export function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-xl group-hover:scale-105 transition-transform">
              ZJ
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">Jawkhela Zwanan</h1>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/80">Together We Thrive</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/login"}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-700"
            >
              <User size={16} className={user ? "text-amber-500" : "text-slate-400"} />
              {user ? 'Dashboard' : 'Login'}
            </Link>
          </nav>

          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 pb-6 px-4 md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-slate-300 hover:text-amber-400 py-2 border-b border-slate-800"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to={user ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-semibold text-amber-500 py-2 mt-4"
              >
                {user ? 'My Dashboard' : 'Member Login'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  ZJ
                </div>
                <h2 className="text-xl font-bold text-white">Jawkhela Zwanan</h2>
              </Link>
              <p className="text-slate-400 max-w-sm mb-6">
                A community welfare organization dedicated to the prosperity and well-being of Jawkhela, Khyber Pakhtunkhwa.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/#about" className="text-slate-400 hover:text-amber-400">About Us</Link></li>
                <li><Link to="/projects" className="text-slate-400 hover:text-amber-400">Projects</Link></li>
                <li><Link to="/blood-bank" className="text-slate-400 hover:text-amber-400">Blood Bank</Link></li>
                <li><Link to="/donations" className="text-slate-400 hover:text-amber-400">Donate</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Jawkhela, Swat</li>
                <li>Khyber Pakhtunkhwa, Pakistan</li>
                <li><a href="mailto:info@zwananjawkhela.org" className="hover:text-amber-400">info@zwananjawkhela.org</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Jawkhela Zwanan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
