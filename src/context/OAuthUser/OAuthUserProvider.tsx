import { useState, useEffect, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { OAuthUserContext } from "./OAuthUserContext.tsx";
import { oAuth } from "./firebase.ts";
import { Center, Progress } from "@chakra-ui/react";

export function OAuthUserProvider({ children }: { children: ReactNode }) {
  const [oAuthUser, setOAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(oAuth, (user) => {
      setOAuthUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Center h='100vh'>
        <Progress.Root maxW="240px" value={null}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Center>
    )
  }

  return (
    <OAuthUserContext.Provider value={oAuthUser}>
      {children}
    </OAuthUserContext.Provider>
  );
}