import { create } from 'zustand';
import { Employee } from '@/types';

interface AuthState {
  employee: Employee | null;
  isAuthenticated: boolean;
  setAuth: (employee: Employee) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,
  isAuthenticated: false,
  setAuth: (employee) => set({ employee, isAuthenticated: true }),
  clearAuth: () => set({ employee: null, isAuthenticated: false }),
}));
