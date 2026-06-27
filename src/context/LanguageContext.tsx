import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "../translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("bedfinder_lang") as Language;
    if (saved === "en" || saved === "hi" || saved === "mr") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("bedfinder_lang", lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const translation = translations[key]?.[language] || translations[key]?.["en"] || key;
    if (!replacements) return translation;
    let result = translation;
    for (const [k, v] of Object.entries(replacements)) {
      result = result.replace(`{${k}}`, String(v));
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
