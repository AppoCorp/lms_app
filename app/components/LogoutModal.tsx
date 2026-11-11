import React from "react";
import { Button } from "./Button";
import { useLanguage } from "../context/LanguageContext";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl transform scale-100 transition-transform duration-200">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold font-inter mb-4 text-[var(--color-text-dark)]">
            {t("Log Out?")}
          </h2>
          <p className="text-[var(--color-text-grey)] font-inter text-base mb-8">
            {t("Are you sure, You want to logout?")}
          </p>
          
          <div className="flex justify-between space-x-4">
            <Button 
              onClick={onClose} 
              className="flex-1 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            >
              {t("Cancel")}
            </Button>
            <Button 
              onClick={onConfirm} 
              className="flex-1 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
            >
              {t("Confirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
