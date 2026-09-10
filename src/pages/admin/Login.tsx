import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    
    try {
      // Allow username login by appending @zwanan.com if it's not an email
      const loginEmail = email.includes('@') ? email : `${email}@zwanan.com`;
      const userCred = await signInWithEmailAndPassword(auth, loginEmail, password);

      
      // Verify admin role
      const memberDoc = await getDoc(doc(db, 'members', userCred.user.uid));
      
      if (!memberDoc.exists()) {
        await auth.signOut();
        setError('You are signed in, but you do not have administrator access.');
        setLoading(false);
        return;
      }

      const data = memberDoc.data();
      if (data.role === 'admin' && data.status === 'approved') {
        navigate('/admin');
      } else {
        await auth.signOut();
        setError('You are signed in, but you do not have administrator access.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-50">Admin Login</h1>
          <p className="text-slate-400 mt-2">Sign in to manage the website.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username or Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
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
