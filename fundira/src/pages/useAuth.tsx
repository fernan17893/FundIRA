// hooks/useAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useAuth = () => {
  const router = useRouter();
  useEffect(() => {
    const isAuthenticated = false; // Replace with actual authentication check
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);
};

export default useAuth;
