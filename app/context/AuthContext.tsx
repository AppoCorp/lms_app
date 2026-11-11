"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  token?: string;
  role?: string;
  photo?: string;
  phone?: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  isAuthenticated: boolean;
  updateProfile: (data: FormData) => Promise<any>;
  changePassword: (data: any) => Promise<any>;
  deleteAccount: (password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useApp } from "./AppContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { baseUrl } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load auth from localStorage on mount
    const savedToken = localStorage.getItem("access_token");
    const savedUserStr = localStorage.getItem("user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("password");
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const updateProfile = async (formData: FormData): Promise<any> => {
    if (!baseUrl || !token) throw new Error("Not authenticated");
    const res = await fetch(`${baseUrl}/api/update_userdata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (data.status === "success" || res.ok) {
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } else {
      throw new Error(data.message || "Failed to update profile");
    }
    return data;
  };

  const changePassword = async (data: any): Promise<any> => {
    if (!baseUrl || !token) throw new Error("Not authenticated");
    const res = await fetch(`${baseUrl}/api/update_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (responseData.status === "failed") {
      throw new Error(responseData.message || "Failed to change password");
    }
    return responseData;
  };

  const deleteAccount = async (password: string): Promise<any> => {
    if (!baseUrl || !token) throw new Error("Not authenticated");
    const res = await fetch(`${baseUrl}/api/account_disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ account_password: password }),
    });
    const responseData = await res.json();
    if (responseData.validity !== 1) {
      throw new Error(responseData.message || "Failed to delete account");
    }
    return responseData;
  };

  if (!isInitialized) {
    return null; // or loading spinner
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, updateProfile, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
