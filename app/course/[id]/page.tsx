"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourses } from "../../../hooks/useCourses";
import { useAuth } from "../../context/AuthContext";
import { useMyCourses } from "../../../hooks/useMyCourses";
import { useWishlist } from "../../../hooks/useWishlist";
import { AlertPopup } from "../../components/AlertPopup";
import { useLanguage } from "../../context/LanguageContext";

const parseList = (data: any): string[] => {
  if (Array.isArray(data)) return data.map(String);
  if (data && typeof data === "object") return Object.values(data).map(String);
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { fetchCourseDetails, enrollFreeCourse } = useCourses();
  const { token } = useAuth();
  const { t } = useLanguage();
  const { toggleWishlist } = useWishlist();

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<"includes" | "outcomes" | "required">("includes");
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showAlert = (message: string, type: "success" | "error" | "info" = "info") => {
    setAlertState({ isOpen: true, message, type });
  };

  const handleEnroll = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setIsEnrolling(true);
    try {
      const res = await enrollFreeCourse(id as string);
      if (res && (res.status === true || res.status === 1 || (res.message && res.message.toLowerCase().includes("enrolled")))) {
        showAlert(res.message || t("Enrolled successfully!"), "success");
        await refreshCourseData();
        setTimeout(() => {
          router.push(`/my-course/${id}`);
        }, 800);
      } else {
        showAlert(res?.message || t("Failed to enroll. Please try again."), "error");
      }
    } catch (err: any) {
      showAlert(err?.message || t("Something went wrong. Please try again."), "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  const isWishlisted = Boolean(course?.is_wishlisted && course.is_wishlisted !== "false" && course.is_wishlisted !== 0);

  const handleToggleWishlist = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!token) {
      showAlert(t("Please log in to manage your wishlist"), "info");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
      return;
    }
    const currentIsWishlisted = isWishlisted;
    setCourse((prev: any) => prev ? { ...prev, is_wishlisted: !currentIsWishlisted } : prev);
    try {
      const res = await toggleWishlist(id as string);
      const isNowWishlisted = res?.status === "added" ? true : res?.status === "removed" ? false : !currentIsWishlisted;
      setCourse((prev: any) => prev ? { ...prev, is_wishlisted: isNowWishlisted } : prev);
      showAlert(
        isNowWishlisted ? t("Added to wishlist") : t("Removed from wishlist"),
        "success"
      );
    } catch (err) {
      setCourse((prev: any) => prev ? { ...prev, is_wishlisted: currentIsWishlisted } : prev);
      showAlert(t("Failed to update wishlist"), "error");
    }
  };

  const { toggleLessonCompleted, fetchCourseSections } = useMyCourses();

  const refreshCourseData = async () => {
    const data = await fetchCourseDetails(id as string);
    if (data) {
      setCourse(data);
      const isPurchased = data.is_purchased === 1 || data.is_purchased === true;
      if (isPurchased) {
        try {
          const sectionsList = await fetchCourseSections(id as string);
          setSections(sectionsList || []);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchCourseDetails(id as string);
      setCourse(data);
      
      const isPurchased = data && (data.is_purchased === 1 || data.is_purchased === true);
      if (isPurchased) {
        try {
          const sectionsList = await fetchCourseSections(id as string);
          setSections(sectionsList || []);
        } catch (e) {
          console.error(e);
          const fallbackSections = data && data.sections ? (Array.isArray(data.sections) ? data.sections : Object.values(data.sections)) : [];
          setSections(fallbackSections);
        }
      } else {
        const fallbackSections = data && data.sections ? (Array.isArray(data.sections) ? data.sections : Object.values(data.sections)) : [];
        setSections(fallbackSections);
      }
      setIsLoading(false);
    };
    loadData();
  }, [id, fetchCourseDetails, fetchCourseSections]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#5851EF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#757575]">
        {t("Course not found.")}
      </div>
    );
  }

  const includes = parseList(course.includes);
  const outcomes = parseList(course.outcomes);
  const requirements = parseList(course.requirements);

  const isPurchased = course.is_purchased === 1 || course.is_purchased === true;
  const isPaid = course.is_paid === 1;
  const price = isPaid ? (course.price ?? "") : t("Free");

  const toggleSection = (i: number) => {
    setOpenSections(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const tabLabels = { includes: t("Includes"), outcomes: t("Outcomes"), required: t("Required") };

  const tabContent = {
    includes: (
      <div className="px-4 pt-3 pb-4">
        <p className="text-[15px] font-semibold text-[#111] mb-3">{t("What is Included")}</p>
        {includes.length === 0 ? (
          <p className="text-[#757575] text-sm">{t("No info available.")}</p>
        ) : (
          <ul className="space-y-2">
            {includes.map((item, i) => (
              <li key={i} className="flex items-center border-b border-[#F0F0F0] pb-2 last:border-0">
                <span className="text-[#757575] text-[14px]">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    outcomes: (
      <div className="px-4 pt-3 pb-4">
        <p className="text-[15px] font-semibold text-[#111] mb-3">{t("What you will learn")}</p>
        {outcomes.length === 0 ? (
          <p className="text-[#757575] text-sm">{t("No outcomes listed.")}</p>
        ) : (
          <ul className="space-y-2">
            {outcomes.map((item, i) => (
              <li key={i} className="text-[14px] text-[#757575]">{item}</li>
            ))}
          </ul>
        )}
      </div>
    ),
    required: (
      <div className="px-4 pt-3 pb-4">
        <p className="text-[15px] font-semibold text-[#111] mb-3">{t("Course Requirements")}</p>
        {requirements.length === 0 ? (
          <p className="text-[#757575] text-sm">{t("No requirements listed.")}</p>
        ) : (
          <ul className="space-y-2">
            {requirements.map((item, i) => (
              <li key={i} className="text-[14px] text-[#757575]">{item}</li>
            ))}
          </ul>
        )}
      </div>
    ),
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Thumbnail + Back + Play + Heart */}
      <div className="relative w-full bg-[#E8EDF1] rounded-b-[28px] overflow-hidden" style={{ height: "260px" }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}

        {/* Back */}
        <button onClick={() => router.back()} className="absolute top-10 left-4 z-20 cursor-pointer p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[50px] h-[50px] rounded-full bg-white shadow-md flex items-center justify-center pointer-events-auto cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#333" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>

        {/* Heart / Wishlist */}
        <button
          onClick={handleToggleWishlist}
          aria-label={t("Toggle Wishlist")}
          className="absolute top-8 right-4 z-20 p-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shadow-md transition-colors"
            style={{ background: isWishlisted ? "white" : "rgba(150,150,150,0.35)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill={isWishlisted ? "#5851EF" : "white"} stroke={isWishlisted ? "#5851EF" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        </button>
      </div>

      {/* Body content */}
      <div className="px-5 pt-5">
        {/* Title + Share */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-[18px] font-medium text-[#111] flex-1 pr-4 leading-snug">{course.title}</h1>
          <button className="mt-1 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
        </div>

        {/* Rating + Reviews + Price */}
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span className="text-[15px] text-[#757575] mr-1">{course.average_rating ?? "0.0"}</span>
          <span className="text-[15px] text-[#757575]">{t("(____ Reviews)", course.total_reviews ?? 0)}</span>
          <div className="flex-1" />
          <span className="text-[26px] font-medium text-[#111]">{price}</span>
        </div>

        {isPurchased && (
          <div className="bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-4 mb-6">
            <div className="w-full h-[6px] bg-gray-200 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-[#5851EF] rounded-full transition-all duration-300"
                style={{ width: `${course.completion || 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-[#757575] font-medium">
              <span>{t("____% Complete", course.completion || 0)}</span>
              <span>{course.total_number_of_completed_lessons || 0}/{course.total_number_of_lessons || 0}</span>
            </div>
          </div>
        )}

        {/* Includes / Outcomes / Required Tab Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] mb-5 overflow-hidden">
          {/* Tab Header */}
          <div className="flex p-2 gap-1">
            {(["includes", "outcomes", "required"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors"
                style={activeTab === tab
                  ? { background: "#5851EF", color: "white" }
                  : { background: "transparent", color: "#555" }
                }
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="min-h-[150px] max-h-[215px] overflow-y-auto">
            {tabContent[activeTab]}
          </div>
        </div>

        {/* Course Curriculum */}
        <p className="text-[17px] font-medium text-[#111] mb-3 px-1">{t("Course curriculum")}</p>
        {sections.length === 0 ? (
          <p className="text-[#757575] text-sm px-1">{t("No curriculum available.")}</p>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {sections.map((section: any, i: number) => {
              const isOpen = openSections.includes(i);
              const lessons: any[] = Array.isArray(section.lessons) ? section.lessons : Object.values(section.lessons || {});
              const totalDuration = section.total_duration ?? section.duration ?? "";
              const lessonCount = lessons.length;

              return (
                <div key={i} className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-4 py-4"
                    onClick={() => toggleSection(i)}
                  >
                    <div className="text-left flex-1">
                      <p className="text-[14px] font-medium text-[#111]">
                        {i + 1}. {section.title}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {totalDuration ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium text-[#5851EF]" style={{ background: "#E8F0FE" }}>
                            {totalDuration}
                          </span>
                        ) : null}
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium text-[#E67E22]" style={{ background: "#FEF5E8" }}>
                          {t("____ Lessons", lessonCount)}
                        </span>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5851EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {isOpen && lessons.length > 0 && (
                    <div className="border-t border-[#F0F0F0]">
                      {lessons.map((lesson: any, li: number) => {
                        const isCompleted = lesson.is_completed === "1" || lesson.is_completed == 1;
                        const isLocked = lesson.is_lock === 1 || lesson.is_lock === "1" || lesson.is_locked === true;
                        return (
                          <div 
                            key={li} 
                            onClick={() => {
                              if (isLocked) {
                                showAlert(t("This lesson is locked by Drip Content. Please complete previous lessons first."), "info");
                                return;
                              }
                              if (isPurchased) {
                                if (lesson.lesson_type === 'quiz') {
                                  router.push(`/quiz/${lesson.id}?course_id=${id}`);
                                } else {
                                  router.push(`/learn/${id}?lesson_id=${lesson.id}`);
                                }
                              }
                            }}
                            className={`flex items-center px-4 py-3 border-b border-[#F8F8F8] last:border-0 ${
                              isLocked ? 'bg-gray-50/70 opacity-75 cursor-not-allowed' : isPurchased ? 'cursor-pointer hover:bg-gray-50/50' : ''
                            }`}
                          >
                            {isPurchased && (
                              <button 
                                disabled={isLocked}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (isLocked) return;
                                  const newProgress = isCompleted ? 0 : 100;
                                  try {
                                    await toggleLessonCompleted(lesson.id, newProgress);
                                    await refreshCourseData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="mr-3 shrink-0"
                              >
                                {isLocked ? (
                                  <div className="w-[18px] h-[18px] rounded-[3px] bg-gray-200 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                  </div>
                                ) : isCompleted ? (
                                  <div className="w-[18px] h-[18px] rounded-[3px] bg-[#5851EF] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  </div>
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#111] bg-white"></div>
                                )}
                              </button>
                            )}

                            <div className="mr-3 shrink-0 text-[#757575] flex items-center">
                              {isLocked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                              ) : !isPurchased ? (
                                <div className="w-8 h-8 rounded-full border border-[#DDD] flex items-center justify-center shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                  </svg>
                                </div>
                              ) : ["video-url", "vimeo-url", "google_drive", "system-video"].includes(lesson.lesson_type) ? (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.86333 15.0058C9.47833 15.0058 9.12083 14.9141 8.8 14.7308C8.06666 14.3091 7.645 13.4474 7.645 12.3566V9.64328C7.645 8.56161 8.06666 7.69078 8.8 7.26911C9.53333 6.84744 10.4867 6.91161 11.4308 7.46161L13.7867 8.81828C14.7217 9.35911 15.2625 10.1566 15.2625 10.9999C15.2625 11.8433 14.7217 12.6408 13.7867 13.1816L11.4308 14.5383C10.8992 14.8499 10.3583 15.0058 9.86333 15.0058ZM9.8725 8.36911C9.72583 8.36911 9.5975 8.39661 9.49666 8.46078C9.20333 8.63494 9.02916 9.06578 9.02916 9.64328V12.3566C9.02916 12.9341 9.19416 13.3649 9.49666 13.5391C9.79 13.7133 10.2483 13.6399 10.7525 13.3466L13.1083 11.9899C13.6125 11.6966 13.8967 11.3391 13.8967 10.9999C13.8967 10.6608 13.6125 10.2941 13.1083 10.0099L10.7525 8.65328C10.4225 8.46078 10.12 8.36911 9.8725 8.36911Z" fill="currentColor"/>
                                  <path d="M11 20.8542C5.56417 20.8542 1.14584 16.4359 1.14584 11C1.14584 5.56421 5.56417 1.14587 11 1.14587C16.4358 1.14587 20.8542 5.56421 20.8542 11C20.8542 16.4359 16.4358 20.8542 11 20.8542ZM11 2.52087C6.325 2.52087 2.52084 6.32504 2.52084 11C2.52084 15.675 6.325 19.4792 11 19.4792C15.675 19.4792 19.4792 15.675 19.4792 11C19.4792 6.32504 15.675 2.52087 11 2.52087Z" fill="currentColor"/>
                                </svg>
                              ) : lesson.lesson_type === "quiz" ? (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11 20.24C10.725 20.24 10.45 20.1758 10.2208 20.0475C8.50667 19.1125 5.49084 18.1225 3.6025 17.875L3.33667 17.8383C2.13584 17.6916 1.14584 16.5641 1.14584 15.345V4.27163C1.14584 3.54747 1.43 2.88747 1.9525 2.4108C2.475 1.93413 3.15334 1.70497 3.86834 1.76913C5.885 1.92497 8.92834 2.9333 10.6517 4.01497L10.8717 4.1433C10.9358 4.17997 11.0733 4.17997 11.1283 4.15247L11.275 4.0608C12.9983 2.97913 16.0417 1.95247 18.0675 1.7783C18.0858 1.7783 18.1592 1.7783 18.1775 1.7783C18.8467 1.71413 19.5342 1.95247 20.0475 2.42913C20.57 2.9058 20.8542 3.5658 20.8542 4.28997V15.3541C20.8542 16.5825 19.8642 17.7008 18.6542 17.8475L18.3517 17.8841C16.4633 18.1316 13.4383 19.1308 11.7608 20.0566C11.5408 20.185 11.275 20.24 11 20.24ZM3.64834 3.13497C3.355 3.13497 3.08917 3.2358 2.87834 3.4283C2.64917 3.63913 2.52084 3.94163 2.52084 4.27163V15.345C2.52084 15.8858 2.98834 16.4083 3.51084 16.4816L3.78584 16.5183C5.84834 16.7933 9.01084 17.8291 10.8442 18.8283C10.9267 18.865 11.0458 18.8741 11.0917 18.8558C12.925 17.8383 16.1058 16.7933 18.1775 16.5183L18.4892 16.4816C19.0117 16.4175 19.4792 15.8858 19.4792 15.345V4.2808C19.4792 3.94163 19.3508 3.6483 19.1217 3.4283C18.8833 3.21747 18.5808 3.11663 18.2417 3.13497C18.2233 3.13497 18.15 3.13497 18.1317 3.13497C16.3808 3.2908 13.5575 4.23497 12.0175 5.19747L11.8708 5.2983C11.3667 5.60997 10.6517 5.60997 10.1658 5.30747L9.94584 5.17913C8.37834 4.21663 5.555 3.28163 3.75834 3.13497C3.72167 3.13497 3.685 3.13497 3.64834 3.13497Z" fill="currentColor"/>
                                  <path d="M11 19.47C10.6242 19.47 10.3125 19.1583 10.3125 18.7825V5.03247C10.3125 4.65664 10.6242 4.34497 11 4.34497C11.3758 4.34497 11.6875 4.65664 11.6875 5.03247V18.7825C11.6875 19.1675 11.3758 19.47 11 19.47Z" fill="currentColor"/>
                                  <path d="M7.10416 8.46997H5.04166C4.66583 8.46997 4.35416 8.1583 4.35416 7.78247C4.35416 7.40664 4.66583 7.09497 5.04166 7.09497H7.10416C7.48 7.09497 7.79166 7.40664 7.79166 7.78247C7.79166 8.1583 7.48 8.46997 7.10416 8.46997Z" fill="currentColor"/>
                                  <path d="M7.79166 11.22H5.04166C4.66583 11.22 4.35416 10.9083 4.35416 10.5325C4.35416 10.1566 4.66583 9.84497 5.04166 9.84497H7.79166C8.1675 9.84497 8.47916 10.1566 8.47916 10.5325C8.47916 10.9083 8.1675 11.22 7.79166 11.22Z" fill="currentColor"/>
                                </svg>
                              ) : lesson.lesson_type === "text" ? (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.75 20.8543H8.25C3.2725 20.8543 1.14584 18.7277 1.14584 13.7502V8.25016C1.14584 3.27266 3.2725 1.146 8.25 1.146H13.75C18.7275 1.146 20.8542 3.27266 20.8542 8.25016V13.7502C20.8542 18.7277 18.7275 20.8543 13.75 20.8543ZM8.25 2.521C4.02417 2.521 2.52084 4.02433 2.52084 8.25016V13.7502C2.52084 17.976 4.02417 19.4793 8.25 19.4793H13.75C17.9758 19.4793 19.4792 17.976 19.4792 13.7502V8.25016C19.4792 4.02433 17.9758 2.521 13.75 2.521H8.25Z" fill="currentColor"/>
                                  <path d="M6.41667 8.8276C6.16917 8.8276 5.92167 8.6901 5.8025 8.45177C5.62833 8.1126 5.76583 7.7001 6.105 7.52593C9.16667 5.9951 12.8242 5.9951 15.8858 7.52593C16.225 7.7001 16.3625 8.1126 16.1975 8.45177C16.0233 8.79093 15.62 8.92843 15.2717 8.76343C12.595 7.4251 9.39583 7.4251 6.71917 8.76343C6.6275 8.80927 6.5175 8.8276 6.41667 8.8276Z" fill="currentColor"/>
                                  <path d="M11 15.6201C10.6242 15.6201 10.3125 15.3085 10.3125 14.9326V7.26929C10.3125 6.89345 10.6242 6.58179 11 6.58179C11.3758 6.58179 11.6875 6.89345 11.6875 7.26929V14.9418C11.6875 15.3176 11.3758 15.6201 11 15.6201Z" fill="currentColor"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.75 20.8542H8.25C3.2725 20.8543 1.14584 18.7277 1.14584 13.7502V8.25016C1.14584 3.27266 3.2725 1.146 8.25 1.146H13.75C18.7275 1.146 20.8542 3.27266 20.8542 8.25016V13.7502C20.8542 18.7277 18.7275 20.8543 13.75 20.8543ZM8.25 2.521C4.02417 2.521 2.52084 4.02433 2.52084 8.25016V13.7502C2.52084 17.976 4.02417 19.4793 8.25 19.4793H13.75C17.9758 19.4793 19.4792 17.976 19.4792 13.7502V8.25016C19.4792 4.02433 17.9758 2.521 13.75 2.521H8.25Z" fill="currentColor"/>
                                  <path d="M8.8 14.4652C8.62583 14.4652 8.45166 14.401 8.31416 14.2635L6.03166 11.981C5.49083 11.4402 5.49083 10.5693 6.03166 10.0285L8.31416 7.74601C8.58 7.48017 9.02 7.48017 9.28583 7.74601C9.55166 8.01184 9.55166 8.45184 9.28583 8.71767L7.00333 11.0002L9.28583 13.2918C9.55166 13.5577 9.55166 13.9977 9.28583 14.2635C9.14833 14.3918 8.97416 14.4652 8.8 14.4652Z" fill="currentColor"/>
                                  <path d="M13.2 14.4651C13.0258 14.4651 12.8517 14.4009 12.7142 14.2634C12.4483 13.9976 12.4483 13.5576 12.7142 13.2917L14.9967 11.0001L12.7142 8.7084C12.4483 8.44256 12.4483 8.00256 12.7142 7.73673C12.98 7.4709 13.42 7.4709 13.6858 7.73673L15.9683 10.0192C16.5092 10.5601 16.5092 11.4309 15.9683 11.9717L13.6858 14.2542C13.5575 14.3917 13.3742 14.4651 13.2 14.4651Z" fill="currentColor"/>
                                </svg>
                              )}
                            </div>

                            <span className="text-[13px] text-[#333] flex-1">{lesson.title ?? lesson.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom bar — matches Flutter exactly */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-5 py-3 flex items-center z-50">
        {/* Account icon */}
        <div className="flex flex-col items-center mr-4">
          <button onClick={() => router.push("/account")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <span className="text-[11px] text-[#B0BEC5] font-medium">{t("Account")}</span>
        </div>

        {/* Divider */}
        <div className="h-10 w-[1px] bg-[#E0E0E0] mr-4" />

        {/* Action buttons */}
        <div className="flex flex-1 gap-2">
          {isPurchased ? (
            /* Purchased → green button */
            <button
              onClick={() => router.push(`/my-course/${course.id}`)}
              className="flex-1 py-3 rounded-xl text-white text-[14px] font-medium"
              style={{ background: "#27AE60" }}
            >
              {isPaid ? t("Purchased") : t("Enrolled")}
            </button>
          ) : isPaid ? (
            <button
              onClick={isWishlisted ? () => router.push("/my-wishlists") : handleToggleWishlist}
              className="flex-1 py-3 rounded-xl text-[14px] font-medium border border-[#5851EF] active:scale-[0.98] transition-all"
              style={{
                color: isWishlisted ? "white" : "#5851EF",
                background: isWishlisted ? "#5851EF" : "white"
              }}
            >
              {isWishlisted ? t("View Wishlist") : t("Add to Wishlist")}
            </button>
          ) : (
            /* Free → Enroll Now */
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="flex-1 py-3 rounded-xl text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: "#5851EF" }}
            >
              {isEnrolling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("Enrolling...")}</span>
                </>
              ) : (
                t("Enroll Now")
              )}
            </button>
          )}
        </div>
      </div>
      <AlertPopup
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
