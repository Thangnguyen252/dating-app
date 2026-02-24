// components/display/MatchesSidebar.tsx
'use client';

import React, { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase, UserProfile, ChatMessage, TimeSlot } from '@/types';
import Matches from './Matches';
import Messages from './Messages';

interface MatchesSidebarProps {
  activeChatUser: UserProfile | null;
  setActiveChatUser: (user: UserProfile | null) => void;
}

export default function MatchesSidebar({ activeChatUser, setActiveChatUser }: MatchesSidebarProps) {
  const [db, setDb, isMounted] = useLocalStorage<AppDatabase>('clique-db', { 
    users: [], 
    likes: {}, 
    matches: [], 
    availabilities: [],
    messages: {} 
  });

  const currentUser = useMemo(() => {
    if (!isMounted) return null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (email && db.users) {
      return db.users.find(u => u.email === email) || null;
    }
    return null;
  }, [db.users, isMounted]);

  const handleSendMessage = (receiverId: string, content: string) => {
    if (!currentUser) return;
    
    const chatId = [currentUser.id, receiverId].sort().join('_');
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      senderId: currentUser.id,
      receiverId,
      content,
      timestamp: Date.now()
    };

    setDb(prev => {
      const messages = prev.messages || {};
      const chatHistory = messages[chatId] || [];
      return {
        ...prev,
        messages: {
          ...messages,
          [chatId]: [...chatHistory, newMessage]
        }
      };
    });
  };

  const handleSelectSlot = (receiverId: string, slot: TimeSlot) => {
    if (!currentUser) return;
    const chatId = [currentUser.id, receiverId].sort().join('_');
    
    setDb(prev => {
      const currentSelections = prev.selections || {};
      const chatSelections = currentSelections[chatId] || {};
      const myPrevSelection = chatSelections[currentUser.id];

      // Kiểm tra nếu slot được chọn trùng với slot đã chọn trước đó thì xóa (unselect)
      const isDeselecting = myPrevSelection && 
        myPrevSelection.date === slot.date && 
        myPrevSelection.startTime === slot.startTime && 
        myPrevSelection.endTime === slot.endTime;

      const newChatSelections = { ...chatSelections };
      if (isDeselecting) {
        delete newChatSelections[currentUser.id];
      } else {
        newChatSelections[currentUser.id] = slot;
      }

      return {
        ...prev,
        selections: {
          ...currentSelections,
          [chatId]: newChatSelections
        }
      };
    });
  };

  if (!isMounted || !currentUser) {
    return <aside className="hidden lg:flex w-80 flex-col pt-4 pl-4 border-l border-stone-200"></aside>;
  }

  // Đếm số người Like mình (Nhưng mình chưa Like lại)
  const pendingLikesCount = (db.users || []).filter(u => 
    (db.likes?.[u.id] || []).includes(currentUser.id) && !(db.likes?.[currentUser.id] || []).includes(u.id)
  ).length;

  // Lọc ra danh sách User Profile đã Match với mình
  const matchedUsers = (db.matches || [])
    .filter(matchPair => Array.isArray(matchPair) && matchPair.includes(currentUser.id))
    .map(matchPair => {
      const partnerId = matchPair[0] === currentUser.id ? matchPair[1] : matchPair[0];
      return (db.users || []).find(u => u.id === partnerId);
    })
    .filter(Boolean) as UserProfile[];

  console.log('MatchesSidebar Debug:', { 
    currentUserId: currentUser.id, 
    dbMatches: db.matches, 
    matchedUsersCount: matchedUsers.length 
  });

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-80 translate-x-full lg:static lg:translate-x-0 flex flex-col bg-stone-50 border-l border-stone-200 px-4 pt-2 overflow-y-auto transition-transform duration-300">
      <Matches 
        pendingLikesCount={pendingLikesCount} 
        matchedUsers={matchedUsers} 
        onUserClick={(user) => setActiveChatUser(user)}
      />
      
      <div className="h-px w-full bg-stone-200 my-2"></div>
      
      <Messages 
        currentUser={currentUser}
        matchedUsers={matchedUsers}
        messages={db.messages || {}}
        onSendMessage={handleSendMessage}
        onSelectSlot={handleSelectSlot}
        selections={db.selections || {}}
        activeChatUser={activeChatUser}
        setActiveChatUser={setActiveChatUser}
      />
    </aside>
  );
}