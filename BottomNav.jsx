import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';

export default function BottomNav() {
    const { t } = useI18n();
    const { user } = useAuth();
    const navigate = useNavigate();

    const items = [
        { to: '/', icon: 'bi-grid', label: t('dashboard') },
        { to: '/attendance', icon: 'bi-geo-alt', label: t('attendance') },
        { to: '/teachers', icon: 'bi-people', label: t('teachers') },
        { to: '/reports', icon: 'bi-bar-chart', label: t('reports') },
        { to: '/settings', icon: 'bi-gear', label: t('settings') },
    ];

    return (
        <nav className="sk-bottom-nav">
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sk-nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
