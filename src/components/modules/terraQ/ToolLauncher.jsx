import React from 'react';
import { Activity, Bug, ChevronRight, CircleHelp, CloudSun, Sprout } from 'lucide-react';

const tools = [
  { label: 'Crop diagnosis', description: 'Scan crop and livestock health images', path: '/diagnox', module: 'DiagnoX', icon: Bug, color: 'text-rose-700 bg-rose-50' },
  { label: 'Weather & fields', description: 'Forecasts and field conditions', path: '/predicto', module: 'Predicto', icon: CloudSun, color: 'text-sky-700 bg-sky-50' },
  { label: 'Fertilizer planning', description: 'Build crop-specific input plans', path: '/fertiwise', module: 'FertiWise', icon: Sprout, color: 'text-emerald-700 bg-emerald-50' },
  { label: 'Seed analysis', description: 'Verify seeds and analyze test kits', path: '/seedlin', module: 'SeedLin', icon: Activity, color: 'text-amber-800 bg-amber-50' },
  { label: 'Expert consultation', description: 'Connect with an agricultural specialist', path: '/fertiwise', module: 'FertiWise', icon: CircleHelp, color: 'text-blue-700 bg-blue-50' },
];

export default function ToolLauncher({ canAccessModule, onOpen }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Tools</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tools.map(({ label, description, path, module, icon: Icon, color }) => {
          const accessible = canAccessModule(module);
          return (
            <button key={label} type="button" disabled={!accessible} onClick={() => onOpen(path)} className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <span className={`rounded-md p-2 ${color}`}><Icon size={17} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-gray-900">{label}</span><span className="block text-xs text-gray-500">{accessible ? description : 'Module access required'}</span></span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
