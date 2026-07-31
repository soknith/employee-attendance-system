# 09 — UI/UX Design

## Design System

### Colors
- **Primary (brand):** Blue-based ramp (50–900)
- **Neutral:** Gray ramp (50–950)
- **Success:** Green
- **Warning:** Amber
- **Error:** Red
- No purple/indigo unless explicitly requested

### Typography
- Body: 150% line height
- Headings: 120% line height
- Max 3 font weights (normal, medium, bold)
- System font stack for performance

### Spacing
- 8px base unit
- Consistent padding/margins using Tailwind spacing scale

### Components
- Rounded corners (rounded-lg, rounded-xl, rounded-2xl)
- Subtle shadows (shadow-sm)
- Border-based cards (border + bg-white / dark:bg-gray-800)
- Backdrop blur on navigation

## Layout

### Mobile (primary)
- Bottom navigation bar with role-based tabs
- Single-column layout
- Max-width 2xl (672px) content container
- Bottom padding to clear nav bar (pb-24)

### Desktop
- Same bottom nav (centered, max-width)
- Content centered with max-width constraint

## Navigation

Role-based tabs in BottomNav:
- **Admin/Super Admin:** Dashboard, Attendance, Teachers, Reports, Leave, Schedule, Notifications, Profile, Settings
- **Principal:** Dashboard, Attendance, Reports, Leave, Schedule, Notifications, Profile
- **Teacher:** Attendance, Leave, Schedule, Notifications, Profile

## Dark Mode

- Toggle via `dark:` Tailwind classes
- Background: gray-950
- Cards: gray-800
- Text: gray-100
- Borders: gray-700
- Brand colors adjusted for dark backgrounds

## Micro-interactions

- Button hover: color shift + scale
- Active nav tab: icon scale + brand color
- Loading states: Loader2 spinner with animate-spin
- Toast notifications: slide in from top
- Modal sheets: slide up from bottom on mobile

## Accessibility

- Sufficient color contrast (WCAG AA)
- Touch targets ≥ 44px
- Semantic HTML elements
- ARIA labels on icon-only buttons
- Keyboard navigable forms

## Localization

- Instant language switch (Khmer ↔ English)
- All UI text via translation keys
- Date formatting respects current language
- No hardcoded strings in components
