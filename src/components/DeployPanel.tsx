import React from 'react';
import { Rocket, ExternalLink, CheckCircle2, Globe } from 'lucide-react';

interface DeployPanelProps {
  onDeploy: (provider: string) => void;
  isDeploying: boolean;
}

export const DeployPanel: React.FC<DeployPanelProps> = ({ onDeploy, isDeploying }) => {
  const providers = [
    { id: 'vercel', name: 'Vercel', icon: Globe, color: 'bg-black' },
    { id: 'netlify', name: 'Netlify', icon: Globe, color: 'bg-teal-500' },
  ];

  return (
    <div className="p-8 bg-zinc-900 rounded-3xl border border-white/5 space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Deploy Your Site</h3>
        <p className="text-zinc-500">Launch your vision to the world in seconds.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onDeploy(provider.id)}
            disabled={isDeploying}
            className="flex items-center justify-between p-6 bg-zinc-950/50 border border-white/5 rounded-2xl hover:border-brand-coral/30 transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${provider.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <provider.icon className="text-white w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white">{provider.name}</h4>
                <p className="text-xs text-zinc-500">Instant production deployment</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-zinc-700 group-hover:text-brand-coral transition-all" />
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>SSL Certificate included</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>Custom domain support</span>
        </div>
      </div>
    </div>
  );
};
