'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

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

    // Create a simple search index based on the navigation structure
    const searchableItems = [
      { title: 'Getting Started', slug: 'getting-started', description: 'Welcome to the ERP Documentation' },
      { title: 'Installation', slug: 'user-guide/installation', description: 'How to install and set up the ERP system' },

      // Accounting
      { title: 'Chart of Accounts', slug: 'erp/ACC_001_Ke_Toan_So_Do_Tai_Khoan', description: 'Accounting chart of accounts management' },
      { title: 'General Ledger', slug: 'erp/ACC_002_So_Cai', description: 'General ledger management' },
      { title: 'Journal Entries', slug: 'erp/ACC_003_But_Toan_Ke_Toan', description: 'Journal entries and accounting records' },
      { title: 'Period Closing', slug: 'erp/ACC_004_Dong_So_Ke_Toan', description: 'Accounting period closing procedures' },
      { title: 'Financial Reports', slug: 'erp/ACC_005_Bao_Cao_Tai_Chinh', description: 'Financial reporting and statements' },
      { title: 'Tax Management', slug: 'erp/ACC_006_Quan_Ly_Thue', description: 'Tax calculation and management' },
      { title: 'Exchange Rate', slug: 'erp/ACC_007_Quan_Ly_Ty_Gia', description: 'Currency exchange rate management' },

      // Assets
      { title: 'Fixed Assets', slug: 'erp/AST_001_Quan_Ly_Tai_San_Co_Dinh', description: 'Fixed assets management' },
      { title: 'Tools & Equipment', slug: 'erp/AST_002_Quan_Ly_Cong_Cu_Dung_Cu', description: 'Tools and equipment management' },

      // Inventory
      { title: 'Warehouse Management', slug: 'erp/INV_001_Quan_Ly_Kho_Hang', description: 'Warehouse and inventory management' },
      { title: 'Materials & Products', slug: 'erp/INV_002_Quan_Ly_Vat_Tu_San_Pham', description: 'Materials and products catalog' },

      // Sales
      { title: 'Customer Management', slug: 'erp/SAL_001_Quan_Ly_Khach_Hang', description: 'Customer relationship management' },
      { title: 'Sales Invoices', slug: 'erp/SAL_004_Quan_Ly_Hoa_Don_Ban_Hang', description: 'Sales invoice management' },

      // Purchasing
      { title: 'Supplier Management', slug: 'erp/PUR_001_Quan_Ly_Nha_Cung_Cap', description: 'Supplier management system' },
      { title: 'Purchase Orders', slug: 'erp/PUR_002_Quan_Ly_Don_Mua_Hang', description: 'Purchase order management' }
    ];

    const filtered = searchableItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.slug.toLowerCase().includes(query.toLowerCase())
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
