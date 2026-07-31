import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useI18n } from '../Contexts/I18nContext';
import { useToast } from '../Components/Toast';
import api from '../Lib/api';
import dayjs from 'dayjs';

export default function TeachersPage() {
    const { user } = useAuth();
    const { t, lang } = useI18n();
    const { showToast } = useToast();
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [form, setForm] = useState({ name: '', full_name_km: '', email: '', phone: '', employee_code: '', gender: 'male', department_id: '', hire_date: '' });

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        loadTeachers();
        api.get('/teachers/departments/all').then(res => setDepartments(res.data)).catch(() => {});
    }, []);

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/teachers', { params: { search } });
            setTeachers(res.data.data || res.data);
        } catch (e) {
            showToast('Error loading teachers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadTeachers();
    };

    const openAdd = () => {
        setEditingTeacher(null);
        setForm({ name: '', full_name_km: '', email: '', phone: '', employee_code: '', gender: 'male', department_id: '', hire_date: '' });
        setShowModal(true);
    };

    const openEdit = (teacher) => {
        setEditingTeacher(teacher);
        setForm({
            name: teacher.name || '',
            full_name_km: teacher.full_name_km || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            employee_code: teacher.employee_code || '',
            gender: teacher.gender || 'male',
            department_id: teacher.department_id || '',
            hire_date: teacher.hire_date ? dayjs(teacher.hire_date).format('YYYY-MM-DD') : '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                await api.put(`/teachers/${editingTeacher.id}`, form);
                showToast('Teacher updated', 'success');
            } else {
                await api.post('/teachers', form);
                showToast('Teacher added', 'success');
            }
            setShowModal(false);
            loadTeachers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete'))) return;
        try {
            await api.delete(`/teachers/${id}`);
            showToast('Teacher deleted', 'success');
            loadTeachers();
        } catch (e) {
            showToast('Error deleting', 'error');
        }
    };

    return (
        <div className="sk-app">
            <div className="sk-main container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold mb-0">{t('teachers')}</h2>
                    {isAdmin && (
                        <button className="btn btn-primary btn-sm" onClick={openAdd}>
                            <i className="bi bi-plus-lg"></i> {t('addTeacher')}
                        </button>
                    )}
                </div>

                <form onSubmit={handleSearch} className="mb-3">
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('search')}
                        />
                        <button className="btn btn-outline-primary" type="submit">{t('search')}</button>
                    </div>
                </form>

                {loading ? (
                    <div className="sk-spinner" />
                ) : teachers.length === 0 ? (
                    <div className="text-center text-muted py-5">{t('noData')}</div>
                ) : (
                    <div className="sk-card overflow-hidden">
                        <div className="table-responsive">
                            <table className="sk-table">
                                <thead>
                                    <tr>
                                        <th>{t('name')}</th>
                                        <th>{t('employeeCode')}</th>
                                        <th>{t('department')}</th>
                                        <th>{t('phone')}</th>
                                        <th>{t('status')}</th>
                                        {isAdmin && <th>{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map((teacher) => (
                                        <tr key={teacher.id}>
                                            <td>
                                                <div className="fw-semibold">{lang === 'km' && teacher.full_name_km ? teacher.full_name_km : teacher.name}</div>
                                                {teacher.email && <div className="small text-muted">{teacher.email}</div>}
                                            </td>
                                            <td>{teacher.employee_code || '-'}</td>
                                            <td>{lang === 'km' && teacher.department?.name_km ? teacher.department.name_km : teacher.department?.name || '-'}</td>
                                            <td>{teacher.phone || '-'}</td>
                                            <td>
                                                <span className={`sk-badge sk-badge-${teacher.status === 'active' ? 'present' : teacher.status === 'on_leave' ? 'late' : 'absent'}`}>
                                                    {t(teacher.status === 'on_leave' ? 'onLeave' : teacher.status === 'active' ? 'active' : 'inactive')}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(teacher)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(teacher.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} style={{ zIndex: 1050 }} />
                    <div className="modal d-block" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingTeacher ? t('editTeacher') : t('addTeacher')}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">{t('name')} *</label>
                                            <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{t('name')} (ខ្មែរ)</label>
                                            <input type="text" className="form-control" value={form.full_name_km} onChange={(e) => setForm({...form, full_name_km: e.target.value})} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{t('email')}</label>
                                            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                                        </div>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <label className="form-label">{t('phone')}</label>
                                                <input type="text" className="form-control" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label">{t('employeeCode')}</label>
                                                <input type="text" className="form-control" value={form.employee_code} onChange={(e) => setForm({...form, employee_code: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 mb-3">
                                                <label className="form-label">{t('gender')}</label>
                                                <select className="form-select" value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
                                                    <option value="male">{t('male')}</option>
                                                    <option value="female">{t('female')}</option>
                                                    <option value="other">{t('other')}</option>
                                                </select>
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label">{t('department')}</label>
                                                <select className="form-select" value={form.department_id} onChange={(e) => setForm({...form, department_id: e.target.value})}>
                                                    <option value="">-</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{lang === 'km' && d.name_km ? d.name_km : d.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">{t('hireDate')}</label>
                                            <input type="date" className="form-control" value={form.hire_date} onChange={(e) => setForm({...form, hire_date: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                                        <button type="submit" className="btn btn-primary">{t('save')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
