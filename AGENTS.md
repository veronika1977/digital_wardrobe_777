# AGENTS.md — Frontend Guidelines for Coding Agents

This document provides operating instructions for AI coding agents working on the Digital Wardrobe frontend repository.

> **Note:** This repo is part of a multi-repo project. Documentation, reports, and ADRs live in [digital_wardrobe_team_44](https://github.com/veronika1977/digital_wardrobe_team_44). The backend  lives in [digital-wardrobe](https://github.com/Mrxfg/digital-wardrobe). All generated code must be reviewed by a human before merging.

---

## Project Context

This repository contains the frontend for **Digital Wardrobe** — a Telegram Mini App for personal wardrobe management with AI-powered outfit suggestions, calendar planning, and daily wear tracking.

### Repository Map

| Repository | Purpose |
|------------|---------|
| **This repo** (`digital_wardrobe_777`) | React + TypeScript frontend + Telegram Bot (Python) |
| Backend (`digital-wardrobe`) | FastAPI + PostgreSQL API server |
| Coordination (`digital_wardrobe_team_44`) | ADRs, reports, handover docs |

---

## Tech Stack

- **React 18**
- **TypeScript** (strict mode)
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **Vitest** (testing)
- **Telegram WebApp SDK** (Mini App integration)
- **Python 3.10+** (for `tg_bot/bot.py`)

---

## Repository Structure

```
digital_wardrobe_777/
├── src/
│   ├── components/
│   │   ├── calendar/          # Calendar-related components
│   │   ├── common/            # Reusable UI components
│   │   ├── constructor/       # Capsule/outfit builder
│   │   ├── onboarding/        # User onboarding flow
│   │   └── wardrobe/          # Wardrobe management
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Helper functions
│   ├── __tests__/             # Test files
│   ├── test/                  # Test setup
│   ├── assets/                # Static assets
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── tg_bot/                    # Telegram Bot (Python)
│   └── bot.py
├── public/                    # Static public assets
├── .github/                   # GitHub Actions, issue templates
├── coverage/                  # Test coverage reports (generated)
├── vite.config.ts             # Vite configuration
├── vitest.config.ts           # Vitest configuration
├── tsconfig.json              # TypeScript configuration
└── eslint.config.js           # ESLint configuration
```

---

## Essential Commands

### Frontend (React/TypeScript)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch

# Lint and type-check
npm run lint
npm run typecheck

# Build for production
npm run build
```

### Telegram Bot (Python)

```bash
cd tg_bot
python3 -m venv venv
source venv/bin/activate
python bot.py
```

---

## Workflow for Agents

### Before Generating Code

1. **Read the relevant issue or PBI** in the coordination repo
2. **Check existing code** in the target module for style and patterns
3. **Review related ADRs** in [digital_wardrobe_team_44/docs/architecture/adr/](https://github.com/veronika1977/digital_wardrobe_team_44/tree/main/docs/architecture/adr)
4. **Verify acceptance criteria** are testable

### When Generating Code

1. **Follow existing code style:**
   - TypeScript strict mode
   - React functional components only
   - TailwindCSS utilities for styling
   - Explicit types for all props and state
   - No `any` type unless absolutely necessary

2. **Add tests for new functionality:**
   - Vitest unit tests for components
   - Test file next to source: `Component.tsx` + `Component.test.tsx`
   - Cover loading, error, and success states for API calls

3. **Update documentation** if the change affects public APIs or setup steps

4. **Use Conventional Commits format:**
   ```
   <type>(<scope>): <description>
   
   # Examples:
   feat(us-14): add AI stylist suggestion UI
   fix(calendar): handle date picker timezone issues
   style: format code with Prettier
   test: add Vitest tests for WardrobeGrid
   ```

### After Generating Code

1. **Run local tests:**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

2. **Ensure no new linting or type-checking errors** are introduced

3. **Do not commit secrets, credentials, or PII**

4. **Link the change to the relevant issue** in the PR description

---

## Sensitive Data and Safety Cautions

### Never Generate or Commit

- Real API keys, tokens, or credentials
- Database connection strings with passwords
- Personal data, PII, or customer-identifying information
- `.env` files with real values (use `.env.example` as template)

### Environment Variables Reference

```bash
# Frontend
VITE_TELEGRAM_BOT_ID=     # Telegram bot ID for Mini App
VITE_API_BASE_URL=        # Backend API base URL (e.g., http://localhost:8000)

# Telegram Bot (Python)
TELEGRAM_BOT_TOKEN=       # From @BotFather
```

### If You Accidentally Expose Sensitive Data

1. **Stop and alert** a human team member immediately
2. **Do not proceed** with the commit or push
3. **Help rotate** the exposed credential if needed
4. **Document the incident** in team chat

---

## Architecture and Design Constraints

### React

- **Functional components only** (no class components)
- **Hooks** for state management
- **Local state** preferred over global stores unless necessary
- **Handle loading, error, and success states** in API calls

### TypeScript

- **Strict mode enabled**
- **Explicit types** for all props and state
- **Use interfaces** for object shapes, **types** for unions/intersections
- **No `any` type** unless absolutely necessary with justification

### Styling

- **TailwindCSS** for styling
- **Utility classes** preferred over custom CSS
- **Responsive design** for mobile-first Telegram Mini App

### Component Organization

Components are organized by domain in `src/components/`:

| Directory | Purpose |
|-----------|---------|
| `calendar/` | Calendar-related components (e.g., `WearCalendar.tsx`) |
| `common/` | Reusable UI components (e.g., `BottomNavBar.tsx`, `ConfirmDialog.tsx`) |
| `constructor/` | Capsule/outfit builder (e.g., `CapsuleWizard.tsx`) |
| `onboarding/` | User onboarding flow (e.g., `OnboardingSlider.tsx`) |
| `wardrobe/` | Wardrobe management (e.g., `AddItemModal.tsx`, `WardrobeGrid.tsx`) |

### Telegram Integration

- **Use `window.Telegram.WebApp`** for Mini App integration
- **Handle Telegram-specific lifecycle events**
- **Test in Telegram client**, not just browser

### API Integration

- **REST API calls** to backend (`VITE_API_BASE_URL`)
- **Handle loading, error, and success states**
- **Use services layer** for API calls (not direct fetch in components)

---

## Known Issues

### Duplicate `src/src/` Directory

There is a duplicate `src/src/` directory in the repository. This appears to be a copy error. **Do not add new files to `src/src/`** — use the correct `src/` directory instead.

---

## Documentation Links

### This Repository

- [CONTRIBUTING.md](CONTRIBUTING.md) — Human contributor workflow
- [README.md](README.md) — Project overview and quick start

### Coordination Repository

- [Architecture Decision Records](https://github.com/veronika1977/digital_wardrobe_team_44/tree/main/docs/architecture/adr)
- [Customer Handover](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/customer-handover.md)
- [Testing Strategy](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/testing.md)
- [Quality Requirement Tests](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/quality-requirement-tests.md)
- [Definition of Done](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/definition-of-done.md)

### Backend Repository

- [Backend](https://github.com/Mrxfg/digital-wardrobe) 

---

## Deployment

- **Production:** Auto-deployed via Cloudflare Pages on push to `main`
- **Staging:** Preview deployments for PR branches via Cloudflare Pages

---

## Course-Specific Reminders

- **All work must be traceable** to an issue or PBI in the coordination repo
- **Maintain documentation:** Update ADRs and testing docs in coordination repo when relevant changes are made
- **Weekly reports** are graded artifacts in the coordination repo
- **Demo Day preparation** is mandatory — ensure generated code supports the final presentation

---

## When in Doubt

1. **Ask a human team member** before making architectural changes
2. **Prefer small, incremental changes** over large refactors
3. **When generating tests,** prioritize critical modules and user-facing flows
4. **If acceptance criteria are unclear,** request clarification before proceeding
5. **If unsure which repository to modify,** check the issue labels or ask the team

---

*This document is a maintained artifact. It is updated when agent workflow, commands, safety constraints, or linked documentation change.*

*Last updated: 2026-07-07*  
*Maintained by: Team 44 — Digital Wardrobe*