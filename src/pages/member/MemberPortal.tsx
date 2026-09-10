import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LogOut, Download, CheckCircle, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function MemberPortal() {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login');
        return;
      }
      try {
        const docRef = await getDoc(doc(db, 'members', user.uid));
        if (docRef.exists() && docRef.data().status === 'approved') {
          setMember({ id: user.uid, ...docRef.data() });
        } else {
          await signOut(auth);
          navigate('/admin/login', { state: { error: 'Your account is not approved yet.' } });
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

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 3, 
        backgroundColor: '#020617', // Match slate-950
        useCORS: true 
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Zwanan_Member_${member.name.replace(/\s+/g, '_')}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Error generating card image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 3, 
        backgroundColor: '#020617', 
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98] // standard CR80 credit card size
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`Zwanan_Member_${member.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500">Loading profile...</div>;
  if (!member) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Member Portal
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { window.location.hash = ''; window.location.reload(); }}>
            Public Site
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="w-full max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome, {member.name}!</h2>
        <p className="text-slate-400">Your membership is officially approved. You can now download your digital membership card below.</p>
      </div>

      {/* The Digital Card */}
      <div 
        ref={cardRef} 
        className="w-full max-w-[400px] relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          aspectRatio: '1.586 / 1', // standard credit card ratio
          padding: '24px'
        }}
      >
        {/* Card Background Patterns */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold tracking-widest text-slate-100 uppercase">Zwanan Jawkhela</h3>
              <p className="text-[10px] text-blue-400 font-semibold tracking-[0.2em] uppercase mt-1">Official Member</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-blue-400 opacity-80" />
          </div>

          {/* Middle Body */}
          <div className="flex items-center gap-4 mt-6">
            {member.photoURL ? (
              <img src={member.photoURL} alt={member.name} className="w-16 h-16 rounded-full border-2 border-slate-500 object-cover shadow-lg" crossOrigin="anonymous" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xl font-bold text-slate-400 shadow-lg">
                {member.name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Name</p>
              <p className="font-bold text-lg leading-tight text-white">{member.name}</p>
            </div>
          </div>

          {/* Footer details */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Blood</p>
              <p className="text-sm font-bold text-red-400">{member.bloodGroup || 'N/A'}</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Member ID</p>
              <p className="text-sm font-mono text-slate-300">{member.id.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Button 
          onClick={handleDownloadImage} 
          disabled={downloading}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-6 py-6 rounded-xl transition-all"
        >
          <Download className="w-5 h-5 mr-3" /> 
          Image (PNG)
        </Button>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
        >
          <FileText className="w-5 h-5 mr-3" /> 
          {downloading ? 'Generating...' : 'Download PDF Card'}
        </Button>
      </div>
    </div>
  );
}
