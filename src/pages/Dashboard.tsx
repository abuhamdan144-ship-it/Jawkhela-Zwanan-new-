import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { LogOut, User, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const [memberData, setMemberData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }
      try {
        const docRef = doc(db, 'members', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMemberData(data);
          if (data.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Error fetching member data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 pb-12 flex items-center justify-center text-amber-500">Loading...</div>;
  }

  if (!memberData) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl text-white mb-4">Profile not found.</h2>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Member Dashboard</h1>
          <div className="flex gap-4">
            {isAdmin && (
              <Button onClick={() => navigate('/admin')}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="col-span-1 bg-slate-900 border-slate-800 text-center">
            <CardContent className="p-8">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-slate-800 border-4 border-slate-800 mb-6">
                {memberData.imageUrl ? (
                  <img src={memberData.imageUrl} alt={memberData.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-6 text-slate-500" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{memberData.fullName}</h2>
              <p className="text-slate-400 mb-4">{memberData.village || memberData.address}</p>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                memberData.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                memberData.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {memberData.status === 'approved' && <ShieldCheck size={16} />}
                {memberData.status === 'pending' && <Clock size={16} />}
                {memberData.status === 'rejected' && <AlertTriangle size={16} />}
                {memberData.status.charAt(0).toUpperCase() + memberData.status.slice(1)}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800">
            <CardHeader className="border-b border-slate-800">
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Email Address</h3>
                  <p className="text-white">{memberData.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Phone Number</h3>
                  <p className="text-white">{memberData.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Father/Guardian Name</h3>
                  <p className="text-white">{memberData.fatherName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">CNIC</h3>
                  <p className="text-white">{memberData.cnic}</p>
                </div>
              </div>
              <hr className="border-slate-800" />
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Full Address</h3>
                <p className="text-white">{memberData.address}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Professional Skills</h3>
                  <p className="text-white">{memberData.skills || 'None provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Volunteer Interest</h3>
                  <p className="text-white">{memberData.volunteerInterest || 'None provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
