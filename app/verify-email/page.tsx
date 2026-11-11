"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col px-6 pt-12 text-center items-center justify-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text-dark)] mb-3">{t("Check Your Email")}</h1>
      <p className="text-[var(--color-text-grey)] mb-8 px-4">
        {t("We have sent a password reset link to your email address. Please check your inbox and spam folder.")}
      </p>

      <div className="w-full max-w-xs mx-auto flex flex-col space-y-4">
        <Button onClick={() => router.push("/login")} fullWidth>
          {t("Back to Login")}
        </Button>
      </div>
    </div>
  );
}
