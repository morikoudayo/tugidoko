import CryptoJS from 'crypto-js';
import type { User } from "./AuthContext";
import { type User as OAuthUser } from "firebase/auth";
import { getSecretKey } from './secretKey';

/**
 * 暗号化
 */
function encrypt(plainText: string, secretKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
  return encrypted;
}

/**
 * 復号化
 */
function decrypt(encryptedText: string, secretKey: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * ローカルストレージに認証情報を保存。
 * Googleアカウントでログインしている場合のみIDとパスワードは暗号化される。
 */
export async function saveUserCredentials(id: string, pass: string, oAuthUser: OAuthUser | null = null) {
  if (oAuthUser !== null) {
    const secretKey = await getSecretKey(oAuthUser.uid)

    localStorage.setItem('crypted', 'true');
    localStorage.setItem('id', encrypt(id, secretKey));
    localStorage.setItem('pass', encrypt(pass, secretKey));
  } else {
    localStorage.setItem('crypted', 'false');
    localStorage.setItem('id', id);
    localStorage.setItem('pass', pass);
  }
}

/**
 * ローカルストレージから認証情報を取得。
 */
export async function loadUserCredentials(oAuthUser: OAuthUser | null = null): Promise<User> {
  const isCrypted: boolean = localStorage.getItem('crypted') === 'true';
  const savedId = localStorage.getItem('id');
  const savedPass = localStorage.getItem('pass');

  const userCredentials: User = {
    id: '',
    pass: ''
  }

  if (isCrypted) {
    if (oAuthUser !== null && savedId !== null && savedPass !== null) {
      const secretKey = await getSecretKey(oAuthUser.uid)

      userCredentials.id = decrypt(savedId, secretKey)
      userCredentials.pass = decrypt(savedPass, secretKey)
    }
  } else {
    if (savedId !== null && savedPass !== null) {
      userCredentials.id = savedId
      userCredentials.pass = savedPass
    }
  }

  return userCredentials
}

/**
 * ローカルストレージの認証情報をクリア。
 */
export function clearUserCredentials(): void {
  localStorage.setItem('crypted', 'false');
  localStorage.setItem('id', '');
  localStorage.setItem('pass', '');
}