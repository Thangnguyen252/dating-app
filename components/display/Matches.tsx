'use client';

import React from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface MatchesProps {
  pendingLikesCount: number;
  matchedUsers: UserProfile[];
  onUserClick: (user: UserProfile) => void;
}

export default function Matches({ pendingLikesCount, matchedUsers, onUserClick }: MatchesProps) {
  return (
    <div className={`w-full flex-col pt-4 pb-2 ${inter.className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[#111827] text-xl tracking-tight">Matches</h3>
        {matchedUsers.length > 0 && (
          <span className="bg-[#fcc824] text-[#111827] text-xs font-bold px-2.5 py-1 rounded-md">
            {matchedUsers.length} New
          </span>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {/* Likes Counter */}
        <div className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group shrink-0">
          <div className="size-16 rounded-full overflow-hidden relative transition-all border-[3px] border-[#fcc824] flex items-center justify-center bg-white shadow-sm group-hover:bg-stone-50">
            <span className="font-extrabold text-[#111827]">{pendingLikesCount}+</span>
          </div>
          <span className="text-xs font-bold text-[#fcc824]">Likes</span>
        </div>

        {/* Matched Users Bubble */}
        {matchedUsers.map((matchUser) => (
          <div 
            key={matchUser.id} 
            onClick={() => onUserClick(matchUser)}
            className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group shrink-0"
          >
            <div className="size-16 rounded-full overflow-hidden relative transition-all border-[3px] border-transparent group-hover:border-[#fcc824] bg-stone-200">
              <Image 
                src={matchUser.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${matchUser.name}`} 
                alt={matchUser.name} 
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-xs text-stone-600 font-medium">{matchUser.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
