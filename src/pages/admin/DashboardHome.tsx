import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, LayoutDashboard, Target, Calendar, HeartHandshake, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardHome() {
  const [stats, setStats] = useState({
    members: 0,
    programs: 0,
    projects: 0,
    events: 0,
    volunteers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [mem, prog, proj, ev, vol] = await Promise.all([
          getDocs(collection(db, 'members')),
          getDocs(collection(db, 'programs')),
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'volunteers'))
        ]);
        
        setStats({
          members: mem.size,
          programs: prog.size,
          projects: proj.size,
          events: ev.size,
          volunteers: vol.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { label: 'Registered Members', value: stats.members, icon: Users, color: 'text-[#d4af37]', bg: 'bg-[#d4af37]/10', link: '/admin/bloodbank' },
    { label: 'Programs', value: stats.programs, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10', link: '/admin/programs' },
    { label: 'Projects', value: stats.projects, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/projects' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10', link: '/admin/events' },
    { label: 'Volunteers', value: stats.volunteers, icon: HeartHandshake, color: 'text-rose-500', bg: 'bg-rose-500/10', link: '/admin/volunteers' },
  ];

  if (loading) return <div className="text-slate-400 p-8 text-center animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Welcome to Zwanan Admin</h1>
        <p className="text-slate-400 mt-2">Here is a quick overview of your community data.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Link key={i} to={c.link} className="bg-[#1a2a4a] border border-[#263c69] rounded-xl p-6 hover:border-[#33508a] transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-slate-400 text-sm font-medium">{c.label}</h3>
                <div className="mt-2 text-3xl font-bold text-slate-50 group-hover:text-white transition-colors">{c.value}</div>
              </div>
              <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-6 h-6 ${c.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
