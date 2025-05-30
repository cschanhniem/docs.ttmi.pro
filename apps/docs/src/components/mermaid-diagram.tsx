'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && ref.current && chart) {
      const renderDiagram = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="p-4 border border-destructive/20 rounded-md bg-destructive/5">
                <p class="text-destructive text-sm font-medium">Mermaid Diagram Error</p>
                <pre class="text-xs mt-2 text-muted-foreground">${chart}</pre>
              </div>
            `;
          }
        }
      };

      renderDiagram();
    }
  }, [isLoaded, chart]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-md bg-muted/20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading diagram...</span>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className={`mermaid-container flex justify-center my-6 ${className || ''}`}
    />
  );
}
