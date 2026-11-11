"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useLanguage } from "../../context/LanguageContext";

export default function NewTicketPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("New Ticket")}</h1>
      </div>

      <div className="p-6 flex-1">
        <p className="text-[var(--color-text-grey)] text-sm mb-6">
          {t("Describe your issue below and our support team will get back to you as soon as possible.")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <Input 
            label={t("Subject")} 
            placeholder={t("Briefly describe the issue")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          
          <div className="w-full flex flex-col gap-1.5 mb-6">
            <label className="text-sm font-medium text-[var(--color-text-dark)]">{t("Description")}</label>
            <textarea
              className="w-full bg-[var(--color-background-input)] border border-[var(--color-border-input)] rounded-xl py-3 px-4 outline-none focus:border-[var(--color-primary)] transition-colors duration-200 min-h-[150px] resize-none text-sm placeholder-[var(--color-text-grey)]"
              placeholder={t("Provide more details about your issue here...")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mt-4">
            <Button type="submit" fullWidth>
              {t("Submit Ticket")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
