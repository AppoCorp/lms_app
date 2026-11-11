"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { AlertPopup } from "../../components/AlertPopup";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Only the domain part — https:// is prepended automatically
  const [serverDomain, setServerDomain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { baseUrl, setBaseUrl } = useApp();
  const { t } = useLanguage();

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

  useEffect(() => {
    // Only pre-fill if the user previously saved a real org URL (not the Vercel deployment URL)
    if (baseUrl && !baseUrl.includes('vercel.app') && !baseUrl.includes('localhost')) {
      // Strip the https:// prefix since we show that separately
      setServerDomain(baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, ''));
    }
  }, [baseUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverDomain.trim()) {
      showAlert(t("Please enter your organization's URL."), "error");
      return;
    }
    if (!email.trim()) {
      showAlert(t("Please enter your email."), "error");
      return;
    }
    if (!password.trim()) {
      showAlert(t("Please enter your password."), "error");
      return;
    }

    // Build full URL from domain — always use https://
    const cleanDomain = serverDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const cleanUrl = `https://${cleanDomain}`;
    setBaseUrl(cleanUrl);
    
    setIsLoading(true);

    try {
      let response: Response;
      try {
        response = await fetch(`${cleanUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email, password }).toString()
        });
      } catch {
        // Network/DNS error — URL is unreachable
        showAlert(t("Could not reach this organization. Please check the URL and try again."), "error");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (response.status === 201) {
        if (data.user?.email_verified_at) {
          login(data.token, data.user);
          showAlert(t("Login Successful"), "success");
          setTimeout(() => { router.push("/account"); }, 1000);
        } else {
          showAlert(t("Your email is not verified. Please check your inbox and verify your email before logging in."), "info");
        }
      } else if (response.status === 401) {
        showAlert(t("Incorrect password. Please try again."), "error");
      } else if (response.status === 404) {
        showAlert(t("No account found with this email address."), "error");
      } else if (response.status === 403) {
        showAlert(t("Your account has been disabled. Please contact support."), "error");
      } else {
        const msg = data?.message || "";
        if (msg.toLowerCase().includes("password")) {
          showAlert(t("Incorrect password. Please try again."), "error");
        } else if (msg.toLowerCase().includes("email")) {
          showAlert(t("No account found with this email address."), "error");
        } else if (msg.toLowerCase().includes("verified")) {
          showAlert(t("Your email is not verified. Please check your inbox."), "info");
        } else {
          showAlert(msg || t("Login failed. Please try again."), "error");
        }
      }
    } catch {
      showAlert(t("Something went wrong. Please try again."), "error");
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
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#111111]">{t("Log In")}</h1>
        </div>

        {/* Login / Signup toggle pill */}
        <div className="bg-[#F5F5FA] p-1 rounded-full flex items-center shadow-inner">
          <button
            type="button"
            className="px-5 py-2 rounded-full text-sm font-semibold bg-[#5851EF] text-white shadow-md transition-all duration-200"
          >
            {t("Log In")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="px-5 py-2 rounded-full text-sm font-semibold text-[#757575] hover:text-[#111111] transition-all duration-200"
          >
            {t("Sign Up")}
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} noValidate className="flex flex-col flex-1">
        {/* Your organization Section */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-bold text-[#111111] px-1">{t("Your organization")}</label>
          <div className="flex items-center bg-white border-2 border-[#D3C9FC] focus-within:border-[#5851EF] rounded-[18px] overflow-hidden transition-all duration-200">
            {/* Fixed https:// prefix */}
            <span className="pl-4 pr-1 text-[15px] font-semibold text-[#5851EF] select-none whitespace-nowrap">https://</span>
            <input
              type="text"
              placeholder="yourorganization.com"
              value={serverDomain}
              onChange={(e) => {
                // Strip any accidentally pasted protocol
                const val = e.target.value.replace(/^https?:\/\//, '');
                setServerDomain(val);
              }}
              className="flex-1 bg-transparent py-4 pr-4 outline-none placeholder-gray-400 text-[15px] font-medium text-[#111111] min-w-0"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            {serverDomain.trim() && (
              <div className="pr-4 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
            )}
          </div>
          <span className="text-[12px] text-[#757575] font-medium px-1">{t("Enter your organization's domain to continue")}</span>
        </div>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="mx-4 text-sm text-gray-400 font-medium">{t("and")}</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Login details Section */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-bold text-[#111111] px-1">{t("Login details")}</label>
          <div className="border border-gray-200 rounded-[20px] overflow-hidden bg-white">
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
            <div className="relative flex items-center bg-white">
              <div className="absolute left-4 text-[#5851EF]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("Password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-12 outline-none text-[15px] text-[#111111] placeholder-gray-400 font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-8 px-1">
          <Link href="/forgot-password" className="text-[#5851EF] font-semibold text-sm hover:underline">
            {t("Forgot password?")}
          </Link>
        </div>

        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center p-4 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5851EF]"></div>
            </div>
          ) : (
            <button 
              type="submit" 
              className="w-full text-white font-medium text-base py-4 rounded-2xl mb-4 relative overflow-hidden flex justify-center"
              style={{ background: 'linear-gradient(to right, #CC61FF 5%, #5851EF 88%)' }}
            >
              {t("Log In")}
            </button>
          )}
        </div>
      </form>
      <AlertPopup isOpen={alertState.isOpen} message={alertState.message} type={alertState.type} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
