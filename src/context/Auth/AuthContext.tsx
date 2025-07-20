import { createContext } from 'react';

export type User = {
    id: string;
    pass: string;
};

export type AuthContextType = {
    user: User;
    login: (user: User, shouldSave?: boolean) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

