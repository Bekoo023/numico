import React, { createContext, useCallback, useContext, useState } from "react";

type User = {
  id: number;
  voornaam: string;
  achternaam: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      const parsed = storedUser ? JSON.parse(storedUser) as User : null;
      return parsed && typeof parsed.id === "number" && storedToken
        ? { user: parsed, token: storedToken }
        : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });
  const [user, updateUser] = useState<User | null>(session.user);
  const [token, setToken] = useState<string | null>(session.token);

  const setUser = useCallback((value: User | null) => {
    updateUser(value);
    if (value) localStorage.setItem("user", JSON.stringify(value));
    else localStorage.removeItem("user");
  }, []);

  const login = (userData: User, tokenValue: string) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, [setUser]);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth moet binnen een AuthProvider gebruikt worden");
  return ctx;
};
