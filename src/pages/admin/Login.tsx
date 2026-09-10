import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const loginEmail = email.includes('@') ? email : `${email}@zwanan.com`;
      const userCred = await signInWithEmailAndPassword(auth, loginEmail, password);
      
      const memberDoc = await getDoc(doc(db, 'members', userCred.user.uid));
      
      if (!memberDoc.exists()) {
        await auth.signOut();
        setError('Account not found in the community database.');
        setLoading(false);
        return;
      }

      const data = memberDoc.data();
      
      if (data.status === 'pending') {
        await auth.signOut();
        setError('Your membership is currently pending approval by an admin.');
        setLoading(false);
        return;
      }
      
      if (data.status === 'rejected') {
        await auth.signOut();
        setError('Your membership application was rejected.');
        setLoading(false);
        return;
      }
      
      if (data.status === 'approved') {
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/member');
        }
      } else {
        await auth.signOut();
        setError('Invalid account status.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1221] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a2a4a] border border-[#263c69] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-50">Community Sign In</h1>
          <p className="text-slate-400 mt-2">Sign in to your member portal or admin dashboard.</p>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              className="w-full px-4 py-2 bg-[#0b1221] border border-[#263c69] rounded-lg text-slate-200 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[#0b1221] border border-[#263c69] rounded-lg text-slate-200 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#0b1221] font-bold hover:bg-[#f3d472] disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="#" onClick={() => {
            window.location.hash = '';
            window.location.reload();
          }} className="text-sm text-slate-500 hover:text-slate-400">
            &larr; Back to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
