import React from 'react';
import { Box, Download, Rocket, History, Share2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  onNewForge: () => void;
  onDownload: () => void;
  onDeploy: () => void;
  onSettings: () => void;
  showActions: boolean;
  projectName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onNewForge, onDownload, onDeploy, onSettings, showActions, projectName }) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Project link copied to clipboard!');
  };

  return (
    <header className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onNewForge}
        >
          <div className="w-10 h-10 bg-brand-coral rounded-xl flex items-center justify-center shadow-lg shadow-brand-coral/20 group-hover:scale-110 transition-transform">
            <Box className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-white">ForgeSite <span className="text-brand-coral">AI</span></span>
        </div>

        {projectName && (
          <div className="hidden md:flex items-center gap-3 pl-6 border-l border-white/5">
            <span className="text-sm font-bold text-zinc-400">{projectName}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showActions && (
          <div className="flex items-center gap-2 pr-4 border-r border-white/5">
            <button 
              onClick={handleShare}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Share Project"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={onSettings}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Project Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        )}
        
        {showActions && (
          <>
            <button 
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-medium transition-all"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
            <button 
              onClick={onDeploy}
              className="flex items-center gap-2 px-4 py-2 bg-brand-coral hover:bg-brand-coral/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-coral/20"
            >
              <Rocket size={16} />
              <span>Deploy</span>
            </button>
          </>
        )}
        <button 
          onClick={onNewForge}
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <History size={16} />
          <span>Dashboard</span>
        </button>
      </div>
    </header>
  );
};
