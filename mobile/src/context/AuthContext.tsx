import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { getStoredToken, setStoredToken } from "../api/client";
import { User } from "../types/models";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { fullName: string; companyName?: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        await setStoredToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    await setStoredToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(
    async (input: { fullName: string; companyName?: string; email: string; password: string }) => {
      const result = await authApi.register(input);
      await setStoredToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await setStoredToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.getMe();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut, refreshUser }),
    [user, isLoading, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
