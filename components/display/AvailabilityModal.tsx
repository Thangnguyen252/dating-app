// components/display/AvailabilityModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppDatabase, UserProfile, UserAvailability } from '@/types';

interface LocalTimeSlot {
  date: string;
  label: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const WEEKDAY_FULL: Record<number, string> = {
  0: 'Chủ nhật', 1: 'Thứ Hai', 2: 'Thứ Ba', 3: 'Thứ Tư',
  4: 'Thứ Năm', 5: 'Thứ Sáu', 6: 'Thứ Bảy',
};

const MONTH_VI: Record<number, string> = {
  0: 'Tháng 1', 1: 'Tháng 2', 2: 'Tháng 3', 3: 'Tháng 4',
  4: 'Tháng 5', 5: 'Tháng 6', 6: 'Tháng 7', 7: 'Tháng 8',
  8: 'Tháng 9', 9: 'Tháng 10', 10: 'Tháng 11', 11: 'Tháng 12',
};

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateLabelVI(date: Date): string {
  const wd = WEEKDAY_FULL[date.getDay()];
  return `${wd}, ${date.getDate()}/${date.getMonth() + 1}`;
}

function formatHeaderDateVI(date: Date): string {
  return `${WEEKDAY_FULL[date.getDay()]}, ngày ${date.getDate()} tháng ${date.getMonth() + 1}`;
}

export default function AvailabilityModal({ isOpen, onClose }: AvailabilityModalProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 21);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');

  const [db, setDb, isMounted] = useLocalStorage<AppDatabase>('clique-db', {
    users: [], likes: {}, matches: [], availabilities: [],
  });
  const [slots, setSlots] = useState<LocalTimeSlot[]>([]);

  const currentUser = useMemo(() => {
    if (!isMounted) return null;
    const emailOrObj = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    if (!emailOrObj) return null;
    let email = emailOrObj;
    try { const p = JSON.parse(emailOrObj); email = p.email || emailOrObj; } catch {}
    return db.users?.find((u: UserProfile) => u.email === email) || null;
  }, [db.users, isMounted]);

  useEffect(() => {
    if (isOpen && currentUser) {
      try {
        const key = `availability_${currentUser.id}`;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        setTimeout(() => setSlots(saved), 0);
      } catch {
        setTimeout(() => setSlots([]), 0);
      }
    }
  }, [isOpen, currentUser]);

  const saveSlots = useCallback((newSlots: LocalTimeSlot[]) => {
    if (!currentUser) return;
    try {
      const key = `availability_${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(newSlots));
      setDb((prev: AppDatabase) => {
        const others = (prev.availabilities || []).filter((a: UserAvailability) => a.userId !== currentUser.id);
        return { ...prev, availabilities: [...others, { userId: currentUser.id, slots: newSlots }] };
      });
    } catch {}
  }, [currentUser, setDb]);

  const handleAddSlot = () => {
    if (!currentUser || slots.length >= 4) return;
    const dateISO = formatDateISO(selectedDate);
    const exists = slots.some(s => s.date === dateISO && s.startTime === startTime && s.endTime === endTime);
    if (exists) return;
    const newSlot: LocalTimeSlot = {
      date: dateISO,
      label: formatDateLabelVI(selectedDate),
      startTime,
      endTime,
    };
    const updated = [...slots, newSlot];
    setSlots(updated);
    saveSlots(updated);
  };

  const handleRemoveSlot = (index: number) => {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    saveSlots(updated);
  };

  // Calendar
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = `${MONTH_VI[viewMonth]} ${viewYear}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isInRange = (date: Date) => date >= today && date <= maxDate;
  const isSelected = (date: Date) => formatDateISO(date) === formatDateISO(selectedDate);
  const isSlotDate = (date: Date) => slots.some(s => s.date === formatDateISO(date));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxWidth: 1020, maxHeight: '92vh' }}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">Đặt Lịch Rảnh</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Chọn tối đa 4 khung giờ trong 3 tuần tới
                </p>
              </div>
              <button
                onClick={onClose}
                className="size-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* ── BODY: 2 cột trên desktop, 1 cột trên mobile ── */}
            {/*
              Dùng inline style thay vì Tailwind breakpoint để đảm bảo layout luôn đúng.
              Mobile (<640px): flex-col  |  Desktop (≥640px): grid 2 cột
            */}
            <div
              className="availability-grid flex-1 overflow-hidden"
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px' }}
            >
              {/* ═══ CỘT TRÁI: Lịch ═══ */}
              <div className="overflow-y-auto p-5 sm:p-6 border-r border-gray-100">
                {/* Điều hướng tháng */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900">{monthLabel}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={prevMonth}
                      className="size-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="size-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Tiêu đề các ngày trong tuần */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAY_LABELS.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Lưới ngày */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(viewYear, viewMonth, day);
                    const inRange = isInRange(date);
                    const selected = isSelected(date);
                    const hasSlot = isSlotDate(date);

                    return (
                      <button
                        key={day}
                        disabled={!inRange}
                        onClick={() => inRange && setSelectedDate(date)}
                        className={[
                          'aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all relative',
                          !inRange
                            ? 'opacity-25 cursor-not-allowed text-slate-400'
                            : '',
                          selected && inRange
                            ? 'bg-yellow-400 text-black font-bold shadow-md shadow-yellow-400/40 scale-110 z-10'
                            : inRange
                              ? 'hover:bg-yellow-100 text-slate-700 cursor-pointer'
                              : '',
                          hasSlot && !selected && inRange
                            ? 'border-2 border-yellow-400 bg-yellow-50 font-bold'
                            : '',
                        ].join(' ')}
                      >
                        {day}
                        {hasSlot && !selected && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-yellow-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Chú thích */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <span>Đang chọn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full border-2 border-yellow-400 bg-yellow-50" />
                    <span>Đã có slot</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-gray-200" />
                    <span>Không khả dụng</span>
                  </div>
                </div>
              </div>

              {/* ═══ CỘT PHẢI: Chọn giờ + Danh sách ═══ */}
              <div className="overflow-y-auto flex flex-col gap-4 p-4 sm:p-5 bg-gray-50/60">

                {/* Chọn khung giờ */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-100 p-2 rounded-full shrink-0">
                      <Clock size={16} className="text-slate-800" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                        {formatHeaderDateVI(selectedDate)}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Chọn khung giờ</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Bắt đầu */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Bắt đầu</label>
                      <div className="relative">
                        <select
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="w-full h-10 bg-gray-50 border border-gray-200 focus:border-yellow-400 focus:ring-0 rounded-xl px-3 text-sm font-medium outline-none appearance-none cursor-pointer transition-colors"
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Kết thúc */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Kết thúc</label>
                      <div className="relative">
                        <select
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className="w-full h-10 bg-gray-50 border border-gray-200 focus:border-yellow-400 focus:ring-0 rounded-xl px-3 text-sm font-medium outline-none appearance-none cursor-pointer transition-colors"
                        >
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronRight size={13} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      onClick={handleAddSlot}
                      disabled={slots.length >= 4}
                      className="w-full bg-slate-900 text-white font-bold h-10 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                    >
                      {slots.length >= 4 ? 'Đã đủ 4 khung giờ' : '+ Thêm khung giờ'}
                    </button>
                  </div>
                </div>

                {/* Danh sách slot đã chọn */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Lịch đã thêm</h4>
                    <span className="bg-gray-100 text-xs font-bold px-2 py-1 rounded-full text-slate-500">
                      {slots.length}/4
                    </span>
                  </div>

                  {slots.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                      <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <Clock size={16} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Chưa có lịch nào</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Chọn ngày, giờ rồi nhấn thêm</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 flex-1">
                      <AnimatePresence initial={false}>
                        {slots.map((slot, i) => (
                          <motion.div
                            key={`${slot.date}-${slot.startTime}-${i}`}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl border border-transparent hover:border-yellow-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-2 rounded-full bg-yellow-400 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate">{slot.label}</span>
                                <span className="text-[11px] text-slate-500">{slot.startTime} – {slot.endTime}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSlot(i)}
                              className="size-7 rounded-full hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-2"
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {slots.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={onClose}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold py-3 rounded-full shadow-lg shadow-yellow-300/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Xác nhận lịch rảnh
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Responsive: mobile stack dọc */}
            <style>{`
              @media (max-width: 600px) {
                .availability-grid {
                  display: flex !important;
                  flex-direction: column;
                  overflow-y: auto;
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}