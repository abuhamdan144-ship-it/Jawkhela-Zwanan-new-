import React from 'react';

export function Settings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
              <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input type="email" defaultValue="admin@example.com" className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium mb-4 text-red-400">Danger Zone</h2>
          <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
