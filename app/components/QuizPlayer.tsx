"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

type QuizQuestion = {
  id: string;
  serial: number;
  type: "mcq" | "fill_blanks" | "true_false" | "unknown";
  title: string;
  htmlTitle: string;
  options: Array<{ value: string; label: string }>;
};

type QuizPlayerProps = {
  baseUrl: string;
  token: string | null;
  courseId: string;
  quizId: string;
  title: string;
};

type AnswerValue = string | string[];

export function QuizPlayer({ baseUrl, token, courseId, quizId, title }: QuizPlayerProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { type: QuizQuestion["type"]; value: AnswerValue }>>({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!baseUrl || !token || !quizId) {
        setLoading(false);
        setLoadingError("Quiz cannot be loaded right now.");
        return;
      }

      setLoading(true);
      setLoadingError(null);

      try {
        const response = await fetch(
          `/api/quiz/${quizId}?baseUrl=${encodeURIComponent(baseUrl)}&token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load quiz.");
        }

        setQuestions(data.questions || []);
        setCurrentIndex(0);
      } catch (error) {
        setLoadingError(error instanceof Error ? error.message : "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [baseUrl, token, quizId]);

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progressValue = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  const setQuestionAnswer = (question: QuizQuestion, value: AnswerValue) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: {
        type: question.type,
        value,
      },
    }));
  };

  const toggleMcqOption = (question: QuizQuestion, optionValue: string) => {
    const existingValues = Array.isArray(answers[question.id]?.value)
      ? (answers[question.id]?.value as string[])
      : [];

    const nextValues = existingValues.includes(optionValue)
      ? existingValues.filter((value) => value !== optionValue)
      : [...existingValues, optionValue];

    setQuestionAnswer(question, nextValues);
  };

  const handleFillBlankChange = (question: QuizQuestion, rawValue: string) => {
    setQuestionAnswer(question, rawValue);
  };

  const goNext = () => {
    setSubmitError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
    }
  };

  const goPrevious = () => {
    setSubmitError(null);
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
    }
  };

  const isQuestionAnswered = (question: QuizQuestion) => {
    const answer = answers[question.id]?.value;
    if (question.type === "mcq") {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (question.type === "fill_blanks") {
      return typeof answer === "string" && answer.trim().length > 0;
    }
    if (question.type === "true_false") {
      return answer === "true" || answer === "false";
    }
    return Boolean(answer);
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    const unansweredQuestion = questions.find((question) => !isQuestionAnswered(question));
    if (unansweredQuestion) {
      setSubmitError(t("Please answer all questions before submitting."));
      const unansweredIndex = questions.findIndex((question) => question.id === unansweredQuestion.id);
      if (unansweredIndex >= 0) {
        setCurrentIndex(unansweredIndex);
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `/api/quiz/${quizId}?baseUrl=${encodeURIComponent(baseUrl)}&token=${encodeURIComponent(token || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("Failed to submit quiz."));
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("Failed to submit quiz."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white text-[#111]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#5851EF] border-t-transparent" />
          <p className="text-sm font-medium text-[#555]">{t("Loading quiz...")}</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-[#111]">{t("Quiz unavailable")}</p>
          <p className="mt-2 text-sm text-[#757575]">{t(loadingError)}</p>
          <button
            onClick={() => router.back()}
            className="mt-5 rounded-2xl bg-[#5851EF] px-5 py-3 text-sm font-medium text-white"
          >
            {t("Go back")}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="absolute inset-0 bg-white px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F3F5] text-[#111]"
          aria-label={t("Back")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="rounded-[24px] border border-[#F0F0F0] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-medium text-[#5851EF]">{t("Quiz completed")}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#111]">{t("Your answers were submitted")}</h2>
          <p className="mt-3 text-sm leading-6 text-[#757575]">
            {t("The backend has recorded your submission and updated the lesson progress.")}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push(`/my-course/${courseId}`)}
              className="flex-1 rounded-2xl bg-[#5851EF] px-4 py-3 text-sm font-medium text-white"
            >
              {t("Back to course")}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111]"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-[#111]">{t("No quiz questions found")}</p>
          <p className="mt-2 text-sm text-[#757575]">{t("The lesson is marked as a quiz, but the backend returned no questions.")}</p>
          <button
            onClick={() => router.back()}
            className="mt-5 rounded-2xl bg-[#5851EF] px-5 py-3 text-sm font-medium text-white"
          >
            {t("Go back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F7F8FC] text-[#111]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#EEF0F4] bg-white px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F3F5] text-[#111]"
            aria-label={t("Back")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#111]">{title}</p>
            <p className="text-[12px] text-[#757575]">{t("Question ____ of ____", currentIndex + 1, questions.length)}</p>
          </div>

          <div className="w-10" />
        </div>

        <div className="bg-white px-4 pb-4 pt-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF0F4]">
            <div className="h-full rounded-full bg-[#5851EF] transition-all" style={{ width: `${progressValue}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4 inline-flex rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-[#5851EF]">
              {currentQuestion?.type === "mcq" ? t("Multiple choice") : currentQuestion?.type === "fill_blanks" ? t("Fill in the blanks") : currentQuestion?.type === "true_false" ? t("True / False") : t("Question")}
            </div>

            <div
              className="text-[17px] font-semibold leading-7 text-[#111]"
              dangerouslySetInnerHTML={{ __html: currentQuestion?.htmlTitle || currentQuestion?.title || "" }}
            />

            <div className="mt-5 space-y-3">
              {currentQuestion?.type === "mcq" && currentQuestion.options.map((option) => {
                const selectedValues = Array.isArray(currentAnswer?.value) ? currentAnswer?.value : [];
                const checked = selectedValues.includes(option.value);

                return (
                  <button
                    key={option.value}
                    onClick={() => toggleMcqOption(currentQuestion, option.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${checked ? "border-[#5851EF] bg-[#EEF0FF]" : "border-[#E5E7EB] bg-white hover:bg-[#FAFAFA]"}`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${checked ? "border-[#5851EF] bg-[#5851EF]" : "border-[#CBD5E1] bg-white"}`}>
                      {checked && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#111]">{option.label}</span>
                  </button>
                );
              })}

              {currentQuestion?.type === "fill_blanks" && (
                <div className="space-y-3">
                  <input
                    value={typeof currentAnswer?.value === "string" ? currentAnswer.value : ""}
                    onChange={(event) => handleFillBlankChange(currentQuestion, event.target.value)}
                    placeholder={t("Type your answer, separate multiple blanks with commas")}
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] px-4 py-3 text-sm text-[#111] outline-none transition-colors focus:border-[#5851EF]"
                  />
                  <p className="text-xs leading-5 text-[#757575]">
                    {t("If the quiz expects more than one blank, enter them in order and separate them with commas.")}
                  </p>
                </div>
              )}

              {currentQuestion?.type === "true_false" && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "True", value: "true" },
                    { label: "False", value: "false" },
                  ].map((option) => {
                    const selected = currentAnswer?.value === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => setQuestionAnswer(currentQuestion, option.value)}
                        className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${selected ? "border-[#5851EF] bg-[#EEF0FF] text-[#5851EF]" : "border-[#E5E7EB] bg-white text-[#111] hover:bg-[#FAFAFA]"}`}
                      >
                        {t(option.label)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {submitError && (
              <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {submitError}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-[#EEF0F4] bg-white px-4 py-4">
          <div className="flex gap-3">
            <button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111] disabled:opacity-50"
            >
              {t("Previous")}
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={goNext}
                className="flex-1 rounded-2xl bg-[#5851EF] px-4 py-3 text-sm font-medium text-white"
              >
                {t("Next")}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-[#111827] px-4 py-3 text-sm font-medium text-white disabled:opacity-70"
              >
                {submitting ? t("Submitting...") : t("Submit Quiz")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}