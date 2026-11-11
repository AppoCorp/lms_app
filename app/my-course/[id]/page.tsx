"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMyCourses } from "../../../hooks/useMyCourses";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function MyCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const { myCourses, fetchCourseSections, fetchLiveClass, toggleLessonCompleted } = useMyCourses();
  const { baseUrl } = useApp();
  const { token, user } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"lessons" | "summary" | "liveClass" | "certificate" | "noticeBoard">("lessons");
  const [openAccordionIds, setOpenAccordionIds] = useState<number[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [liveClassData, setLiveClassData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [notices, setNotices] = useState<any[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);

  const course = myCourses.find(c => c.id.toString() === courseId) || null;

  const handleLessonClick = (lesson: any) => {
    if (lesson.lesson_type === "quiz") {
      router.push(`/quiz/${lesson.id}?course_id=${courseId}`);
    } else {
      router.push(`/learn/${courseId}?lesson_id=${lesson.id}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [sectionsData, liveData] = await Promise.allSettled([
          fetchCourseSections(courseId),
          fetchLiveClass(courseId)
        ]);
        
        if (sectionsData.status === "fulfilled" && sectionsData.value) {
          setSections(sectionsData.value);
          if (sectionsData.value.length > 0) {
            setOpenAccordionIds([sectionsData.value[0].id]);
          }
        }
        
        if (liveData.status === "fulfilled" && liveData.value) {
          setLiveClassData(liveData.value);
        }
      } catch (e) {
        console.error("Failed to load course details", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId) {
      loadData();
    }
  }, [courseId, fetchCourseSections, fetchLiveClass]);

  useEffect(() => {
    if (!baseUrl || !courseId) return;

    // Fetch certificate status on load
    const fetchCertificate = async () => {
      setIsLoadingCertificate(true);
      try {
        const userIdParam = user?.id ? `&user_id=${user.id}` : "";
        const res = await fetch(`${baseUrl}/api/certificate_status?course_id=${courseId}${userIdParam}`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setCertificateInfo(data);
        }
      } catch (e) {
        console.error("Failed to fetch certificate status", e);
      } finally {
        setIsLoadingCertificate(false);
      }
    };
    fetchCertificate();
  }, [baseUrl, token, user?.id, courseId]);

  useEffect(() => {
    if (!baseUrl || !token || !courseId) return;

    if (activeTab === "noticeBoard") {
      const fetchNotices = async () => {
        setIsLoadingNotices(true);
        try {
          const res = await fetch(`${baseUrl}/api/notice_board?course_id=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setNotices(Array.isArray(data) ? data : []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingNotices(false);
        }
      };
      fetchNotices();
    }
  }, [activeTab, baseUrl, token, courseId]);

  const [downloadToast, setDownloadToast] = useState(false);

  const openCertificateUrl = (url: string) => {
    if (!url) return;
    const finalUrl = url.includes("auto_download") ? url : `${url}${url.includes("?") ? "&" : "?"}auto_download=1`;

    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);

    // Open certificate page in a new tab to allow html2canvas rendering & direct PNG download
    window.open(finalUrl, "_blank");
  };

  const handleGetCertificate = async () => {
    if (certificateInfo?.download_url) {
      openCertificateUrl(certificateInfo.download_url);
      return;
    }
    if (certificateInfo?.identifier && baseUrl) {
      openCertificateUrl(`${baseUrl}/certificate/${certificateInfo.identifier}`);
      return;
    }

    let targetUrl: string | null = null;

    if (baseUrl && courseId) {
      try {
        const userIdParam = user?.id ? `&user_id=${user.id}` : "";
        const res = await fetch(`${baseUrl}/api/certificate_status?course_id=${courseId}${userIdParam}`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setCertificateInfo(data);
          if (data.download_url) {
            targetUrl = data.download_url;
          } else if (data.identifier) {
            targetUrl = `${baseUrl}/certificate/${data.identifier}`;
          }
        }
      } catch (e) {
        console.error("Failed to fetch certificate status", e);
      }
    }

    if (!targetUrl && baseUrl && courseId) {
      targetUrl = `${baseUrl}/certificate/${courseId}${user?.id ? `?user_id=${user.id}` : ""}`;
    }

    if (targetUrl) {
      openCertificateUrl(targetUrl);
    }
  };

  const handleShareCertificate = async () => {
    let certUrl = certificateInfo?.download_url;
    if (!certUrl && certificateInfo?.identifier && baseUrl) {
      certUrl = `${baseUrl}/certificate/${certificateInfo.identifier}`;
    }
    if (!certUrl && baseUrl && courseId) {
      certUrl = `${baseUrl}/certificate/${courseId}${user?.id ? `?user_id=${user.id}` : ""}`;
    }
    if (!certUrl) certUrl = window.location.href;

    const shareData = {
      title: t("My Certificate for ____", course?.title || t("Course")),
      text: t("I completed ____ on AppoLearn! Check out my certificate:", course?.title || t("the course")),
      url: certUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(certUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch (e) {
        console.error("Clipboard copy failed", e);
      }
    }
  };

  const toggleAccordion = (id: number) => {
    if (openAccordionIds.includes(id)) {
      setOpenAccordionIds(openAccordionIds.filter(aId => aId !== id));
    } else {
      setOpenAccordionIds([...openAccordionIds, id]);
    }
  };

  const PlaceholderImage = () => (
    <div className="w-full h-full bg-[#E8EDF1] flex items-center justify-center rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-10 pb-6">
      {/* Clipboard copy toast */}
      {shareCopied && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] bg-[#333] text-white text-[13px] font-medium px-4 py-2 rounded-xl shadow-lg">
          {t("Link copied to clipboard!")}
        </div>
      )}

      {/* Download toast */}
      {downloadToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] bg-[#1a237e] text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t("Downloading certificate...")}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>

      </div>

      <div className="px-5 mt-3">
        {/* Course Title above the card */}
        <h1 className="text-[17px] font-semibold text-[#111] mb-5 leading-snug">
          {course ? course.title : t("Course Details")}
        </h1>

        {/* Course Info Card */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-4 mb-6">
          <div className="flex items-start mb-6">
            <div className="w-[72px] h-[54px] shrink-0 mr-4">
              {course?.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <PlaceholderImage />
              )}
            </div>
            <div className="flex-1 flex justify-between relative">
              <h2 className="text-[15px] text-[#111] leading-tight pt-1 pr-2">
                {course ? course.title : ""}
              </h2>
              {/* 3-dot menu */}
              <div className="relative shrink-0">
                <button
                  className="text-[#757575] p-1 -mr-2 -mt-1"
                  onClick={(e) => { e.stopPropagation(); setShowShareMenu(v => !v); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                    <circle cx="12" cy="19" r="2"></circle>
                  </svg>
                </button>
                {showShareMenu && (
                  <>
                    {/* backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                    <div className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] min-w-[160px] overflow-hidden">
                      <button
                        className="w-full text-left px-4 py-3 text-[14px] text-[#111] hover:bg-[#F5F5F5] transition-colors flex items-center gap-2"
                        onClick={async () => {
                          setShowShareMenu(false);
                          const link = course?.shareable_link || window.location.href;
                          if (navigator.share) {
                            try {
                              await navigator.share({ title: course?.title, url: link });
                            } catch (_) {}
                          } else {
                            await navigator.clipboard.writeText(link);
                            setShareCopied(true);
                            setTimeout(() => setShareCopied(false), 2000);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        {t("Share this Course")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full h-[6px] bg-gray-300 rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-[#5851EF] rounded-full transition-all duration-300"
              style={{ width: `${course?.completion || 0}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-[11px] text-[#757575] font-medium">
            <span>{t("____% Complete", course?.completion || 0)}</span>
            <span>{course?.total_number_of_completed_lessons || 0}/{course?.total_number_of_lessons || 0}</span>
          </div>


        </div>

        {/* Tabs Row (Scrollable Horizontal Pills) */}
        <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide py-1">
          {[
            { id: "lessons", label: "Lessons", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> },
            { id: "summary", label: "Summary", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg> },
            { id: "liveClass", label: "Live Class", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> },
            { id: "certificate", label: "Certificate", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> },
            { id: "noticeBoard", label: "Notice Board", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-3 rounded-2xl font-medium text-[14px] whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#5851EF] text-white shadow-sm"
                  : "bg-white text-[#5851EF] border border-gray-100"
              }`}
            >
              {tab.icon}
              {t(tab.label)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "lessons" && (
          <div className="flex flex-col space-y-4">
            {isLoading ? (
              <div className="text-center text-[#757575] py-8 text-[14px]">{t("Loading...")}</div>
            ) : sections.length === 0 ? (
              <div className="text-center text-[#757575] py-8 text-[14px]">
                {t("No lessons found for this course.")}
              </div>
            ) : sections.map((section: any, sIdx: number) => {
              const isAccordionOpen = openAccordionIds.includes(section.id);
              
              return (
                <div key={section.id} className="bg-white rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] p-4 cursor-pointer" onClick={() => toggleAccordion(section.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#111] mb-3">
                        {sIdx + 1}. {section.title}
                      </h3>
                      <div className="flex space-x-3">
                        <div className="bg-[#E0F7FA] text-[#00BCD4] px-2 py-1 rounded-[4px] text-[10px] font-medium tracking-wide">
                          {section.totalDuration || "00:00:00"}
                        </div>
                        <div className="bg-[#FFF3E0] text-[#FF9800] px-2 py-1 rounded-[4px] text-[10px] font-medium tracking-wide">
                          {t("____ Lessons", section.lessons?.length || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 pr-1">
                      {isAccordionOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5851EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      )}
                    </div>
                  </div>

                  {/* Expanded Lessons List */}
                  {isAccordionOpen && (
                    <div className="mt-6 flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>
                      {section.lessons?.map((lesson: any, idx: number, arr: any[]) => (
                        <div key={lesson.id} className="flex flex-col">
                          <div className="flex items-center py-4 cursor-pointer hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors" onClick={() => handleLessonClick(lesson)}>
                            {/* Checkbox */}
                            <button 
                              className="mr-3 shrink-0 cursor-pointer p-1 -m-1 z-10"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const newProgress = lesson.is_completed == 1 ? 0 : 1;
                                try {
                                  await toggleLessonCompleted(lesson.id, newProgress);
                                  const updatedSections = await fetchCourseSections(courseId);
                                  setSections(updatedSections);
                                } catch (err) {
                                  console.error("Error updating progress", err);
                                }
                              }}
                            >
                              {lesson.is_completed == 1 ? (
                                <div className="w-[18px] h-[18px] rounded-[3px] bg-[#5851EF] flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#111] bg-white"></div>
                              )}
                            </button>
                            
                            {/* Icon */}
                            <div className="mr-3 shrink-0 text-[#757575] flex items-center">
                              {["video-url", "vimeo-url", "google_drive", "system-video"].includes(lesson.lesson_type) ? (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.86333 15.0058C9.47833 15.0058 9.12083 14.9141 8.8 14.7308C8.06666 14.3091 7.645 13.4474 7.645 12.3566V9.64328C7.645 8.56161 8.06666 7.69078 8.8 7.26911C9.53333 6.84744 10.4867 6.91161 11.4308 7.46161L13.7867 8.81828C14.7217 9.35911 15.2625 10.1566 15.2625 10.9999C15.2625 11.8433 14.7217 12.6408 13.7867 13.1816L11.4308 14.5383C10.8992 14.8499 10.3583 15.0058 9.86333 15.0058ZM9.8725 8.36911C9.72583 8.36911 9.5975 8.39661 9.49666 8.46078C9.20333 8.63494 9.02916 9.06578 9.02916 9.64328V12.3566C9.02916 12.9341 9.19416 13.3649 9.49666 13.5391C9.79 13.7133 10.2483 13.6399 10.7525 13.3466L13.1083 11.9899C13.6125 11.6966 13.8967 11.3391 13.8967 10.9999C13.8967 10.6608 13.6125 10.2941 13.1083 10.0099L10.7525 8.65328C10.4225 8.46078 10.12 8.36911 9.8725 8.36911Z" fill="currentColor"/>
                                  <path d="M11 20.8542C5.56417 20.8542 1.14584 16.4359 1.14584 11C1.14584 5.56421 5.56417 1.14587 11 1.14587C16.4358 1.14587 20.8542 5.56421 20.8542 11C20.8542 16.4359 16.4358 20.8542 11 20.8542ZM11 2.52087C6.325 2.52087 2.52084 6.32504 2.52084 11C2.52084 15.675 6.325 19.4792 11 19.4792C15.675 19.4792 19.4792 15.675 11 19.4792C19.4792 6.32504 15.675 2.52087 11 2.52087Z" fill="currentColor"/>
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
                              ) : lesson.lesson_type === "document_type" ? (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.75 20.8542H8.25C3.2725 20.8542 1.14584 18.7275 1.14584 13.75V8.25004C1.14584 3.27254 3.2725 1.14587 8.25 1.14587H12.8333C13.2092 1.14587 13.5208 1.45754 13.5208 1.83337C13.5208 2.20921 13.2092 2.52087 12.8333 2.52087H8.25C4.02417 2.52087 2.52084 4.02421 2.52084 8.25004V13.75C2.52084 17.9759 4.02417 19.4792 8.25 19.4792H13.75C17.9758 19.4792 19.4792 17.9759 19.4792 13.75V9.16671C19.4792 8.79087 19.7908 8.47921 20.1667 8.47921C20.5425 8.47921 20.8542 8.79087 20.8542 9.16671V13.75C20.8542 18.7275 18.7275 20.8542 13.75 20.8542Z" fill="currentColor"/>
                                  <path d="M20.1667 9.8542H16.5C13.365 9.8542 12.1458 8.63503 12.1458 5.50003V1.83336C12.1458 1.55836 12.3108 1.3017 12.5675 1.20086C12.8242 1.09086 13.1175 1.15503 13.3192 1.34753L20.6525 8.68086C20.845 8.87336 20.9092 9.17586 20.7992 9.43253C20.6892 9.6892 20.4417 9.8542 20.1667 9.8542ZM13.5208 3.49253V5.50003C13.5208 7.86503 14.135 8.4792 16.5 8.4792H18.5075L13.5208 3.49253Z" fill="currentColor"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.75 20.8543H8.25C3.2725 20.8543 1.14584 18.7277 1.14584 13.7502V8.25016C1.14584 3.27266 3.2725 1.146 8.25 1.146H13.75C18.7275 1.146 20.8542 3.27266 20.8542 8.25016V13.7502C20.8542 18.7277 18.7275 20.8543 13.75 20.8543ZM8.25 2.521C4.02417 2.521 2.52084 4.02433 2.52084 8.25016V13.7502C2.52084 17.976 4.02417 19.4793 8.25 19.4793H13.75C17.9758 19.4793 19.4792 17.976 19.4792 13.7502V8.25016C19.4792 4.02433 17.9758 2.521 13.75 2.521H8.25Z" fill="currentColor"/>
                                  <path d="M8.8 14.4652C8.62583 14.4652 8.45166 14.401 8.31416 14.2635L6.03166 11.981C5.49083 11.4402 5.49083 10.5693 6.03166 10.0285L8.31416 7.74601C8.58 7.48017 9.02 7.48017 9.28583 7.74601C9.55166 8.01184 9.55166 8.45184 9.28583 8.71767L7.00333 11.0002L9.28583 13.2918C9.55166 13.5577 9.55166 13.9977 9.28583 14.2635C9.14833 14.3918 8.97416 14.4652 8.8 14.4652Z" fill="currentColor"/>
                                  <path d="M13.2 14.4651C13.0258 14.4651 12.8517 14.4009 12.7142 14.2634C12.4483 13.9976 12.4483 13.5576 12.7142 13.2917L14.9967 11.0001L12.7142 8.7084C12.4483 8.44256 12.4483 8.00256 12.7142 7.73673C12.98 7.4709 13.42 7.4709 13.6858 7.73673L15.9683 10.0192C16.5092 10.5601 16.5092 11.4309 15.9683 11.9717L13.6858 14.2542C13.5575 14.3917 13.3742 14.4651 13.2 14.4651Z" fill="currentColor"/>
                                </svg>
                              )}
                            </div>

                            {/* Title */}
                            <div className="flex-1 text-[#757575] text-[14px]">
                              {lesson.title}
                            </div>
                          </div>
                          {/* Divider */}
                          {idx < arr.length - 1 && (
                            <div className="h-[1px] bg-gray-200 w-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)] space-y-4">
            <h2 className="text-[17px] font-semibold text-[#111]">{course ? course.title : t("Course Overview")}</h2>
            <p className="text-[14px] text-[#555] leading-relaxed">
              {t("Welcome to ____. Use the curriculum lessons tab above to start watching your course modules.", course?.title || t("this course"))}
            </p>
          </div>
        )}

        {/* Live Class Tab */}
        {activeTab === "liveClass" && (!liveClassData || !liveClassData.live_classes || liveClassData.live_classes.length === 0) && (
          <div className="mt-2 px-2">
            <div className="bg-[#2A2A2A] text-white p-4 rounded-xl text-center text-[15px] leading-relaxed">
              {t("No live class is scheduled for this course yet. Please come back later.")}
            </div>
          </div>
        )}

        {activeTab === "liveClass" && liveClassData?.live_classes?.map((liveClass: any, index: number) => (
          <div key={index} className="bg-white rounded-[16px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] flex flex-col p-4 mb-4 border border-gray-50">
            <div className="flex justify-center items-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span className="ml-2 text-[#111] text-[15px]">{t("Zoom live class schedule")}</span>
            </div>
            <div className="text-center text-[#111] text-[15px] mb-3">
              {liveClassData.zoomSdk || t("active")}
            </div>
            <div className="flex justify-center items-center pb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span className="ml-2 text-[#111] text-[15px]">{liveClass.date_and_time}</span>
            </div>
            <div className="bg-gray-100 py-3 text-center text-[#111] text-[15px] mb-4">
              {t("Everyone must join")}
            </div>
            <a 
              href={liveClass.join_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#5851EF] text-white rounded-2xl py-3.5 flex justify-center items-center text-[16px] font-medium w-full mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect><line x1="8" y1="8" x2="8" y2="16"></line><line x1="4" y1="12" x2="12" y2="12"></line></svg>
              {t("Join live video class")}
            </a>
          </div>
        ))}

        {/* Certificate Tab */}
        {activeTab === "certificate" && (
          <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5851EF]/10 flex items-center justify-center text-[#5851EF]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-[#111]">{t("Course Completion Certificate")}</h3>
            
            {isLoadingCertificate ? (
              <p className="text-xs text-gray-500">{t("Checking completion status...")}</p>
            ) : (certificateInfo?.is_eligible || (course?.completion || 0) >= 100) ? (
              <div className="w-full flex flex-col items-center space-y-3">
                <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                  {t("Congratulations! You have completed 100% of this course. Your official certificate is ready.")}
                </p>
                <button
                  onClick={handleGetCertificate}
                  className="w-full max-w-xs px-6 py-3 bg-[#5851EF] text-white text-xs font-bold rounded-xl hover:bg-[#4841CF] transition-colors shadow-sm"
                >
                  {t("Get Certificate")}
                </button>
                <button
                  onClick={handleShareCertificate}
                  className="w-full max-w-xs px-6 py-3 bg-white text-[#5851EF] border border-[#5851EF] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  {t("Share Certificate")}
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-3">
                <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                  {t("Complete 100% of the course curriculum to unlock your certificate.")}
                </p>
                <div className="w-full bg-gray-100 rounded-full h-3 max-w-xs overflow-hidden">
                  <div
                    className="bg-[#5851EF] h-full rounded-full transition-all duration-300"
                    style={{ width: `${course?.completion || certificateInfo?.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-[#5851EF]">{t("____% Complete", course?.completion || certificateInfo?.progress || 0)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notice Board Tab */}
        {activeTab === "noticeBoard" && (
          <div className="space-y-3">
            {isLoadingNotices ? (
              <div className="text-center py-8 text-sm text-gray-500">{t("Loading notices...")}</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-[16px] border border-gray-100 text-gray-500 text-sm">
                {t("No notices found for this course.")}
              </div>
            ) : (
              notices.map((notice: any) => (
                <div key={notice.id} className="bg-white rounded-[16px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)] space-y-2">
                  <h3 className="font-bold text-base text-[#111]">{notice.title}</h3>
                  <p className="text-xs text-gray-400">
                    {t("Posted on ____", notice.created_at ? new Date(notice.created_at).toLocaleDateString() : t("Recent"))}
                  </p>
                  <div
                    className="prose prose-sm max-w-none text-[#333] text-xs leading-relaxed mt-2"
                    dangerouslySetInnerHTML={{ __html: notice.description || "" }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
