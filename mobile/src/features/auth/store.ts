import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Employee } from '@/types';

const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(name);
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return localStorage.setItem(name, value);
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') return localStorage.removeItem(name);
    await SecureStore.removeItemAsync(name);
  },
};

interface AuthState {
  employee: Employee | null;
  isAuthenticated: boolean;
  setAuth: (employee: Employee) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      employee: null,
      isAuthenticated: false,
      setAuth: (employee) => set({ employee, isAuthenticated: true }),
      clearAuth: () => set({ employee: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
