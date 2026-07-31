import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';
import { useToast } from '../Components/Toast';
import api from '../Lib/api';
import { useGps } from '../Hooks/useGps';
import { QRCodeCanvas } from 'qrcode.react';
import dayjs from 'dayjs';

export default function AttendancePage() {
    const { user } = useAuth();
    const { t, lang } = useI18n();
    const { showToast } = useToast();
    const { location, status, error, getLocation } = useGps();

    const [teacher, setTeacher] = useState(null);
    const [todayRecords, setTodayRecords] = useState([]);
    const [qrCode, setQrCode] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [scannedQr, setScannedQr] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        loadTodayRecords();
    }, []);

    const loadTodayRecords = async () => {
        try {
            const res = await api.get('/attendance/today');
            setTodayRecords(res.data);
        } catch (e) {
            // teacher profile might not exist
        }
    };

    const handleCheckIn = async (shift) => {
        setSubmitting(true);
        try {
            const loc = await getLocation();
            const res = await api.post('/attendance/check-in', {
                teacher_id: teacher?.id,
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy_meters: loc.accuracy,
                qr_code: scannedQr || null,
                shift,
            });
            showToast(res.data.message, res.data.status === 'late' ? 'warning' : 'success');
            setScannedQr('');
            loadTodayRecords();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckOut = async (shift) => {
        setSubmitting(true);
        try {
            const loc = location || await getLocation();
            const res = await api.post('/attendance/check-out', {
                teacher_id: teacher?.id,
                latitude: loc?.latitude,
                longitude: loc?.longitude,
                shift,
            });
            showToast(res.data.message, 'success');
            loadTodayRecords();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const generateQr = async () => {
        try {
            const res = await api.get('/attendance/qr-code');
            setQrCode(res.data.qr_code);
            setShowQr(true);
        } catch (e) {
            showToast('Error generating QR', 'error');
        }
    };

    const hasCheckedIn = (shift) => {
        return todayRecords.some(r => r.check_type === 'check_in' && r.shift === shift);
    };

    const hasCheckedOut = (shift) => {
        return todayRecords.some(r => r.check_type === 'check_out' && r.shift === shift);
    };

    const gpsStatusClass = status === 'success' ? 'success' : status === 'error' ? 'error' : status === 'loading' ? 'loading' : '';
    const gpsStatusText = status === 'success' ? t('locationSuccess') : status === 'error' ? t('locationError') : status === 'loading' ? t('gettingLocation') : '';

    return (
        <div className="sk-app">
            <div className="sk-main container py-4">
                <h2 className="fw-bold mb-4">{t('attendance')}</h2>

                <div className="sk-card p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">{t('qrCode')}</h5>
                        <button className="btn btn-outline-primary btn-sm" onClick={generateQr}>
                            <i className="bi bi-qr-code"></i> {t('generateQr')}
                        </button>
                    </div>
                    {showQr && qrCode && (
                        <div className="text-center">
                            <div className="sk-qr-container d-inline-block">
                                <QRCodeCanvas value={qrCode} size={200} />
                                <p className="mt-2 mb-0 text-muted small">{qrCode}</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-3">
                        <label className="form-label">{t('scanQrCode')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={scannedQr}
                            onChange={(e) => setScannedQr(e.target.value)}
                            placeholder={t('qrCode')}
                        />
                    </div>
                </div>

                <div className="sk-card p-4 mb-4">
                    <h5 className="fw-bold mb-3"><i className="bi bi-geo-alt"></i> GPS</h5>
                    {status !== 'idle' && (
                        <div className={`sk-gps-status ${gpsStatusClass} mb-3`}>
                            <i className={`bi ${status === 'success' ? 'bi-check-circle' : status === 'error' ? 'bi-x-circle' : 'bi-arrow-repeat'}`}></i>
                            {gpsStatusText}
                        </div>
                    )}
                    {location && (
                        <div className="small text-muted">
                            <div>Lat: {Number(location.latitude).toFixed(6)}, Lng: {Number(location.longitude).toFixed(6)}</div>
                            {settings && <div>{t('radiusMeters')}: {settings.radius_meters}m</div>}
                        </div>
                    )}
                    <button className="btn btn-outline-secondary btn-sm mt-2" onClick={getLocation}>
                        <i className="bi bi-crosshair"></i> {t('gettingLocation')}
                    </button>
                </div>

                <div className="sk-card p-4 mb-4">
                    <h5 className="fw-bold mb-3">{t('morningShift')}</h5>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success sk-attendance-btn"
                            onClick={() => handleCheckIn('morning')}
                            disabled={submitting || hasCheckedIn('morning')}
                        >
                            <i className="bi bi-box-arrow-in-right"></i>
                            {hasCheckedIn('morning') ? t('checkedIn') : t('checkIn')}
                        </button>
                        <button
                            className="btn btn-danger sk-attendance-btn"
                            onClick={() => handleCheckOut('morning')}
                            disabled={submitting || !hasCheckedIn('morning') || hasCheckedOut('morning')}
                        >
                            <i className="bi bi-box-arrow-right"></i>
                            {hasCheckedOut('morning') ? t('checkedOut') : t('checkOut')}
                        </button>
                    </div>
                </div>

                <div className="sk-card p-4 mb-4">
                    <h5 className="fw-bold mb-3">{t('afternoonShift')}</h5>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success sk-attendance-btn"
                            onClick={() => handleCheckIn('afternoon')}
                            disabled={submitting || hasCheckedIn('afternoon')}
                        >
                            <i className="bi bi-box-arrow-in-right"></i>
                            {hasCheckedIn('afternoon') ? t('checkedIn') : t('checkIn')}
                        </button>
                        <button
                            className="btn btn-danger sk-attendance-btn"
                            onClick={() => handleCheckOut('afternoon')}
                            disabled={submitting || !hasCheckedIn('afternoon') || hasCheckedOut('afternoon')}
                        >
                            <i className="bi bi-box-arrow-right"></i>
                            {hasCheckedOut('afternoon') ? t('checkedOut') : t('checkOut')}
                        </button>
                    </div>
                </div>

                <div className="sk-card p-4">
                    <h5 className="fw-bold mb-3">{t('todayRecords')}</h5>
                    {todayRecords.length === 0 ? (
                        <p className="text-muted text-center py-3">{t('noRecords')}</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="sk-table">
                                <thead>
                                    <tr>
                                        <th>{t('checkIn')}/{t('checkOut')}</th>
                                        <th>{t('status')}</th>
                                        <th>{t('distance')}</th>
                                        <th>{t('date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayRecords.map((r) => (
                                        <tr key={r.id}>
                                            <td>
                                                <i className={`bi ${r.check_type === 'check_in' ? 'bi-box-arrow-in-right text-success' : 'bi-box-arrow-right text-danger'}`}></i>
                                                {' '}{r.check_type === 'check_in' ? t('checkIn') : t('checkOut')}
                                            </td>
                                            <td>
                                                <span className={`sk-badge sk-badge-${r.status}`}>
                                                    {t(r.status)}
                                                </span>
                                            </td>
                                            <td>{r.distance_meters ? `${Number(r.distance_meters).toFixed(0)}m` : '-'}</td>
                                            <td>{dayjs(r.scanned_at).format('HH:mm')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
