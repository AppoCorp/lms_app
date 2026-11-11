"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilters } from "../../hooks/useFilters";
import { Button } from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

export default function FilterScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { categories, languages, isLoading, fetchFiltersData } = useFilters();

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCat, setSelectedSubCat] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  // Derived sub-categories based on selected category
  const activeCategory = categories.find((cat: any) => cat.id.toString() === selectedCategory);
  const subCategories = activeCategory?.childs || [];

  const handleReset = () => {
    setKeyword("");
    setSelectedCategory("all");
    setSelectedSubCat("all");
    setSelectedPrice("all");
    setSelectedLevel("all");
    setSelectedLanguage("all");
    setSelectedRating("all");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Construct query parameters
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("search", keyword.trim());
    if (selectedSubCat !== "all") {
      params.append("category_id", selectedSubCat);
    } else if (selectedCategory !== "all") {
      params.append("category_id", selectedCategory);
    }
    if (selectedPrice !== "all") params.append("price", selectedPrice);
    if (selectedLevel !== "all") params.append("level", selectedLevel);
    if (selectedLanguage !== "all") params.append("language", selectedLanguage);
    if (selectedRating !== "all") params.append("rating", selectedRating);

    router.push(`/courses?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-xl font-bold text-[#111]">{t("Filter Courses")}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <p className="text-gray-500">{t("Loading filters...")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={t("Search")}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-[#F5F7FA] border border-gray-100 rounded-[16px] px-4 py-4 text-base focus:outline-none focus:border-gray-200"
              />
              <button 
                type="button"
                onClick={() => handleSubmit()}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </div>

            {/* Header: Category & Reset */}
            <div className="flex justify-between items-center pt-2">
              <h2 className="text-[18px] font-medium text-[#111]">{t("Category")}</h2>
              <button type="button" onClick={handleReset} className="text-[18px] font-medium text-[var(--color-primary)]">
                {t("Reset")}
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCat("all");
                }}
                className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
              >
                <option value="all">{t("All Category")}</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.title || cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            {/* Sub Category Dropdown */}
            <div>
              <h2 className="text-[16px] font-normal text-[#111] mb-2">{t("Sub Category")}</h2>
              <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
                <select
                  value={selectedSubCat}
                  onChange={(e) => setSelectedSubCat(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
                  disabled={subCategories.length === 0}
                >
                  <option value="all">{t("All Sub-Category")}</option>
                  {subCategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id.toString()}>{sub.title || sub.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Pricing Dropdown */}
            <div>
              <h2 className="text-[16px] font-normal text-[#111] mb-2">{t("Pricing")}</h2>
              <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
                >
                  <option value="all">{t("All Price")}</option>
                  <option value="free">{t("Free")}</option>
                  <option value="paid">{t("Paid")}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Level Dropdown */}
            <div>
              <h2 className="text-[16px] font-normal text-[#111] mb-2">{t("Level")}</h2>
              <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
                >
                  <option value="all">{t("All Level")}</option>
                  <option value="beginner">{t("Beginner")}</option>
                  <option value="intermediate">{t("Intermediate")}</option>
                  <option value="advanced">{t("Advanced")}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Language Dropdown */}
            <div>
              <h2 className="text-[16px] font-normal text-[#111] mb-2">{t("Language")}</h2>
              <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
                >
                  <option value="all">{t("All Language")}</option>
                  {languages.map((lang: any) => (
                    <option key={lang.id} value={lang.value}>{lang.displayedValue}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Rating Dropdown */}
            <div>
              <h2 className="text-[16px] font-normal text-[#111] mb-2">{t("Rating")}</h2>
              <div className="bg-[#F5F7FA] rounded-[16px] px-4 py-1 relative">
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full bg-transparent border-none outline-none py-3 text-[#555] text-[15px] appearance-none"
                >
                  <option value="all">{t("All Ratings")}</option>
                  <option value="1">⭐☆☆☆☆</option>
                  <option value="2">⭐⭐☆☆☆</option>
                  <option value="3">⭐⭐⭐☆☆</option>
                  <option value="4">⭐⭐⭐⭐☆</option>
                  <option value="5">⭐⭐⭐⭐⭐</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

          </form>
        )}
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 flex justify-center z-20">
        <Button onClick={() => handleSubmit()} className="w-[140px] shadow-sm">
          {t("Filter")}
        </Button>
      </div>
    </div>
  );
}
