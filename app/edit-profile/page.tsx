"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.photo) {
        setPhotoPreview(user.photo);
      }
    }
  }, [user]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (photo) {
        formData.append("photo", photo);
      }
      
      await updateProfile(formData);
      router.back();
    } catch (err: any) {
      setError(err.message || t("Failed to update profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] pb-10">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-text-dark)]">{t("Update Profile")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Profile Photo */}
          <div className="flex justify-center mb-8 relative">
            <div 
              className="w-32 h-32 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center relative overflow-hidden shadow-sm"
            >
              {photoPreview ? (
                <img src={photoPreview} alt={t("Profile")} className="w-full h-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              )}
            </div>
            <button 
              type="button"
              onClick={handlePhotoClick}
              className="absolute bottom-0 right-[calc(50%-48px)] bg-[var(--color-primary)] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md border-2 border-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[var(--color-text-dark)] font-medium mb-1">{t("User Name")}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-[var(--color-background-input)] rounded-xl border border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mt-auto">
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              {t("Update Profile")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
