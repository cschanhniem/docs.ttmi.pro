'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { generateStaticNavigation, type NavItem } from '@/lib/static-docs';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    const nav = generateStaticNavigation();
    setNavigation(nav);

    // Auto-expand items that contain the current page
    const expandedSet = new Set<string>();

    function findAndExpand(items: NavItem[], path: string[] = []): boolean {
      for (const item of items) {
        const currentPath = [...path, item.title];
        const pathString = currentPath.join('/');

        if (item.href === pathname) {
          // Expand all parent paths
          for (let i = 1; i <= path.length; i++) {
            expandedSet.add(path.slice(0, i).join('/'));
          }
          return true;
        }

        if (item.children && findAndExpand(item.children, currentPath)) {
          expandedSet.add(pathString);
          return true;
        }
      }
      return false;
    }

    findAndExpand(nav);
    setExpandedItems(expandedSet);
  }, [pathname]);

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItem = (item: NavItem, path: string[] = []): React.ReactNode => {
    const currentPath = [...path, item.title];
    const pathString = currentPath.join('/');
    const isExpanded = expandedItems.has(pathString);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href === pathname;

    return (
      <div key={pathString}>
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground",
            !item.href && "cursor-default"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(pathString);
            }
            if (item.href) {
              onClose();
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )
          ) : (
            <FileText className="h-4 w-4 flex-shrink-0" />
          )}

          {item.href ? (
            <Link
              href={item.href}
              className="flex-1 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {item.title}
            </Link>
          ) : (
            <span className="flex-1 truncate">{item.title}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navigation.map(item => renderNavItem(item))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
