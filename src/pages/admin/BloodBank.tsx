import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Activity, Phone, Mail, IdCard, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function BloodBank() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'members'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { status: 'approved' });
      await loadData();
    } catch (e: any) {
      setError('Error approving: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this member?')) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      await loadData();
    } catch (e: any) {
      setError('Error deleting: ' + e.message);
    }
  };

  const filteredMembers = members.filter(m => {
    const hasBloodGroup = m.bloodGroup && m.bloodGroup !== '';
    const matchesGroup = filter ? m.bloodGroup?.toLowerCase() === filter.toLowerCase() : true;
    const matchesStatus = statusFilter === 'all' ? true : m.status === statusFilter;
    
    // We can show all members here or only blood bank specific. 
    // The prompt says "Blood bank details save only there if need in emergency we have completed data".
    return matchesGroup && matchesStatus && hasBloodGroup;
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) return <div className="text-slate-400">Loading Blood Bank details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500" />
            Blood Bank & Emergency Contacts
          </h1>
          <p className="text-slate-400 text-sm">Emergency contact list sorted by blood group.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <select 
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 focus:outline-none focus:border-red-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select 
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 focus:outline-none focus:border-red-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(m => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                {m.bloodGroup}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {m.photoURL ? (
                <img src={m.photoURL} alt={m.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border-2 border-slate-700">
                  {m.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-slate-100">{m.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {m.status || 'pending'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-400 flex-grow mb-4">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /> {m.phone || 'N/A'}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> {m.email || 'N/A'}</div>
              <div className="flex items-center gap-2"><IdCard className="w-4 h-4 text-slate-500" /> ID: {m.idCard || 'N/A'}</div>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800">
              {m.status !== 'approved' && (
                <Button size="sm" onClick={() => handleApprove(m.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900">
            No members found matching the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
