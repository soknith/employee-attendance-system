# Coding Standard

## General

1. Follow PSR-12 (PHP) and TypeScript ESLint rules
2. No dead code — delete what you replace
3. No commented-out code blocks
4. No `_old` or `_backup` file variants
5. No premature abstractions — three similar lines is fine
6. No error handling for impossible scenarios
7. Trust internal code and framework guarantees
8. Only validate at system boundaries (user input, external APIs)

## Comments

9. Default to no comments
10. Only comment the WHY, never the WHAT
11. One short line max — never multi-paragraph docstrings
12. Never reference tasks, issues, or callers in comments

## Error Handling

13. Check results before using them
14. Handle errors and empty cases explicitly
15. Confirm response shape before binding to UI
16. Surface visible error states — never let undefined reach the screen
17. Don't retry failing commands blindly — diagnose first

## Imports

18. Import every symbol used in a file
19. Use `@/` path alias (frontend) or PSR-4 namespaces (backend)
20. No unused imports
21. Group imports: external, then internal

## File Organization

22. One clear purpose per file
23. Things that change together belong together
24. Never leave orphaned files or dead exports
25. Split files only when they become hard to navigate

## Security

26. Never use `dangerouslySetInnerHTML`
27. Never build SQL with string concatenation
28. Always enable RLS on new tables
29. Always hash passwords with bcrypt
30. Never log secrets or passwords

## State

31. No module-level mutable state or globals
32. Share code through explicit imports/exports
33. Pass dependencies as arguments, not through hidden coupling

## Design

34. 8px spacing system
35. Max 3 font weights per page
36. 150% line height for body, 120% for headings
37. Sufficient color contrast in light and dark modes
38. Mobile-first responsive design
