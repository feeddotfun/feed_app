'use client';
import React from 'react';
import { NavItems } from './nav-items';
import { navigationItems } from '@/constants/navigation-items';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import Link from 'next/link';
import Logo from '../../ui/logo';
import SidebarLogo from './sidebar-logo';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

  const handleToggle = () => {
    toggle();
  };

  return (
    <aside
    className={cn(
      'relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block',
      !isMinimized ? 'w-60' : 'w-[72px]',
      className
    )}
    >
 <SidebarLogo isMinimized={isMinimized} />

      <ChevronLeft
        className={cn(
          'absolute -right-3 top-6 z-50 cursor-pointer rounded-full border bg-background p-1 text-foreground transition-transform',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
    <div className="px-4">
        <NavItems items={navigationItems} />
      </div>
    </aside>
  );
}
