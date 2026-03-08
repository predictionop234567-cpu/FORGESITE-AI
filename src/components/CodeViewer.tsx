import React, { useState } from 'react';
import { FileCode, Hash, Terminal, Cpu, ClipboardList, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

interface CodeViewerProps {
  html: string;
  css: string;
  js: string;
  react_code?: string;
  specification?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ html, css, js, react_code, specification }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'html' | 'css' | 'js' | 'react'>('plan');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'plan', label: 'Forge Plan', icon: ClipboardList, content: specification || '# No plan generated' },
    { id: 'html', label: 'HTML', icon: FileCode, content: html },
    { id: 'css', label: 'CSS', icon: Hash, content: css },
    { id: 'js', label: 'JS', icon: Terminal, content: js },
    { id: 'react', label: 'React', icon: Cpu, content: react_code || '// No React code generated' },
  ];

  const handleCopy = () => {
    const content = tabs.find(t => t.id === activeTab)?.content || '';
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-950/50 pr-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-brand-coral text-white bg-white/5' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-xs"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'plan' ? (
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-p:text-zinc-400 prose-li:text-zinc-400">
            <Markdown>{tabs.find(t => t.id === activeTab)?.content}</Markdown>
          </div>
        ) : (
          <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-all">
            {tabs.find(t => t.id === activeTab)?.content}
          </pre>
        )}
      </div>
    </div>
  );
};
