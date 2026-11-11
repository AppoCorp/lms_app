"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCategories } from "../../../hooks/useCategories";
import { useLanguage } from "../../context/LanguageContext";

export default function CategoryDetailPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useParams();
  const categoryId = params.id as string;
  
  const { categoryCourses, isLoadingCategoryCourses, fetchCategoryWiseCourses, categories, fetchCategories } = useCategories();
  const [catTitle, setCatTitle] = useState("");

  useEffect(() => {
    fetchCategoryWiseCourses(categoryId);
  }, [categoryId, fetchCategoryWiseCourses]);
  
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    } else {
      const found = categories.find((c: any) => c.id.toString() === categoryId);
      if (found) setCatTitle(found.title);
    }
  }, [categories, categoryId, fetchCategories]);

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
    <div className="flex flex-col min-h-screen bg-white pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mb-4 bg-white">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-semibold text-[#111] truncate max-w-[200px]">{catTitle || t("Category Details")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-5">
        {/* Sub Categories Section */}
        <div className="mb-10 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[17px] font-semibold text-[#111]">{t("Sub Categories")}</h2>
            <Link href={`/category/${categoryId}/sub-categories`} className="text-[15px] text-[#5851EF] font-medium flex items-center">
              {t("Show all")}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          
          <div className="min-h-[100px]">
            {/* Empty space as seen in the screenshot */}
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[17px] font-semibold text-[#111]">{t("Courses")}</h2>
            <Link href="/courses" className="text-[15px] text-[#5851EF] font-medium flex items-center">
              {t("All courses")}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-hide">
            {isLoadingCategoryCourses ? (
              <div className="text-sm text-gray-500 py-4 w-full text-center">{t("Loading...")}</div>
            ) : categoryCourses.length === 0 ? (
               <div className="text-sm text-gray-500 py-4 w-full text-center">{t("No courses found")}</div>
            ) : categoryCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="min-w-[170px] w-[170px] bg-white rounded-[20px] p-[10px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col">
                <div className="w-full aspect-[4/3] mb-3">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
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
                    <span className="text-[#FF9800] mr-1">{course.average_rating ? Number(course.average_rating).toFixed(1) : "0.0"}</span> {t("(____ Reviews)", course.total_reviews || 0)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
