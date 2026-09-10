import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Trash2, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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
      await setDoc(doc(db, collectionName, id), data, { merge: true });
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    setSaving(true);
    try {
      await setDoc(doc(db, collectionName, id), { status: newStatus }, { merge: true });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    setItems([{ _id: '', status: 'approved', ...template }, ...items]);
  };

  if (loading) return <div className="text-slate-400">Loading {title}...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
          <p className="text-slate-400 text-sm">Manage items in the {collectionName} collection.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" /> Reload</Button>
          <Button onClick={handleAddItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg border border-red-500/50">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.length === 0 && (
          <div className="col-span-full text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
            No items found. Click "Add Item" to create one.
          </div>
        )}
        {items.map((item, index) => (
          <ItemEditor 
            key={item._id || `new-${index}`} 
            item={item} 
            template={template}
            onSave={handleSave} 
            onDelete={() => item._id ? handleDelete(item._id) : loadData()} 
            onApprove={() => handleStatusChange(item._id, 'approved')}
            onReject={() => handleStatusChange(item._id, 'rejected')}
            saving={saving} 
            isVolunteer={collectionName === 'volunteers'}
          />
        ))}
      </div>
    </div>
  );
}

const ItemEditor: React.FC<{ item: any, template: any, onSave: (v: any) => void, onDelete: () => void, onApprove: () => void, onReject: () => void, saving: boolean, isVolunteer: boolean }> = ({ item, template, onSave, onDelete, onApprove, onReject, saving, isVolunteer }) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const { _id, ...rest } = item;
    // ensure template keys exist so they can be edited even if empty
    const initData = { ...template, ...rest };
    return initData;
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    onSave({ _id: item._id, ...formData });
  };

  // Determine if it needs approval UI
  const showApproval = isVolunteer && item._id && formData.status !== 'approved';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col relative shadow-lg">
      {item._id ? (
         <div className="text-xs text-slate-500 font-mono mb-4 bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
            <span>ID: {item._id}</span>
            {formData.status && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${formData.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : formData.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {formData.status}
              </span>
            )}
         </div>
      ) : (
         <div className="text-xs text-blue-400 font-mono mb-4 bg-blue-500/10 p-2 rounded border border-blue-500/20">
            NEW ITEM (Not Saved)
         </div>
      )}
      
      <div className="space-y-4 flex-grow mb-6">
        {Object.keys(formData).map(key => {
          if (key === 'status') return null; // handled via badges/actions
          
          const val = formData[key];
          const isArray = Array.isArray(val);
          
          return (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{key}</label>
              {isArray ? (
                <input
                  type="text"
                  value={val.join(', ')}
                  onChange={(e) => handleChange(key, e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Comma separated values"
                />
              ) : (
                <textarea
                  value={val === undefined || val === null ? '' : String(val)}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-y min-h-[40px]"
                  rows={String(val).length > 50 ? 3 : 1}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-800">
        {showApproval && (
          <div className="flex gap-2 mb-2">
            <Button onClick={onApprove} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0" disabled={saving}>
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button onClick={onReject} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-0" disabled={saving}>
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={onDelete} variant="destructive" size="sm" className="flex-1" disabled={saving}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button onClick={save} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0" disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}
