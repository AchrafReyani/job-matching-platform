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

/** Authenticated wrapper for request() */
export async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error('No auth token found');
  }

  return request<T>(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}



/* ---------- TOKEN HELPERS ---------- */

/**
 * Save auth token to localStorage and notify app that it changed.
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    // 🔔 Let other parts of the app know token was updated
    window.dispatchEvent(new Event('tokenChanged'));
  }
}

/**
 * Get the saved auth token (if any).
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Remove auth token and notify app that it changed.
 */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // 🔔 Let other parts of the app know token was cleared
    window.dispatchEvent(new Event('tokenChanged'));
  }
}
