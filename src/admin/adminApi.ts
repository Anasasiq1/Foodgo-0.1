/**
 * Utility for making authenticated requests to the Foodgo Admin API.
 * Attaches credentials and fallback x-admin-token headers automatically.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('foodgo_admin_token');
  const headers = new Headers(init.headers || {});

  if (token && !headers.has('x-admin-token')) {
    headers.set('x-admin-token', token);
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });
}
