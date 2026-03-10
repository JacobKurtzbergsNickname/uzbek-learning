/**
 * Small fetch helper that accepts an already-obtained Auth0 access token.
 * Keep token acquisition separate (component/server) so this helper stays lightweight.
 *
 * Usage: Pass the Auth0 access token (from getAccessToken or useAccessToken) as the third argument.
 */
export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {},
  token?: string,
) {
  const headers = new Headers(
    init.headers as Record<string, string> | undefined,
  );
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
