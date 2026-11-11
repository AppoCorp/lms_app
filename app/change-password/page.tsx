"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t("New passwords do not match."));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(t("Password updated successfully."));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || t("Failed to update password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const EyeIcon = ({ show, toggle }: { show: boolean, toggle: () => void }) => (
    <button type="button" onClick={toggle} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      )}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Update Password")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 pt-10">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          
          <div className="relative">
            <input 
              type={showCurrentPassword ? "text" : "password"} 
              placeholder={t("Current Password")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              required
            />
            <EyeIcon show={showCurrentPassword} toggle={() => setShowCurrentPassword(!showCurrentPassword)} />
          </div>

          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"} 
              placeholder={t("New Password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              required
            />
            <EyeIcon show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
          </div>

          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder={t("Confirm Password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              required
            />
            <EyeIcon show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
          </div>

          {error && <div className="text-red-500 text-sm pl-2 pt-1">{error}</div>}
          {success && <div className="text-green-500 text-sm pl-2 pt-1">{success}</div>}

          <div className="pt-6">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {t("Update Now")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
