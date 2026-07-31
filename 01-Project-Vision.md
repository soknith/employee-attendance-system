# 01 — Project Vision

## Overview

SovannKiri Attendance Kit is a GPS-based teacher attendance management system designed for schools in Cambodia. It enables teachers to check in and check out using their mobile device's GPS location, while giving administrators and principals real-time visibility into attendance, leave requests, and teaching schedules.

## Goals

- Eliminate manual paper-based attendance tracking
- Ensure teachers are physically present at school via GPS geofencing
- Provide administrators with live dashboards and reports
- Support both Khmer and English languages
- Work on mobile devices (primary) and desktop (secondary)

## Target Users

| Role | Capabilities |
|------|-------------|
| Super Admin | Full system control, settings, all modules |
| Admin | Manage teachers, view reports, approve leave |
| Principal | View dashboards, approve leave, view reports |
| Teacher | GPS check-in/out, request leave, view schedule |

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Laravel 12 (REST API) / Supabase (active database)
- **Database:** MySQL (production) / PostgreSQL via Supabase (active)
- **Auth:** Laravel Sanctum / Supabase Auth
- **GPS:** Browser Geolocation API + Haversine distance formula

## Design Principles

1. Mobile-first responsive design
2. Bilingual (Khmer + English) with instant switching
3. Light/Dark mode support
4. Clean, modern UI with micro-interactions
5. Role-based access control throughout
