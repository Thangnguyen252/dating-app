'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UserProfile, ChatMessage, TimeSlot } from '@/types';
import { X, Minus, Calendar, ArrowUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface MessagesProps {
  currentUser: UserProfile;
  matchedUsers: UserProfile[];
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (receiverId: string, content: string) => void;
  onSelectSlot?: (receiverId: string, slot: TimeSlot) => void;
  selections?: Record<string, Record<string, TimeSlot>>;
  activeChatUser: UserProfile | null;
  setActiveChatUser: (user: UserProfile | null) => void;
}

export default function Messages({
  currentUser,
  matchedUsers,
  messages,
  onSendMessage,
  onSelectSlot,
  selections = {},
  activeChatUser,
  setActiveChatUser
}: MessagesProps) {
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getChatId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeChatUser) return;
    onSendMessage(activeChatUser.id, inputText);
    setInputText('');
  };

  const getAvailability = (userId: string) => {
    if (typeof window === 'undefined') return [];
    try {
      const key = `availability_${userId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  };

  const mySlots = getAvailability(currentUser.id);

  useEffect(() => {
    if (chatEndRef.current && !isMinimized) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChatUser, isMinimized]);

  // Reset minimized when changing chat user (Reset during render to avoid cascading renders)
  const [lastUser, setLastUser] = useState(activeChatUser);
  if (activeChatUser?.id !== lastUser?.id) {
    setLastUser(activeChatUser);
    setIsMinimized(false);
  }

  return (
    <div className={`flex-1 flex flex-col relative ${inter.className}`}>
      <div className="flex items-center justify-between mb-4 mt-2">
        <h3 className="font-extrabold text-[#111827] text-xl tracking-tight">Messages</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar">
        {matchedUsers.length === 0 ? (
          <p className="text-sm text-stone-400">Vuốt thêm để tìm mảnh ghép của bạn nhé!</p>
        ) : (
          matchedUsers.map((matchUser) => {
            const chatId = getChatId(currentUser.id, matchUser.id);
            const userMessages = messages[chatId] || [];
            const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
            
            return (
              <div 
                key={matchUser.id} 
                onClick={() => setActiveChatUser(matchUser)}
                className="flex items-start gap-4 cursor-pointer group"
              >
                <div className="size-12 rounded-full overflow-hidden shrink-0 relative bg-stone-200">
                  <Image 
                    src={matchUser.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${matchUser.name}`} 
                    alt={matchUser.name} 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0 pb-3 border-b border-stone-100 group-hover:border-transparent transition-colors">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm text-[#111827]">{matchUser.name.split(' ')[0]}</h4>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-stone-500 truncate group-hover:text-stone-700 transition-colors flex-1">
                      {lastMessage ? lastMessage.content : 'Bắt đầu cuộc trò chuyện ngay!'}
                    </p>
                    {(() => {
                      const theirSlots = getAvailability(matchUser.id);
                      const common = mySlots.filter((m: TimeSlot) => 
                        theirSlots.some((t: TimeSlot) => t.date === m.date && t.startTime === m.startTime && t.endTime === m.endTime)
                      );
                      if (common.length > 0) {
                        return (
                          <div className="flex items-center gap-1 bg-[#fcc824]/20 text-[#111827] text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter shrink-0 animate-pulse border border-[#fcc824]/30">
                            <Clock size={8} /> Lịch trùng
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Chat Box Overlay */}
      {activeChatUser && (
        <div 
          className="absolute inset-x-0 bottom-0 bg-[#f9fafb] z-30 flex flex-col rounded-t-3xl shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-in-out" 
          style={{ height: isMinimized ? '64px' : 'min(500px, calc(100vh - 100px))' }}
        >
          {/* Header */}
          <div className="bg-[#fcc824] px-4 py-3 flex items-center justify-between shadow-sm cursor-pointer shrink-0" onClick={() => isMinimized && setIsMinimized(false)}>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full overflow-hidden bg-white border border-white/50 relative">
                <Image 
                  src={activeChatUser.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${activeChatUser.name}`} 
                  alt={activeChatUser.name} 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#111827] text-sm">{activeChatUser.name.split(' ')[0]}</span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-green-500 size-1.5 rounded-full"></span>
                  <span className="text-[9px] font-bold text-[#111827]/70 uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#111827]/60">
              <button className="p-1 hover:bg-black/10 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                <Minus size={18} strokeWidth={3} className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button className="p-1 hover:bg-black/10 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setActiveChatUser(null); }}>
                <X size={18} strokeWidth={3} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 no-scrollbar relative">
          
            {messages[getChatId(currentUser.id, activeChatUser.id)]?.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="flex items-end gap-2 max-w-[85%]">
                      <div className="size-6 rounded-full overflow-hidden shrink-0 mb-1 relative bg-stone-200">
                        <Image 
                          src={activeChatUser.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${activeChatUser.name}`} 
                          alt={activeChatUser.name} 
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="bg-white border border-stone-100 text-[#111827] text-sm px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {isMe && (
                    <div className="max-w-[85%] bg-[#fcc824] text-[#111827] text-sm font-medium px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                      {msg.content}
                    </div>
                  )}
                  <span className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider font-semibold">
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              );
            })}

            {/* Common Availability Notification */}
            {(() => {
              if (!activeChatUser) return null;
              
              const theirSlots = getAvailability(activeChatUser.id);
              
              // Find overlaps
              const common = mySlots.filter((mySlot: { date: string, startTime: string, endTime: string }) => 
                theirSlots.some((theirSlot: { date: string, startTime: string, endTime: string }) => 
                  theirSlot.date === mySlot.date && 
                  theirSlot.startTime === mySlot.startTime && 
                  theirSlot.endTime === mySlot.endTime
                )
              );

              if (common.length === 0) {
                return (
                  <div className="mx-2 mt-4 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Lên lịch</span>
                      <Calendar size={14} className="text-stone-400" />
                    </div>
                    <p className="text-xs text-stone-600 mb-3">Cùng tìm khoảng thời gian rảnh phù hợp cho những bước hẹn hò tiếp.</p>
                    <button className="flex items-center gap-2 text-xs font-bold text-[#fcc824] bg-[#fdf8e6] border border-[#fcc824]/30 px-3 py-1.5 rounded-lg w-fit">
                      <Calendar size={12} /> Cập nhật lịch ngay!
                    </button>
                  </div>
                );
              }

              const chatId = getChatId(currentUser.id, activeChatUser.id);
              const chatSelections = selections[chatId] || {};
              const mySelection = chatSelections[currentUser.id];
              const theirSelection = chatSelections[activeChatUser.id];

              const isSameSlot = (s1: TimeSlot | undefined, s2: TimeSlot | undefined) => 
                s1 && s2 && s1.date === s2.date && s1.startTime === s2.startTime && s1.endTime === s2.endTime;

              const matchFound = isSameSlot(mySelection, theirSelection);

              return (
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-2 bg-[#fcc824]/5 border-2 border-[#fcc824]/20 rounded-2xl p-5 shadow-sm overflow-hidden relative group"
                  >
                    {/* Decorative background circle */}
                    <div className="absolute -right-6 -top-6 size-24 bg-[#fcc824]/10 rounded-full blur-2xl group-hover:bg-[#fcc824]/20 transition-all"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#fcc824] p-1.5 rounded-lg">
                            <Clock size={14} className="text-slate-900" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Tìm thấy lịch trùng</span>
                        </div>
                        <div className="bg-[#fcc824] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                          {common.length} SLOTS
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-4 font-medium italic">Hãy chọn một thời gian phù hợp!</p>
                      
                      <div className="space-y-2">
                        {common.map((slot: TimeSlot, idx: number) => {
                          const isSelectedByMe = isSameSlot(mySelection, slot);
                          
                          
                          return (
                            <div key={idx} className={`bg-white/80 backdrop-blur-sm border ${isSelectedByMe ? 'border-[#fcc824] ring-1 ring-[#fcc824]' : 'border-[#fcc824]/30'} rounded-xl p-3 flex items-center justify-between shadow-sm transition-all`}>
                              <div className="flex items-center gap-3">
                                <div className={`size-2 rounded-full ${isSelectedByMe ? 'bg-[#fcc824]' : 'bg-stone-200'} ${isSelectedByMe && !matchFound ? 'animate-pulse' : ''}`} />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{slot.startTime} – {slot.endTime}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => onSelectSlot?.(activeChatUser.id, slot)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  isSelectedByMe 
                                    ? 'bg-[#fcc824] text-slate-900' 
                                    : 'bg-slate-900 text-white hover:bg-black'
                                }`}
                              >
                                {isSelectedByMe ? 'ĐÃ CHỌN' : 'CHỌN'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-stone-100">
            <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-full pr-1 pl-4 py-1 focus-within:ring-2 focus-within:ring-[#fcc824]/50 focus-within:border-[#fcc824] transition-all">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent text-sm h-8 outline-none placeholder-stone-400 font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="size-8 bg-[#fcc824] rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105"
              >
                <ArrowUp size={16} strokeWidth={3} className="text-[#111827]" />
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}