"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { deleteAccount, logout } = useAuth();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteClick = () => {
    setIsModalOpen(true);
    setPassword("");
    setError("");
  };

  const handleConfirmDelete = async () => {
    if (!password) {
      setError(t("Password cannot be empty"));
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      await deleteAccount(password);
      setIsModalOpen(false);
      logout();
      router.push("/home");
    } catch (err: any) {
      setError(err.message || t("Failed to delete account"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Delete Account")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 flex items-center border-b border-gray-100">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-text-dark)]">{t("Delete Your Account")}</h2>
          </div>
          
          <div className="p-6">
            <p className="text-[var(--color-text-grey)] text-[15px] leading-relaxed mb-8">
              {t("When you delete your account you will lose accesss to your account services and we permanentlly delete your personal data.")}
            </p>
            
            <div className="flex justify-end">
              <Button onClick={handleDeleteClick} className="w-32 bg-[var(--color-primary)] text-white">
                {t("Delete")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--color-text-dark)] mb-2">{t("Notifying")}</h3>
              <p className="text-sm text-[var(--color-text-grey)] mb-6">
                {t("To remove your account provide your account password.")}
              </p>
              
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-grey)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5"></circle></svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[var(--color-background-input)] rounded-lg border border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-colors text-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
              
              {error && <div className="text-red-500 text-xs mb-4">{error}</div>}
              
              <div className="flex justify-between space-x-3 mt-6">
                <Button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  {t("No")}
                </Button>
                <Button 
                  onClick={handleConfirmDelete} 
                  isLoading={isSubmitting}
                  className="flex-1 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                >
                  {t("Confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
