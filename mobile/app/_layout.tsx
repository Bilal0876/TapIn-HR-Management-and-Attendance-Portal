import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';

export default function RootLayout() {
  const { isAuthenticated, employee } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated users
      if (employee?.mustChangePassword) {
        // Force to change password if not already there
        if (segments[1] !== 'change-password') {
          router.replace('/(auth)/change-password');
        }
      } else if (inAuthGroup) {
        // Redirect away from auth group if password is changed and logged in
        const target = (employee?.role === 'ADMIN' || employee?.role === 'SUPER_ADMIN') 
          ? '/(admin)/' 
          : '/(employee)/';
        router.replace(target);
      }
    }
  }, [isAuthenticated, employee, segments]);

  return <Slot />;
}
