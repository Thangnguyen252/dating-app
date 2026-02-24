// components/Header.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Settings, Menu, LogOut, Calendar, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AvailabilityModal from '@/components/display/AvailabilityModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase } from '@/types';

export default function Header() {
  const router = useRouter();
  const [db, , isMounted] = useLocalStorage<AppDatabase>('clique-db', { users: [], likes: {}, matches: [], availabilities: [] });
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);

  const currentUser = useMemo(() => {
    if (!isMounted) return null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    return db.users?.find(u => u.email === email) || null;
  }, [db.users, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-stone-200 shadow-sm shrink-0">
        <div className="px-6 md:px-10 h-16 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <a className="flex items-center gap-2 group" href="#">
              <motion.div 
                whileHover={{ rotate: 90 }}
                className="w-10 h-10 bg-primary text-slate-900 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20"
              >
                <LayoutGrid className="w-6 h-6" />
              </motion.div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Clique83</h2>
            </a>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-stone-400 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-5 text-sm font-medium" href="#">
              Profile
            </a>
            <a className="text-slate-900 font-bold border-b-2 border-primary py-5 text-sm" href="#">
              Discover
            </a>
            <a className="text-stone-400 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-5 text-sm font-medium" href="#">
              Matches
            </a>
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Nút bật Lịch Rảnh (Availability) */}
            <button 
              onClick={() => setIsAvailabilityOpen(true)}
              className="text-stone-500 hover:text-primary transition-colors flex items-center justify-center"
              title="Cập nhật lịch rảnh"
            >
              <Calendar size={24} />
            </button>
            <button 
              onClick={handleLogout}
              className="text-stone-500 hover:text-red-500 transition-colors flex items-center justify-center"
              title="Đăng xuất"
            >
              <LogOut size={24} />
            </button>
            
            <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-stone-200 ml-1 md:ml-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{currentUser?.name || 'Guest'}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active</span>
              </div>
              <div className="size-10 rounded-full border-2 border-primary overflow-hidden bg-stone-100 shrink-0 relative">
                {currentUser?.imageUrls?.[0] ? (
                  <Image 
                    src={currentUser.imageUrls[0]} 
                    alt={currentUser.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-stone-400">
                    {currentUser?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden ml-1">
              <button className="text-slate-900">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Gọi Modal Lịch Rảnh ở đây */}
      <AvailabilityModal 
        isOpen={isAvailabilityOpen} 
        onClose={() => setIsAvailabilityOpen(false)} 
      />
    </>
  );
}

function Hive({ size = 24, className = "", strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}