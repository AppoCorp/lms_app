"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { TopBar } from "../components/TopBar";

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={active ? "text-[#5851EF]" : "text-[#7A7985]"}>
    <path d="M20.04 6.82L14.28 2.79C12.71 1.69 10.3 1.75 8.78999 2.92L3.77999 6.83C2.77999 7.61 1.98999 9.21 1.98999 10.47V17.37C1.98999 19.92 4.05999 22 6.60999 22H17.39C19.94 22 22.01 19.93 22.01 17.38V10.6C22.01 9.25 21.14 7.59 20.04 6.82ZM12.75 18C12.75 18.41 12.41 18.75 12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18Z" fill="currentColor"/>
  </svg>
);

const CoursesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={active ? "text-[#5851EF]" : "text-[#7A7985]"}>
    <path d="M14.35 2H9.65001C8.61001 2 7.76001 2.84 7.76001 3.88V4.82C7.76001 5.86 8.60001 6.7 9.64001 6.7H14.35C15.39 6.7 16.23 5.86 16.23 4.82V3.88C16.24 2.84 15.39 2 14.35 2Z" fill="currentColor"/>
    <path d="M17.24 4.82C17.24 6.41 15.94 7.71 14.35 7.71H9.65004C8.06004 7.71 6.76004 6.41 6.76004 4.82C6.76004 4.26 6.16004 3.91 5.66004 4.17C4.25004 4.92 3.29004 6.40999 3.29004 8.11999V17.53C3.29004 19.99 5.30004 22 7.76004 22H16.24C18.7 22 20.71 19.99 20.71 17.53V8.11999C20.71 6.40999 19.75 4.92 18.34 4.17C17.84 3.91 17.24 4.26 17.24 4.82ZM12.38 16.95H8.00004C7.59004 16.95 7.25004 16.61 7.25004 16.2C7.25004 15.79 7.59004 15.45 8.00004 15.45H12.38C12.79 15.45 13.13 15.79 13.13 16.2C13.13 16.61 12.79 16.95 12.38 16.95ZM15 12.95H8.00004C7.59004 12.95 7.25004 12.61 7.25004 12.2C7.25004 11.79 7.59004 11.45 8.00004 11.45H15C15.41 11.45 15.75 11.79 15.75 12.2C15.75 12.61 15.41 12.95 15 12.95Z" fill="currentColor"/>
  </svg>
);

const WishlistIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={active ? "text-[#5851EF]" : "text-[#7A7985]"}>
    <path d="M16.94 3.10001C15.13 3.10001 13.51 3.98001 12.5 5.33001C11.49 3.98001 9.87 3.10001 8.06 3.10001C4.99 3.10001 2.5 5.60001 2.5 8.69001C2.5 9.88001 2.69 10.98 3.02 12C4.6 17 9.47 19.99 11.88 20.81C12.22 20.93 12.78 20.93 13.12 20.81C15.53 19.99 20.4 17 21.98 12C22.31 10.98 22.5 9.88001 22.5 8.69001C22.5 5.60001 20.01 3.10001 16.94 3.10001Z" fill="currentColor"/>
  </svg>
);

const AccountIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={active ? "text-[#5851EF]" : "text-[#7A7985]"}>
    <path d="M9.5 2C6.88 2 4.75 4.13 4.75 6.75C4.75 9.32 6.76 11.4 9.38 11.49C9.46 11.48 9.54 11.48 9.6 11.49C9.62 11.49 9.63 11.49 9.65 11.49C9.66 11.49 9.66 11.49 9.67 11.49C12.23 11.4 14.24 9.32 14.25 6.75C14.25 4.13 12.12 2 9.5 2Z" fill="currentColor"/>
    <path d="M14.58 14.15C11.79 12.29 7.23996 12.29 4.42996 14.15C3.15996 15 2.45996 16.15 2.45996 17.38C2.45996 18.61 3.15996 19.75 4.41996 20.59C5.81996 21.53 7.65996 22 9.49996 22C11.34 22 13.18 21.53 14.58 20.59C15.84 19.74 16.54 18.6 16.54 17.36C16.53 16.13 15.84 14.99 14.58 14.15Z" fill="currentColor"/>
    <path d="M20.4901 7.33999C20.6501 9.27999 19.2701 10.98 17.3601 11.21C17.3501 11.21 17.3501 11.21 17.3401 11.21H17.3101C17.2501 11.21 17.1901 11.21 17.1401 11.23C16.1701 11.28 15.2801 10.97 14.6101 10.4C15.6401 9.47999 16.2301 8.09999 16.1101 6.59999C16.0401 5.78999 15.7601 5.04999 15.3401 4.41999C15.7201 4.22999 16.1601 4.10999 16.6101 4.06999C18.5701 3.89999 20.3201 5.35999 20.4901 7.33999Z" fill="currentColor"/>
    <path d="M22.49 16.59C22.41 17.56 21.79 18.4 20.75 18.97C19.75 19.52 18.49 19.78 17.24 19.75C17.96 19.1 18.38 18.29 18.46 17.43C18.56 16.19 17.97 15 16.79 14.05C16.12 13.52 15.34 13.1 14.49 12.79C16.7 12.15 19.48 12.58 21.19 13.96C22.11 14.7 22.58 15.63 22.49 16.59Z" fill="currentColor"/>
  </svg>
);

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const tabs = [
    { name: "Home", href: "/home", icon: HomeIcon },
    { name: "My Courses", href: "/my-courses", icon: CoursesIcon },
    { name: "Wishlist", href: "/my-wishlists", icon: WishlistIcon },
    { name: "Account", href: "/account", icon: AccountIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] relative">
      {!isAuthPage && <TopBar />}

      <div className={`flex-1 ${isAuthPage ? "" : "pb-20"}`}>
        {children}
      </div>

      {/* Floating Action Button (Filter) */}
      {!isAuthPage && (
        <div className="fixed bottom-[80px] right-4 z-50">
          <Link href="/filter" className="w-14 h-14 bg-white rounded-full shadow-lg border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] cursor-pointer hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#5851EF]">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.05817 9.1721C6.76898 10.1438 5.86885 10.8524 4.80323 10.8524C3.73761 10.8524 2.83748 10.1438 2.54829 9.1721H1.10714C0.735689 9.1721 0.43457 8.87378 0.43457 8.5C0.43457 8.12881 0.735315 7.8279 1.10714 7.8279H2.54829C2.83748 6.85621 3.73761 6.14765 4.80323 6.14765C5.86885 6.14765 6.76898 6.85621 7.05817 7.8279H15.8924C16.2639 7.8279 16.565 8.12622 16.565 8.5C16.565 8.87119 16.2643 9.1721 15.8924 9.1721H7.05817ZM9.9414 13.5408C10.2306 12.5691 11.1307 11.8605 12.1963 11.8605C13.262 11.8605 14.1621 12.5691 14.4513 13.5408H15.8924C16.2639 13.5408 16.565 13.8391 16.565 14.2129C16.565 14.5841 16.2643 14.885 15.8924 14.885H14.4513C14.1621 15.8567 13.262 16.5652 12.1963 16.5652C11.1307 16.5652 10.2306 15.8567 9.9414 14.885H1.10714C0.735689 14.885 0.43457 14.5866 0.43457 14.2129C0.43457 13.8417 0.735315 13.5408 1.10714 13.5408H9.9414ZM9.9414 2.11504C10.2306 1.14335 11.1307 0.434784 12.1963 0.434784C13.262 0.434784 14.1621 1.14335 14.4513 2.11504H15.8924C16.2639 2.11504 16.565 2.41336 16.565 2.78714C16.565 3.15833 16.2643 3.45924 15.8924 3.45924H14.4513C14.1621 4.43093 13.262 5.13949 12.1963 5.13949C11.1307 5.13949 10.2306 4.43093 9.9414 3.45924H1.10714C0.735689 3.45924 0.43457 3.16092 0.43457 2.78714C0.43457 2.41595 0.735315 2.11504 1.10714 2.11504H9.9414ZM12.1963 3.79529C12.7531 3.79529 13.2045 3.34393 13.2045 2.78714C13.2045 2.23035 12.7531 1.77899 12.1963 1.77899C11.6396 1.77899 11.1882 2.23035 11.1882 2.78714C11.1882 3.34393 11.6396 3.79529 12.1963 3.79529ZM12.1963 15.221C12.7531 15.221 13.2045 14.7697 13.2045 14.2129C13.2045 13.6561 12.7531 13.2047 12.1963 13.2047C11.6396 13.2047 11.1882 13.6561 11.1882 14.2129C11.1882 14.7697 11.6396 15.221 12.1963 15.221ZM4.80323 7.49185C4.24644 7.49185 3.79508 7.94321 3.79508 8.5C3.79508 9.05679 4.24644 9.50815 4.80323 9.50815C5.36002 9.50815 5.81138 9.05679 5.81138 8.5C5.81138 7.94321 5.36002 7.49185 4.80323 7.49185Z" fill="currentColor"/>
            </svg>
          </Link>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {!isAuthPage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] pb-safe z-50">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => {
              // Note: Since Account renders Login form in the same route when unauthenticated, it highlights "Account"
              const isActive = pathname === tab.href || ((pathname === '/login' || pathname === '/signup') && tab.href === '/account');
              
              return (
                <Link 
                  key={tab.name} 
                  href={tab.href}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                    isActive ? "text-[#5851EF]" : "text-[#757575] hover:text-gray-500"
                  }`}
                >
                  <tab.icon active={isActive} />
                  <span className="text-[11px] font-medium mt-1">{t(tab.name)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
