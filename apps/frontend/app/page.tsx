'use client';
import { useEffect } from 'react';
import { registerJobSeeker, login, getProfile, saveToken } from '@/lib/api';

export default function TestApi() {
  useEffect(() => {
    async function run() {
      try {
        // Register a new job seeker
        await registerJobSeeker({
          email: 'demo@example.com',
          password: '123456',
          fullName: 'John Doe',
        });

        // Login
        const { access_token } = await login({
          email: 'demo@example.com',
          password: '123456',
        });
        console.log('Logged in token:', access_token);
        saveToken(access_token);

        // Fetch profile
        const profile = await getProfile(access_token);
        console.log('Profile:', profile);
      } catch (err) {
        console.error(err);
      }
    }
    run();
  }, []);

  return <div>Testing API layer... check console</div>;
}
