# 13 — Coding Rules

## General

1. Never create duplicate files, folders, controllers, models, services, repositories, routes, components, API endpoints, or migrations
2. Always reuse existing code
3. Generate production-ready code only
4. New code must integrate with existing architecture, not replace it
5. Every feature must include validation, authorization, logging, and error handling

## Backend (Laravel)

6. Follow Laravel 12 best practices
7. Follow PSR-12 coding standard
8. Always use Repository Pattern
9. Always use Service Layer
10. Always use Form Request Validation
11. Always use Eloquent Relationships
12. Always use Database Transactions
13. Always use Laravel Sanctum
14. Always use MySQL (production)
15. Keep business logic inside Services, not Controllers
16. Keep Controllers thin

## Frontend (React)

17. Use TypeScript with explicit types (no implicit `any`)
18. Import every symbol used (icons, components, hooks)
19. Use `@/` path alias instead of relative paths
20. Use Tailwind CSS classes for styling
21. Use Lucide React for icons
22. Use React hooks (useState, useEffect, useCallback)
23. Handle loading and error states explicitly
24. Never use `dangerouslySetInnerHTML`

## Database

25. Always enable RLS on every new table
26. Write 4 separate policies per table (one per CRUD verb)
27. Use `auth.uid()` for ownership checks
28. Never use `current_user` for RLS
29. Never DROP or DELETE columns (data loss)
30. Never rename tables or change column types

## Localization

31. Always support Khmer and English
32. All UI text via translation keys in I18nContext
33. Never hardcode user-facing strings

## Theming

34. Always support Light and Dark mode
35. Use `dark:` Tailwind prefix for all color classes
