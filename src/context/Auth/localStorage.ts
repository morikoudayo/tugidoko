import type { User } from "./AuthContext";

/**
 * ローカルストレージから認証情報を取得。
 * 平文で保存しているため取り扱いには注意。
 * Googleアカウントによる保護も検討。
 */
export function loadUserCredentials(): User {
  const savedId = localStorage.getItem('id');
  const savedPass = localStorage.getItem('pass');

  const userCredentials: User = {
    id: '',
    pass: ''
  }

  if (savedId !== null && savedPass !== null) {
    userCredentials.id = savedId
    userCredentials.pass = savedPass
  }

  return userCredentials
}

/**
 * ローカルストレージの認証情報をクリア。
 */
export function clearUserCredentials(): void {
  localStorage.setItem('id', '');
  localStorage.setItem('pass', '');
}