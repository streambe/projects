'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { SplashScreen } from '@/components/app/splash-screen';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isLoggedIn()) {
      router.replace('/nearby');
    } else {
      router.replace('/login');
    }
  }, [ready, router]);

  return <SplashScreen onReady={() => setReady(true)} />;
}
