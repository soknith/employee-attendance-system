import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';

export default function LoginPage() {
    const { login } = useAuth();
    const { t, lang, toggleLang } = useI18n();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(t('loginError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sk-login-container">
            <div className="sk-login-card">
                <div className="sk-login-logo">
                    <div className="logo-icon">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <h1 className="sk-login-title">{t('appName')}</h1>
                    <p className="sk-login-subtitle">{lang === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងវត្តមាន' : 'Attendance Management System'}</p>
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <div className="sk-lang-toggle">
                        <button className={lang === 'en' ? 'active' : ''} onClick={() => lang !== 'en' && toggleLang()}>EN</button>
                        <button className={lang === 'km' ? 'active' : ''} onClick={() => lang !== 'km' && toggleLang()}>ខ្មែរ</button>
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t('email')}</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">{t('password')}</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock"></i></span>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" /> : t('signIn')}
                    </button>
                </form>
            </div>
        </div>
    );
}
