'use client';

import { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { MermaidDiagram } from './mermaid-diagram';
import { CodeBlock } from './code-block';

interface MDXContentProps {
  content: string;
}

const components = {
  // Custom components
  MermaidDiagram,

  // Override default components
  pre: ({ children, ...props }: any) => {
    // Extract code content and language
    const code = children?.props?.children || '';
    const language = children?.props?.className?.replace('language-', '') || '';

    if (language === 'mermaid') {
      return <MermaidDiagram chart={code} />;
    }

    return <CodeBlock code={code} language={language} {...props} />;
  },

  // Custom heading with anchor links
  h1: ({ children, id, ...props }: any) => (
    <h1 id={id} {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80"
          aria-label="Link to heading"
        >
          #
        </a>
      )}
    </h1>
  ),

  h2: ({ children, id, ...props }: any) => (
    <h2 id={id} {...props} className="group">
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80"
          aria-label="Link to heading"
        >
          #
        </a>
      )}
    </h2>
  ),

  h3: ({ children, id, ...props }: any) => (
    <h3 id={id} {...props} className="group">
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-primary hover:text-primary/80"
          aria-label="Link to heading"
        >
          #
        </a>
      )}
    </h3>
  ),

  // Custom table styling
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto">
      <table {...props} className="min-w-full">
        {children}
      </table>
    </div>
  ),

  // Custom blockquote
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      className="border-l-4 border-primary/20 pl-4 italic text-muted-foreground"
    >
      {children}
    </blockquote>
  ),
};

export function MDXContent({ content }: MDXContentProps) {
  return (
    <div className="mdx-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeHighlight,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }]
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
