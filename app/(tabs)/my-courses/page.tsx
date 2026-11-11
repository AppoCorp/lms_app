"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyCourses } from "../../../hooks/useMyCourses";
import { useLanguage } from "../../context/LanguageContext";

export default function MyCoursesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { myCourses, isLoadingMyCourses } = useMyCourses();

  const PlaceholderImage = () => (
    <div className="w-full h-[120px] bg-[#E8EDF1] flex items-center justify-center rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-14 pb-6 px-4">
      <div className="mb-6 px-1">
        <h1 className="text-[18px] font-medium text-[#111]">{t("My Courses")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLoadingMyCourses ? (
          <div className="col-span-2 text-center text-sm text-gray-500 py-4">{t("Loading my courses...")}</div>
        ) : myCourses.map((course) => (
          <Link 
            key={course.id} 
            href={`/my-course/${course.id}`}
            className="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col pb-4"
          >
            <div className="p-2 w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#E8EDF1]">
              {course.thumbnail && !course.thumbnail.includes('placeholder') ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <PlaceholderImage />
              )}
            </div>
            
            <div className="px-2">
              <div className="h-[46px] flex items-center mb-1 mt-1">
                <h3 className="font-medium text-[#111] text-[14px] leading-snug line-clamp-2">
                  {course.title}
                </h3>
              </div>
              
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF9800" stroke="#FF9800" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span className="text-[11px] text-[#757575] mr-1">{course.average_rating ? Number(course.average_rating).toFixed(1) : "0.0"}</span>
                <span className="text-[11px] text-[#757575]">({t("____ Reviews", course.total_reviews || 0)})</span>
              </div>
              
              <div className="w-full h-[6px] bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-[#5851EF] rounded-full"
                  style={{ width: `${course.completion || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-[#757575]">
                <span>{t("____% completed", course.completion || 0)}</span>
                <span>{course.total_number_of_completed_lessons || 0}/{course.total_number_of_lessons || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
