"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { AlertPopup } from "../../components/AlertPopup";
import { useLanguage } from "../../context/LanguageContext";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const courseId = searchParams.get("course_id");

  const { token } = useAuth();
  const { baseUrl } = useApp();
  const { t } = useLanguage();

  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [lastSubmission, setLastSubmission] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);

  // Helper for fill blanks tagging input
  const [tempFillBlankVal, setTempFillBlankVal] = useState("");

  const loadQuizData = useCallback(async () => {
    if (!baseUrl || !token || !quizId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/quiz_questions?quiz_id=${quizId}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load quiz details");
      const data = await res.json();
      setQuizDetails(data.quiz);
      setQuestions(data.questions || []);
      setSubmissionsCount(data.submissions_count || 0);
      setLastSubmission(data.last_submission || null);

      if (data.last_submission) {
        setViewingResults(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, token, quizId]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  const handleMCQToggle = (questionId: string, option: string) => {
    const current = answers[questionId] || [];
    let updated;
    if (current.includes(option)) {
      updated = current.filter((o: string) => o !== option);
    } else {
      updated = [...current, option];
    }
    setAnswers({ ...answers, [questionId]: updated });
  };

  const handleTrueFalseSelect = (questionId: string, value: "true" | "false") => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleAddFillBlankAnswer = (questionId: string) => {
    if (!tempFillBlankVal.trim()) return;
    const current = answers[questionId] || [];
    if (!current.includes(tempFillBlankVal.trim())) {
      const updated = [...current, tempFillBlankVal.trim()];
      setAnswers({ ...answers, [questionId]: updated });
    }
    setTempFillBlankVal("");
  };

  const handleRemoveFillBlankAnswer = (questionId: string, indexToRemove: number) => {
    const current = answers[questionId] || [];
    const updated = current.filter((_: any, i: number) => i !== indexToRemove);
    setAnswers({ ...answers, [questionId]: updated });
  };

  const handleSubmitQuiz = async () => {
    // Validate that all questions have some input
    const unanswered = questions.filter(q => {
      const ans = answers[q.id];
      if (q.type === 'mcq') {
        return !ans || ans.length === 0;
      } else if (q.type === 'fill_blanks') {
        return !ans || ans.length === 0;
      } else if (q.type === 'true_false') {
        return ans === undefined;
      }
      return true;
    });

    if (unanswered.length > 0) {
      showAlert(t("Please answer all questions before submitting."), "info");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/submit_quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          quiz_id: quizId,
          answers: answers
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t("Failed to submit quiz"));
      }

      showAlert(t("Quiz submitted successfully!"), "success");
      setQuizStarted(false);
      await loadQuizData();
      setViewingResults(true);
    } catch (err: any) {
      showAlert(err.message || t("An error occurred"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (courseId) {
      router.push(`/learn/${courseId}?lesson_id=${quizId}`);
    } else if (quizDetails?.course_id) {
      router.push(`/learn/${quizDetails.course_id}?lesson_id=${quizId}`);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#5851EF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quizDetails) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center text-[#757575] bg-white p-6 text-center">
        <p className="text-sm font-medium mb-4">{error ? t(error) : t("Quiz not found.")}</p>
        <button onClick={handleGoBack} className="px-5 py-2.5 bg-[#5851EF] text-white rounded-xl text-[14px] font-medium">
          {t("Go Back")}
        </button>
      </div>
    );
  }

  const retakeLimit = quizDetails.retake ?? 1;
  const hasAttemptsLeft = submissionsCount < retakeLimit;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Top Header */}
      <div className="bg-white border-b border-[#F0F0F0] px-4 py-4 flex items-center sticky top-0 z-40">
        <button onClick={handleGoBack} className="mr-3 p-1 hover:bg-[#F5F5F5] rounded-full transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="text-[17px] font-semibold text-[#111] truncate flex-1">{quizDetails.title}</h1>
      </div>

      <div className="px-4 pt-5 pb-8 w-full max-w-2xl mx-auto flex flex-col gap-4">
        {!quizStarted ? (
          /* Landing Screen (Show Results or Details) */
          <div className="flex flex-col gap-4">
            {/* Last attempt score summary card */}
            {lastSubmission && viewingResults && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-5 mb-5">
                <h2 className="text-[15px] font-semibold text-[#111] mb-4">{t("Last Attempt Result")}</h2>
                
                {(() => {
                  const totalQuestions = questions.length || 1;
                  const markPerQuestion = quizDetails.total_mark / totalQuestions;
                  const correctCount = lastSubmission.correct_answer?.length || 0;
                  const wrongCount = lastSubmission.wrong_answer?.length || 0;
                  const obtainedMark = correctCount * markPerQuestion;
                  const passed = obtainedMark >= quizDetails.pass_mark;

                  return (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-[12px] text-[#757575] font-medium uppercase tracking-wider">{t("Status")}</p>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {passed ? t("Passed") : t("Failed")}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-[#757575] font-medium uppercase tracking-wider">{t("Score Obtained")}</p>
                          <p className="text-[20px] font-bold text-[#111] mt-0.5">{obtainedMark} / {quizDetails.total_mark}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] rounded-xl p-3 border border-[#F0F0F0] mb-4">
                        <div>
                          <span className="text-[11px] text-[#757575] block font-medium">{t("Correct Answers")}</span>
                          <span className="text-[14px] font-semibold text-green-600">{correctCount}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#757575] block font-medium">{t("Wrong Answers")}</span>
                          <span className="text-[14px] font-semibold text-red-600">{wrongCount}</span>
                        </div>
                      </div>

                      {/* Detailed Submission Question Breakdown */}
                      <div className="mt-5 border-t border-[#F0F0F0] pt-4">
                        <h3 className="text-sm font-semibold text-[#111] mb-3">{t("Review Questions")}</h3>
                        <div className="space-y-4">
                          {questions.map((question, qi) => {
                            const isCorrect = lastSubmission.correct_answer?.includes(question.id);
                            const userAns = lastSubmission.submits?.[question.id];
                            const correctAns = question.answer;

                            return (
                              <div key={question.id} className="border-b border-[#F8F8F8] pb-3 last:border-0 last:pb-0">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-[#EEF0F2] flex items-center justify-center text-[10px] font-semibold text-[#4F5B66] shrink-0 mt-0.5">
                                    {qi + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] text-[#333] font-medium leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: question.title }} />
                                    
                                    <div className="text-[11px] text-[#757575] space-y-1 bg-[#F9FAFB] p-2.5 rounded-lg border border-[#F0F0F0]">
                                      <p>
                                        <span className="font-semibold">{t("Your Answer:")} </span>
                                        {Array.isArray(userAns) ? userAns.join(", ") : String(userAns || t("No answer"))}
                                      </p>
                                      {correctAns !== undefined && !isCorrect && (
                                        <p className="text-green-600">
                                          <span className="font-semibold">{t("Correct Answer:")} </span>
                                          {Array.isArray(correctAns) ? correctAns.join(", ") : String(correctAns)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="shrink-0 mt-0.5">
                                    {isCorrect ? (
                                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Quiz Info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-5 mb-6">
              <h2 className="text-[15px] font-semibold text-[#111] mb-4">{t("Quiz Specifications")}</h2>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Total Questions")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Duration Limit")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">
                    {(() => {
                      const dur = (quizDetails.duration || "00:00:00").split(":");
                      const hrs = parseInt(dur[0] || "0");
                      const mins = parseInt(dur[1] || "0");
                      if (hrs > 0) return t("____ hr ____ mins", hrs, mins);
                      return t("____ minutes", mins);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Total Mark")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{quizDetails.total_mark}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Pass Mark")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{quizDetails.pass_mark}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Attempts Allowed")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{retakeLimit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#757575]">{t("Attempts Used")}</span>
                  <span className="text-[13px] font-semibold text-[#111]">{submissionsCount}</span>
                </div>
              </div>

              {quizDetails.summary && (
                <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
                  <p className="text-[11px] text-[#757575] font-semibold uppercase tracking-wider mb-1.5">{t("Quiz Summary")}</p>
                  <p className="text-[12px] text-[#555] leading-relaxed" dangerouslySetInnerHTML={{ __html: quizDetails.summary }} />
                </div>
              )}
            </div>

            {/* Bottom action button */}
            <div>
              {hasAttemptsLeft ? (
                <button
                  onClick={() => {
                    setQuizStarted(true);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="w-full py-3.5 bg-[#5851EF] text-white rounded-xl text-[14px] font-semibold hover:bg-[#4841CF] transition-colors shadow-sm"
                >
                  {submissionsCount > 0 ? t("Retake Quiz") : t("Start Quiz")}
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
                  <p className="text-[12px] text-amber-800 font-medium">{t("You have reached the maximum number of quiz attempts allowed.")}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Quiz Taking view (one question at a time) */
          <div className="flex flex-col gap-4">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-[#757575] font-semibold uppercase">{t("Question ____ of ____", currentQuestionIndex + 1, questions.length)}</span>
              <span className="text-[12px] font-semibold text-[#5851EF]">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
            </div>

            <div className="w-full h-1.5 bg-[#EEF0F2] rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-[#5851EF] rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Active Question Body */}
            {(() => {
              const currentQuestion = questions[currentQuestionIndex];
              if (!currentQuestion) return null;

              return (
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0F0F0] p-5 shadow-sm">
                    <h3 className="text-[15px] font-medium text-[#111] leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: currentQuestion.title }} />

                    {/* Question inputs */}
                    {currentQuestion.type === "mcq" && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option: string) => {
                          const isChecked = (answers[currentQuestion.id] || []).includes(option);
                          return (
                            <button
                              key={option}
                              onClick={() => handleMCQToggle(currentQuestion.id, option)}
                              className={`w-full flex items-center p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${isChecked ? 'bg-[#5851EF]/5 border-[#5851EF] text-[#5851EF]' : 'bg-white border-[#E0E0E0] text-[#333] hover:bg-[#F9FAFB]'}`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 shrink-0 ${isChecked ? 'bg-[#5851EF] border-[#5851EF]' : 'border-[#C0C0C0] bg-white'}`}>
                                {isChecked && (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                              </div>
                              <span className="text-xs">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentQuestion.type === "true_false" && (
                      <div className="grid grid-cols-2 gap-4">
                        {["true", "false"].map((val) => {
                          const isSelected = answers[currentQuestion.id] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleTrueFalseSelect(currentQuestion.id, val as any)}
                              className={`flex flex-col items-center justify-center p-5 rounded-xl border text-sm font-semibold capitalize transition-all ${isSelected ? 'bg-[#5851EF]/5 border-[#5851EF] text-[#5851EF]' : 'bg-white border-[#E0E0E0] text-[#333] hover:bg-[#F9FAFB]'}`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mb-2.5 ${isSelected ? 'border-[#5851EF]' : 'border-[#C0C0C0]'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#5851EF]" />}
                              </div>
                              {t(val === "true" ? "True" : "False")}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentQuestion.type === "fill_blanks" && (
                      <div>
                        {/* Selected tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                          {(answers[currentQuestion.id] || []).map((ans: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5851EF]/10 text-[#5851EF] border border-[#5851EF]/20">
                              {ans}
                              <button onClick={() => handleRemoveFillBlankAnswer(currentQuestion.id, idx)} className="ml-1.5 focus:outline-none">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </span>
                          ))}
                          {(answers[currentQuestion.id] || []).length === 0 && (
                            <span className="text-[11px] text-[#757575] italic">{t("No answers added yet.")}</span>
                          )}
                        </div>

                        {/* Input row */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t("Type an answer keyword...")}
                            value={tempFillBlankVal}
                            onChange={(e) => setTempFillBlankVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddFillBlankAnswer(currentQuestion.id);
                              }
                            }}
                            className="flex-1 px-3.5 py-2.5 border border-[#E0E0E0] rounded-xl text-xs focus:outline-none focus:border-[#5851EF] bg-[#F9FAFB]"
                          />
                          <button
                            onClick={() => handleAddFillBlankAnswer(currentQuestion.id)}
                            className="px-4 bg-[#5851EF] text-white rounded-xl text-xs font-semibold hover:bg-[#4841CF] transition-colors"
                          >
                            {t("Add")}
                          </button>
                        </div>
                        <span className="text-[10px] text-[#757575] mt-2 block leading-normal">
                          {t('Type an answer keyword and press "Add" or hit enter. You can add multiple key phrases.')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Nav action buttons */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(currentQuestionIndex - 1);
                        } else {
                          setQuizStarted(false);
                        }
                      }}
                      className="py-3 bg-white border border-[#E0E0E0] text-[#555] rounded-xl text-[13px] font-semibold transition-colors hover:bg-[#F9FAFB]"
                    >
                      {currentQuestionIndex === 0 ? t("Quit Quiz") : t("Previous")}
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="py-3 bg-[#5851EF] text-white rounded-xl text-[13px] font-semibold hover:bg-[#4841CF] transition-colors"
                      >
                        {t("Next Question")}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="py-3 bg-green-600 text-white rounded-xl text-[13px] font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          t("Submit Quiz")
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      <AlertPopup isOpen={alertState.isOpen} message={alertState.message} type={alertState.type} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
