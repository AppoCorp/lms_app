"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCourses } from "../../../hooks/useCourses";
import { useCategories } from "../../../hooks/useCategories";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { topCourses, isLoadingTopCourses, fetchTopCourses } = useCourses();
  const { categories, fetchCategories, isLoadingCategories } = useCategories();
  const { baseUrl } = useApp();

  useEffect(() => {
    if (baseUrl) {
      fetchCategories();
      fetchTopCourses();
    }
  }, [baseUrl, fetchCategories, fetchTopCourses]);

  const PlaceholderImage = () => (
    <div className="w-full h-full bg-[#E8EDF1] flex items-center justify-center rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pt-10">


      <div className="px-5">
        {/* Top Courses Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[22px] font-semibold text-[#111]">{t("Top Course")}</h2>
            <Link href="/courses" className="text-[15px] text-[#5851EF] font-medium flex items-center">
              {t("All courses")}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-hide">
            {isLoadingTopCourses ? (
              <div className="p-4 text-center w-full text-sm text-gray-500">{t("Loading top courses...")}</div>
            ) : topCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="min-w-[170px] w-[170px] bg-white rounded-[20px] p-[10px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                <div className="w-full aspect-[4/3] mb-3 rounded-xl overflow-hidden bg-[#E8EDF1]">
                  {course.thumbnail && !course.thumbnail.includes('placeholder') ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlaceholderImage />
                  )}
                </div>
                <div className="flex-1 flex flex-col px-1">
                  <h3 className="font-semibold text-[#111] text-[15px] leading-tight mb-2 line-clamp-2 min-h-[38px]">{course.title}</h3>
                  <div className="flex items-center text-[13px] text-[#757575]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF9800" stroke="#FF9800" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-[2px]">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="text-[#FF9800] mr-1">{course.average_rating || "0.0"}</span> ({t("____ Reviews", course.total_reviews || 0)})
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Course Categories Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[22px] font-semibold text-[#111]">{t("Course Categories")}</h2>
            <Link href="/courses" className="text-[15px] text-[#5851EF] font-medium flex items-center">
              {t("All courses")}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          
          <div className="flex flex-col space-y-[1px] bg-gray-200">
            {isLoadingCategories ? (
               <div className="p-4 text-center text-sm text-gray-500 bg-white">{t("Loading categories...")}</div>
            ) : categories.map((cat, idx) => (
              <Link key={cat.id} href={`/category/${cat.id}`} className="bg-white py-4 flex items-center">
                <div className="w-[100px] h-[75px] rounded-xl overflow-hidden mr-4 shadow-sm bg-[#E8EDF1]">
                  {cat.thumbnail && !cat.thumbnail.includes('placeholder') ? (
                    <img src={cat.thumbnail} alt={cat.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlaceholderImage />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[13px] text-[#757575] font-medium mb-1">{t("____ sub-categories", cat.number_of_sub_categories || 0)}</p>
                  <h3 className="font-semibold text-[#111] text-[15px] leading-tight">{cat.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center ml-2" style={{ background: 'linear-gradient(to right, #CC61FF, #5851EF)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
