import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/src/lib/firebase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Textarea } from '@/src/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  fatherName: z.string().min(2, 'Father/Guardian name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().min(5, 'Address is required'),
  cnic: z.string().min(13, 'CNIC is required (13 digits)'),
  skills: z.string().optional(),
  volunteerInterest: z.string().min(1, 'Please select a volunteer interest'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (!imageFile) {
      setError("Profile image is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Upload Profile Image
      const storageRef = ref(storage, `profileImages/${user.uid}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      const imageUrl = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      // 3. Save to Firestore
      await setDoc(doc(db, 'members', user.uid), {
        userId: user.uid,
        fullName: data.fullName,
        fatherName: data.fatherName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        cnic: data.cnic,
        skills: data.skills || '',
        volunteerInterest: data.volunteerInterest,
        imageUrl: imageUrl,
        status: 'pending', // pending, approved, rejected
        role: 'member', // member, admin
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || "Failed to register. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center p-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-slate-400 mb-8">
            Your application has been submitted and is currently pending approval by the administration.
          </p>
          <p className="text-sm text-amber-500">Redirecting to your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Join Jawkhela Zwanan</h1>
          <p className="text-slate-400">Become a member and contribute to community welfare.</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/50 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-dashed border-slate-600 mb-4 flex items-center justify-center group cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud className="text-slate-500 group-hover:text-amber-500 transition-colors" size={32} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{Math.round(uploadProgress)}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400">Upload Profile Photo (Required)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register('fullName')} placeholder="e.g. Ahmad Khan" />
                  {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father/Guardian Name</Label>
                  <Input id="fatherName" {...register('fatherName')} placeholder="e.g. Muhammad Ali" />
                  {errors.fatherName && <p className="text-red-500 text-xs">{errors.fatherName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC (Without Dashes)</Label>
                  <Input id="cnic" {...register('cnic')} placeholder="e.g. 1560212345678" />
                  {errors.cnic && <p className="text-red-500 text-xs">{errors.cnic.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register('phone')} placeholder="e.g. 03001234567" />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="e.g. ahmad@example.com" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (For Account)</Label>
                  <Input id="password" type="password" {...register('password')} placeholder="Minimum 6 characters" />
                  {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Village / Address</Label>
                <Textarea id="address" {...register('address')} placeholder="Full address in Jawkhela or beyond" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Professional Skills (Optional)</Label>
                <Input id="skills" {...register('skills')} placeholder="e.g. Doctor, Teacher, Engineer, Plumber" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerInterest">Volunteer Interest</Label>
                <select 
                  id="volunteerInterest" 
                  {...register('volunteerInterest')}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select an area to volunteer...</option>
                  <option value="Education">Education & Tutoring</option>
                  <option value="Health">Health & Medical Camps</option>
                  <option value="Blood Donation">Blood Donation & Coordination</option>
                  <option value="Environment">Environmental Cleanliness</option>
                  <option value="Event Management">Event Management</option>
                  <option value="Anti Narcotics">Anti-Narcotics Awareness</option>
                  <option value="Other">Other General Welfare</option>
                </select>
                {errors.volunteerInterest && <p className="text-red-500 text-xs">{errors.volunteerInterest.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-slate-400">
                  Already have an account? <Link to="/login" className="text-amber-500 hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
