import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';
import { useToast } from '../Components/Toast';
import api from '../Lib/api';

export default function SettingsPage() {
    const { user } = useAuth();
    const { t, lang, toggleLang } = useI18n();
    const { showToast } = useToast();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        api.get('/settings')
            .then(res => setSettings(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', settings);
            showToast(t('settingsSaved'), 'success');
        } catch (err) {
            showToast('Error saving settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const update = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="sk-app">
            <div className="sk-main container py-4">
                <h2 className="fw-bold mb-4">{t('settings')}</h2>

                <div className="sk-card p-4 mb-4">
                    <h5 className="fw-bold mb-3"><i className="bi bi-translate"></i> {t('profile')}</h5>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-semibold">{user?.name}</div>
                            <div className="text-muted small">{user?.email}</div>
                            <div className="text-muted small">{t(user?.role)}</div>
                        </div>
                        <div className="sk-lang-toggle">
                            <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
                            <button className={lang === 'km' ? 'active' : ''} onClick={() => lang !== 'km' && toggleLang()}>ខ្មែរ</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="sk-spinner" />
                ) : settings && isAdmin ? (
                    <form onSubmit={handleSave}>
                        <div className="sk-card p-4 mb-4">
                            <h5 className="fw-bold mb-3"><i className="bi bi-building"></i> {t('schoolName')}</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">{t('schoolName')}</label>
                                    <input type="text" className="form-control" value={settings.school_name || ''} onChange={(e) => update('school_name', e.target.value)} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">{t('schoolNameKm')}</label>
                                    <input type="text" className="form-control" value={settings.school_name_km || ''} onChange={(e) => update('school_name_km', e.target.value)} required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('latitude')}</label>
                                    <input type="number" step="any" className="form-control" value={settings.latitude || ''} onChange={(e) => update('latitude', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('longitude')}</label>
                                    <input type="number" step="any" className="form-control" value={settings.longitude || ''} onChange={(e) => update('longitude', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('radiusMeters')}</label>
                                    <input type="number" className="form-control" value={settings.radius_meters || ''} onChange={(e) => update('radius_meters', e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div className="sk-card p-4 mb-4">
                            <h5 className="fw-bold mb-3"><i className="bi bi-sun"></i> {t('morningShift')}</h5>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('morningStart')}</label>
                                    <input type="time" className="form-control" value={settings.morning_start || ''} onChange={(e) => update('morning_start', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('morningLateAfter')}</label>
                                    <input type="time" className="form-control" value={settings.morning_late_after || ''} onChange={(e) => update('morning_late_after', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('morningEnd')}</label>
                                    <input type="time" className="form-control" value={settings.morning_end || ''} onChange={(e) => update('morning_end', e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div className="sk-card p-4 mb-4">
                            <h5 className="fw-bold mb-3"><i className="bi bi-moon"></i> {t('afternoonShift')}</h5>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('afternoonStart')}</label>
                                    <input type="time" className="form-control" value={settings.afternoon_start || ''} onChange={(e) => update('afternoon_start', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('afternoonLateAfter')}</label>
                                    <input type="time" className="form-control" value={settings.afternoon_late_after || ''} onChange={(e) => update('afternoon_late_after', e.target.value)} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">{t('afternoonEnd')}</label>
                                    <input type="time" className="form-control" value={settings.afternoon_end || ''} onChange={(e) => update('afternoon_end', e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                            {saving ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-save"></i> {t('saveSettings')}</>}
                        </button>
                    </form>
                ) : settings ? (
                    <div className="sk-card p-4">
                        <h5 className="fw-bold mb-3">{settings.school_name}</h5>
                        <p className="text-muted">{settings.school_name_km}</p>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="text-muted small">{t('morningStart')}</div>
                                <div className="fw-semibold">{settings.morning_start}</div>
                            </div>
                            <div className="col-6">
                                <div className="text-muted small">{t('afternoonStart')}</div>
                                <div className="fw-semibold">{settings.afternoon_start}</div>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-6">
                                <div className="text-muted small">{t('radiusMeters')}</div>
                                <div className="fw-semibold">{settings.radius_meters}m</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
