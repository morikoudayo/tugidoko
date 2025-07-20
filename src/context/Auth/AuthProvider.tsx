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

  useEffect(() => {
    setUser(loadUserCredentials());
  }, []);

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

  function logout() {
    clearAuthCookie();
    setRefHour(undefined);

    clearUserCredentials();
    setUser(EMPTY_USER);
  }

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