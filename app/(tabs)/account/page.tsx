"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LogoutModal } from "../../components/LogoutModal";

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push("/home");
  };

  const accountLinks = [
    { title: "Edit Profile", href: "/edit-profile", icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
        <path d="M14 2.33331C10.9433 2.33331 8.45833 4.81831 8.45833 7.87498C8.45833 10.8733 10.8033 13.3 13.86 13.405C13.9533 13.3933 14.0467 13.3933 14.1167 13.405C14.14 13.405 14.1517 13.405 14.175 13.405C14.1867 13.405 14.1867 13.405 14.1983 13.405C17.185 13.3 19.53 10.8733 19.5417 7.87498C19.5417 4.81831 17.0567 2.33331 14 2.33331Z" fill="currentColor"/>
        <path d="M19.9267 16.5084C16.6717 14.3384 11.3633 14.3384 8.085 16.5084C6.60333 17.5 5.78667 18.8417 5.78667 20.2767C5.78667 21.7117 6.60333 23.0417 8.07333 24.0217C9.70667 25.1184 11.8533 25.6667 14 25.6667C16.1467 25.6667 18.2933 25.1184 19.9267 24.0217C21.3967 23.03 22.2133 21.7 22.2133 20.2534C22.2017 18.8184 21.3967 17.4884 19.9267 16.5084Z" fill="currentColor"/>
      </svg>
    ) },
    { title: "Change Password", href: "/change-password", icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
        <path d="M23.0883 4.92332C19.635 1.48165 14.035 1.48165 10.605 4.92332C8.19 7.31499 7.46667 10.7567 8.4 13.79L2.91667 19.2733C2.53167 19.67 2.26333 20.4517 2.345 21.0117L2.695 23.555C2.82333 24.395 3.605 25.1883 4.445 25.305L6.98833 25.655C7.54833 25.7367 8.33 25.48 8.72667 25.0717L9.68333 24.115C9.91667 23.8933 9.91667 23.52 9.68333 23.2867L7.42 21.0233C7.08167 20.685 7.08167 20.125 7.42 19.7867C7.75833 19.4483 8.31833 19.4483 8.65667 19.7867L10.9317 22.0617C11.1533 22.2833 11.5267 22.2833 11.7483 22.0617L14.2217 19.6C17.2433 20.545 20.685 19.81 23.0883 17.4183C26.53 13.9767 26.53 8.36499 23.0883 4.92332ZM16.9167 14C15.3067 14 14 12.6933 14 11.0833C14 9.47332 15.3067 8.16666 16.9167 8.16666C18.5267 8.16666 19.8333 9.47332 19.8333 11.0833C19.8333 12.6933 18.5267 14 16.9167 14Z" fill="currentColor"/>
      </svg>
    ) },
    { title: "Delete Your Account", href: "/delete-account", icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
        <path d="M14 2.33331C10.9433 2.33331 8.45833 4.81831 8.45833 7.87498C8.45833 10.8733 10.8033 13.3 13.86 13.405C13.9533 13.3933 14.0467 13.3933 14.1167 13.405C14.14 13.405 14.1517 13.405 14.175 13.405C14.1867 13.405 14.1867 13.405 14.1983 13.405C17.185 13.3 19.53 10.8733 19.5417 7.87498C19.5417 4.81831 17.0567 2.33331 14 2.33331Z" fill="currentColor"/>
        <path d="M19.9267 16.5084C16.6717 14.3384 11.3633 14.3384 8.085 16.5084C6.60333 17.5 5.78667 18.8417 5.78667 20.2767C5.78667 21.7117 6.60333 23.0417 8.07333 24.0217C9.70667 25.1184 11.8533 25.6667 14 25.6667C16.1467 25.6667 18.2933 25.1184 19.9267 24.0217C21.3967 23.03 22.2133 21.7 22.2133 20.2534C22.2017 18.8184 21.3967 17.4884 19.9267 16.5084Z" fill="currentColor"/>
      </svg>
    ) },
    { title: "Log Out", onClick: () => setIsLogoutModalOpen(true), icon: (
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
        <path d="M17.5 19.6L17.5 14.875L10.2083 14.875C9.73 14.875 9.33333 14.4783 9.33333 14C9.33333 13.5217 9.73 13.125 10.2083 13.125L17.5 13.125L17.5 8.40001C17.5 4.66668 15.1667 2.33334 11.4333 2.33334L8.41166 2.33334C4.66667 2.33334 2.33333 4.66668 2.33333 8.40001L2.33333 19.5883C2.33333 23.3217 4.66667 25.655 8.4 25.655L11.4333 25.655C15.1667 25.6667 17.5 23.3333 17.5 19.6Z" fill="currentColor"/>
        <path d="M22.68 14.875L20.265 17.29C20.09 17.465 20.0083 17.6867 20.0083 17.9083C20.0083 18.13 20.09 18.3517 20.265 18.5267C20.6033 18.865 21.1633 18.865 21.5017 18.5267L25.41 14.6183C25.7483 14.28 25.7483 13.72 25.41 13.3817L21.5017 9.47332C21.1633 9.13499 20.6033 9.13499 20.265 9.47332C19.9267 9.81166 19.9267 10.3717 20.265 10.71L22.68 13.125L17.5 13.125L17.5 14.875L22.68 14.875Z" fill="currentColor"/>
      </svg>
    ) },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-12 pb-24 bg-[var(--color-background)]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full border border-gray-200 bg-white flex items-center justify-center mb-4 shadow-sm relative overflow-hidden">
           {user?.photo ? (
             <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
             </div>
           )}
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{user?.name || t("Demo Student")}</h1>
      </div>

      <div className="flex flex-col w-full">
        {accountLinks.map((link, index) => (
          <React.Fragment key={index}>
            {link.href ? (
              <Link href={link.href} className="flex items-center px-6 py-4 bg-white active:bg-gray-50 transition-colors">
                <div className="w-6 h-6 flex items-center justify-center mr-4">
                  {link.icon}
                </div>
                <span className="font-bold text-[15px] text-[var(--color-text-dark)] flex-1">{t(link.title)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Link>
            ) : (
              <button onClick={link.onClick} className="flex items-center w-full px-6 py-4 bg-white active:bg-gray-50 transition-colors text-left">
                <div className="w-6 h-6 flex items-center justify-center mr-4">
                  {link.icon}
                </div>
                <span className="font-bold text-[15px] text-[var(--color-text-dark)] flex-1">{t(link.title)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            )}
            <div className="px-6 bg-white">
              <div className="border-b border-gray-200"></div>
            </div>
          </React.Fragment>
        ))}
        
        {/* About Section */}
        <div className="flex items-center px-6 py-4 bg-white text-left">
          <div className="w-6 h-6 flex items-center justify-center mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]">
              <path d="M9.70874 1.23133C7.83619 1.62966 6.09997 2.50969 4.67165 3.78445C3.24333 5.05922 2.17234 6.6846 1.5645 8.49999C0.956654 10.3154 0.833002 12.258 1.20576 14.1358C1.57851 16.0136 2.43478 17.7616 3.68994 19.2072C3.83945 19.387 3.92784 19.6097 3.94233 19.8431C3.95682 20.0764 3.89664 20.3083 3.77051 20.5052L3.26489 21.3199C3.16152 21.4865 3.10455 21.6776 3.09987 21.8736C3.09519 22.0696 3.14298 22.2633 3.23828 22.4346C3.33359 22.6059 3.47295 22.7487 3.64194 22.8481C3.81093 22.9474 4.00341 22.9999 4.19946 22.9999H11.6841C14.5276 23.03 17.2764 21.9794 19.3739 20.0593C21.4714 18.1391 22.7607 15.4936 22.9807 12.6584C23.0812 10.9667 22.7899 9.27455 22.1295 7.71379C21.4691 6.15302 20.4573 4.76575 19.173 3.65997C17.8887 2.5542 16.3665 1.75976 14.725 1.33852C13.0834 0.917278 11.3668 0.880595 9.70874 1.23133ZM12 4.99988C12.3043 4.9999 12.6017 5.09015 12.8547 5.25921C13.1077 5.42827 13.3048 5.66856 13.4213 5.94967C13.5377 6.23079 13.5681 6.54012 13.5088 6.83854C13.4494 7.13696 13.3028 7.41108 13.0877 7.62622C12.8725 7.84136 12.5984 7.98787 12.3 8.04723C12.0015 8.10658 11.6922 8.0761 11.4111 7.95966C11.13 7.84321 10.8897 7.64603 10.7207 7.39303C10.5517 7.14004 10.4614 6.8426 10.4614 6.53833C10.4615 6.1303 10.6236 5.73899 10.9121 5.45048C11.2006 5.16196 11.592 4.99988 12 4.99988ZM13.2305 17.9999H12C11.8687 17.9999 11.7386 17.9741 11.6173 17.9238C11.4959 17.8736 11.3857 17.7999 11.2928 17.7071C11.2 17.6142 11.1263 17.5039 11.0761 17.3826C11.0258 17.2613 11 17.1312 11 16.9999V11.8461H10.7695C10.5043 11.8461 10.25 11.7407 10.0624 11.5532C9.87489 11.3656 9.76953 11.1113 9.76953 10.8461C9.76953 10.5809 9.87489 10.3265 10.0624 10.139C10.25 9.95143 10.5043 9.84607 10.7695 9.84607H12C12.1313 9.84604 12.2614 9.87188 12.3827 9.92212C12.5041 9.97236 12.6143 10.046 12.7072 10.1389C12.8 10.2318 12.8737 10.046 12.7072 10.1389C12.8 10.2318 12.8737 10.342 12.924 10.4633C12.9742 10.5847 13 10.7147 13 10.8461V15.9999H13.2305C13.4957 15.9999 13.75 16.1052 13.9376 16.2928C14.1251 16.4803 14.2305 16.7347 14.2305 16.9999C14.2305 17.2651 14.1251 17.5194 13.9376 17.707C13.75 17.8945 13.4957 17.9999 13.2305 17.9999Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex-1 flex flex-col">
            <span className="font-bold text-[15px] text-[var(--color-text-dark)] mb-0.5">{t("About")}</span>
            <span className="text-[11px] text-[var(--color-text-grey)]">{t("Version: ____", "1.3.0")}</span>
          </div>
        </div>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
