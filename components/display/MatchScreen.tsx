import React from 'react';
import { UserProfile } from '@/types';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface MatchScreenProps {
  currentUser: UserProfile;
  matchedProfile: UserProfile;
  onClose: () => void;
  onSendMessage: (user: UserProfile) => void;
}

export default function MatchScreen({ currentUser, matchedProfile, onClose, onSendMessage }: MatchScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center min-h-screen p-4 md:p-6 text-center bg-primary font-display antialiased text-slate-900 overflow-y-auto scrollbar-hide">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0.7; }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        .confetti-piece {
            position: absolute;
            top: -20px;
            animation: fall var(--fall-duration) linear infinite;
            animation-delay: var(--fall-delay);
            left: var(--left-pos);
            width: var(--size);
            height: var(--size);
            background-color: var(--color);
            border-radius: var(--radius);
        }
        .animate-pop-in {
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-float {
            animation: float 4s ease-in-out infinite;
        }
      `}} />

      {/* Confetti Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="confetti-piece" style={{ '--fall-duration': '4s', '--fall-delay': '0s', '--left-pos': '5%', '--size': '12px', '--color': '#ffffff', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5s', '--fall-delay': '1.5s', '--left-pos': '15%', '--size': '10px', '--color': '#FF6B6B', '--radius': '2px' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '4.5s', '--fall-delay': '0.5s', '--left-pos': '25%', '--size': '15px', '--color': '#4D96FF', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '6s', '--fall-delay': '2s', '--left-pos': '35%', '--size': '8px', '--color': '#6BCB77', '--radius': '4px' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '3.5s', '--fall-delay': '0.2s', '--left-pos': '45%', '--size': '14px', '--color': '#ffffff', '--radius': '0%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5.5s', '--fall-delay': '1s', '--left-pos': '55%', '--size': '11px', '--color': '#FFD93D', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '4.2s', '--fall-delay': '2.5s', '--left-pos': '65%', '--size': '13px', '--color': '#ffffff', '--radius': '3px' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5.8s', '--fall-delay': '0.8s', '--left-pos': '75%', '--size': '9px', '--color': '#9D72FF', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '4.7s', '--fall-delay': '1.2s', '--left-pos': '85%', '--size': '12px', '--color': '#ffffff', '--radius': '2px' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5.2s', '--fall-delay': '0.3s', '--left-pos': '95%', '--size': '15px', '--color': '#FF6B6B', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '6.5s', '--fall-delay': '3s', '--left-pos': '10%', '--size': '14px', '--color': '#4D96FF', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5.1s', '--fall-delay': '4.5s', '--left-pos': '30%', '--size': '10px', '--color': '#ffffff', '--radius': '0%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '4.8s', '--fall-delay': '3.5s', '--left-pos': '50%', '--size': '13px', '--color': '#6BCB77', '--radius': '50%' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '5.5s', '--fall-delay': '4.1s', '--left-pos': '70%', '--size': '11px', '--color': '#FF6B6B', '--radius': '3px' } as React.CSSProperties}></div>
        <div className="confetti-piece" style={{ '--fall-duration': '6.2s', '--fall-delay': '3.8s', '--left-pos': '90%', '--size': '15px', '--color': '#ffffff', '--radius': '50%' } as React.CSSProperties}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-full py-8 md:py-12">
        <div className="mb-4 md:mb-8 text-slate-900/40 animate-pop-in">
          <svg className="w-10 h-10 md:w-14 md:h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 10l-10 5 10 5 10-5-10-5z"/></svg>
        </div>
        
        <div className="animate-pop-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-black text-5xl md:text-8xl text-slate-900 tracking-tighter leading-none mb-2 md:mb-4 italic drop-shadow-md">
            It&apos;s a Match!
          </h1>
          <p className="text-slate-900/90 text-lg md:text-3xl font-semibold mb-8 md:mb-12">
            You and <span className="text-white drop-shadow-sm">{matchedProfile.name}</span> have matched!
          </p>
        </div>

        <div className="relative flex items-center justify-center mb-10 md:mb-16 h-40 md:h-64 w-full max-w-2xl animate-pop-in" style={{ animationDelay: '0.2s' }}>
          {/* Current user */}
          <div className="absolute left-1/2 -translate-x-[90%] md:-translate-x-[85%] z-10 animate-float">
            <div className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 md:border-10 border-white shadow-2xl overflow-hidden bg-stone-200 rotate-[-5deg] relative">
              <Image 
                alt="My Profile" 
                className="w-full h-full object-cover" 
                src={currentUser.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} 
                fill
                unoptimized
              />
            </div>
          </div>
          
          <div className="absolute -translate-x-1/2 z-30 bg-white rounded-full p-3 md:p-6 shadow-2xl scale-110 md:scale-125">
            <svg className="w-8 h-8 md:w-14 md:h-14 text-primary fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          
          {/* Matched user */}
          <div className="absolute right-1/2 translate-x-[90%] md:translate-x-[85%] z-20 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 md:border-10 border-white shadow-2xl overflow-hidden bg-stone-200 rotate-[5deg] relative">
              <Image 
                alt="Matched User" 
                className="w-full h-full object-cover" 
                src={matchedProfile.imageUrls?.[0] || `https://ui-avatars.com/api/?name=${matchedProfile.name}&background=random`} 
                fill
                unoptimized
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-5 w-full max-w-md animate-pop-in" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={() => onSendMessage(matchedProfile)}
            className="w-full py-4 md:py-5 px-10 bg-white hover:bg-stone-50 text-slate-900 font-black text-lg md:text-2xl rounded-full shadow-2xl hover:shadow-white/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest group"
          >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
            Send a Message
          </button>
          <button onClick={onClose} className="w-full py-3 md:py-4 px-8 bg-transparent border-4 border-slate-900/30 hover:border-slate-900 text-slate-900 font-extrabold text-base md:text-xl rounded-full transition-all hover:bg-slate-900/10 uppercase tracking-widest">
            Keep Swiping
          </button>
        </div>
        
        {/* Background decorations */}
        <div className="absolute bottom-10 left-10 hidden md:block opacity-40">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6H22l-6 4.6 2.3 7.8L12 17.6 5.7 22l2.3-7.8-6-4.6h7.6z"/></svg>
        </div>
      </div>
    </div>
  );
}
