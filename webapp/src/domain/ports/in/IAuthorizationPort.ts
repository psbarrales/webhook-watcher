import { User } from "firebase/auth";

export interface IAuthorizationPort {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
    isAuthenticated: boolean;
    isReady: boolean;
    isProcessing: boolean;
    user: User | null;
    token?: string | null;
    error?: string | null;
    clearError: () => void;
}
