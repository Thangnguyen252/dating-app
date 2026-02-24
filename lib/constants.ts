// lib/constants.ts

export const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'TP. Huế',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
  'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
  'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang',
  'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh',
  'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh',
  'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
].sort((a, b) => a.localeCompare(b, 'vi'));

export const HOBBIES = [
  { id: 'cooking', label: 'Nấu ăn', icon: '🍳' },
  { id: 'gym', label: 'Tập Gym', icon: '💪' },
  { id: 'gaming', label: 'Chơi game', icon: '🎮' },
  { id: 'reading', label: 'Đọc sách', icon: '📚' },
  { id: 'travel', label: 'Du lịch', icon: '✈️' },
  { id: 'photography', label: 'Chụp ảnh', icon: '📸' },
  { id: 'martial_arts', label: 'Võ thuật', icon: '🥋' },
  { id: 'music', label: 'Âm nhạc', icon: '🎵' },
  { id: 'coffee', label: 'Cà phê', icon: '☕' },
  { id: 'sports', label: 'Thể thao', icon: '🏀' },
  { id: 'running', label: 'Chạy bộ', icon: '🏃‍♂️' },
  { id: 'movies', label: 'Xem phim', icon: '🎬' },
  { id: 'pets', label: 'Thú cưng', icon: '🐶' },
  { id: 'art', label: 'Nghệ thuật', icon: '🎨' },
  { id: 'hiking', label: 'Leo núi', icon: '⛰️' },
  { id: 'dancing', label: 'Nhảy múa', icon: '💃' },
  { id: 'baking', label: 'Làm bánh', icon: '🧁' },
  { id: 'tech', label: 'Công nghệ', icon: '💻' },
  { id: 'shopping', label: 'Mua sắm', icon: '🛍️' },
  { id: 'astrology', label: 'Chiêm tinh', icon: '✨' },
];
