import React from 'react';

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: '1,248', change: '+12%' },
          { label: 'Active Sessions', value: '42', change: '+5%' },
          { label: 'Revenue', value: '$12,450', change: '+18%' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-sm font-medium text-emerald-400">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500">Chart Placeholder</p>
      </div>
    </div>
  );
}
