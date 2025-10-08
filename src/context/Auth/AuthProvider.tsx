import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType, type User } from './AuthContext';
import { Toaster, toaster } from '@/components/ui/toaster';
import { activateSession, deactivateSession } from './authCookie';
import { clearUserCredentials, loadUserCredentials, saveUserCredentials } from './localStorage';
import { useFirebaseUser } from '@/hook/useFirebaseUser';

const EMPTY_USER: User = {
  id: '',
  pass: ''
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(EMPTY_USER);

  const firebaseUser = useFirebaseUser()

  /**
  * ページ読み込み時に一度だけ、ローカルストレージから認証情報を取得。
  */
  useEffect(() => {
    async function initializeUser() {
      if (firebaseUser !== null) {
        setUser(await loadUserCredentials(firebaseUser));
      } else {
        setUser(await loadUserCredentials());
      }
    }

    initializeUser();
  }, [firebaseUser]);

  /**
  * IDとパスワードが有効かチェックし、AuthContextに保存。
  * さらに、shouldSaveがtrueの場合、localStorageに認証情報を保存。
  */
  async function login(userCredentials: User, shouldSave = false): Promise<void> {
    const success = await activateSession(userCredentials)

    if (success) {
      setUser(userCredentials);

      if (shouldSave) {
        if (firebaseUser !== null) {
          saveUserCredentials(userCredentials.id, userCredentials.pass, firebaseUser)
        } else {
          saveUserCredentials(userCredentials.id, userCredentials.pass)
        }
      }

      await deactivateSession()
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
  function logout(): void {
    clearUserCredentials();
    setUser(EMPTY_USER);
  }

  /**
  * 以下はProviderの定義。
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