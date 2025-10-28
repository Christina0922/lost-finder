// C:\LostFinderProject\client\src\utils\auth.ts
export type AuthUser = { id: string; email: string; name?: string };

const TOKEN_KEY = "lf_token";
const USER_KEY = "lf_user";

export function isLoggedIn(): boolean {
  try {
    return !!localStorage.getItem(TOKEN_KEY);
  } catch {
    return false;
  }
}
export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
export function login(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("auth-changed", { detail: { loggedIn: true } }));
}
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent("auth-changed", { detail: { loggedIn: false } }));
}
