"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useLanguage } from "../../context/LanguageContext";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 flex items-center">
        <button 
          onClick={() => router.back()}
          className="mr-4 text-[var(--color-text-dark)] p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Update Password")}</h1>
      </div>

      <div className="p-6 flex-1">
        <p className="text-[var(--color-text-grey)] text-sm mb-6">
          {t("Your new password must be different from previously used passwords.")}
        </p>

        <form onSubmit={handleUpdate}>
          <Input 
            label={t("Current Password")} 
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input 
            label={t("New Password")} 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input 
            label={t("Confirm New Password")} 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <div className="mt-8">
            <Button type="submit" fullWidth>
              {t("Update Password")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
