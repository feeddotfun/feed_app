import React from 'react';
import Sidebar from '@/components/layout/sidebar/sidebar';
import type { Metadata } from 'next';
import Header from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Feed.fun - Where News Meets Memes',
  description: 'Transform trending news into profitable meme opportunities',
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
}
