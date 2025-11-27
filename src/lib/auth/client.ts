// src/lib/auth/client.ts
'use client';

// Client-side function to verify session (makes an API call)
export async function checkSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Session check failed:', error);
    return false;
  }
}