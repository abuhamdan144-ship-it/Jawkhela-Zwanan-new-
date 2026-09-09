import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Briefcase } from 'lucide-react';

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Welfare Projects</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Discover the initiatives we are undertaking to improve our community.</p>
        </div>

        {loading ? (
          <div className="text-center text-amber-500">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <Card key={project.id} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-amber-500/50 transition-colors">
                {project.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-600">
                    <Briefcase size={48} />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{project.description}</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                    {project.status || 'Ongoing'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
            No projects available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
