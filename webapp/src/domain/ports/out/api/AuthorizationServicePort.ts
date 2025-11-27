import { User } from "firebase/auth";

export interface AuthorizationServicePort {
    login(email: string, password: string): Promise<void>;
    register(email: string, password: string, displayName?: string): Promise<void>;
    logout(): Promise<void>;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    getCurrentUser(): User | null;
    refreshToken(): Promise<string | null>;
}
