"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useLanguage, type Language } from "../context/LanguageContext";

type Branding = { logo: string; name: string };

const brandingKey = (baseUrl: string) => `branding_${baseUrl}`;

// Company logo (same one as the website header) + the student's language switch.
export function TopBar() {
  const { baseUrl } = useApp();
  const { isAuthenticated } = useAuth();
  const { language, hindiAvailable, setLanguage, t } = useLanguage();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!baseUrl) return;
    let active = true;
    const cached = localStorage.getItem(brandingKey(baseUrl));
    if (cached) {
      try {
        setBranding(JSON.parse(cached));
      } catch {
        localStorage.removeItem(brandingKey(baseUrl));
      }
    }
    fetch(`${baseUrl}/api/app-config`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.logo) return;
        const path: string = data.logo.dark || data.logo.light || "";
        // The server may send a site-relative path (/uploads/...)
        const logo = !path || /^https?:\/\//.test(path) ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
        const next = { logo, name: data.branding?.app_name || "" };
        setBranding(next);
        localStorage.setItem(brandingKey(baseUrl), JSON.stringify(next));
      })
      .catch(() => {
        // keep cached logo
      });
    return () => {
      active = false;
    };
  }, [baseUrl]);

  // Close the menu when tapping outside it
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [menuOpen]);

  const choose = async (next: Language) => {
    setMenuOpen(false);
    if (next === language) return;
    setSaving(true);
    try {
      await setLanguage(next);
    } catch {
      alert(t("Could not change language. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  // Language is saved on the student account, so only offer it once logged in
  const showLanguage = isAuthenticated && (hindiAvailable || language === "hindi");

  return (
    <div className="sticky top-0 z-40 bg-[var(--color-background)]">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="h-11 flex items-center max-w-[60%]">
          {branding?.logo ? (
            <img src={branding.logo} alt={branding.name || "Logo"} className="h-full w-auto object-contain" />
          ) : (
            <span className="font-bold text-[var(--color-text-dark)] truncate">{branding?.name}</span>
          )}
        </div>

        {showLanguage && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              disabled={saving}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t("Language")}
              className="h-11 min-w-11 px-3 flex items-center gap-1 rounded-xl border border-gray-200 bg-white text-[var(--color-text-dark)] font-semibold text-sm disabled:opacity-60"
            >
              {language === "hindi" ? "हिंदी" : "ENG"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <ul role="menu" className="absolute right-0 mt-2 w-36 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                {(["english", "hindi"] as const).map((lang) => (
                  <li key={lang}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => choose(lang)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-dark)] hover:bg-gray-50"
                    >
                      <span className="w-4">{language === lang ? "✓" : ""}</span>
                      {lang === "english" ? "English" : "हिंदी"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
