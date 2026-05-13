'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tag,
  Package,
  Handshake,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/brands', label: '브랜드 관리', icon: Tag },
  { href: '/products', label: '상품 관리', icon: Package },
  { href: '/partners', label: '파트너', icon: Handshake },
  { href: '/settlement', label: '정산', icon: BarChart3 },
  { href: '/settings', label: '설정', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#0f1117] flex flex-col py-7 flex-shrink-0 h-screen sticky top-0">
      <div className="px-6 mb-8 text-xl font-extrabold text-white tracking-tight">
        두호<span className="text-indigo-400">.</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-[10px] text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
