"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function CustomerSupportPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const tickets = [
    { id: 1, title: "Cannot access course materials", status: "Open", date: "Oct 24, 2023" },
    { id: 2, title: "Billing issue", status: "Closed", date: "Oct 10, 2023" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-[var(--color-text-dark)] p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Customer Support")}</h1>
        </div>
        <Link href="/support/new">
          <Button className="px-4 py-2 text-sm">{t("New Ticket")}</Button>
        </Link>
      </div>

      <div className="p-6">
        <h2 className="text-lg font-bold text-[var(--color-text-dark)] mb-4">{t("Your Tickets")}</h2>
        
        {tickets.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-[var(--color-text-dark)] text-sm mb-1">{t(ticket.title)}</h3>
                  <p className="text-xs text-[var(--color-text-grey)]">{ticket.date}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'Open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {t(ticket.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-[var(--color-text-grey)]">{t("No tickets found.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
