import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  History, 
  Download, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  Layout, 
  Code2, 
  Rocket,
  Plus,
  X,
  Sparkles,
  Eye,
  Share2,
  Settings,
  RefreshCw,
  Clock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import JSZip from 'jszip';
import { Toaster, toast } from 'sonner';
import type { Project, GeneratedCode } from './types';
import { cn } from './lib/utils';

// Components
import { PromptBox } from './components/PromptBox';
import { PreviewPanel } from './components/PreviewPanel';
import { CodeViewer } from './components/CodeViewer';
import { DeployPanel } from './components/DeployPanel';
import { Header } from './components/Header';

// --- Services ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const API = {
  getProjects: () => fetch('/api/projects').then(res => res.json()),
  createProject: (data: any) => fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteProject: (id: string) => fetch(`/api/projects/${id}`, { method: 'DELETE' }).then(res => res.json()),
  updateProject: (id: string, data: { name: string }) => fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),
};

const LOADING_MESSAGES = [
  "Analyzing product requirements...",
  "Architecting user flows...",
  "Designing reusable components...",
  "Synthesizing production-grade code...",
  "Optimizing for performance...",
  "Polishing user experience...",
  "Finalizing forge..."
];

export default function App() {
  const [view, setView] = useState<'home' | 'builder'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'deploy'>('preview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    API.getProjects().then(setProjects);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to forge your site.');
      return;
    }
    setIsLoading(true);
    setView('builder');
    setActiveTab('preview');

    const loadingToast = toast.loading('Forging your vision...');

    try {
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: `Act as a world-class senior full-stack engineer, product architect, and UX designer. 
        Your goal is to produce software that feels like a real startup product rather than a demo project.
        
        Before generating any code, you MUST plan the project like a senior engineer.
        
        Your response MUST include a detailed "specification" field in Markdown that defines:
        1. Product Goal: What is the primary purpose of this site?
        2. User Flows: How do users navigate and interact with the core features?
        3. Pages/Screens: List all pages or major sections to be implemented.
        4. Reusable Components: Identify common UI elements to be abstracted.
        5. Data Models: Define the structure of the data used in the application.
        6. Backend Routes (if required): List API endpoints if a backend were to be implemented.
        7. Folder Structure: Show a clean, scalable directory layout (e.g., src/components, src/pages, etc.).

        Then, generate a complete, production-quality website based on this plan.

        Product Engineering Rules:
        1. UX & Usability: Prioritize intuitive navigation, clear calls to action, and responsive layouts.
        2. Real-world Functionality: Every button must have real functionality (e.g., opening modals, filtering lists, updating state, form submissions).
        3. Clean Design: Use a modern, professional, and high-end aesthetic (inspired by Vercel, Stripe, Linear). Use Tailwind CSS.
        4. Maintainable Architecture: Write clean, well-commented, and modular code.
        5. Completeness: Ensure all features mentioned in the plan are fully implemented. No placeholders.
        6. Interactivity: Use modern JS patterns for state management and dynamic UI updates.
        
        Return a JSON object with exactly these keys:
        - name: A professional name for the site.
        - specification: The detailed Markdown plan described above.
        - html: The HTML content for the body (do not include <html>, <head>, or <body> tags).
        - css: Any custom CSS needed (Tailwind is already included).
        - js: Any JavaScript for interactivity.
        
        User Prompt: "${prompt}"`,
        config: { responseMimeType: "application/json" }
      });

      const result: GeneratedCode = JSON.parse(response.text || '{}');
      const newProject: Project = {
        id: Math.random().toString(36).substring(7),
        name: result.name || 'Untitled Site',
        prompt: prompt,
        specification: result.specification,
        html: result.html,
        css: result.css,
        js: result.js,
        created_at: new Date().toISOString()
      };

      await API.createProject(newProject);
      setProjects([newProject, ...projects]);
      setCurrentProject(newProject);
      toast.success('Site forged successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to forge site. Please try again.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentProject) return;
    const zip = new JSZip();
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentProject.name}</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style>${currentProject.css}</style>
</head>
<body>
    ${currentProject.html}
    <script>${currentProject.js}</script>
</body>
</html>`;

    zip.file("index.html", fullHtml);
    zip.file("styles.css", currentProject.css);
    zip.file("script.js", currentProject.js);

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
    link.click();
  };

  const handleDeploy = async (provider: string) => {
    setIsDeploying(true);
    const deployToast = toast.loading(`Deploying to ${provider}...`);
    // Simulate deployment
    await new Promise(r => setTimeout(r, 2000));
    toast.success(`Successfully deployed to ${provider}!`, { id: deployToast });
    setIsDeploying(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await API.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
        setView('home');
      }
      toast.success('Forge deleted.');
    } catch (error) {
      toast.error('Failed to delete forge.');
    }
  };

  const handleShare = () => {
    if (!currentProject) return;
    navigator.clipboard.writeText(window.location.href);
    toast.success('Project link copied to clipboard!');
  };

  const handleRename = async (newName: string) => {
    if (!currentProject) return;
    try {
      await API.updateProject(currentProject.id, { name: newName });
      const updatedProject = { ...currentProject, name: newName };
      setCurrentProject(updatedProject);
      setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
      toast.success('Project renamed successfully!');
    } catch (error) {
      toast.error('Failed to rename project.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface text-zinc-200 flex flex-col">
      <Toaster position="top-center" theme="dark" richColors />
      <Header 
        onNewForge={() => { setView('home'); setCurrentProject(null); }}
        onDownload={handleDownload}
        onDeploy={() => setActiveTab('deploy')}
        onSettings={() => setIsSettingsOpen(true)}
        showActions={view === 'builder' && !!currentProject}
        projectName={currentProject?.name}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center p-6 space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-display font-bold text-white">
                  Forge your vision <br /> into <span className="text-brand-coral">reality.</span>
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                  The world's most advanced AI website builder. Describe it, forge it, deploy it.
                </p>
              </div>

              <PromptBox 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={handleGenerate} 
                isLoading={isLoading} 
              />

              {projects.length > 0 && (
                <div className="w-full max-w-5xl space-y-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                    <History className="w-4 h-4" /> Recent Forges
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {projects.slice(0, 6).map(project => (
                      <div 
                        key={project.id}
                        onClick={() => { setCurrentProject(project); setView('builder'); }}
                        className="glass-panel p-6 cursor-pointer hover:border-brand-coral/30 transition-all group relative"
                      >
                        <button 
                          onClick={(e) => handleDelete(project.id, e)}
                          className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                          <Layout className="text-zinc-400 w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white group-hover:text-brand-coral transition-colors">{project.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{project.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Sidebar */}
              <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-zinc-950/30 z-20">
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`p-3 rounded-xl transition-all ${activeTab === 'preview' ? 'bg-brand-coral text-white shadow-lg shadow-brand-coral/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  title="Preview"
                >
                  <Eye className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setActiveTab('code')}
                  className={`p-3 rounded-xl transition-all ${activeTab === 'code' ? 'bg-brand-coral text-white shadow-lg shadow-brand-coral/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  title="Code"
                >
                  <Code2 className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setActiveTab('deploy')}
                  className={`p-3 rounded-xl transition-all ${activeTab === 'deploy' ? 'bg-brand-coral text-white shadow-lg shadow-brand-coral/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  title="Deploy"
                >
                  <Rocket className="w-6 h-6" />
                </button>
                
                <div className="w-8 h-px bg-white/5 my-2" />

                <button 
                  onClick={handleGenerate}
                  className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  title="Regenerate"
                >
                  <RefreshCw className={cn("w-6 h-6", isLoading && "animate-spin")} />
                </button>

                <div className="mt-auto flex flex-col gap-6">
                  <button 
                    onClick={() => { setView('home'); setCurrentProject(null); }}
                    className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    title="New Forge"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </aside>

              {/* History Sidebar (Optional/Collapsible) */}
              <div className="w-64 border-r border-white/5 bg-zinc-950/20 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-white/5 flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <Clock size={14} /> History
                </div>
                <div className="p-2 border-b border-white/5">
                  <input 
                    type="text" 
                    placeholder="Search forges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-coral/50 outline-none transition-all"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.prompt.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                    <div className="p-4 text-center text-zinc-600 text-xs italic">
                      No forges found.
                    </div>
                  ) : (
                    projects
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(project => (
                        <button
                          key={project.id}
                          onClick={() => setCurrentProject(project)}
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all group relative",
                            currentProject?.id === project.id ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02] border border-transparent"
                          )}
                        >
                          <div className="text-sm font-bold text-white truncate pr-6">{project.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{project.prompt}</div>
                          <button 
                            onClick={(e) => handleDelete(project.id, e)}
                            className="absolute top-3 right-2 p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </button>
                      ))
                  )}
                </div>
              </div>

              {/* Workspace */}
              <div className="flex-1 flex flex-col bg-black/20 relative">
                {isLoading && (
                  <div className="absolute inset-0 z-50 bg-brand-surface/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-brand-coral/20 border-t-brand-coral rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto text-brand-coral w-8 h-8 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Forging Your Vision</h3>
                      <p className="text-zinc-400 font-mono text-sm animate-pulse">{LOADING_MESSAGES[loadingMessageIndex]}</p>
                    </div>
                  </div>
                )}

                {currentProject ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/50">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-white">{currentProject.name}</span>
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-500 font-mono">{currentProject.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Live</span>
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        {activeTab === 'preview' && (
                          <motion.div 
                            key="preview"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="h-full"
                          >
                            <PreviewPanel 
                              html={currentProject.html} 
                              css={currentProject.css} 
                              js={currentProject.js} 
                            />
                          </motion.div>
                        )}

                        {activeTab === 'code' && (
                          <motion.div 
                            key="code"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full"
                          >
                            <CodeViewer 
                              html={currentProject.html} 
                              css={currentProject.css} 
                              js={currentProject.js} 
                              specification={currentProject.specification}
                            />
                          </motion.div>
                        )}

                        {activeTab === 'deploy' && (
                          <motion.div 
                            key="deploy"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full flex items-center justify-center"
                          >
                            <div className="w-full max-w-md">
                              <DeployPanel onDeploy={handleDeploy} isDeploying={isDeploying} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 italic">
                    <Box className="w-12 h-12 mb-4 opacity-20" />
                    Waiting for the forge to start...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && currentProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Project Settings</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Name</label>
                  <input 
                    type="text" 
                    defaultValue={currentProject.name}
                    onBlur={(e) => handleRename(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename((e.target as HTMLInputElement).value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-coral/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project ID</label>
                  <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 font-mono text-sm">
                    {currentProject.id}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Original Prompt</label>
                  <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 text-sm max-h-32 overflow-y-auto custom-scrollbar italic">
                    "{currentProject.prompt}"
                  </div>
                </div>
              </div>
              <div className="p-6 bg-zinc-950/50 border-t border-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleDelete(currentProject.id, { stopPropagation: () => {} } as any);
                    setIsSettingsOpen(false);
                  }}
                  className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-all"
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {view === 'home' && (
        <footer className="border-t border-white/5 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-coral rounded-lg flex items-center justify-center">
                <Box className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-display font-bold text-white">ForgeSite AI</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <p className="text-sm text-zinc-500">© 2025 ForgeSite AI. Built with Gemini.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
