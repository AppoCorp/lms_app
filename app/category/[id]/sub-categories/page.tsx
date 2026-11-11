"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { useLanguage } from "../../../context/LanguageContext";

export default function SubCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { baseUrl } = useApp();
  const { t } = useLanguage();

  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!baseUrl || !categoryId) return;
    const fetchSubCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${baseUrl}/api/sub_categories/${categoryId}`, {
          headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          const data = await res.json();
          setSubCategories(Array.isArray(data) ? data : Object.values(data || {}));
        }
      } catch (e) {
        console.error("Failed to fetch sub-categories", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubCategories();
  }, [baseUrl, categoryId]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mb-2 bg-white">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-semibold text-[#111] truncate max-w-[200px]">{t("Sub-Categories")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-5 mt-2">
        {isLoading ? (
          <p className="text-center text-[#757575] mt-10">{t("Loading...")}</p>
        ) : subCategories.length === 0 ? (
          <p className="text-center text-[#757575] mt-10">{t("No sub-categories found.")}</p>
        ) : (
          <>
            <h2 className="text-[17px] font-semibold text-[#111] mb-5">{t("Showing ____ Sub-Categories", subCategories.length)}</h2>

            <div className="flex flex-col space-y-[2px]">
              {subCategories.map((subCat: any, index: number) => {
                const displayIndex = index < 9 ? `0${index + 1}` : `${index + 1}`;

                return (
                  <Link
                    key={subCat.id}
                    href={`/courses?category=${subCat.id}`}
                    className="bg-white py-3 flex items-center"
                  >
                    {/* Large Index Number */}
                    <div className="w-[60px] shrink-0 text-[#757575] opacity-60 text-[40px] font-medium leading-none">
                      {displayIndex}
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 flex flex-col justify-center px-2">
                      <p className="text-[11px] text-[#757575] mb-1">
                        {t("____ Courses", subCat.number_of_courses ?? 0)}
                      </p>
                      <h3 className="font-medium text-[#111] text-[16px] leading-tight">
                        {subCat.title ?? subCat.name}
                      </h3>
                    </div>

                    {/* Right Arrow Button */}
                    <div
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 ml-2"
                      style={{ background: 'linear-gradient(to right, #CC61FF, #5851EF)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
