import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Contexts/AuthContext';
import { I18nProvider } from './Contexts/I18nContext';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import AttendancePage from './Pages/AttendancePage';
import TeachersPage from './Pages/TeachersPage';
import ReportsPage from './Pages/ReportsPage';
import SettingsPage from './Pages/SettingsPage';
import BottomNav from './Components/BottomNav';
import Toast from './Components/Toast';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="sk-spinner" />;
    if (!user) return <Navigate to="/login" />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
                <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            {user && <BottomNav />}
        </>
    );
}

export default function App() {
    return (
        <I18nProvider>
            <AuthProvider>
                <AppRoutes />
                <Toast />
            </AuthProvider>
        </I18nProvider>
    );
}
