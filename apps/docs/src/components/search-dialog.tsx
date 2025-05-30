'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { staticDocs } from '@/lib/static-docs';

interface SearchDialogProps {
  children: React.ReactNode;
}

export function SearchDialog({ children }: SearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const docs = staticDocs;
    const filtered = docs.filter(doc =>
      doc.meta.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      (doc.meta.description && doc.meta.description.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10);

    setResults(filtered);
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${slug}`);
  };

  if (!isOpen) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((doc) => (
              <div
                key={doc.slug}
                className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                onClick={() => handleSelect(doc.slug)}
              >
                <div className="flex-1">
                  <div className="font-medium">{doc.meta.title}</div>
                  {doc.meta.description && (
                    <div className="text-muted-foreground text-xs">
                      {doc.meta.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No results found for "{query}"
          </div>
        )}

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Press <kbd className="bg-muted px-1 rounded">ESC</kbd> to close
        </div>
      </div>

      <div
        className="fixed inset-0 -z-10"
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
    </div>
  );
}
