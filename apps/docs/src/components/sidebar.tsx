'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type NavItem } from '@/lib/static-docs';
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
    // Create navigation structure based on your docs folder
    const nav: NavItem[] = [
      {
        title: 'Getting Started',
        href: '/getting-started',
        order: 1
      },
      {
        title: 'User Guide',
        children: [
          {
            title: 'Installation',
            href: '/user-guide/installation'
          }
        ]
      },
      {
        title: 'ERP Modules',
        children: [
          {
            title: 'Accounting',
            children: [
              { title: 'Chart of Accounts', href: '/erp/ACC_001_Ke_Toan_So_Do_Tai_Khoan' },
              { title: 'General Ledger', href: '/erp/ACC_002_So_Cai' },
              { title: 'Journal Entries', href: '/erp/ACC_003_But_Toan_Ke_Toan' },
              { title: 'Period Closing', href: '/erp/ACC_004_Dong_So_Ke_Toan' },
              { title: 'Financial Reports', href: '/erp/ACC_005_Bao_Cao_Tai_Chinh' },
              { title: 'Tax Management', href: '/erp/ACC_006_Quan_Ly_Thue' },
              { title: 'Exchange Rate', href: '/erp/ACC_007_Quan_Ly_Ty_Gia' }
            ]
          },
          {
            title: 'Assets Management',
            children: [
              { title: 'Fixed Assets', href: '/erp/AST_001_Quan_Ly_Tai_San_Co_Dinh' },
              { title: 'Tools & Equipment', href: '/erp/AST_002_Quan_Ly_Cong_Cu_Dung_Cu' },
              { title: 'Asset Changes', href: '/erp/AST_003_Quan_Ly_Ly_Do_Tang_Giam_Tai_San' },
              { title: 'Asset Categories', href: '/erp/AST_004_Quan_Ly_Loai_Tai_San_Cong_Cu' }
            ]
          },
          {
            title: 'Budget Management',
            children: [
              { title: 'Budget Control', href: '/erp/BUD_001_Quan_Ly_Chi_Tieu_Ngan_Sach' },
              { title: 'Cost Management', href: '/erp/BUD_002_Quan_Ly_Chi_Phi' },
              { title: 'Factor Types', href: '/erp/BUD_003_Quan_Ly_Loai_Yeu_To' }
            ]
          },
          {
            title: 'Document Management',
            children: [
              { title: 'E-Invoice Rights', href: '/erp/DOC_002_Quan_Ly_Quyen_Hoa_Don_Dien_Tu' },
              { title: 'Document Control', href: '/erp/DOC_003_Quan_Ly_Chung_Tu' }
            ]
          },
          {
            title: 'Finance Management',
            children: [
              { title: 'Bank Management', href: '/erp/FIN_001_Quan_Ly_Ngan_Hang' },
              { title: 'Payment Management', href: '/erp/FIN_002_Quan_Ly_Thanh_Toan' },
              { title: 'Loan Management', href: '/erp/FIN_003_Quan_Ly_Khoan_Vay' },
              { title: 'Fee Management', href: '/erp/FIN_004_Quan_Ly_Phi' },
              { title: 'Payment Terms', href: '/erp/FIN_005_Quan_Ly_Dot_Thanh_Toan' },
              { title: 'Payment Conditions', href: '/erp/FIN_006_Quan_Ly_Dieu_Kien_Thanh_Toan' }
            ]
          },
          {
            title: 'Geography & Location',
            children: [
              { title: 'Country Management', href: '/erp/GEO_001_Quan_Ly_Quoc_Gia' },
              { title: 'Province Management', href: '/erp/GEO_002_Quan_Ly_Tinh_Thanh' },
              { title: 'District Management', href: '/erp/GEO_003_Quan_Ly_Quan_Huyen' },
              { title: 'Ward Management', href: '/erp/GEO_004_Quan_Ly_Xa_Phuong' },
              { title: 'Region Management', href: '/erp/GEO_005_Quan_Ly_Khu_Vuc' },
              { title: 'Address Management', href: '/erp/GEO_006_Quan_Ly_Dia_Chi' },
              { title: 'Delivery Address', href: '/erp/GEO_007_Quan_Ly_Dia_Chi_Nhan_Hang' }
            ]
          },
          {
            title: 'Inventory Management',
            children: [
              { title: 'Warehouse Management', href: '/erp/INV_001_Quan_Ly_Kho_Hang' },
              { title: 'Materials & Products', href: '/erp/INV_002_Quan_Ly_Vat_Tu_San_Pham' },
              { title: 'Material Categories', href: '/erp/INV_003_Quan_Ly_Loai_Vat_Tu' },
              { title: 'Units of Measure', href: '/erp/INV_004_Quan_Ly_Don_Vi_Tinh' },
              { title: 'Stock Movements', href: '/erp/INV_005_Quan_Ly_Nhap_Xuat_Kho' },
              { title: 'Storage Locations', href: '/erp/INV_006_Quan_Ly_Vi_Tri_Kho_Hang' },
              { title: 'Batch Management', href: '/erp/INV_007_Quan_Ly_Lo_Hang' },
              { title: 'Size Management', href: '/erp/INV_008_Quan_Ly_Kich_Co' }
            ]
          },
          {
            title: 'Organization',
            children: [
              { title: 'Department Management', href: '/erp/ORG_001_Quan_Ly_Bo_Phan' },
              { title: 'Employee Management', href: '/erp/ORG_002_Quan_Ly_Nhan_Vien' },
              { title: 'User Permissions', href: '/erp/ORG_003_Phân Quyền Người Dùng' },
              { title: 'Asset Usage Dept', href: '/erp/ORG_004_Quản lý Bộ Phận Sử Dụng Tài Sản' },
              { title: 'Tool Usage Dept', href: '/erp/ORG_005_Quản lý Bộ Phận Sử Dụng CCDC' }
            ]
          },
          {
            title: 'Purchasing',
            children: [
              { title: 'Supplier Management', href: '/erp/PUR_001_Quan_Ly_Nha_Cung_Cap' },
              { title: 'Purchase Orders', href: '/erp/PUR_002_Quan_Ly_Don_Mua_Hang' },
              { title: 'Purchase Invoices', href: '/erp/PUR_003_Quan_Ly_Hoa_Don_Mua_Vao' },
              { title: 'Purchase Pricing', href: '/erp/PUR_004_Quan_Ly_Gia_Mua' },
              { title: 'Import Constraints', href: '/erp/PUR_005_Quan_Ly_Rang_Buoc_Nhap' }
            ]
          },
          {
            title: 'Sales Management',
            children: [
              { title: 'Customer Management', href: '/erp/SAL_001_Quan_Ly_Khach_Hang' },
              { title: 'Customer Groups', href: '/erp/SAL_002_Quan_Ly_Nhom_Khach_Hang' },
              { title: 'Sales Pricing', href: '/erp/SAL_003_Quan_Ly_Gia_Ban' },
              { title: 'Sales Invoices', href: '/erp/SAL_004_Quan_Ly_Hoa_Don_Ban_Hang' },
              { title: 'Sales Channels', href: '/erp/SAL_005_Quan_Ly_Kenh_Ban_Hang' },
              { title: 'Payment Methods', href: '/erp/SAL_006_Quan_Ly_Hinh_Thuc_Thanh_Toan' },
              { title: 'Invoice Templates', href: '/erp/SAL_007_Quan_Ly_Mau_So_Hoa_Don' },
              { title: 'Invoice Categories', href: '/erp/SAL_008_Quan_Ly_Nhom_Loai_Hoa_Don' }
            ]
          },
          {
            title: 'Services',
            children: [
              { title: 'Service Management', href: '/erp/SRV_001_Quan_Ly_Dich_Vu' },
              { title: 'Specifications', href: '/erp/SRV_002_Quan_Ly_Quy_Cach' }
            ]
          },
          {
            title: 'Transportation',
            children: [
              { title: 'Transport Vehicles', href: '/erp/TRN_001_Quan_Ly_Phuong_Tien_Van_Chuyen' },
              { title: 'Delivery Vehicles', href: '/erp/TRN_002_Quan_Ly_Phuong_Tien_Giao_Hang' }
            ]
          }
        ]
      },
      {
        title: 'API Documentation',
        children: []
      }
    ];

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
