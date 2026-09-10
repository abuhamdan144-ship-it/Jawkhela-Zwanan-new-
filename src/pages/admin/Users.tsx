import React from 'react';

export function Users() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="bg-[#d4af37] text-[#0b1221] font-bold hover:bg-[#f3d472] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Add User
        </button>
      </div>

      <div className="bg-[#1a2a4a] border border-[#263c69] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0b1221] border-b border-[#263c69]">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-400">Name</th>
              <th className="px-6 py-4 font-medium text-slate-400">Email</th>
              <th className="px-6 py-4 font-medium text-slate-400">Role</th>
              <th className="px-6 py-4 font-medium text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-[#263c69]/50 transition-colors">
                <td className="px-6 py-4">User {i}</td>
                <td className="px-6 py-4 text-slate-400">user{i}@example.com</td>
                <td className="px-6 py-4">Member</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
