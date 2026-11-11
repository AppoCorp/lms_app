"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/Input";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

export default function SignupPage() {
  const router = useRouter();
  const { baseUrl, setBaseUrl } = useApp();
  const { t } = useLanguage();

  const [serverUrl, setServerUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (baseUrl) {
      setServerUrl(baseUrl);
    }
  }, [baseUrl]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("Passwords do not match"));
      return;
    }
    
    if (!serverUrl.trim()) {
      setError(t("Please enter the Server URL"));
      return;
    }

    const cleanUrl = serverUrl.trim().replace(/\/+$/, "");
    setBaseUrl(cleanUrl);

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${cleanUrl}/api/signup?type=registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      if (response.status === 201 || response.ok) {
        // Registration successful
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.message || t("Registration failed. Please try again."));
      }
    } catch (err: any) {
      setError(err.message || t("An error occurred during registration"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-12 px-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="text-[#5851EF]">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#111111]">{t("Sign Up")}</h1>
        </div>

        {/* Login / Signup toggle pill */}
        <div className="bg-[#F5F5FA] p-1 rounded-full flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="px-5 py-2 rounded-full text-sm font-semibold text-[#757575] hover:text-[#111111] transition-all duration-200"
          >
            {t("Log In")}
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#5851EF] text-white shadow-md transition-all duration-200"
          >
            {t("Sign Up")}
          </button>
        </div>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col flex-1">
        {/* Your organization Section */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-bold text-[#111111] px-1">{t("Your organization")}</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-[#5851EF]">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 20.8543C5.56417 20.8543 1.14584 16.436 1.14584 11.0002C1.14584 5.56433 5.56417 1.146 11 1.146C16.4358 1.146 20.8542 5.56433 20.8542 11.0002C20.8542 16.436 16.4358 20.8543 11 20.8543ZM11 2.521C6.325 2.521 2.52084 6.32516 2.52084 11.0002C2.52084 15.6752 6.325 19.4793 11 19.4793C15.675 19.4793 19.4792 15.6752 19.4792 11.0002C19.4792 6.32516 15.675 2.521 11 2.521Z" fill="currentColor"/>
                <path d="M8.25 19.9376H7.33333C6.9575 19.9376 6.64583 19.626 6.64583 19.2501C6.64583 18.8743 6.93917 18.5718 7.315 18.5626C5.87583 13.6493 5.87583 8.35096 7.315 3.43762C6.93917 3.42846 6.64583 3.12596 6.64583 2.75012C6.64583 2.37429 6.9575 2.06262 7.33333 2.06262H8.25C8.47 2.06262 8.68083 2.17262 8.80917 2.34679C8.9375 2.53012 8.97417 2.75929 8.90083 2.97012C7.1775 8.14929 7.1775 13.851 8.90083 19.0393C8.97417 19.2501 8.9375 19.4793 8.80917 19.6626C8.68083 19.8276 8.47 19.9376 8.25 19.9376Z" fill="currentColor"/>
                <path d="M13.75 19.9376C13.6767 19.9376 13.6033 19.9284 13.53 19.9009C13.1725 19.7817 12.9708 19.3876 13.0992 19.0301C14.8225 13.8509 14.8225 8.14925 13.0992 2.96092C12.98 2.60342 13.1725 2.20925 13.53 2.09008C13.8967 1.97092 14.2817 2.16342 14.4008 2.52092C16.225 7.98425 16.225 13.9976 14.4008 19.4517C14.3092 19.7542 14.0342 19.9376 13.75 19.9376Z" fill="currentColor"/>
                <path d="M11 15.7668C8.4425 15.7668 5.89417 15.4093 3.4375 14.6851C3.42833 15.0518 3.12583 15.3543 2.75 15.3543C2.37417 15.3543 2.0625 15.0426 2.0625 14.6668V13.7501C2.0625 13.5301 2.1725 13.3193 2.34667 13.1909C2.53 13.0626 2.75917 13.0259 2.97 13.0993C8.14917 14.8226 13.86 14.8226 19.0392 13.0993C19.25 13.0259 19.4792 13.0626 19.6625 13.1909C19.8458 13.3193 19.9467 13.5301 19.9467 13.7501V14.6668C19.9467 15.0426 19.635 15.3543 19.2592 15.3543C18.8833 15.3543 18.5808 15.0609 18.5717 14.6851C16.1058 15.4093 13.5575 15.7668 11 15.7668Z" fill="currentColor"/>
                <path d="M19.25 8.93766C19.1767 8.93766 19.1033 8.92849 19.03 8.90099C13.8508 7.17766 8.14 7.17766 2.96084 8.90099C2.59417 9.02016 2.20917 8.82766 2.09 8.47016C1.98 8.10349 2.1725 7.71849 2.53 7.59933C7.99334 5.77516 14.0067 5.77516 19.4608 7.59933C19.8183 7.71849 20.02 8.11266 19.8917 8.47016C19.8092 8.75433 19.5342 8.93766 19.25 8.93766Z" fill="currentColor"/>
              </svg>
            </div>
            <input
              type="url"
              placeholder="https://example.com"
              value={serverUrl}
              onChange={(e) => {
                setServerUrl(e.target.value);
                setBaseUrl(e.target.value);
              }}
              className="w-full bg-white border-2 border-[#D3C9FC] focus:border-[#5851EF] rounded-[18px] py-4 pl-12 pr-12 outline-none transition-all duration-200 placeholder-gray-400 text-[15px] font-medium text-[#111111]"
              required
            />
            {serverUrl && serverUrl.startsWith("http") && (
              <div className="absolute right-4 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
            )}
          </div>
          <span className="text-[12px] text-[#757575] font-medium px-1">{t("Enter your organization's URL to continue")}</span>
        </div>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="mx-4 text-sm text-gray-400 font-medium">{t("and")}</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Registration details Section */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-bold text-[#111111] px-1">{t("Registration details")}</label>
          <div className="border border-gray-200 rounded-[20px] overflow-hidden bg-white">
            {/* Name Input */}
            <div className="relative flex items-center border-b border-gray-200 bg-white">
              <div className="absolute left-4 text-[#5851EF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input
                type="text"
                placeholder={t("Name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-4 outline-none text-[15px] text-[#111111] placeholder-gray-400 font-medium"
                required
              />
            </div>
            {/* Email Input */}
            <div className="relative flex items-center border-b border-gray-200 bg-white">
              <div className="absolute left-4 text-[#5851EF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <input
                type="email"
                placeholder={t("E-mail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-4 outline-none text-[15px] text-[#111111] placeholder-gray-400 font-medium"
                required
              />
            </div>
            {/* Password Input */}
            <div className="relative flex items-center border-b border-gray-200 bg-white">
              <div className="absolute left-4 text-[#5851EF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                placeholder={t("Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-4 outline-none text-[15px] text-[#111111] placeholder-gray-400 font-medium"
                required
              />
            </div>
            {/* Confirm Password Input */}
            <div className="relative flex items-center bg-white">
              <div className="absolute left-4 text-[#5851EF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                placeholder={t("Confirm Password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-4 outline-none text-[15px] text-[#111111] placeholder-gray-400 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-[25px] p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="w-full">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full text-white font-medium text-base py-4 rounded-2xl relative overflow-hidden flex justify-center border border-gray-100 disabled:opacity-70"
            style={{
              background: 'linear-gradient(to right, #CC61FF 5%, #5851EF 88%)'
            }}
          >
            {isLoading ? t("Signing Up...") : t("Sign Up")}
          </button>
        </div>
      </form>
    </div>
  );
}
