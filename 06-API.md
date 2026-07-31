# 06 — API Specification

## Base URL

- **Active:** Supabase client (no base URL needed)
- **Production:** `http://localhost:8000/api/v1` (Laravel)

## Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <token>
Accept-Language: en|km
```

## Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Email + password login |
| POST | /auth/logout | Invalidate token |
| GET | /auth/me | Current user profile |
| PUT | /auth/profile | Update profile (phone, email) |
| PUT | /auth/password | Change password |
| POST | /auth/profile/photo | Upload profile photo |
| DELETE | /auth/profile/photo | Remove profile photo |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Role-based dashboard data |

### Attendance
| Method | Path | Description |
|--------|------|-------------|
| GET | /attendance/today | Today's attendance record |
| GET | /attendance/history | Paginated attendance history |
| POST | /attendance/check-in | GPS check-in |
| POST | /attendance/check-out | GPS check-out |
| POST | /attendance/verify-gps | Verify GPS within geofence |

### Teachers (Admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | /teachers | List teachers (paginated, searchable) |
| POST | /teachers | Create teacher |
| PUT | /teachers/{id} | Update teacher |
| DELETE | /teachers/{id} | Delete teacher |

### Departments
| Method | Path | Description |
|--------|------|-------------|
| GET | /departments | List departments |

### Leave Requests
| Method | Path | Description |
|--------|------|-------------|
| GET | /leave-requests | List (role-scoped) |
| POST | /leave-requests | Create leave request |
| PUT | /leave-requests/{id}/approve | Approve (admin/principal) |
| PUT | /leave-requests/{id}/reject | Reject (admin/principal) |
| DELETE | /leave-requests/{id} | Delete own pending request |

### Teaching Schedules
| Method | Path | Description |
|--------|------|-------------|
| GET | /schedules | List (role-scoped) |
| POST | /schedules | Create schedule |
| DELETE | /schedules/{id} | Delete schedule |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | /notifications | List own notifications |
| PUT | /notifications/{id}/read | Mark as read |
| PUT | /notifications/read-all | Mark all as read |
| DELETE | /notifications/{id} | Delete notification |

### Settings (Admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | /settings | School settings |
| PUT | /settings | Update school settings |

### Reports
| Method | Path | Description |
|--------|------|-------------|
| GET | /reports/daily | Daily attendance report |
| GET | /reports/monthly | Monthly report |
| GET | /reports/yearly | Yearly report |
| GET | /reports/teacher/{id} | Per-teacher report |

## Response Format

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation message"]
  }
}
```
