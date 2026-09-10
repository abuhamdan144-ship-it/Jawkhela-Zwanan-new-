import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Props {
  collectionName: string;
  title: string;
  template: any;
}

export function CollectionManager({ collectionName, title, template }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, collectionName));
      const data = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [collectionName]);

  const handleSave = async (item: any) => {
    setSaving(true);
    try {
      const { _id, ...data } = item;
      const id = _id || Date.now().toString();
      await setDoc(doc(db, collectionName, id), data);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    setItems([{ _id: '', ...template }, ...items]);
  };

  if (loading) return <div className="text-slate-400">Loading {title}...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
          <p className="text-slate-400 text-sm">Manage items in the {collectionName} collection.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" /> Reload</Button>
          <Button onClick={handleAddItem} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg border border-red-500/50">{error}</div>}

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
            No items found. Click "Add Item" to create one.
          </div>
        )}
        {items.map((item, index) => (
          <ItemEditor 
            key={item._id || `new-${index}`} 
            item={item} 
            onSave={handleSave} 
            onDelete={() => item._id ? handleDelete(item._id) : loadData()} 
            saving={saving} 
          />
        ))}
      </div>
    </div>
  );
}

function ItemEditor({ item, onSave, onDelete, saving }: { item: any, onSave: (v: any) => void, onDelete: () => void, saving: boolean }) {
  const [json, setJson] = useState(() => {
    const { _id, ...rest } = item;
    return JSON.stringify(rest, null, 2);
  });
  const [err, setErr] = useState('');

  const save = () => {
    try {
      const parsed = JSON.parse(json);
      setErr('');
      onSave({ _id: item._id, ...parsed });
    } catch (e: any) {
      setErr('Invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {item._id && <div className="text-xs text-slate-500 font-mono">ID: {item._id}</div>}
      {err && <div className="text-red-400 text-sm">{err}</div>}
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500"
        spellCheck={false}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onDelete} variant="destructive" size="sm" disabled={saving}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
        <Button onClick={save} size="sm" disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> Save
        </Button>
      </div>
    </div>
  );
}
