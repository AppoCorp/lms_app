"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "../components/Input";

import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";

export default function SearchPage() {
  const router = useRouter();
  const { baseUrl } = useApp();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || !baseUrl) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${baseUrl}/api/courses_by_search_string?search_string=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const PlaceholderImage = () => (
    <div className="w-full h-full bg-[#E8EDF1] flex items-center justify-center rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header & Search Bar */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-[var(--color-text-dark)] p-1 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text-dark)]">{t("Search")}</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="flex-1">
            <Input 
              placeholder={t("Search for courses...")} 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-0 border-gray-200 bg-gray-50"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              }
            />
          </div>
          <button type="button" onClick={() => router.push('/filter')} className="w-12 h-12 mb-4 bg-[var(--color-background-input)] rounded-xl flex items-center justify-center text-[var(--color-text-dark)] border border-[var(--color-border-input)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {hasSearched && (
          <h2 className="text-sm font-bold text-[var(--color-text-grey)] mb-4 uppercase tracking-wider">
            {searchResults.length > 0 ? t("Top Results") : t("No Results Found")}
          </h2>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500">{t("Searching...")}</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {searchResults.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="bg-white rounded-2xl p-3 flex shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-50 h-[120px]">
                <div className="w-24 h-full bg-gray-200 rounded-xl flex-shrink-0 mr-4 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlaceholderImage />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1 pr-2 h-full">
                  <div>
                    <h3 className="font-bold text-[var(--color-text-dark)] text-sm line-clamp-2 leading-tight mb-1">{course.title}</h3>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {course.is_paid === 0 || course.isFree ? (
                      <span className="font-bold text-[var(--color-primary)]">{t("Free")}</span>
                    ) : (
                      <span className="font-bold text-[var(--color-primary)]">{course.price}</span>
                    )}
                    <div className="flex items-center text-xs text-[var(--color-text-grey)]">
                      <span className="text-[var(--color-accent-star)] mr-1">★</span> {course.average_rating || "0.0"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
