import React, { useState, useEffect } from 'react';
import { useI18n } from '../Contexts/I18nContext';
import { useToast } from '../Components/Toast';
import api from '../Lib/api';
import dayjs from 'dayjs';

export default function ReportsPage() {
    const { t, lang } = useI18n();
    const { showToast } = useToast();
    const [tab, setTab] = useState('daily');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [dailyData, setDailyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadDaily = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports/daily', { params: { date } });
            setDailyData(res.data);
        } catch (e) {
            showToast('Error loading report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadMonthly = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports/monthly', { params: { month } });
            setMonthlyData(res.data);
        } catch (e) {
            showToast('Error loading report', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === 'daily') loadDaily();
        else loadMonthly();
    }, [tab]);

    return (
        <div className="sk-app">
            <div className="sk-main container py-4">
                <h2 className="fw-bold mb-4">{t('reports')}</h2>

                <ul className="nav nav-pills mb-4">
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>
                            <i className="bi bi-calendar-day"></i> {t('dailyReport')}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>
                            <i className="bi bi-calendar-month"></i> {t('monthlyReport')}
                        </button>
                    </li>
                </ul>

                {tab === 'daily' && (
                    <>
                        <div className="row mb-3">
                            <div className="col-auto">
                                <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary" onClick={loadDaily}>{t('search')}</button>
                            </div>
                        </div>

                        {loading ? <div className="sk-spinner" /> : dailyData && (
                            <>
                                <div className="row g-3 mb-4">
                                    <div className="col-6 col-lg-3">
                                        <div className="sk-stat-card">
                                            <div className="sk-stat-icon" style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd' }}>
                                                <i className="bi bi-people-fill"></i>
                                            </div>
                                            <div className="sk-stat-value">{dailyData.summary.total_teachers}</div>
                                            <div className="sk-stat-label">{t('totalTeachers')}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-lg-3">
                                        <div className="sk-stat-card">
                                            <div className="sk-stat-icon" style={{ background: 'rgba(25,135,84,0.1)', color: '#198754' }}>
                                                <i className="bi bi-check-circle-fill"></i>
                                            </div>
                                            <div className="sk-stat-value">{dailyData.summary.present}</div>
                                            <div className="sk-stat-label">{t('present')}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-lg-3">
                                        <div className="sk-stat-card">
                                            <div className="sk-stat-icon" style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107' }}>
                                                <i className="bi bi-clock-fill"></i>
                                            </div>
                                            <div className="sk-stat-value">{dailyData.summary.late}</div>
                                            <div className="sk-stat-label">{t('late')}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 col-lg-3">
                                        <div className="sk-stat-card">
                                            <div className="sk-stat-icon" style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545' }}>
                                                <i className="bi bi-x-circle-fill"></i>
                                            </div>
                                            <div className="sk-stat-value">{dailyData.summary.absent}</div>
                                            <div className="sk-stat-label">{t('absent')}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="sk-card overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="sk-table">
                                            <thead>
                                                <tr>
                                                    <th>{t('name')}</th>
                                                    <th>{t('checkIn')}/{t('checkOut')}</th>
                                                    <th>{t('status')}</th>
                                                    <th>{t('distance')}</th>
                                                    <th>{t('date')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailyData.records.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center text-muted py-3">{t('noRecords')}</td></tr>
                                                ) : (
                                                    dailyData.records.map((r) => (
                                                        <tr key={r.id}>
                                                            <td>{lang === 'km' && r.teacher?.full_name_km ? r.teacher.full_name_km : r.teacher?.name}</td>
                                                            <td>{r.check_type === 'check_in' ? t('checkIn') : t('checkOut')}</td>
                                                            <td><span className={`sk-badge sk-badge-${r.status}`}>{t(r.status)}</span></td>
                                                            <td>{r.distance_meters ? `${Number(r.distance_meters).toFixed(0)}m` : '-'}</td>
                                                            <td>{dayjs(r.scanned_at).format('HH:mm')}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {tab === 'monthly' && (
                    <>
                        <div className="row mb-3">
                            <div className="col-auto">
                                <input type="month" className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-primary" onClick={loadMonthly}>{t('search')}</button>
                            </div>
                        </div>

                        {loading ? <div className="sk-spinner" /> : monthlyData && (
                            <div className="sk-card overflow-hidden">
                                <div className="table-responsive">
                                    <table className="sk-table">
                                        <thead>
                                            <tr>
                                                <th>{t('name')}</th>
                                                <th>{t('presentDays')}</th>
                                                <th>{t('lateDays')}</th>
                                                <th>{t('totalCheckins')}</th>
                                                <th>{t('totalCheckouts')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyData.report.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center text-muted py-3">{t('noData')}</td></tr>
                                            ) : (
                                                monthlyData.report.map((row, i) => (
                                                    <tr key={i}>
                                                        <td>{lang === 'km' && row.teacher?.full_name_km ? row.teacher.full_name_km : row.teacher?.name}</td>
                                                        <td><span className="sk-badge sk-badge-present">{row.present_days}</span></td>
                                                        <td><span className="sk-badge sk-badge-late">{row.late_days}</span></td>
                                                        <td>{row.total_checkins}</td>
                                                        <td>{row.total_checkouts}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
