"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourses } from "../../hooks/useCourses";
import { useLanguage } from "../context/LanguageContext";

function CoursesContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { topCourses, isLoadingTopCourses, fetchTopCourses, fetchFilteredCourses } = useCourses();

  useEffect(() => {
    const category_id = searchParams.get("category_id");
    const price = searchParams.get("price");
    const level = searchParams.get("level");
    const language = searchParams.get("language");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");

    if (category_id || price || level || language || rating || search) {
      fetchFilteredCourses(
        category_id || "all",
        price || "all",
        level || "all",
        language || "all",
        rating || "all",
        search || ""
      );
    } else {
      fetchTopCourses();
    }
  }, [fetchTopCourses, fetchFilteredCourses, searchParams]);

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
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mb-2 bg-white">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-semibold text-[#111]">{t("Courses")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-5 mt-2">
        <h2 className="text-[17px] font-semibold text-[#111] mb-5">{t("Showing ____ Courses", topCourses.length)}</h2>
        
        <div className="flex flex-col space-y-4">
          {isLoadingTopCourses ? (
             <div className="text-center text-gray-500 py-10">{t("Loading courses...")}</div>
          ) : topCourses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`} className="bg-white rounded-[20px] p-[10px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center min-h-[140px]">
              <div className="w-[120px] h-[120px] shrink-0 mr-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center py-2 h-full">
                <h3 className="font-semibold text-[#111] text-[16px] leading-tight mb-3 line-clamp-2">{course.title}</h3>
                <div className="flex items-center text-[13px] text-[#757575] mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF9800" stroke="#FF9800" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-[2px]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span className="text-[#FF9800] mr-1">{course.average_rating ? Number(course.average_rating).toFixed(1) : "0.0"}</span> {t("(____ Reviews)", course.total_reviews || 0)}
                </div>
                {course.is_paid === 0 || course.isFree ? (
                  <span className="font-bold text-[18px] text-[#111]">{t("Free")}</span>
                ) : (
                  <span className="font-bold text-[18px] text-[#111]">{course.price}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AllCoursesPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">{t("Loading...")}</div>}>
      <CoursesContent />
    </Suspense>
  );
}
