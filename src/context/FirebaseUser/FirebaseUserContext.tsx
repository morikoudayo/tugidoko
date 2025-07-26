import { createContext } from "react";
import { type User } from "firebase/auth";

export const FirebaseUserContext = createContext<User | null>(null);