// src/utils/helpers.ts

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const getAttendancePercentage = (present: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const getAttendanceStatus = (percentage: number): 'good' | 'warning' | 'poor' => {
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'warning';
  return 'poor';
};

export const getDaysFromToday = (date: Date): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getFeeStatus = (dueDate: Date, status: string): 'paid' | 'due' | 'overdue' => {
  if (status === 'paid') return 'paid';
  const today = new Date();
  return dueDate < today ? 'overdue' : 'due';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone);
};

export const generateRegNo = (department: string, year: number): string => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const yearCode = year.toString().substring(2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${deptCode}${yearCode}${random}`;
};
