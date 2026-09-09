import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/src/lib/firebase';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Copy, UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const donationSchema = z.object({
  donorName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Phone is required'),
  amount: z.string().min(1, 'Amount is required'),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export function Donations() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: DonationFormValues) => {
    if (!receiptFile) {
      setError("Please upload your donation receipt");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload receipt
      const storageRef = ref(storage, `donations/${Date.now()}_${receiptFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, receiptFile);

      const receiptUrl = await new Promise<string>((resolve, reject) => {
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

      // Save to Firestore
      await addDoc(collection(db, 'donations'), {
        donorName: data.donorName,
        phone: data.phone,
        amount: data.amount,
        receiptUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      reset();
      setReceiptFile(null);
      setUploadProgress(0);

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Donation submission error:", err);
      setError(err.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Support Our Cause</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Your generous donations help us run community welfare projects, medical camps, and more.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Bank Details */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Donation Accounts</h2>
            <Card className="bg-slate-900 border-slate-800 mb-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Account Title</p>
                    <p className="text-lg font-bold text-white">Aziz Ul Haq</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Easypaisa</p>
                    <p className="text-lg font-mono text-white">0342 9395868</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy('03429395868', 'easypaisa')} title="Copy Easypaisa">
                    {copiedText === 'easypaisa' ? <CheckCircle className="text-green-500" size={18} /> : <Copy size={18} />}
                  </Button>
                </div>

                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Deposit Account</p>
                    <p className="text-lg font-mono text-white">253566694</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy('253566694', 'account')} title="Copy Account">
                    {copiedText === 'account' ? <CheckCircle className="text-green-500" size={18} /> : <Copy size={18} />}
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">IBAN</p>
                    <p className="text-lg font-mono text-white break-all pr-4">PK62UNIL0109000253566694</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy('PK62UNIL0109000253566694', 'iban')} title="Copy IBAN">
                    {copiedText === 'iban' ? <CheckCircle className="text-green-500" size={18} /> : <Copy size={18} />}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm">
              Please upload the transaction receipt after transferring your donation so our admins can verify and record it.
            </div>
          </div>

          {/* Submission Form */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Submit Receipt</h2>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 md:p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/50 flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  </div>
                )}
                
                {isSuccess && (
                  <div className="mb-6 p-4 rounded-md bg-green-500/10 border border-green-500/50 flex items-start gap-3">
                    <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-green-400 font-medium">Receipt submitted successfully! Pending admin verification.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="donorName">Your Name</Label>
                    <Input id="donorName" {...register('donorName')} placeholder="Enter your full name" />
                    {errors.donorName && <p className="text-red-500 text-xs">{errors.donorName.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" {...register('phone')} placeholder="0300..." />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount Sent (PKR)</Label>
                      <Input id="amount" {...register('amount')} placeholder="e.g. 1000" />
                      {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Donation Receipt / Screenshot</Label>
                    <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg bg-slate-800 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      {receiptFile ? (
                        <div className="text-center p-4">
                          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-300 truncate max-w-[200px]">{receiptFile.name}</p>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-amber-500 transition-colors" />
                          <p className="text-sm text-slate-400 group-hover:text-amber-500 transition-colors">Tap to upload receipt image</p>
                        </div>
                      )}
                      
                      {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-20">
                          <span className="text-white text-sm font-bold">Uploading {Math.round(uploadProgress)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Receipt for Verification'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
