import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocMeta {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  order?: number;
}

export interface DocItem {
  slug: string;
  meta: DocMeta;
  content: string;
  path: string;
}

export interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
  order?: number;
}

const docsDirectory = path.join(process.cwd(), '../../docs');

export function getDocBySlug(slug: string[]): DocItem | null {
  try {
    const fullPath = path.join(docsDirectory, ...slug) + '.md';

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: slug.join('/'),
      meta: data as DocMeta,
      content,
      path: fullPath,
    };
  } catch (error) {
    console.error('Error reading doc:', error);
    return null;
  }
}

function readDirectory(dir: string, basePath: string, docs: DocItem[]): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      readDirectory(fullPath, path.join(basePath, file), docs);
    } else if (file.endsWith('.md')) {
      const slug = path.join(basePath, file.replace(/\.md$/, ''));
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      docs.push({
        slug: slug.replace(/\\/g, '/'), // Normalize path separators
        meta: data as DocMeta,
        content,
        path: fullPath,
      });
    }
  }
}

export function getAllDocs(): DocItem[] {
  try {
    if (!fs.existsSync(docsDirectory)) {
      return [];
    }

    const docs: DocItem[] = [];
    readDirectory(docsDirectory, '', docs);

    // Sort by order if specified, then by title
    return docs.sort((a, b) => {
      const orderA = a.meta.order ?? 999;
      const orderB = b.meta.order ?? 999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (a.meta.title || '').localeCompare(b.meta.title || '');
    });
  } catch (error) {
    console.error('Error reading docs directory:', error);
    return [];
  }
}

// Helper function to format titles from filenames
function formatTitle(filename: string): string {
  // Handle special cases for ERP modules
  const erpModuleMap: { [key: string]: string } = {
    'ACC': 'Accounting',
    'AST': 'Assets',
    'BUD': 'Budget',
    'DOC': 'Documents',
    'FIN': 'Finance',
    'GEO': 'Geography',
    'INV': 'Inventory',
    'ORG': 'Organization',
    'PUR': 'Purchasing',
    'SAL': 'Sales',
    'SRV': 'Services',
    'TRN': 'Transportation'
  };

  // Extract module prefix if it exists
  const moduleMatch = filename.match(/^([A-Z]{3})_\d+_(.+)$/);
  if (moduleMatch) {
    const [, moduleCode, title] = moduleMatch;
    const moduleName = erpModuleMap[moduleCode] || moduleCode;
    const formattedTitle = title
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return `${moduleName}: ${formattedTitle}`;
  }

  // Handle regular filenames
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to get module group from filename
function getModuleGroup(filename: string): string | null {
  const moduleMatch = filename.match(/^([A-Z]{3})_/);
  if (moduleMatch) {
    const moduleCode = moduleMatch[1];
    const moduleMap: { [key: string]: string } = {
      'ACC': 'Accounting',
      'AST': 'Assets Management',
      'BUD': 'Budget Management',
      'DOC': 'Document Management',
      'FIN': 'Finance Management',
      'GEO': 'Geography & Location',
      'INV': 'Inventory Management',
      'ORG': 'Organization',
      'PUR': 'Purchasing',
      'SAL': 'Sales Management',
      'SRV': 'Services',
      'TRN': 'Transportation'
    };
    return moduleMap[moduleCode] || moduleCode;
  }
  return null;
}

export function generateNavigation(): NavItem[] {
  const docs = getAllDocs();
  const nav: NavItem[] = [];

  for (const doc of docs) {
    const parts = doc.slug.split('/');
    let current = nav;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      let displayTitle: string;
      if (isLast) {
        // Use document title from frontmatter, or format the filename
        displayTitle = doc.meta.title || formatTitle(part);
      } else {
        // For directories, use formatted names
        displayTitle = part === 'erp' ? 'ERP Modules' :
                     part === 'user-guide' ? 'User Guide' :
                     part === 'api' ? 'API Documentation' :
                     formatTitle(part);
      }

      let existing = current.find(item => item.title === displayTitle);

      if (!existing) {
        existing = {
          title: displayTitle,
          href: isLast ? `/${doc.slug}` : undefined,
          children: isLast ? undefined : [],
          order: isLast ? doc.meta.order : undefined,
        };
        current.push(existing);
      }

      if (!isLast && existing.children) {
        current = existing.children;
      }
    }
  }

  // Group ERP modules by category
  const erpNav = nav.find(item => item.title === 'ERP Modules');
  if (erpNav && erpNav.children) {
    const groupedModules: { [key: string]: NavItem[] } = {};
    const ungroupedModules: NavItem[] = [];

    for (const module of erpNav.children) {
      if (module.href) {
        const filename = module.href.split('/').pop() || '';
        const group = getModuleGroup(filename);

        if (group) {
          if (!groupedModules[group]) {
            groupedModules[group] = [];
          }
          groupedModules[group].push(module);
        } else {
          ungroupedModules.push(module);
        }
      }
    }

    // Create new structure with groups
    const newChildren: NavItem[] = [];

    // Add grouped modules
    Object.entries(groupedModules).forEach(([groupName, modules]) => {
      if (modules.length === 1) {
        // If only one module in group, don't create a group
        newChildren.push(modules[0]);
      } else {
        // Create group with modules
        newChildren.push({
          title: groupName,
          children: modules.sort((a, b) => a.title.localeCompare(b.title)),
        });
      }
    });

    // Add ungrouped modules
    newChildren.push(...ungroupedModules);

    erpNav.children = newChildren;
  }

  // Sort navigation items
  function sortNav(items: NavItem[]): NavItem[] {
    return items
      .sort((a, b) => {
        const orderA = a.order ?? 999;
        const orderB = b.order ?? 999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return a.title.localeCompare(b.title);
      })
      .map(item => ({
        ...item,
        children: item.children ? sortNav(item.children) : undefined,
      }));
  }

  return sortNav(nav);
}
