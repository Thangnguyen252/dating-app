import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 1. Khởi tạo state với initialValue để tránh lỗi Hydration trên Next.js
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 2. Chỉ đọc từ Local Storage sau khi Component đã mount trên Client (Trình duyệt)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Lỗi khi đọc key "${key}" từ Local Storage:`, error);
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [key]);

  // Đồng bộ hoá localStorage thay đổi từ component/tab khác
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key && customEvent.detail.newValue) {
        setStoredValue(JSON.parse(customEvent.detail.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomChange);
    };
  }, [key]);

  // 3. Hàm cập nhật dữ liệu: Vừa update State, vừa lưu xuống Local Storage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          const stringifiedValue = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, stringifiedValue);
          // Tránh gọi dispatchEvent đồng bộ bên trong setState updater function để fix lỗi "Cannot update a component while rendering..."
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('local-storage', {
                detail: { key, newValue: stringifiedValue }
              })
            );
          }, 0);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Lỗi khi lưu key "${key}" vào Local Storage:`, error);
    }
  }, [key]);

  // Trả về isMounted để component biết khi nào dữ liệu đã sẵn sàng
  return [storedValue, setValue, isMounted] as const;
}