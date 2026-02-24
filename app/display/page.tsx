// app/display/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/display/Header';
import MatchesSidebar from '@/components/display/MatchesSidebar';
import DiscoveryFeed from '@/components/display/DiscoveryFeed';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase, TimeSlot, UserProfile } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
export default function AppMainPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = useMemo(() => {
    if (!isMounted) return false;
    return typeof window !== 'undefined' && !!localStorage.getItem('currentUser');
  }, [isMounted]);

  const [db] = useLocalStorage<AppDatabase>('clique-db', { 
    users: [], likes: {}, matches: [], availabilities: [], messages: {}, selections: {}
  });

  const currentUser = useMemo(() => {
    if (!isMounted) return null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (email && db.users) {
      return db.users.find(u => u.email === email) || null;
    }
    return null;
  }, [db.users, isMounted]);

  const confirmedAppointments = useMemo(() => {
    if (!currentUser || !isMounted || !db.selections) return [];

    const getChatId = (id1: string, id2: string) => [id1, id2].sort().join('_');

    const apps: { partner: UserProfile; slot: TimeSlot }[] = [];

    // Lọc ra danh sách User Profile đã Match với mình
    const matchedUsers = (db.matches || [])
      .filter(matchPair => Array.isArray(matchPair) && matchPair.includes(currentUser.id))
      .map(matchPair => {
        const partnerId = matchPair[0] === currentUser.id ? matchPair[1] : matchPair[0];
        return (db.users || []).find(u => u.id === partnerId);
      })
      .filter(Boolean) as UserProfile[];

    for (const partner of matchedUsers) {
      const chatId = getChatId(currentUser.id, partner.id);
      const chatSelections = db.selections[chatId] || {};
      const mySelection = chatSelections[currentUser.id];
      const theirSelection = chatSelections[partner.id];

      if (mySelection && theirSelection && 
          mySelection.date === theirSelection.date && 
          mySelection.startTime === theirSelection.startTime && 
          mySelection.endTime === theirSelection.endTime) {
        apps.push({ partner, slot: mySelection });
      }
    }

    return apps;
  }, [db.matches, db.users, db.selections, currentUser, isMounted]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/'); // Nếu chưa, đẩy về trang chủ
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex max-w-7xl mx-auto w-full h-[calc(100vh-64px)]">
        <DiscoveryFeed setActiveChatUser={setActiveChatUser} />
        <MatchesSidebar activeChatUser={activeChatUser} setActiveChatUser={setActiveChatUser} />
      </div>

      {/* Global Notifications for Confirmed Appointments */}
      {isMounted && (
        <div className="fixed top-24 left-4 lg:left-6 z-100 flex flex-col items-start gap-3 pointer-events-none">
          <AnimatePresence>
            {confirmedAppointments.map((app, idx) => (
              <motion.div 
                key={`${app.partner.id}-${idx}`}
                initial={{ x: -100, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.9 }}
                className="pointer-events-auto bg-slate-900 border-2 border-[#fcc824]/30 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-xs flex gap-4 items-center group overflow-hidden relative"
              >
               
                
                <div className="size-14 rounded-full overflow-hidden shrink-0 border-2 border-[#fcc824] shadow-lg shadow-[#fcc824]/20 relative bg-white">
                  <Image 
                    src={app.partner.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${app.partner.name}`} 
                    alt={app.partner.name} 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
  
                <div className="flex flex-col min-w-0 pr-4 relative z-10">
                  <h4 className="font-extrabold text-sm text-white truncate drop-shadow-sm">Có hẹn với {app.partner.name.split(' ')[0]}!</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="bg-[#fcc824] text-slate-900 p-1 rounded-md shadow-sm">
                      <Calendar size={12} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#fcc824] uppercase tracking-wider leading-none">
                        {app.slot.label}
                      </span>
                      <span className="text-[10px] font-bold text-white/70 uppercase mt-0.5">
                        {app.slot.startTime} – {app.slot.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}