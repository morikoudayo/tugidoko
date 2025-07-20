import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType, type User } from './AuthContext';
import { Toaster, toaster } from '@/components/ui/toaster';
import { clearAuthCookie, getAuthCookie } from './authCookie';
import { clearUserCredentials, loadUserCredentials } from './localStorage';

const EMPTY_USER: User = {
  id: '',
  pass: ''
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [refHour, setRefHour] = useState<string | undefined>(undefined)

  /**
  * ページ読み込み時に一度だけ、ローカルストレージから認証情報を取得。
  */
  useEffect(() => {
    setUser(loadUserCredentials());
  }, []);

  /**
  * 学内ポータルの認証クッキーを取得できたら、現在時刻を取得しrefHourに格納。
  * さらに、shouldSaveがtrueの場合、localStorageに認証情報を保存。
  */
  async function login(userCredentials: User, shouldSave = false) {
    const success = await getAuthCookie(userCredentials)

    if (success) {
      const currentHour = new Date().getHours().toString();
      setRefHour(currentHour)

      setUser(userCredentials);

      if (shouldSave) {
        localStorage.setItem('id', userCredentials.id);
        localStorage.setItem('pass', userCredentials.pass);
      }
    } else {
      toaster.create({
        description: "ログインに失敗しました。",
        type: "error",
      })
    }
  }

  /**
  * 認証情報を各所から削除。
  */
  function logout() {
    clearAuthCookie();
    setRefHour(undefined);

    clearUserCredentials();
    setUser(EMPTY_USER);
  }

  /**
  * 1分ごとにautoLogin関数が実行される。
  * autoLogin関数では、前回ログイン時刻から時間（hh）が変更された場合にのみログイン処理を実行する。
  * これにより60分で失効する学内ポータルの認証Cookieを自動的に更新する。
  */
  useEffect(() => {
    async function autoLogin() {
      const currentHour = new Date().getHours().toString();
      if (refHour === undefined || refHour != currentHour) {
        const success = await getAuthCookie(user)
        if (success) {
          setRefHour(currentHour)
        }
      }
    }

    const intervalId = setInterval(() => {
      if (user.id && user.pass) {
        autoLogin();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, refHour]);

  /**
  * 以下はproviderの定義。
  */
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
  };

  return (<>
    <Toaster />
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  </>);
}