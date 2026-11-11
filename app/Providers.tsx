"use client";

import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </AppProvider>
  );
}
