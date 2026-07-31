# 12 — GitHub Workflow

## Branch Strategy

```
main          ← production-ready, tagged releases
├── develop   ← integration branch
├── feature/* ← new features
├── fix/*     ← bug fixes
└── hotfix/*  ← urgent production fixes
```

## Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(attendance): add GPS check-out with distance validation
fix(auth): handle expired session redirect
docs(api): update endpoint documentation
```

## Pull Request Process

1. Create feature branch from `develop`
2. Make changes with clear commit messages
3. Ensure `npm run build` and `npm run typecheck` pass
4. Create PR with description of changes
5. Review and merge to `develop`
6. Periodically merge `develop` → `main` and tag release

## .gitignore

Key files excluded from version control:
- `.env` (contains secrets)
- `node_modules/`
- `dist/`
- `vendor/`
- `storage/`
- `*.log`
