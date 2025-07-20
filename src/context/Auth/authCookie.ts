import type { User } from "./AuthContext";

export async function getAuthCookie(userCredentials: User) {
  const response = await fetch('/amserver/UI/Login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      IDToken0: '',
      IDToken1: userCredentials.id,
      IDToken2: userCredentials.pass
    })
  })

  const html = await response.text();

  const match = html.match(/<title>(.*?)<\/title>/i);
  if (match) {
    const title = match[1];
    if (title.includes('Please Wait While Redirecting to console')) {
      return true;
    }
  }

  return false;
}

export function clearAuthCookie() {
  document.cookie = `iPlanetDirectoryPro=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nginx-app-109380428695.asia-northeast1.run.app;`;
}