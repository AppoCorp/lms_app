"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "../../../hooks/useWishlist";
import { useLanguage } from "../../context/LanguageContext";

export default function MyWishlistsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { wishlist, isLoading, fetchWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const PlaceholderImage = () => (
    <div className="w-[100px] h-[100px] bg-[#E8EDF1] flex items-center justify-center rounded-xl flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("My Wishlists")}</h1>
        <div className="w-8 h-8"></div> {/* Placeholder for balance */}
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <p className="text-gray-500">{t("Loading wishlists...")}</p>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {wishlist.map((course: any) => (
              <div key={course.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex relative">
                <Link href={`/course/${course.id}`} className="flex w-full">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-[100px] h-[100px] object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <PlaceholderImage />
                  )}
                  <div className="ml-3 flex flex-col justify-center flex-1 pr-8">
                    <h3 className="font-semibold text-[var(--color-text-dark)] text-[15px] leading-tight line-clamp-2 mb-1">{course.title}</h3>
                    <p className="text-[var(--color-text-grey)] text-xs mb-2">{t("By ____", course.instructor_name || t("Instructor"))}</p>
                    <div className="flex items-center">
                      <span className="font-bold text-[var(--color-text-dark)]">${course.price || t("Free")}</span>
                      {course.discount_flag === "1" && course.discounted_price && (
                        <span className="ml-2 text-xs text-[var(--color-text-grey)] line-through">${course.discounted_price}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(course.id);
                  }} 
                  className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-primary)" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-grey)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 mb-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <p className="text-[var(--color-text-dark)] font-medium text-lg">{t("No items in wishlist")}</p>
            <p className="text-[var(--color-text-grey)] text-sm mt-1">{t("Browse courses and add them here")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
