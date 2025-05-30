'use client';

import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { SearchDialog } from './search-dialog';
import { useAuth } from './auth-provider';
import { Menu, LogOut, Search } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">ERP Documentation</h1>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center space-x-2">
          <SearchDialog>
            <Button variant="outline" size="sm" className="relative">
              <Search className="h-4 w-4 mr-2" />
              Search...
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:inline-flex">
                ⌘K
              </kbd>
            </Button>
          </SearchDialog>
          
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
