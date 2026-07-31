import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';
import api from '../Lib/api';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { t, lang, toggleLang } = useI18n();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports/summary')
            .then(res => setSummary(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { icon: 'bi-people-fill', color: '#0d6efd', bg: 'rgba(13,110,253,0.1)', value: summary?.total_teachers ?? 0, label: t('totalTeachers') },
        { icon: 'bi-check-circle-fill', color: '#198754', bg: 'rgba(25,135,84,0.1)', value: summary?.checked_in_today ?? 0, label: t('checkedInToday') },
        { icon: 'bi-clock-fill', color: '#ffc107', bg: 'rgba(255,193,7,0.1)', value: summary?.late_today ?? 0, label: t('lateToday') },
        { icon: 'bi-x-circle-fill', color: '#dc3545', bg: 'rgba(220,53,69,0.1)', value: summary?.absent_today ?? 0, label: t('absentToday') },
    ];

    const monthStats = [
        { icon: 'bi-calendar-check', color: '#198754', bg: 'rgba(25,135,84,0.1)', value: summary?.total_present_this_month ?? 0, label: t('totalPresentMonth') },
        { icon: 'bi-calendar-x', color: '#ffc107', bg: 'rgba(255,193,7,0.1)', value: summary?.total_late_this_month ?? 0, label: t('totalLateMonth') },
    ];

    return (
        <div className="sk-app">
            <div className="sk-main container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0">{t('welcome')}, {user?.name}</h2>
                        <p className="text-muted mb-0">{new Date().toLocaleDateString(lang === 'km' ? 'km-KH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="sk-lang-toggle">
                            <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
                            <button className={lang === 'km' ? 'active' : ''} onClick={() => lang !== 'km' && toggleLang()}>ខ្មែរ</button>
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                            <i className="bi bi-box-arrow-right"></i>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="sk-spinner" />
                ) : (
                    <>
                        <div className="row g-3 mb-4">
                            {stats.map((stat, i) => (
                                <div className="col-6 col-lg-3" key={i}>
                                    <div className="sk-stat-card">
                                        <div className="sk-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                            <i className={`bi ${stat.icon}`}></i>
                                        </div>
                                        <div className="sk-stat-value">{stat.value}</div>
                                        <div className="sk-stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h5 className="fw-bold mb-3">{t('summary')}</h5>
                        <div className="row g-3 mb-4">
                            {monthStats.map((stat, i) => (
                                <div className="col-6" key={i}>
                                    <div className="sk-stat-card">
                                        <div className="sk-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                            <i className={`bi ${stat.icon}`}></i>
                                        </div>
                                        <div className="sk-stat-value">{stat.value}</div>
                                        <div className="sk-stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sk-card p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="fw-bold mb-0">{t('attendance')}</h5>
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/attendance')}>
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </div>
                            <p className="text-muted mb-0">{t('checkIn')} / {t('checkOut')}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
