"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMyCourses } from "../../../hooks/useMyCourses";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

import { AlertPopup } from "../../components/AlertPopup";
import { useLanguage } from "../../context/LanguageContext";

function CoursePlayerPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const lessonIdFromUrl = searchParams.get("lesson_id");

  const { myCourses, fetchCourseSections } = useMyCourses();
  const { token, user } = useAuth();
  const { baseUrl } = useApp();
  const { t } = useLanguage();
  
  const [sections, setSections] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type: "success" | "error" | "info" }>({
    isOpen: false,
    message: "",
    type: "info"
  });

  const [activeTab, setActiveTab] = useState<"lessons" | "summary" | "live_class" | "certificate" | "notice_board">("lessons");
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [isLoadingLiveClasses, setIsLoadingLiveClasses] = useState(false);

  useEffect(() => {
    if (!baseUrl || !token || !courseId) return;

    if (activeTab === "notice_board") {
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

    if (activeTab === "certificate") {
      const fetchCertificate = async () => {
        setIsLoadingCertificate(true);
        try {
          const res = await fetch(`${baseUrl}/api/certificate_status?course_id=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setCertificateInfo(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingCertificate(false);
        }
      };
      fetchCertificate();
    }

    if (activeTab === "live_class") {
      const fetchLiveClasses = async () => {
        setIsLoadingLiveClasses(true);
        try {
          const res = await fetch(`${baseUrl}/api/zoom/meetings?course_id=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setLiveClasses(Array.isArray(data) ? data : []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingLiveClasses(false);
        }
      };
      fetchLiveClasses();
    }
  }, [activeTab, baseUrl, token, courseId]);

  const course = myCourses.find(c => c.id.toString() === courseId) || { title: t("Course Details") };

  useEffect(() => {
    if (!baseUrl || !token) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const sectionsData = await fetchCourseSections(courseId);
        setSections(sectionsData || []);
        if (sectionsData && sectionsData.length > 0) {
          let foundLesson = null;
          let foundSectionId = null;
          let firstUnlockedLesson = null;

          for (const s of sectionsData) {
            for (const l of (s.lessons || [])) {
              const isL = l.is_lock === 1 || l.is_lock === "1" || l.is_locked === true;
              if (!firstUnlockedLesson && !isL) {
                firstUnlockedLesson = l;
              }
              if (lessonIdFromUrl && l.id.toString() === lessonIdFromUrl) {
                foundLesson = l;
                foundSectionId = s.id;
              }
            }
          }

          if (foundLesson) {
            setActiveLesson(foundLesson);
            if (foundSectionId) setExpandedSection(foundSectionId);
          } else if (firstUnlockedLesson) {
            setActiveLesson(firstUnlockedLesson);
            if (sectionsData[0]?.id) setExpandedSection(sectionsData[0].id);
          } else if (sectionsData[0]?.lessons?.[0]) {
            setActiveLesson(sectionsData[0].lessons[0]);
            setExpandedSection(sectionsData[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (courseId) {
      loadData();
    }
  }, [courseId, lessonIdFromUrl, fetchCourseSections, baseUrl, token]);

  const toggleSection = (sectionId: number) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const BackBtn = () => (
    <button 
      onClick={() => router.back()}
      className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    </button>
  );

  const renderPlayer = () => {
    if (!activeLesson) {
      if (!token) {
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white px-6 text-center">
            <BackBtn />
            <p className="text-sm font-medium">{t("Sign in to access this lesson")}</p>
            <p className="mt-2 text-xs text-white/70 max-w-[260px] leading-5">
              {t("The quiz and course curriculum load from your student session, so the app needs an active login before it can continue.")}
            </p>
          </div>
        );
      }

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          <BackBtn />
          <p className="text-sm font-medium">{t("No lesson selected")}</p>
        </div>
      );
    }

    const isLocked = activeLesson.is_lock === 1 || activeLesson.is_lock === "1" || activeLesson.is_locked === true;
    if (isLocked) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white px-6 text-center">
          <BackBtn />
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFB74D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{t("Lesson Locked")}</h2>
          <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
            {t("This course supports drip content. Please complete the previous lessons in order to unlock this lesson.")}
          </p>
        </div>
      );
    }

    const { lesson_type, video_url } = activeLesson;

    if (["video-url", "vimeo-url", "google_drive", "system-video", "iframe"].includes(lesson_type)) {
      const url = video_url || "";

      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        }
        return (
          <div className="absolute inset-0 bg-black">
            <BackBtn />
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        );
      }

      // Vimeo
      if (url.includes("vimeo.com")) {
        const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
        const videoId = match ? match[3] : "";
        return (
          <div className="absolute inset-0 bg-black">
            <BackBtn />
            <iframe 
              src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // Direct MP4
      if (url.endsWith(".mp4") || url.includes(".mp4?")) {
        return (
          <div className="absolute inset-0 bg-black">
            <BackBtn />
            <video 
              src={url} 
              controls 
              autoPlay
              className="w-full h-full"
            />
          </div>
        );
      }

      // Fallback Embed Iframe
      if (url) {
        return (
          <div className="absolute inset-0 bg-black">
            <BackBtn />
            <iframe 
              src={url}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        );
      }
    }

    if (lesson_type === 'quiz') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
          <BackBtn />
          <div className="w-16 h-16 bg-[#5851EF]/20 border border-[#5851EF]/30 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5851EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="9" y1="15" x2="15" y2="15"></line>
              <line x1="9" y1="11" x2="15" y2="11"></line>
              <line x1="9" y1="19" x2="15" y2="19"></line>
            </svg>
          </div>
          <p className="text-sm font-semibold mb-2 text-center px-4">{activeLesson.title}</p>
          <p className="text-xs text-gray-400 mb-6 text-center max-w-[240px] px-4 leading-relaxed">
            {t("This lesson is a quiz. Tap the button below to take it.")}
          </p>
          <button
            onClick={() => router.push(`/quiz/${activeLesson.id}?course_id=${courseId}`)}
            className="px-6 py-3 bg-[#5851EF] text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#4841CF] transition-colors"
          >
            {t("Take Quiz")}
          </button>
        </div>
      );
    }

    // Document / File lesson
    if (lesson_type === 'document_type') {
      const attachment = activeLesson.attachment || "";
      const attachmentType = activeLesson.attachment_type || "";
      const fileUrl = attachment ? `${baseUrl}/uploads/lesson_file/attachment/${attachment}` : "";
      const ext = attachment.split('.').pop()?.toLowerCase() || "";

      if (!fileUrl) {
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
            <BackBtn />
            <p className="text-sm">{t("No file available for this lesson.")}</p>
          </div>
        );
      }

      // PDF — render inline
      if (ext === "pdf" || attachmentType === "pdf") {
        return (
          <div className="absolute inset-0 bg-white flex flex-col">
            <BackBtn />
            <iframe src={fileUrl} className="w-full flex-1 border-0" title={activeLesson.title} />
          </div>
        );
      }

      // Office docs (doc, docx, ppt, pptx, xls, xlsx) — Microsoft Office Online viewer
      if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext) || ["doc", "ppt"].includes(attachmentType)) {
        const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        return (
          <div className="absolute inset-0 bg-white flex flex-col">
            <BackBtn />
            <iframe src={viewerUrl} className="w-full flex-1 border-0" title={activeLesson.title} />
          </div>
        );
      }

      // Image files
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        return (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-4">
            <BackBtn />
            <img src={fileUrl} alt={activeLesson.title} className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        );
      }

      // Fallback — show download button
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
          <BackBtn />
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <p className="text-sm font-semibold mb-2 text-center">{activeLesson.title}</p>
          <p className="text-xs text-gray-400 mb-6 text-center max-w-[240px] leading-relaxed">
            {t("This file cannot be previewed directly. Open it in your browser or download it.")}
          </p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#5851EF] text-white rounded-xl text-xs font-semibold hover:bg-[#4841CF] transition-colors"
          >
            {t("Open File")}
          </a>
        </div>
      );
    }

    // Text lesson
    if (lesson_type === 'text') {
      const textContent = activeLesson.attachment || activeLesson.description || activeLesson.summary || activeLesson.text_description || "";
      return (
        <div className="absolute inset-0 bg-white overflow-y-auto">
          <BackBtn />
          <div className="pt-14 px-5 pb-8">
            <h2 className="text-[17px] font-semibold text-[#111] mb-4">{activeLesson.title}</h2>
            {textContent ? (
              <div
                className="prose prose-sm max-w-none text-[#333] leading-relaxed text-sm break-words"
                dangerouslySetInnerHTML={{ __html: textContent }}
              />
            ) : (
              <p className="text-sm text-gray-500">{t("No content available.")}</p>
            )}
          </div>
        </div>
      );
    }

    // Default Fallback
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <BackBtn />
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-white/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
        <p className="text-sm font-medium mb-2">{activeLesson.title}</p>
      </div>
    );
  };

  if (!baseUrl || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
        <p className="text-sm font-medium">{t("Sign in to access this lesson")}</p>
        <p className="mt-2 max-w-[280px] text-xs leading-5 text-white/70">
          {t("The quiz and course curriculum load from your student session, so the app needs an active login before it can continue.")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-black text-white">{t("Loading player...")}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Video/Quiz Player Section */}
      <div className="w-full bg-black sticky top-0 z-50">
        <div className="relative pt-[56.25%]">
          {renderPlayer()}
        </div>
      </div>

      {/* Horizontal Tabs Bar */}
      <div className="flex border-b border-gray-100 bg-white px-4 overflow-x-auto scrollbar-hide sticky top-[56.25vw] z-40">
        {[
          { id: "lessons", label: "Lessons" },
          { id: "summary", label: "Summary" },
          { id: "live_class", label: "Live Class" },
          { id: "certificate", label: "Certificate" },
          { id: "notice_board", label: "Notice Board" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-[#5851EF] text-[#5851EF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* Course Info & Tab Contents */}
      <div className="flex-1 p-4 pb-12">
        <h1 className="text-lg font-bold text-[var(--color-text-dark)] mb-4">{course.title}</h1>

        {/* Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex justify-between items-center bg-[var(--color-background-input)] text-left"
                >
                  <span className="font-bold text-sm text-[var(--color-text-dark)]">{section.title}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transform transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {expandedSection === section.id && (
                  <div className="divide-y divide-gray-50">
                    {section.lessons?.map((lesson: any) => {
                      const isLessonLocked = lesson.is_lock === 1 || lesson.is_lock === "1" || lesson.is_locked === true;
                      return (
                        <div 
                          key={lesson.id} 
                          onClick={() => {
                            if (isLessonLocked) {
                              setAlertState({
                                isOpen: true,
                                message: t("This lesson is locked by Drip Content. Please complete previous lessons first."),
                                type: "info"
                              });
                              return;
                            }
                            setActiveLesson(lesson);
                          }}
                          className={`px-4 py-3 flex items-start transition-colors ${
                            isLessonLocked ? "opacity-60 bg-gray-50/50 cursor-not-allowed" :
                            activeLesson?.id === lesson.id ? "bg-[var(--color-background-input)] font-bold text-[var(--color-primary)] cursor-pointer" : "hover:bg-gray-50 text-[var(--color-text-dark)] cursor-pointer"
                          }`}
                        >
                          {/* Status / Lock indicator */}
                          <div className="mr-3 mt-0.5 shrink-0">
                            {isLessonLocked ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            ) : lesson.is_completed === "1" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            ) : activeLesson?.id === lesson.id ? (
                              <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>

                          {/* Icon */}
                          <div className="mr-2.5 shrink-0 text-[#757575] flex items-center mt-0.5">
                            {isLessonLocked ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            ) : ["video-url", "vimeo-url", "google_drive", "system-video"].includes(lesson.lesson_type) ? (
                              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.86333 15.0058C9.47833 15.0058 9.12083 14.9141 8.8 14.7308C8.06666 14.3091 7.645 13.4474 7.645 12.3566V9.64328C7.645 8.56161 8.06666 7.69078 8.8 7.26911C9.53333 6.84744 10.4867 6.91161 11.4308 7.46161L13.7867 8.81828C14.7217 9.35911 15.2625 10.1566 15.2625 10.9999C15.2625 11.8433 14.7217 12.6408 13.7867 13.1816L11.4308 14.5383C10.8992 14.8499 10.3583 15.0058 9.86333 15.0058ZM9.8725 8.36911C9.72583 8.36911 9.5975 8.39661 9.49666 8.46078C9.20333 8.63494 9.02916 9.06578 9.02916 9.64328V12.3566C9.02916 12.9341 9.19416 13.3649 9.49666 13.5391C9.79 13.7133 10.2483 13.6399 10.7525 13.3466L13.1083 11.9899C13.6125 11.6966 13.8967 11.3391 13.8967 10.9999C13.8967 10.6608 13.6125 10.2941 13.1083 10.0099L10.7525 8.65328C10.4225 8.46078 10.12 8.36911 9.8725 8.36911Z" fill="currentColor"/>
                                <path d="M11 20.8542C5.56417 20.8542 1.14584 16.4359 1.14584 11C1.14584 5.56421 5.56417 1.14587 11 1.14587C16.4358 1.14587 20.8542 5.56421 20.8542 11C20.8542 16.4359 16.4358 20.8542 11 20.8542ZM11 2.52087C6.325 2.52087 2.52084 6.32504 2.52084 11C2.52084 15.675 6.325 19.4792 11 19.4792C15.675 19.4792 19.4792 15.675 19.4792 11C19.4792 6.32504 15.675 2.52087 11 2.52087Z" fill="currentColor"/>
                              </svg>
                            ) : lesson.lesson_type === 'quiz' ? (
                              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 20.24C10.725 20.24 10.45 20.1758 10.2208 20.0475C8.50667 19.1125 5.49084 18.1225 3.6025 17.875L3.33667 17.8383C2.13584 17.6916 1.14584 16.5641 1.14584 15.345V4.27163C1.14584 3.54747 1.43 2.88747 1.9525 2.4108C2.475 1.93413 3.15334 1.70497 3.86834 1.76913C5.885 1.92497 8.92834 2.9333 10.6517 4.01497L10.8717 4.1433C10.9358 4.17997 11.0733 4.17997 11.1283 4.15247L11.275 4.0608C12.9983 2.97913 16.0417 1.95247 18.0675 1.7783C18.0858 1.7783 18.1592 1.7783 18.1775 1.7783C18.8467 1.71413 19.5342 1.95247 20.0475 2.42913C20.57 2.9058 20.8542 3.5658 20.8542 4.28997V15.3541C20.8542 16.5825 19.8642 17.7008 18.6542 17.8475L18.3517 17.8841C16.4633 18.1316 13.4383 19.1308 11.7608 20.0566C11.5408 20.185 11.275 20.24 11 20.24ZM3.64834 3.13497C3.355 3.13497 3.08917 3.2358 2.87834 3.4283C2.64917 3.63913 2.52084 3.94163 2.52084 4.27163V15.345C2.52084 15.8858 2.98834 16.4083 3.51084 16.4816L3.78584 16.5183C5.84834 16.7933 9.01084 17.8291 10.8442 18.8283C10.9267 18.865 11.0458 18.8741 11.0917 18.8558C12.925 17.8383 16.1058 16.7933 18.1775 16.5183L18.4892 16.4816C19.0117 16.4175 19.4792 15.8858 19.4792 15.345V4.2808C19.4792 3.94163 19.3508 3.6483 19.1217 3.4283C18.8833 3.21747 18.5808 3.11663 18.2417 3.13497C18.2233 3.13497 18.15 3.13497 18.1317 3.13497C16.3808 3.2908 13.5575 4.23497 12.0175 5.19747L11.8708 5.2983C11.3667 5.60997 10.6517 5.60997 10.1658 5.30747L9.94584 5.17913C8.37834 4.21663 5.555 3.28163 3.75834 3.13497C3.72167 3.13497 3.685 3.13497 3.64834 3.13497Z" fill="currentColor"/>
                                <path d="M11 19.47C10.6242 19.47 10.3125 19.1583 10.3125 18.7825V5.03247C10.3125 4.65664 10.6242 4.34497 11 4.34497C11.3758 4.34497 11.6875 4.65664 11.6875 5.03247V18.7825C11.6875 19.1675 11.3758 19.47 11 19.47Z" fill="currentColor"/>
                                <path d="M7.10416 8.46997H5.04166C4.66583 8.46997 4.35416 8.1583 4.35416 7.78247C4.35416 7.40664 4.66583 7.09497 5.04166 7.09497H7.10416C7.48 7.09497 7.79166 7.40664 7.79166 7.78247C7.79166 8.1583 7.48 8.46997 7.10416 8.46997Z" fill="currentColor"/>
                                <path d="M7.79166 11.22H5.04166C4.66583 11.22 4.35416 10.9083 4.35416 10.5325C4.35416 10.1566 4.66583 9.84497 5.04166 9.84497H7.79166C8.1675 9.84497 8.47916 10.1566 8.47916 10.5325C8.47916 10.9083 8.1675 11.22 7.79166 11.22Z" fill="currentColor"/>
                              </svg>
                            ) : lesson.lesson_type === 'text' ? (
                              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.75 20.8543H8.25C3.2725 20.8543 1.14584 18.7277 1.14584 13.7502V8.25016C1.14584 3.27266 3.2725 1.146 8.25 1.146H13.75C18.7275 1.146 20.8542 3.27266 20.8542 8.25016V13.7502C20.8542 18.7277 18.7275 20.8543 13.75 20.8543ZM8.25 2.521C4.02417 2.521 2.52084 4.02433 2.52084 8.25016V13.7502C2.52084 17.976 4.02417 19.4793 8.25 19.4793H13.75C17.9758 19.4793 19.4792 17.976 19.4792 13.7502V8.25016C19.4792 4.02433 17.9758 2.521 13.75 2.521H8.25Z" fill="currentColor"/>
                                <path d="M6.41667 8.8276C6.16917 8.8276 5.92167 8.6901 5.8025 8.45177C5.62833 8.1126 5.76583 7.7001 6.105 7.52593C9.16667 5.9951 12.8242 5.9951 15.8858 7.52593C16.225 7.7001 16.3625 8.1126 16.1975 8.45177C16.0233 8.79093 15.62 8.92843 15.2717 8.76343C12.595 7.4251 9.39583 7.4251 6.71917 8.76343C6.6275 8.80927 6.5175 8.8276 6.41667 8.8276Z" fill="currentColor"/>
                                <path d="M11 15.6201C10.6242 15.6201 10.3125 15.3085 10.3125 14.9326V7.26929C10.3125 6.89345 10.6242 6.58179 11 6.58179C11.3758 6.58179 11.6875 6.89345 11.6875 7.26929V14.9418C11.6875 15.3176 11.3758 15.6201 11 15.6201Z" fill="currentColor"/>
                              </svg>
                            ) : lesson.lesson_type === 'document_type' ? (
                              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.75 20.8542H8.25C3.2725 20.8542 1.14584 18.7275 1.14584 13.75V8.25004C1.14584 3.27254 3.2725 1.14587 8.25 1.14587H12.8333C13.2092 1.14587 13.5208 1.45754 13.5208 1.83337C13.5208 2.20921 13.2092 2.52087 12.8333 2.52087H8.25C4.02417 2.52087 2.52084 4.02421 2.52084 8.25004V13.75C2.52084 17.9759 4.02417 19.4792 8.25 19.4792H13.75C17.9758 19.4792 19.4792 17.9759 19.4792 13.75V9.16671C19.4792 8.79087 19.7908 8.47921 20.1667 8.47921C20.5425 8.47921 20.8542 8.79087 20.8542 9.16671V13.75C20.8542 18.7275 18.7275 20.8542 13.75 20.8542Z" fill="currentColor"/>
                                <path d="M20.1667 9.8542H16.5C13.365 9.8542 12.1458 8.63503 12.1458 5.50003V1.83336C12.1458 1.55836 12.3108 1.3017 12.5675 1.20086C12.8242 1.09086 13.1175 1.15503 13.3192 1.34753L20.6525 8.68086C20.845 8.87336 20.9092 9.17586 20.7992 9.43253C20.6892 9.6892 20.4417 9.8542 20.1667 9.8542ZM13.5208 3.49253V5.50003C13.5208 7.86503 14.135 8.4792 16.5 8.4792H18.5075L13.5208 3.49253Z" fill="currentColor"/>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.75 20.8543H8.25C3.2725 20.8543 1.14584 18.7277 1.14584 13.7502V8.25016C1.14584 3.27266 3.2725 1.146 8.25 1.146H13.75C18.7275 1.146 20.8542 3.27266 20.8542 8.25016V13.7502C20.8542 18.7277 18.7275 20.8543 13.75 20.8543ZM8.25 2.521C4.02417 2.521 2.52084 4.02433 2.52084 8.25016V13.7502C2.52084 17.976 4.02417 19.4793 8.25 19.4793H13.75C17.9758 19.4793 19.4792 17.976 19.4792 13.7502V8.25016C19.4792 4.02433 17.9758 2.521 13.75 2.521H8.25Z" fill="currentColor"/>
                                <path d="M8.8 14.4652C8.62583 14.4652 8.45166 14.401 8.31416 14.2635L6.03166 11.981C5.49083 11.4402 5.49083 10.5693 6.03166 10.0285L8.31416 7.74601C8.58 7.48017 9.02 7.48017 9.28583 7.74601C9.55166 8.01184 9.55166 8.45184 9.28583 8.71767L7.00333 11.0002L9.28583 13.2918C9.55166 13.5577 9.55166 13.9977 9.28583 14.2635C9.14833 14.3918 8.97416 14.4652 8.8 14.4652Z" fill="currentColor"/>
                                <path d="M13.2 14.4651C13.0258 14.4651 12.8517 14.4009 12.7142 14.2634C12.4483 13.9976 12.4483 13.5576 12.7142 13.2917L14.9967 11.0001L12.7142 8.7084C12.4483 8.44256 12.4483 8.00256 12.7142 7.73673C12.98 7.4709 13.42 7.4709 13.6858 7.73673L15.9683 10.0192C16.5092 10.5601 16.5092 11.4309 15.9683 11.9717L13.6858 14.2542C13.5575 14.3917 13.3742 14.4651 13.2 14.4651Z" fill="currentColor"/>
                              </svg>
                            )}
                          </div>

                          {/* Title */}
                          <div className="flex-1">
                            <p className={`text-sm ${activeLesson?.id === lesson.id ? "font-bold text-[var(--color-primary)]" : "font-medium text-[var(--color-text-dark)]"}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-[var(--color-text-grey)] mt-1 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {lesson.duration}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#111]">{course.title}</h2>
            {activeLesson?.summary ? (
              <div
                className="prose prose-sm max-w-none text-[#333] leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: activeLesson.summary }}
              />
            ) : (
              <p className="text-sm text-gray-500">{t("No summary available for this lesson.")}</p>
            )}
          </div>
        )}

        {/* Live Class Tab */}
        {activeTab === "live_class" && (
          <div className="space-y-3">
            {isLoadingLiveClasses ? (
              <div className="text-center py-8 text-sm text-gray-500">{t("Loading live classes...")}</div>
            ) : liveClasses.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm">
                {t("No live classes scheduled for this course.")}
              </div>
            ) : (
              liveClasses.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm text-[#111]">{item.topic || item.title || t("Live Class")}</h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{t("Scheduled")}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t("Date: ____", item.start_time || item.date || t("Upcoming"))}</p>
                  {item.join_url && (
                    <a
                      href={item.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-[#5851EF] text-white text-xs font-semibold rounded-xl hover:bg-[#4841CF] transition-colors"
                    >
                      {t("Join Class")}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === "certificate" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5851EF]/10 flex items-center justify-center text-[#5851EF]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#111]">{t("Course Completion Certificate")}</h3>
            
            {isLoadingCertificate ? (
              <p className="text-sm text-gray-500">{t("Checking completion status...")}</p>
            ) : certificateInfo?.is_eligible ? (
              <div className="w-full flex flex-col items-center space-y-3">
                <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                  {t("Congratulations! You have completed 100% of this course. Your official certificate is ready.")}
                </p>
                <button
                  onClick={async () => {
                    const openUrl = (url: string) => {
                      if (!url) return;
                      const finalUrl = url.includes("auto_download") ? url : `${url}${url.includes("?") ? "&" : "?"}auto_download=1`;
                      window.open(finalUrl, "_blank");
                    };
                    if (certificateInfo?.download_url) {
                      openUrl(certificateInfo.download_url);
                      return;
                    }
                    if (certificateInfo?.identifier && baseUrl) {
                      openUrl(`${baseUrl}/certificate/${certificateInfo.identifier}`);
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
                      openUrl(targetUrl);
                    }
                  }}
                  className="w-full max-w-xs px-6 py-3 bg-[#5851EF] text-white text-xs font-bold rounded-xl hover:bg-[#4841CF] transition-colors shadow-sm"
                >
                  {t("Get Certificate")}
                </button>
                <button
                  onClick={async () => {
                    let certUrl = certificateInfo?.download_url;
                    if (!certUrl && certificateInfo?.identifier && baseUrl) {
                      certUrl = `${baseUrl}/certificate/${certificateInfo.identifier}`;
                    }
                    if (!certUrl && baseUrl && courseId) {
                      certUrl = `${baseUrl}/certificate/${courseId}${user?.id ? `?user_id=${user.id}` : ""}`;
                    }
                    if (!certUrl) certUrl = window.location.href;

                    const shareData = {
                      title: t("My Course Certificate"),
                      text: t("Check out my course completion certificate on AppoLearn:"),
                      url: certUrl
                    };

                    if (navigator.share) {
                      try {
                        await navigator.share(shareData);
                      } catch (e) {}
                    } else {
                      try {
                        await navigator.clipboard.writeText(certUrl);
                        alert(t("Certificate link copied to clipboard!"));
                      } catch (e) {}
                    }
                  }}
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
                    style={{ width: `${certificateInfo?.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-[#5851EF]">{t("____% Complete", certificateInfo?.progress || 0)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notice Board Tab */}
        {activeTab === "notice_board" && (
          <div className="space-y-3">
            {isLoadingNotices ? (
              <div className="text-center py-8 text-sm text-gray-500">{t("Loading notices...")}</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm">
                {t("No notices found for this course.")}
              </div>
            ) : (
              notices.map((notice: any) => (
                <div key={notice.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
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
      <AlertPopup
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function CoursePlayerPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black text-white">{t("Loading player...")}</div>}>
      <CoursePlayerPageContent />
    </Suspense>
  );
}
