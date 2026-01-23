'use client';

import { useState, useEffect } from 'react';

interface CurrentUser {
  userId: string;
  role: 'JOB_SEEKER' | 'COMPANY';
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.sub,
          role: payload.role,
        });
      } catch {
        console.warn('Failed to decode token');
      }
    }
  }, []);

  return user;
}
