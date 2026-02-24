'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Sparkles,
  Heart,
  Calendar,
  Edit3,
  LayoutGrid,
  X,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase, UserProfile } from '@/types';
import { UploadDropzone } from '@/lib/uploadthing';
import { PROVINCES, HOBBIES } from '@/lib/constants';
import Image from 'next/image';

// ─── Kiểu dữ liệu nội bộ ───────────────────────────────────────────────────
type Gender = 'male' | 'female' | 'other';

interface FormData {
  name: string;
  age: string;
  gender: Gender | '';
  bio: string;
  interests: string[];
  location: string;
  imageUrls: string[];
}

// ─── Các bước của form ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Tên của bạn', icon: User },
  { id: 2, title: 'Về bạn', icon: Edit3 },
  { id: 3, title: 'Ảnh đại diện', icon: Camera },
  { id: 4, title: 'Hoàn tất', icon: Sparkles },
];

// ─── Animation variants ──────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ─── Component chính ─────────────────────────────────────────────────────────
export default function SetupProfilePage() {
  const router = useRouter();
  const [, setDb] = useLocalStorage<AppDatabase>('clique-db', {
    users: [],
    likes: {},
    matches: [],
    availabilities: [],
  });

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    bio: '',
    interests: [],
    location: '',
    imageUrls: [],
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const update = (field: keyof FormData, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const clearError = (field: string) =>
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  // ─── Validation từng bước ────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.name.trim()) newErrors.name = 'Hãy cho chúng tôi biết tên của bạn!';
      else if (form.name.trim().length < 2) newErrors.name = 'Tên phải có ít nhất 2 ký tự.';
      if (!form.age) newErrors.age = 'Vui lòng nhập tuổi của bạn.';
      else if (Number(form.age) < 18 || Number(form.age) > 99)
        newErrors.age = 'Bạn phải từ 18 tuổi trở lên.';
      if (!form.gender) newErrors.gender = 'Hãy chọn giới tính.';
    }
    if (step === 2) {
      if (form.bio.trim().length < 10)
        newErrors.bio = 'Bio cần ít nhất 10 ký tự để người khác hiểu bạn hơn.';
      if (!form.location)
        newErrors.location = 'Vui lòng chọn vị trí của bạn.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Điều hướng bước ─────────────────────────────────────────────────────
  const next = () => {
    if (!validate()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const removeImage = (idx: number) =>
    update('imageUrls', form.imageUrls.filter((_, i) => i !== idx));

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // giả lập loading

    const pendingEmail = localStorage.getItem('pendingEmail') || `user_${Date.now()}@example.com`;

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender as Gender,
      bio: form.bio.trim(),
      email: pendingEmail,
      interests: form.interests,
      location: form.location,
      imageUrls: form.imageUrls.length
        ? form.imageUrls
        : ['https://api.dicebear.com/7.x/thumbs/svg?seed=' + form.name],
    };

    setDb((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    localStorage.setItem('currentUser', pendingEmail);
    localStorage.removeItem('pendingEmail');
    router.push('/display'); // chuyển sang giao diện trang display
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fdfcf5] flex flex-col selection:bg-primary/30">
      {/* Navbar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-primary/10 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
            <LayoutGrid className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-2xl font-black tracking-tighter">
            CLIQUE<span className="text-primary">83</span>
          </span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          Huỷ
        </button>
      </header>

      <main className="grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Step Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <motion.div
                      animate={{
                        backgroundColor: isDone
                          ? '#16a34a'
                          : isActive
                          ? '#f2cc0d'
                          : '#e2e8f0',
                        scale: isActive ? 1.15 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                        />
                      )}
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: step > s.id ? '100%' : '0%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Bước {step} / {STEPS.length} — {STEPS[step - 1].title}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="p-8 lg:p-10"
              >
                {/* ── STEP 1: Tên, Tuổi, Giới tính ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-1">
                        Xin chào! 
                      </h2>
                      <p className="text-slate-500">Hãy bắt đầu với những thông tin cơ bản.</p>
                    </div>

                    {/* Tên */}
                    <Field label="Tên của bạn" error={errors.name}>
                      <input
                        type="text"
                        placeholder="VD: Minh Khôi"
                        value={form.name}
                        onChange={(e) => { update('name', e.target.value); clearError('name'); }}
                        className={inputClass(!!errors.name)}
                      />
                    </Field>

                    {/* Tuổi */}
                    <Field label="Tuổi" error={errors.age}>
                      <div className="relative flex items-center">
                        <Calendar className="absolute left-4 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          placeholder="18"
                          min={18}
                          max={99}
                          value={form.age}
                          onChange={(e) => { update('age', e.target.value); clearError('age'); }}
                          className={inputClass(!!errors.age) + ' pl-12'}
                        />
                      </div>
                    </Field>

                    {/* Giới tính */}
                    <Field label="Giới tính" error={errors.gender}>
                      <div className="grid grid-cols-3 gap-3">
                        {(['male', 'female', 'other'] as Gender[]).map((g) => {
                          const labels = { male: '♂ Nam', female: '♀ Nữ', other: '◎ Khác' };
                          const active = form.gender === g;
                          return (
                            <motion.button
                              key={g}
                              type="button"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => { update('gender', g); clearError('gender'); }}
                              className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                active
                                  ? 'bg-primary border-primary text-slate-900 shadow-lg shadow-primary/20'
                                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/40'
                              }`}
                            >
                              {labels[g]}
                            </motion.button>
                          );
                        })}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── STEP 2: Bio ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-1">
                        Kể về bản thân 
                      </h2>
                      <p className="text-slate-500">
                        Một lời giới thiệu hay sẽ giúp bạn nổi bật hơn.
                      </p>
                    </div>

                    <Field label="Bio" error={errors.bio}>
                      <textarea
                        rows={5}
                        placeholder="VD: Tôi thích cà phê sáng, nhạc chill và những buổi đi hike cuối tuần. Đang tìm kiếm những người bạn cùng sở thích..."
                        value={form.bio}
                        onChange={(e) => { update('bio', e.target.value); clearError('bio'); }}
                        className={`${inputClass(!!errors.bio)} resize-none leading-relaxed`}
                      />
                    </Field>
                    <div className="flex justify-end">
                      <span className={`text-xs font-bold ${form.bio.length < 10 ? 'text-red-400' : 'text-green-500'}`}>
                        {form.bio.length} / 300 ký tự
                      </span>
                    </div>

                    {/* Gợi ý */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                         Gợi ý bio hay:
                      </p>
                      <ul className="space-y-1 text-sm text-slate-500">
                        <li>• Sở thích và đam mê của bạn</li>
                        <li>• Bạn đang tìm kiếm điều gì?</li>
                        <li>• Một sự thật thú vị về bản thân</li>
                      </ul>
                    </div>

                    {/* Sở thích */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-700 ml-1">Sở thích của bạn (Tối đa 4)</label>
                        <span className={`text-xs font-bold ${form.interests.length >= 4 ? 'text-primary' : 'text-slate-400'}`}>
                          {form.interests.length} / 4
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {HOBBIES.map((hobby) => {
                          const isSelected = form.interests.includes(hobby.id);
                          return (
                            <motion.button
                              key={hobby.id}
                              type="button"
                              whileTap={!isSelected && form.interests.length >= 4 ? {} : { scale: 0.95 }}
                              onClick={() => {
                                if (isSelected) {
                                  update('interests', form.interests.filter(i => i !== hobby.id));
                                } else if (form.interests.length < 4) {
                                  update('interests', [...form.interests, hobby.id]);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2
                                ${
                                  isSelected
                                    ? 'bg-primary border-primary text-slate-900 shadow-sm'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-primary/40'
                                }
                                ${!isSelected && form.interests.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              <span className="text-base">{hobby.icon}</span>
                              {hobby.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vị trí */}
                    <div className="pt-4 border-t border-slate-100">
                      <Field label="Vị trí hiện tại" error={errors.location}>
                        <div className="relative">
                          <select
                            value={form.location}
                            onChange={(e) => { update('location', e.target.value); clearError('location'); }}
                            className={`${inputClass(!!errors.location)} appearance-none cursor-pointer pr-10`}
                          >
                            <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                            {PROVINCES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Ảnh ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-1">
                        Thêm ảnh của bạn 
                      </h2>
                      <p className="text-slate-500">
                        Tải lên tối đa 6 ảnh. Ảnh đầu tiên sẽ là avatar chính.
                      </p>
                    </div>

                    {/* UploadThing Dropzone */}
                    {form.imageUrls.length < 6 && (
                      <div className="uploadthing-wrapper">
                        <UploadDropzone
                          endpoint="profileImage"
                          onUploadBegin={() => setIsUploading(true)}
                          onClientUploadComplete={(res) => {
                            setIsUploading(false);
                            if (!res) return;
                            const newUrls = res.map((r) => r.ufsUrl);
                            update('imageUrls', [...form.imageUrls, ...newUrls].slice(0, 6));
                          }}
                          onUploadError={(error) => {
                            setIsUploading(false);
                            alert(`Lỗi khi tải ảnh: ${error.message}`);
                          }}
                          appearance={{
                            container: {
                              border: '2px dashed #f2cc0d',
                              borderRadius: '1rem',
                              background: '#fdfcf5',
                              padding: '1.5rem',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                            },
                            uploadIcon: { color: '#f2cc0d', width: 48, height: 48 },
                            label: {
                              color: '#1e293b',
                              fontWeight: '700',
                              fontSize: '0.95rem',
                            },
                            allowedContent: { color: '#94a3b8', fontSize: '0.78rem' },
                            button: {
                              background: '#f2cc0d',
                              color: '#1e293b',
                              fontWeight: '800',
                              borderRadius: '0.875rem',
                              padding: '0.6rem 1.4rem',
                            },
                          }}
                          config={{ mode: 'auto' }}
                        />
                      </div>
                    )}

                    {/* Trạng thái uploading */}
                    {isUploading && (
                      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                        />
                        <span className="text-sm font-bold text-slate-700">Đang tải ảnh lên...</span>
                      </div>
                    )}

                    {/* Grid ảnh đã upload */}
                    {form.imageUrls.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Ảnh đã tải lên ({form.imageUrls.length}/6)
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {form.imageUrls.map((url, i) => (
                            <motion.div
                              key={url + i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group border-2 border-slate-100 shadow-sm"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Photo ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="w-3 h-3 text-white" strokeWidth={3} />
                              </button>
                              {i === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-[9px] font-black text-slate-900 text-center py-1 uppercase tracking-widest">
                                  ⭐ Avatar
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {/* Empty slots */}
                          {Array.from({ length: Math.max(0, 3 - form.imageUrls.length) }).map((_, i) => (
                            <div
                              key={'empty-' + i}
                              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50"
                            >
                              <Camera className="w-6 h-6 text-slate-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

              
                  </div>
                )}

                {/* ── STEP 4: Xác nhận ── */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-1">
                        Trông tuyệt đó! 
                      </h2>
                      <p className="text-slate-500">Xem lại hồ sơ của bạn trước khi hoàn tất.</p>
                    </div>

                    {/* Preview Card */}
                    <div className="rounded-3xl border-2   border-primary/20 bg-primary/5 overflow-hidden">
                      {/* Avatar */}
                      <div className="h-60 bg-slate-200 relative overflow-hidden">
                        {form.imageUrls[0] ? (
                          <Image
                            src={form.imageUrls[0]}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            fill
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/30 to-yellow-100">
                            <User className="w-16 h-16 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900">
                              {form.name},{' '}
                              <span className="font-bold text-slate-500">{form.age}</span>
                            </h3>
                            <span className="inline-block mt-1 px-3 py-1 bg-white text-primary font-bold text-xs rounded-full uppercase tracking-wider border border-primary">
                              {form.gender === 'male' ? 'Nam' : form.gender === 'female' ? 'Nữ' : 'Khác'}
                            </span>
                          </div>
                          <Heart className="w-6 h-6 text-primary mt-1" />
                        </div>
                        <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4 text-sm whitespace-pre-wrap">
                          {form.bio}
                        </p>
                        {form.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            {form.interests.map(id => {
                              const hobby = HOBBIES.find(h => h.id === id);
                              if (!hobby) return null;
                              return (
                                <div key={id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg shadow-sm border border-slate-100">
                                  <span className="text-sm">{hobby.icon}</span> {hobby.label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {form.location && (
                          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 text-sm font-bold text-slate-600">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">🗺</span>
                            {form.location}, Việt Nam
                          </div>
                        )}
                        <div className="text-xs text-slate-400 font-medium pt-3 border-t border-slate-100">
                          {form.imageUrls.length} ảnh đã thêm
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="px-8 lg:px-10 pb-8 flex items-center gap-3">
              {step > 1 && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={back}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </motion.button>
              )}

              {step < STEPS.length ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-primary font-black text-slate-900 text-lg shadow-2xl shadow-primary/30 hover:bg-[#eec60a] transition-colors"
                >
                  Tiếp theo
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-primary font-black text-slate-900 text-lg shadow-2xl shadow-primary/30 hover:bg-[#eec60a] transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                      />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Hoàn tất hồ sơ
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1 block">{label}</label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-red-500 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-4 rounded-2xl border-2 outline-none font-semibold text-slate-900 placeholder-slate-400 transition-all
    ${
      hasError
        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-slate-100 bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/10'
    }`;
}
