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
      // Check if dark mode is enabled
      const isDark = document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: isDark ? '#ffffff' : '#000000',
          primaryBorderColor: '#6b7280',
          lineColor: '#6b7280',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#ffffff',
        },
      });
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && ref.current && chart) {
      const renderDiagram = async () => {
        try {
          // Clean the chart content
          const cleanChart = chart.trim();
          if (!cleanChart) return;

          // Clear previous content
          if (ref.current) {
            ref.current.innerHTML = '';
          }

          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, cleanChart);

          if (ref.current) {
            ref.current.innerHTML = svg;

            // Add some styling to the SVG
            const svgElement = ref.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
            }
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <p class="text-red-600 dark:text-red-400 text-sm font-medium">Mermaid Diagram Error</p>
                <p class="text-red-500 dark:text-red-300 text-xs mt-1">Failed to render diagram. Check syntax.</p>
                <pre class="text-xs mt-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">${chart}</pre>
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
