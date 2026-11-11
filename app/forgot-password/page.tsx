"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const router = useRouter();
  const { baseUrl } = useApp();
  const { t } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${baseUrl}/api/forgot_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200 || response.ok) {
        setMessage({ text: data.message || t("Password reset link sent to your email"), type: 'success' });
        // Don't route to verify email, as it usually opens an email link directly.
        // Wait, the flutter app doesn't have a verify email screen, it probably just shows a toast.
      } else {
        setMessage({ text: data.message || t("Failed to send reset link"), type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || t("An error occurred"), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col px-6 pt-12">
      <div className="flex-1 flex flex-col max-w-md w-full mx-auto">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors mb-6 -ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-dark)] mb-2">{t("Forgot Password?")}</h1>
          <p className="text-[var(--color-text-grey)]">{t("Enter your email address to get a password reset link.")}</p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col flex-1">
          <Input 
            label={t("Email Address")} 
            type="email" 
            placeholder={t("Enter your email")} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </div>
          )}

          <div className="mt-4 mb-6">
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? t("Sending...") : t("Send Reset Link")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
