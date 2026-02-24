// components/display/DiscoveryFeed.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, X, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase, UserProfile } from '@/types';
import { HOBBIES } from '@/lib/constants';
import MatchScreen from './MatchScreen';
// 1. Mở rộng AppDatabase để chứa thêm trường 'passes' (lưu danh sách dislike)
interface ExtendedDatabase extends AppDatabase {
  passes?: Record<string, string[]>;
}

interface HobbyType {
  id: string;
  label: string;
  icon: string;
}

// ----------------------------------------------------------------------
// THUẬT TOÁN TÍNH ĐIỂM MATCHING POINT
// ----------------------------------------------------------------------

const calculateElo = (userId: string, likesData: Record<string, string[]>): number => {
  let elo = 0;
  Object.values(likesData).forEach(likedUsers => {
    if (likedUsers.includes(userId)) elo += 1;
  });
  return elo;
};

const calculateMatchingPoint = (
  currentUser: UserProfile, 
  targetUser: UserProfile, 
  likesData: Record<string, string[]>
): number => {
  if (currentUser.gender === targetUser.gender) return -1;

  let point = 0;

  const myElo = calculateElo(currentUser.id, likesData);
  const targetElo = calculateElo(targetUser.id, likesData);
  if (Math.abs(myElo - targetElo) <= 4) {
    point += 10;
  }

  const myInterests = currentUser.interests || [];
  const targetInterests = targetUser.interests || [];
  const commonInterests = myInterests.filter(interest => targetInterests.includes(interest));
  point += Math.min(commonInterests.length * 10, 40);

  if (
    currentUser.location && 
    targetUser.location && 
    currentUser.location.toLowerCase() === targetUser.location.toLowerCase()
  ) {
    point += 15;
  }

  if (Math.abs((currentUser.age || 0) - (targetUser.age || 0)) <= 4) {
    point += 15;
  }

  if (likesData[targetUser.id]?.includes(currentUser.id)) {
    point += 15;
  }

  return point;
};

// ----------------------------------------------------------------------
// COMPONENT CHÍNH
// ----------------------------------------------------------------------

interface DiscoveryFeedProps {
  setActiveChatUser: (user: UserProfile | null) => void;
}

export default function DiscoveryFeed({ setActiveChatUser }: DiscoveryFeedProps) {
  // 2. Khởi tạo thêm object 'passes: {}' vào dữ liệu gốc
  const [db, setDb, isMounted] = useLocalStorage<ExtendedDatabase>('clique-db', { 
    users: [], 
    likes: {}, 
    matches: [], 
    availabilities: [],
    passes: {} 
  });
  
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);

  const currentUser = useMemo(() => {
    if (!isMounted) return null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (email && db.users) {
      return db.users.find(u => u.email === email) || null;
    }
    return null;
  }, [db.users, isMounted]);

  const feedProfiles = useMemo(() => {
    if (!currentUser) return [];

    return (db.users || [])
      .map(user => {
        const score = calculateMatchingPoint(currentUser, user, db.likes || {});
        return { ...user, tempScore: score };
      })
      .filter(user => {
        if (user.id === currentUser.id) return false;
        if (user.tempScore === -1) return false;
        if ((db.likes?.[currentUser.id] || []).includes(user.id)) return false;
        
        // 3. Lọc bỏ những người đã bị Dislike (từ database)
        if ((db.passes?.[currentUser.id] || []).includes(user.id)) return false;
        
        // Vẫn giữ check passedIds cho session hiện tại để UI render mượt mà
        if (passedIds.includes(user.id)) return false;

        return true;
      })
      .sort((a, b) => b.tempScore - a.tempScore);
  }, [db.users, db.likes, db.passes, currentUser, passedIds]);

  if (!isMounted || !currentUser) return <div className="flex-1 flex items-center justify-center">Đang tải...</div>;

  const profile = feedProfiles[0];

  const handleLike = () => {
    if (!profile) return;
    
    setDb(prev => {
      const newLikes = { ...prev.likes };
      if (!newLikes[currentUser.id]) newLikes[currentUser.id] = [];
      
      if (!newLikes[currentUser.id].includes(profile.id)) {
        newLikes[currentUser.id].push(profile.id);
      }

      const newMatches = [...prev.matches];
      let matched = false;

      if (prev.likes[profile.id]?.includes(currentUser.id)) {
        newMatches.push([currentUser.id, profile.id]);
        matched = true;
      }

      if (matched) {
        setMatchedProfile(profile as UserProfile);
      }

      return { ...prev, likes: newLikes, matches: newMatches };
    });
  };

  // 4. Cập nhật hàm handlePass để lưu id người bị Dislike vào Database
  const handlePass = () => {
    if (!profile) return;

    setDb(prev => {
      const newPasses = { ...(prev.passes || {}) };
      if (!newPasses[currentUser.id]) newPasses[currentUser.id] = [];
      
      if (!newPasses[currentUser.id].includes(profile.id)) {
        newPasses[currentUser.id].push(profile.id);
      }

      return { ...prev, passes: newPasses };
    });

    setPassedIds(prev => [...prev, profile.id]);
  };

  if (matchedProfile) {
    return (
      <MatchScreen 
        currentUser={currentUser} 
        matchedProfile={matchedProfile} 
        onClose={() => setMatchedProfile(null)} 
        onSendMessage={(user) => {
          setActiveChatUser(user);
          setMatchedProfile(null);
        }}
      />
    );
  }

  if (!profile) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative py-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-stone-200">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-stone-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Đã hết hồ sơ!</h2>
          <p className="text-stone-500">Hãy chờ những người còn lại phản hồi nhé!</p>
        </div>
      </section>
    );
  }

  const profileHobbies: HobbyType[] = profile.interests?.map((interest: string) => {
    const hobbyData = HOBBIES.find(h => h.id === interest);
    return hobbyData || { id: interest, label: interest, icon: '✨' };
  }) || [];

  return (
    <section className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative py-4 px-4 overflow-hidden h-full">
      <motion.div 
        key={profile.id} 
        initial={{ opacity: 0, x: 50, scale: 0.95, rotate: 2 }} 
        animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }} 
        exit={{ opacity: 0, x: -100, rotate: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full aspect-3/4 md:aspect-4/5 max-h-[75vh] rounded-4xl overflow-hidden shadow-2xl bg-slate-900 group"
      >
        <div className="absolute top-4 left-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 backdrop-blur-md">
          🔥 {profile.tempScore} Matching Point
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={profile.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&size=800`} 
          alt={profile.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-3xl md:text-4xl font-black drop-shadow-md">
                {profile.name} <span className="font-normal text-white/80">{profile.age}</span>
              </h2>
              {profile.location && (
                <div className="flex items-center gap-2 mt-2 text-white/90 font-medium text-sm">
                  <MapPin size={16} /> <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {profileHobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profileHobbies.map((hobby) => (
                <span key={hobby.id} className="px-3 py-1.5 bg-white backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-sm text-black">
                  <span>{hobby.icon}</span> {hobby.label}
                </span>
              ))}
            </div>
          )}

          <p className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-md border-t border-white/10 pt-4">
            {profile.bio}
          </p>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-6 mt-6 md:mt-8 w-full max-w-sm pb-8">
        <motion.button onClick={handlePass} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="group flex items-center justify-center size-16 md:size-20 bg-white rounded-full shadow-lg border border-stone-200 transition-all hover:shadow-xl focus:outline-none">
          <X size={32} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
        </motion.button>
        <motion.button onClick={handleLike} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="group flex items-center justify-center size-16 md:size-20 bg-primary hover:bg-[#f5c500] rounded-full shadow-lg shadow-primary/30 transition-all hover:shadow-xl focus:outline-none">
          <Check size={36} className="text-slate-900 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
}