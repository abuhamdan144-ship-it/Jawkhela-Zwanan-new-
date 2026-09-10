import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Activity, Phone, Mail, IdCard, Trash2, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function BloodBank() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { status: newStatus });
      await loadData();
    } catch (e: any) {
      setError('Error updating status: ' + e.message);
    }
  };
  
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'members', id), { role: newRole });
      await loadData();
    } catch (e: any) {
      setError('Error updating role: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this member completely?')) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      await loadData();
    } catch (e: any) {
      setError('Error deleting: ' + e.message);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesGroup = filter ? m.bloodGroup?.toLowerCase() === filter.toLowerCase() : true;
    const matchesStatus = statusFilter === 'all' ? true : m.status === statusFilter;
    const matchesRole = roleFilter === 'all' ? true : m.role === roleFilter;
    return matchesGroup && matchesStatus && matchesRole;
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) return <div className="text-slate-400">Loading Members...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-50">
            <Users className="w-6 h-6 text-blue-500" />
            Members & Blood Bank
          </h1>
          <p className="text-slate-400 text-sm">Manage all registered members, roles, and emergency blood contacts.</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">Refresh Data</Button>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <select 
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select 
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select 
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/30">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map(m => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-lg">
            {m.bloodGroup && (
              <div className="absolute top-0 right-0 p-3">
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                  {m.bloodGroup}
                </span>
              </div>
            )}
            
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
                <div className="flex gap-2 mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${m.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : m.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {m.status || 'pending'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {m.role || 'member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-400 flex-grow mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-500" /> {m.phone || 'N/A'}</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-500" /> <span className="truncate">{m.email || 'N/A'}</span></div>
              <div className="flex items-center gap-3"><IdCard className="w-4 h-4 text-slate-500" /> {m.idCard || 'N/A'}</div>
            </div>
            
            <div className="flex gap-2 mb-2">
               {m.role !== 'admin' ? (
                 <Button size="sm" variant="outline" onClick={() => handleRoleChange(m.id, 'admin')} className="flex-1 text-xs py-1 h-auto">Make Admin</Button>
               ) : (
                 <Button size="sm" variant="outline" onClick={() => handleRoleChange(m.id, 'member')} className="flex-1 text-xs py-1 h-auto">Remove Admin</Button>
               )}
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-800">
              {m.status !== 'approved' && (
                <Button size="sm" onClick={() => handleStatusChange(m.id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                  <CheckCircle className="w-4 h-4 mr-1" /> Allow
                </Button>
              )}
              {m.status !== 'rejected' && (
                <Button size="sm" onClick={() => handleStatusChange(m.id, 'rejected')} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-0">
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)} className="flex-none px-3">
                <Trash2 className="w-4 h-4" />
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
