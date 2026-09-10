import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Settings() {
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteSettings', 'public'));
        if (snap.exists()) {
          setJson(JSON.stringify(snap.data(), null, 2));
        } else {
          setJson(JSON.stringify({
            title: "Zwanan Jawkhela",
            heroLead: "Zwanan Jawkhela is the youth community platform of Jawkhela village.",
            aboutText: "We are building a better future."
          }, null, 2));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const data = JSON.parse(json);
      await setDoc(doc(db, 'siteSettings', 'public'), data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Global Site Settings</h1>
        <p className="text-slate-400 text-sm">Manage global settings like the site title and hero text.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">{error}</div>}
      {success && <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-lg">Settings saved successfully.</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-300">Settings JSON</label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-96 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500"
          spellCheck={false}
        />
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
