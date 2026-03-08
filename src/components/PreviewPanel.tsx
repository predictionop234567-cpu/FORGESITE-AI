import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface PreviewPanelProps {
  html: string;
  css: string;
  js: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ html, css, js }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  const updateIframe = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const content = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
            <style>
              body { margin: 0; padding: 0; }
              ${css}
            </style>
          </head>
          <body class="bg-white text-black min-h-screen">
            ${html}
            <script>${js}</script>
          </body>
          </html>
        `;
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  };

  useEffect(() => {
    updateIframe();
  }, [html, css, js]);

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setDeviceMode('desktop')}
            className={cn("p-2 rounded-lg transition-all", deviceMode === 'desktop' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Monitor size={16} />
          </button>
          <button 
            onClick={() => setDeviceMode('tablet')}
            className={cn("p-2 rounded-lg transition-all", deviceMode === 'tablet' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Tablet size={16} />
          </button>
          <button 
            onClick={() => setDeviceMode('mobile')}
            className={cn("p-2 rounded-lg transition-all", deviceMode === 'mobile' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={updateIframe}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Refresh Preview"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Open in new tab"
            onClick={() => {
              const win = window.open('', '_blank');
              if (win) {
                win.document.write(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>Preview</title>
                    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
                    <style>${css}</style>
                  </head>
                  <body>
                    ${html}
                    <script>${js}</script>
                  </body>
                  </html>
                `);
                win.document.close();
              }
            }}
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 bg-zinc-800 flex items-center justify-center p-4 overflow-auto custom-scrollbar">
        <div 
          className="bg-white shadow-2xl transition-all duration-300 ease-in-out h-full"
          style={{ width: deviceWidths[deviceMode] }}
        >
          <iframe 
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
        </div>
      </div>
    </div>
  );
};
