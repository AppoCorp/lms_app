"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useApp } from "./AppContext";
import { useAuth } from "./AuthContext";

export type Language = "english" | "hindi";

interface LanguageContextType {
  language: Language;
  // false until this organisation's server provides Hindi phrases (older servers don't)
  hindiAvailable: boolean;
  setLanguage: (language: Language) => Promise<void>;
  t: (text: string, ...replacements: Array<string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Per organisation, since each server has its own translations
const cacheKey = (baseUrl: string) => `phrases_hindi_${baseUrl}`;

const isPhraseMap = (data: unknown): data is Record<string, string> =>
  !!data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 0;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { baseUrl } = useApp();
  const { user, token, updateUser } = useAuth();
  const language: Language = user?.language === "hindi" ? "hindi" : "english";
  const [hindiPhrases, setHindiPhrases] = useState<Record<string, string>>({});

  // Always load the Hindi map (when a server is set) so we know whether Hindi is offered;
  // t() only uses it when the student's language is Hindi.
  useEffect(() => {
    setHindiPhrases({});
    if (!baseUrl) return;

    let active = true;
    const cached = localStorage.getItem(cacheKey(baseUrl));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (isPhraseMap(parsed)) setHindiPhrases(parsed);
      } catch {
        localStorage.removeItem(cacheKey(baseUrl));
      }
    }

    fetch(`${baseUrl}/api/phrases?language=hindi`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && isPhraseMap(data)) {
          setHindiPhrases(data);
          localStorage.setItem(cacheKey(baseUrl), JSON.stringify(data));
        }
      })
      .catch(() => {
        // offline or old server: keep cached/English text
      });

    return () => {
      active = false;
    };
  }, [baseUrl]);

  const setLanguage = async (next: Language) => {
    if (!baseUrl || !token) throw new Error("Not authenticated");
    const res = await fetch(`${baseUrl}/api/update_language`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ language: next }),
    });
    if (!res.ok) throw new Error("Failed to change language");
    updateUser({ language: next });
  };

  const t = useCallback(
    (text: string, ...replacements: Array<string | number>) => {
      let out = (language === "hindi" && hindiPhrases[text]) || text;
      for (const r of replacements) out = out.replace("____", () => String(r));
      return out;
    },
    [language, hindiPhrases]
  );

  const hindiAvailable = Object.keys(hindiPhrases).length > 0;

  return (
    <LanguageContext.Provider value={{ language, hindiAvailable, setLanguage, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
