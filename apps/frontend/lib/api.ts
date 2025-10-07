const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/** Utility function to handle JSON requests + errors cleanly */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error: ${res.status} - ${errText}`);
  }

  return (await res.json()) as T;
}

/* ---------- TOKEN HELPERS ---------- */

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}
