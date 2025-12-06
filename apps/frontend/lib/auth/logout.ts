'use client';

import { clearToken } from '../api';
import { redirect } from 'next/navigation';

export function logout() {
  clearToken();
  redirect('/home');
}
