import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const I18nContext = createContext();

export function I18nProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', lang);
        document.body.className = lang === 'km' ? 'lang-km' : '';
    }, [lang]);

    const t = useCallback((key) => {
        return translations[lang]?.[key] || translations.en[key] || key;
    }, [lang]);

    const toggleLang = () => setLang(prev => prev === 'en' ? 'km' : 'en');

    return (
        <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
}
