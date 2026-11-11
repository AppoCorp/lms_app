"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [userName, setUserName] = useState(user?.name || "");

  const handleSave = (e: React.FormEvent) => {
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
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Edit Profile")}</h1>
      </div>

      <div className="p-6 flex-1">
        <div className="flex justify-center mb-8 mt-4">
          <div className="relative">
            <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {userName.charAt(0) || "S"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 text-[var(--color-primary)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <Input 
            label={t("User Name")} 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          
          <div className="mt-8">
            <Button type="submit" fullWidth>
              {t("Save Changes")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
