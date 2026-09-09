import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { CheckCircle, XCircle, Trash2, Edit2, LogOut, Users, Heart, Droplet, Shield } from 'lucide-react';

export function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }
      try {
        const docRef = doc(db, 'members', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
          fetchMembers();
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'members'));
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const updateMemberStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { status });
      setMembers(members.map(m => m.id === id ? { ...m, status } : m));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const deleteMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'members', id));
        setMembers(members.filter(m => m.id !== id));
      } catch (err) {
        console.error("Failed to delete member", err);
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24 text-amber-500">Loading Admin Area...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <LogOut className="mr-2 h-4 w-4" /> Exit Admin
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="bg-slate-900 border-slate-800">
              <div className="flex flex-col py-4">
                <button 
                  onClick={() => setActiveTab('members')}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <Users size={18} /> Members
                </button>
                {/* Other tabs can be added here similarly */}
                <button className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <Heart size={18} /> Projects (Coming Soon)
                </button>
                <button className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <Droplet size={18} /> Blood Bank (Coming Soon)
                </button>
                <button className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <Shield size={18} /> Donations (Coming Soon)
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'members' && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                  <CardTitle>Member Management</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {members.map(member => (
                        <tr key={member.id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{member.fullName}</div>
                            <div className="text-slate-500">{member.cnic}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">{member.phone}</div>
                            <div className="text-slate-500">{member.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              member.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {member.status !== 'approved' && (
                                <button onClick={() => updateMemberStatus(member.id, 'approved')} className="p-1.5 text-green-500 hover:bg-green-500/20 rounded" title="Approve">
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {member.status !== 'rejected' && (
                                <button onClick={() => updateMemberStatus(member.id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-500/20 rounded" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button onClick={() => deleteMember(member.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/20 rounded" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
