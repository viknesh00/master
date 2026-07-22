/* -------------------------------------------------------------------------- *
 * Session storage
 *
 * Holds the access/refresh token pair the API issues at sign-in.
 *
 * The access token is short lived (15 minutes by default) and is attached to
 * every request. The refresh token is long lived, is sent only to
 * /api/Login/Refresh, and is rotated on each use - the API revokes the old one
 * the moment it hands out a new one.
 * -------------------------------------------------------------------------- */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const EXPIRES_AT_KEY = "accessTokenExpiresAt";

// Kept for compatibility with the existing ProtectedRoute / UI checks.
const LEGACY_AUTH_FLAG = "isAuthenticated";
const USERNAME_KEY = "username";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || "";

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || "";

/**
 * True when a refresh token is present. An expired access token is not a
 * problem - the interceptor renews it on the next request.
 */
export const hasSession = () => Boolean(getRefreshToken());

/** Milliseconds until the access token expires; negative once it has. */
export const accessTokenTimeRemaining = () => {
  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) || 0);
  if (!expiresAt) return 0;
  return expiresAt - Date.now();
};

/**
 * Persists the AuthResult returned by /Login/Login and /Login/Refresh.
 * Shape: { accessToken, refreshToken, expiresIn, expiresAtUtc, user }
 */
export const storeSession = (auth, username) => {
  if (!auth) return;

  if (auth.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  if (auth.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);

  // Prefer the server's absolute expiry; fall back to expiresIn seconds.
  const expiresAt = auth.expiresAtUtc
    ? Date.parse(auth.expiresAtUtc)
    : Date.now() + (Number(auth.expiresIn) || 0) * 1000;

  if (!Number.isNaN(expiresAt)) {
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  }

  localStorage.setItem(LEGACY_AUTH_FLAG, "true");
  if (username) localStorage.setItem(USERNAME_KEY, username);
};

/** Drops every trace of the session, including the role cookies. */
export const clearSession = () => {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY, LEGACY_AUTH_FLAG, USERNAME_KEY].forEach(
    (key) => localStorage.removeItem(key)
  );

  // Role cookies drive the UI permission checks - stale ones would leave a
  // signed-out browser still showing admin-only controls.
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
};
