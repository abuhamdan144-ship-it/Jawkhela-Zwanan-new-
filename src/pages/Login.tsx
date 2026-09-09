import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Card, CardContent } from '@/src/components/ui/Card';
import { AlertCircle, Loader2, Info } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Check role
      const memberDoc = await getDoc(doc(db, 'members', user.uid));
      if (memberDoc.exists() && memberDoc.data().role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage("Password reset email sent. Please check your inbox.");
      setResetMode(false);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-slate-900 border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-3xl mx-auto mb-4">
            ZJ
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Log in to your member dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/50 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-md bg-blue-500/10 border border-blue-500/50 flex items-start gap-3">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-blue-400 font-medium">{message}</p>
          </div>
        )}

        {!resetMode ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={() => setResetMode(true)} className="text-xs text-amber-500 hover:underline focus:outline-none">
                  Forgot Password?
                </button>
              </div>
              <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-400">
                Not a member yet? <Link to="/register" className="text-amber-500 hover:underline">Register here</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input 
                id="resetEmail" 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="you@example.com" 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
            </Button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setResetMode(false)} className="text-sm text-slate-400 hover:text-white transition-colors">
                Back to Login
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
