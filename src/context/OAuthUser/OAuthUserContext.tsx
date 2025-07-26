import { createContext } from "react";
import { type User } from "firebase/auth";

export const OAuthUserContext = createContext<User | null>(null);