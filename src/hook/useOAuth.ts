import { useContext } from "react";
import { OAuthUserContext } from "../context/OAuthUser/OAuthUserContext";

export function useOAuthUser() {
  const context = useContext(OAuthUserContext);
  if (context === undefined) {
    throw new Error('useOAuthUser must be used within an OAuthUserProvider');
  }
  return context;
};