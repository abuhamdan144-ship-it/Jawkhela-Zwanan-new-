import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Droplet, Phone, MapPin } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function BloodBank() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonors() {
      try {
        const q = query(collection(db, 'bloodBank'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setDonors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching donors", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDonors();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplet className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Community Blood Bank</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Connecting heroes with those in need. Every drop counts.</p>
        </div>

        <div className="mb-12 flex justify-center">
          <Button variant="danger" size="lg">Register as Donor (Coming Soon)</Button>
        </div>

        {loading ? (
          <div className="text-center text-red-500">Loading donors...</div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map(donor => (
              <Card key={donor.id} className="bg-slate-900 border-slate-800 flex items-center p-6 gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-2xl font-bold border border-red-500/30">
                  {donor.bloodGroup}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{donor.name}</h3>
                  <div className="flex items-center text-sm text-slate-400 mt-1 gap-1">
                    <MapPin size={14} /> {donor.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-400 mt-1 gap-1">
                    <Phone size={14} /> {donor.phone}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
            No donors registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
