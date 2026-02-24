// types/index.ts

export interface UserProfile {
  id: string; 
  name: string; 
  age: number; 
  gender: 'male' | 'female' | 'other'; 
  bio: string; 
  email: string; 
  imageUrls: string[]; // Lưu mảng URL ảnh cho giao diện giống Bumble
  interests?: string[]; // Mảng sở thích người dùng chọn
  location?: string; // Vị trí người dùng (Tỉnh/Thành phố)
}

export interface TimeSlot {
  date: string; // Định dạng YYYY-MM-DD
  label: string; // Ví dụ: Thứ Hai, 24/2
  startTime: string; // Định dạng HH:mm
  endTime: string; // Định dạng HH:mm
}

export interface UserAvailability {
  userId: string; 
  slots: TimeSlot[]; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

export interface AppDatabase {
  users: UserProfile[]; 
  likes: Record<string, string[]>; // Lưu ID người đi like và danh sách ID người được like
  matches: Array<[string, string]>; // Lưu các cặp đã match thành công
  availabilities: UserAvailability[]; 
  messages?: Record<string, ChatMessage[]>; // Lưu danh sách tin nhắn giữa 2 user (key là chatId = id1_id2)
  selections?: Record<string, Record<string, TimeSlot>>; // chatId -> { userId: TimeSlot }
}