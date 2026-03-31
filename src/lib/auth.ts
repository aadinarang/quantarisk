const TOKEN_KEY = "quantarisk-access-token";

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}