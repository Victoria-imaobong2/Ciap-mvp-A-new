# CIAP — Development Workflow

**Last Updated:** April 2026

This document defines the Git workflow, branching strategy, commit conventions, and pull request process for the CIAP MVP repository.

---

## Branching Strategy

We use a simplified **feature branch workflow** off `main`. There is no `develop` branch — `main` always reflects the latest stable, reviewed code.

```
main
 ├── feature/auth-jwt-login
 ├── feature/creator-dashboard-ui
 ├── fix/token-expiry-calculation
 ├── docs/update-api-reference
 └── refactor/scoring-engine-extract
```

### Branch Naming Convention

| Prefix | When to use |
|---|---|
| `feature/` | New feature or user-facing capability |
| `fix/` | Bug fix in existing code |
| `docs/` | Documentation changes only |
| `refactor/` | Code restructuring without behavior change |
| `test/` | Adding or updating tests only |
| `chore/` | Dependency updates, tooling, config changes |

**Examples:**
```
feature/influence-scoring-engine
feature/sme-creator-comparison
fix/audience-snapshot-null-country
docs/add-erd-reference
refactor/extract-ingestion-service
test/mock-api-client-normalize
chore/update-pydantic-v2
```

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). This makes the git log readable and enables automated changelog generation later.

**Format:**
```
<type>(<optional scope>): <short description>

<optional body>
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `chore` | Maintenance — dependencies, CI config, tooling |
| `perf` | Performance improvement |

**Examples:**
```
feat(scoring): add cross-platform growth dimension to influence score

fix(auth): correct refresh token expiry window calculation

docs(api): add campaign management endpoints to API reference

refactor(data): extract engagement rate calculation into BaseAPIClient helper

test(mock): add deterministic fixture assertions to MockAPIClient

chore(deps): upgrade fastapi to 0.111.1
```

**Rules:**
- Use the imperative mood: "add", not "added" or "adds"
- No capital letter at the start of the description
- No period at the end
- Keep the subject line under 72 characters
- Use the body to explain *what* and *why*, not *how*

---

## Pull Request Workflow

### Opening a PR

1. Branch off `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. Do your work. Commit frequently with descriptive messages.

3. Push and open a PR against `main`:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Fill in the PR description:
   - **What does this PR do?** — 2–3 sentence summary
   - **How was it tested?** — mention seed data, manual steps, or tests run
   - **Related week/milestone** — e.g. "Week 4: Influence Scoring"
   - **Screenshots** — if it includes any visual changes

### PR Checklist (author)

Before marking a PR ready for review, confirm:

- [ ] Code runs locally without errors
- [ ] No secrets, tokens, or `.env` values committed
- [ ] Existing tests still pass
- [ ] New logic includes at least a basic test or manual verification step
- [ ] Documentation updated if API shapes or setup steps changed
- [ ] No breaking changes to `DATA/` schemas without team communication

### Review Process

- At least **one team member** must review and approve before merge
- Reviewers should check for correctness, readability, and schema contract compliance
- Nitpicks are fine — mark them as `nit:` so authors know they're optional
- Blocking comments must be resolved before merge

### Merging

- Use **Squash and Merge** for feature branches to keep `main` history clean
- The squashed commit message should follow the commit convention
- Delete the feature branch after merge

---

## DATA Layer Change Protocol

Changes to `DATA/models/` affect the entire team. Follow this process:

1. Update the SQLAlchemy model in `DATA/models/`
2. Update the corresponding Pydantic schema in `DATA/schemas/entities/`
3. Generate the Alembic migration:
   ```bash
   cd DATA/
   python -m alembic revision --autogenerate -m "Describe the change"
   ```
4. Review the auto-generated migration file before committing
5. Notify the backend and frontend teams in the PR description — they may need to update their response models or TypeScript types

---

## Keeping Your Branch Up to Date

If `main` has moved forward while you were working:

```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main
```

Prefer rebase over merge to keep a linear history. If there are conflicts, resolve them and continue:

```bash
git rebase --continue
```

---

## Local Development Quick Reference

```bash
# Start the backend with hot reload
uvicorn backend.main:app --reload --port 8000

# Run migrations after a model change
cd DATA/ && python -m alembic upgrade head && cd ..

# Re-seed the database
python seeds/seed.py --reset

# Check for import errors across the DATA package
python -c "import DATA; print('DATA package OK')"
```
