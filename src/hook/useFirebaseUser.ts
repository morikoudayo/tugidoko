import { useContext } from "react";
import { FirebaseUserContext } from "@/context/FirebaseUser/FirebaseUserContext";

export function useFirebaseUser() {
  const context = useContext(FirebaseUserContext);
  if (context === undefined) {
    throw new Error('useFirebaseUser must be used within an FirebaseUserProvider');
  }
  return context;
};