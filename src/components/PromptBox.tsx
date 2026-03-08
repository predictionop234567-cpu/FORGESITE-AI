import React from 'react';
import { Sparkles, Loader2, Zap } from 'lucide-react';

interface PromptBoxProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const EXAMPLES = [
  "SaaS Landing Page",
  "Portfolio for a Designer",
  "E-commerce Coffee Shop",
  "Fitness Tracker Dashboard"
];

export const PromptBox: React.FC<PromptBoxProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-coral to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Sparkles className="text-brand-coral w-5 h-5" />
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
              placeholder="Describe the website or app you want to build..."
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-500 py-4"
              disabled={isLoading}
            />
          </div>
          <button 
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-brand-coral hover:bg-brand-coral/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-coral/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Forging...</span>
              </>
            ) : (
              <span>Forge Site</span>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 px-2">
        <span className="text-xs text-zinc-500 flex items-center gap-1 mr-2">
          <Zap size={12} /> Try an example:
        </span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => setPrompt(example)}
            className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full text-zinc-400 hover:text-white transition-all"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};
