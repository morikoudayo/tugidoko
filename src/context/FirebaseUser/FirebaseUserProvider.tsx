import { useState, useEffect, type ReactNode } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { FirebaseUserContext } from "./FirebaseUserContext.tsx";
import { firebaseAuth } from "./firebase.ts";
import { Center, Progress } from "@chakra-ui/react";

export function FirebaseUserProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setFirebaseUser(user);
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
    <FirebaseUserContext.Provider value={firebaseUser}>
      {children}
    </FirebaseUserContext.Provider>
  );
}