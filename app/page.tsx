'use client';

// Types and Icons
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, LayoutGrid, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase } from '@/types';

export default function App() {
  // 1. Hook quản lý Database
  const [db, , isMounted] = useLocalStorage<AppDatabase>('clique-db', {
    users: [],
    likes: {},
    matches: [],
    availabilities: []
  });

  const router = useRouter();

  // 2. State cho Form
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Tự động đăng nhập nếu đã có currentUser trong local storage
  useEffect(() => {
    if (isMounted) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        router.push('/display');
      }
    }
  }, [isMounted, router]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      // User đã có tài khoản → tự động đăng nhập
      localStorage.setItem('currentUser', existingUser.email);
      router.push('/display');
    } else {
      // User mới → tạo profile
      localStorage.setItem('pendingEmail', normalizedEmail);
      router.push('/setup-profile');
    }
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdf8e6]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <LayoutGrid className="w-6 h-6 text-slate-900" />
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Đang tải...</p>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcf5] text-slate-900 selection:bg-primary/30">
      {/* Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-primary/10 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-10 h-10 bg-primary text-slate-900 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20"
          >
            <LayoutGrid className="w-6 h-6" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-primary transition-colors">
            CLIQUE<span className="text-primary">83</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex px-5 py-2.5 items-center justify-center rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
            Log in
          </button>
          <button className="flex px-6 py-2.5 items-center justify-center rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
            Get the App
          </button>
        </div>
      </header>

      <main
        style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', minHeight: 'calc(100vh - 72px)' }}
        className="max-md:[display:flex] max-md:flex-col"
      >
        {/* Left Section: Hero Image */}
        <div className="relative min-h-[50vh] md:min-h-0 flex items-center justify-center overflow-hidden bg-slate-100">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              alt="Group of diverse friends laughing together"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuACkR43FCPATvkvpehz4nP1o_ctPzU_x1CojaYZclxUD_HTI5sr_Ab-n7jRAYsw9jpxwcKe4BGF-NT0VYfUlgLlYDxJmvmC4tGXRqN7oQuSJk-xa_goYMcIQsZxoyx2vZNfOATp1wOEN0xEDuRlSp2Em_hONMXLBG_iCCrKNxZx1PrwXh-Vxiq1JngafM7SjiPkfpQQvPm0TkcAXNTPw8p5GqPQvYdbqOS3GMNMQj7RaIcgbVEtJtt0DztiRDV8ro8mtB8Tvupi3z0"
              referrerPolicy="no-referrer"
            />
            {/* Enhanced Gradient Overlay for Yellow Theme */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent lg:bg-linear-to-r lg:from-slate-900/90 lg:via-slate-900/20 lg:to-transparent"></div>
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
          </motion.div>
          
          <div className="relative z-10 p-10 text-center md:text-left md:p-16 lg:px-24 w-full h-full flex flex-col justify-end lg:justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <h2 className="text-5xl lg:text-8xl font-black text-white leading-[0.9] mb-6 drop-shadow-2xl text-left">
                Real connections, <br />
                <span className="text-primary italic">not just matches.</span>
              </h2>
              <p className="text-lg lg:text-2xl text-stone-200 font-medium max-w-md mb-10 drop-shadow-lg leading-relaxed">
                Join 50,000+ people finding their true social circle in a space designed for authenticity.
              </p>
              
              <div className="hidden md:flex items-center gap-8 border-t border-white/10 pt-10">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">98%</span>
                  <span className="text-sm text-white/60 font-medium">Daily matches</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">5-star</span>
                  <span className="text-sm text-white/60 font-medium">Community rating</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Accents */}
          {/* <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[100%] bg-primary/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div> */}
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px] mix-blend-screen"></div>

          {/* Live Indicator Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 left-10 z-20 hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl"
          >
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Live Activity</span>
              <span className="text-[10px] text-white/70 uppercase tracking-tighter">842 sessions active</span>
            </div>
          </motion.div>
        </div>

        {/* Right Section: Join Form */}
        <div className="relative flex flex-col justify-center items-center px-6 py-12 md:p-16 bg-white transition-colors">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-10"
          >
            <div className="text-center md:text-left space-y-3">
              <h3 className="text-4xl font-black tracking-tight text-slate-900 leading-none">Nhập email của bạn</h3>
              <p className="text-slate-500 text-lg">Chúng tôi sẽ kiểm tra email có trong hệ thống</p>
            </div>

            <form className="space-y-5" onSubmit={handleContinue}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">Địa chỉ email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-slate-900 placeholder-slate-400 transition-all font-semibold outline-none border-2"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1 ml-1"
                  >
                    <Zap className="w-3 h-3" /> {error}
                  </motion.p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center py-4.5 px-6 border border-transparent rounded-2xl shadow-2xl shadow-primary/30 text-lg font-black text-slate-900 bg-primary hover:bg-[#eec60a] transition-all group"
                type="submit"
              >
                Bắt đầu
                <Zap className="ml-2 w-5 h-5 fill-current transition-transform group-hover:translate-x-1" />
              </motion.button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-6 bg-white text-slate-400">Trusted Authentication</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-center px-4 py-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-all hover:border-slate-300 group shadow-sm">
                <svg className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-bold text-slate-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-4 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-all hover:border-slate-300 group shadow-sm">
                <svg className="h-5 w-5 mr-3 text-[#1877F2] transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
                </svg>
                <span className="text-sm font-bold text-slate-700">Facebook</span>
              </button>
            </div>

            <div className="flex justify-center items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encryption</span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 font-medium">
              By joining, you agree to our{' '}
              <a className="underline hover:text-primary transition-colors decoration-primary/30 underline-offset-4" href="#">Terms</a> and{' '}
              <a className="underline hover:text-primary transition-colors decoration-primary/30 underline-offset-4" href="#">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}