import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Heart, Droplet, Shield, ArrowRight, Calendar, Newspaper, MapPin, Phone, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { db } from '@/src/lib/firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';

export function Home() {
  const [stats, setStats] = useState({ members: 0, projects: 0, bloodDonations: 0 });
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cabinet, setCabinet] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const membersSnapshot = await getDocs(query(collection(db, 'members'), limit(100)));
        const projectsSnapshot = await getDocs(query(collection(db, 'projects'), limit(100)));
        const bloodBankSnapshot = await getDocs(query(collection(db, 'bloodBank'), limit(100)));
        
        setStats({
          members: membersSnapshot.size,
          projects: projectsSnapshot.size,
          bloodDonations: bloodBankSnapshot.size,
        });

        const newsSnapshot = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3)));
        setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc'), limit(3)));
        setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const cabinetSnapshot = await getDocs(query(collection(db, 'cabinet'), orderBy('order', 'asc'), limit(4)));
        setCabinet(cabinetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    }
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Empowering <span className="text-amber-500">Jawkhela</span> Together
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Jawkhela Zwanan is dedicated to the welfare, development, and prosperity of our community in Khyber Pakhtunkhwa. Together we thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Join the Community <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/donations">Make a Donation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">{stats.members || '500+'}</h3>
              <p className="text-slate-400 font-medium">Active Members</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">{stats.projects || '20+'}</h3>
              <p className="text-slate-400 font-medium">Welfare Projects</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplet className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">{stats.bloodDonations || '150+'}</h3>
              <p className="text-slate-400 font-medium">Blood Donors</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Anti-Narcotics Awareness */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/50 to-slate-900 border border-red-900/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium mb-4">
                <Shield size={16} /> Community Protection
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Say NO to Narcotics</h2>
              <p className="text-slate-300 text-lg mb-6">
                Protecting our youth from the dangers of drug abuse is our top priority. Jawkhela Zwanan actively runs awareness campaigns and support programs for a drug-free society.
              </p>
              <Button variant="danger">Learn More & Get Help</Button>
            </div>
            <div className="flex-1 relative hidden md:block">
              {/* Abstract representation of protection/shield */}
              <div className="w-64 h-64 mx-auto bg-red-950/50 rounded-full flex items-center justify-center border-4 border-red-900/30">
                <Shield size={120} className="text-red-500/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cabinet / Leadership */}
      <section id="cabinet" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Community Leadership</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Meet the dedicated cabinet members guiding Jawkhela Zwanan towards a better future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {cabinet.length > 0 ? (
              cabinet.map((member) => (
                <Card key={member.id} className="text-center bg-slate-950 border-slate-800 overflow-hidden group">
                  <div className="h-48 overflow-hidden bg-slate-800">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-amber-500 font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-slate-400">{member.message}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Placeholders if no data
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="text-center bg-slate-950 border-slate-800 overflow-hidden">
                  <div className="h-48 bg-slate-800 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-slate-800 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* News */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Newspaper className="text-amber-500" /> Latest News
                </h2>
                <Button variant="link" size="sm">View All</Button>
              </div>
              <div className="space-y-6">
                {news.length > 0 ? (
                  news.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                      <div className="hidden sm:block w-24 h-24 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-amber-500 mb-1 block">
                          {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{item.summary}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-8">No news available.</div>
                )}
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-amber-500" /> Upcoming Events
                </h2>
                <Button variant="link" size="sm">View All</Button>
              </div>
              <div className="space-y-6">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="flex gap-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
                        <span className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                        <span className="text-xs uppercase font-medium">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                          <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-1">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-slate-500 text-center py-8">No upcoming events.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Have questions or want to contribute? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="text-center bg-slate-950 border-slate-800">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                    <MapPin />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Location</h3>
                  <p className="text-slate-400">Jawkhela, Khyber Pakhtunkhwa, Pakistan</p>
                </CardContent>
             </Card>
             <Card className="text-center bg-slate-950 border-slate-800">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                    <Phone />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                  <p className="text-slate-400">Not Available</p>
                </CardContent>
             </Card>
             <Card className="text-center bg-slate-950 border-slate-800">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                    <Mail />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                  <p className="text-slate-400">info@zwananjawkhela.org</p>
                </CardContent>
             </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
