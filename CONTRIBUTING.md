# Contributing to Digital Wardrobe Frontend

This is the frontend repository for Digital Wardrobe — a Telegram Mini App for personal wardrobe management with AI-powered outfit suggestions.

> **Note:** This repo is part of a multi-repo project. Documentation, reports, and ADRs live in [digital_wardrobe_team_44](https://github.com/veronika1977/digital_wardrobe_team_44). The backend API lives in [digital-wardrobe](https://github.com/Mrxfg/digital-wardrobe).

---

## Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Git
- Telegram account (for testing Mini App)
- Python 3.10+ (only if working on `tg_bot/bot.py`)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/veronika1977/digital_wardrobe_777.git
cd digital_wardrobe_777
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
VITE_TELEGRAM_BOT_ID=your_bot_id_here
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or similar Vite port).

### 5. Build for production

```bash
npm run build
```

---

## Repository Structure

```
digital_wardrobe_777/
├── src/
│   ├── components/
│   │   ├── calendar/          # Calendar-related components
│   │   │   └── WearCalendar.tsx
│   │   ├── common/            # Reusable UI components
│   │   │   ├── BottomNavBar.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── constructor/       # Capsule/outfit builder
│   │   │   └── CapsuleWizard.tsx
│   │   ├── onboarding/        # User onboarding flow
│   │   │   └── OnboardingSlider.tsx
│   │   ├── wardrobe/          # Wardrobe management
│   │   │   ├── AddItemModal.tsx
│   │   │   ├── TrashBin.tsx
│   │   │   └── WardrobeGrid.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── SubscriptionModal.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   └── useSubscription.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Helper functions
│   │   ├── constants.ts
│   │   └── wardrobe.ts
│   ├── __tests__/             # Test files
│   │   └── example.test.ts
│   ├── test/                  # Test setup
│   │   └── setup.ts
│   ├── assets/                # Static assets (images, icons)
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── globals.d.ts           # Global TypeScript declarations
├── tg_bot/                    # Telegram Bot (Python)
│   └── bot.py
├── public/                    # Static public assets
├── .github/                   # GitHub Actions, issue templates
│   ├── workflows/
│   │   └── frontend-ci.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── coverage/                  # Test coverage reports (generated)
├── vite.config.ts             # Vite configuration
├── vitest.config.ts           # Vitest configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.config.js           # ESLint configuration
├── package.json
├── CONTRIBUTING.md
├── AGENTS.md
└── README.md
```

---

## Branching Strategy

We use issue-linked branches:

- **Branch naming:** `<issue-number>-short-description`
- **Examples:** `217-ai-stylist-ui`, `218-bot-notification-frontend`
- **Create PR against:** `main`

### Branch Types

| Prefix | Purpose |
|--------|---------|
| `<issue-number>-` | Feature or bug fix linked to an issue |
| `docs/` | Documentation updates |
| `refactor/` | Code refactoring (no new features) |

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear history and automated changelogs.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature (user-facing) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change, no new feature/bugfix |
| `test` | Adding/updating tests |
| `chore` | Build, config, tooling (no production code) |

### Examples

```bash
# Good:
feat(us-14): add AI stylist suggestion UI
fix(calendar): handle date picker timezone issues
style: format code with Prettier
test: add Vitest tests for WardrobeGrid
chore: update Vite to v5.0

# Bad:
update code
fixed bug
wip
```

---

## Pull Request Process

### Before Creating a PR

1. **Create an issue** (or link existing one) describing the change
2. **Branch from `main`**
3. **Write tests** for new functionality
4. **Run local checks:**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   npm run build
   ```

### PR Template

Every PR must include:

```markdown
## Description
[Brief description of changes]

## Related Issue
Closes #<issue_number>

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring
- [ ] Tests

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed (screenshots if UI)

## Checklist
- [ ] Code follows project style guide
- [ ] Self-reviewed my code
- [ ] Added comments for complex logic
- [ ] Updated documentation (if needed)
- [ ] No new warnings/errors
```

### Review Process

1. **Assign reviewers:** At least 1 team member (different from implementer)
2. **CI checks must pass:** linting, type-check, tests, build
3. **Address feedback:** Respond to all review comments
4. **Squash and merge:** Use "Squash and merge" for clean history
5. **Delete branch:** After merge, delete feature branch

---

## Definition of Done

A PBI/issue is "Done" when:

- [ ] Code is merged to `main`
- [ ] All tests pass (unit + integration)
- [ ] CI pipeline is green
- [ ] Documentation updated (if applicable)
- [ ] Peer review completed
- [ ] No critical security issues
- [ ] Feature tested in staging environment

See [Definition of Done](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/definition-of-done.md) for details.

---

## Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test src/__tests__/example.test.ts
```

### Testing Requirements

- **Component tests** for all user-facing UI components
- **Integration tests** for critical flows (auth, item creation, calendar)
- **Minimum 30% overall coverage** (QRT-001)
- **Critical modules:** >=70% coverage
- **All new code must have tests**

### Test Structure

Tests live in `src/__tests__/` or next to components:

```
src/
├── components/
│   └── wardrobe/
│       ├── WardrobeGrid.tsx
│       └── WardrobeGrid.test.tsx  # Component tests
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts            # Hook tests
└── utils/
    ├── formatters.ts
    └── formatters.test.ts         # Utility tests
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view.

---

## Code Style

### TypeScript

- **Strict mode enabled**
- **Explicit types** for all props and state
- **No `any` type** unless absolutely necessary
- **Interfaces** for object shapes, **types** for unions/intersections

### React

- **Functional components only** (no class components)
- **Hooks** for state management
- **Local state** preferred over global stores
- **Handle loading, error, and success states** in API calls

### Styling

- **TailwindCSS** for styling
- **Utility classes** preferred over custom CSS
- **Responsive design** for mobile-first Telegram Mini App

### File Organization

```
src/
├── components/       # Reusable UI components (organized by domain)
├── hooks/           # Custom React hooks
├── services/        # API calls and business logic
├── utils/           # Helper functions
├── types/           # TypeScript type definitions
└── assets/          # Images, fonts, etc.
```

---

## Environment Variables

```bash
# Required
VITE_TELEGRAM_BOT_ID=     # Telegram bot ID for Mini App
VITE_API_BASE_URL=        # Backend API base URL (e.g., http://localhost:8000)
```

### Never Commit

- `.env` files with real credentials
- API keys, tokens, or passwords
- Personal data or PII

### If You Accidentally Expose Sensitive Data

1. **Stop and alert** a human team member immediately
2. **Do not proceed** with the commit or push
3. **Help rotate** the exposed credential if needed
4. **Document the incident** in team chat

---

## Architecture & ADRs

See [digital_wardrobe_team_44/docs/architecture/adr/](https://github.com/veronika1977/digital_wardrobe_team_44/tree/main/docs/architecture/adr)

Key ADRs for frontend:
- [ADR-003: Telegram Mini App Auth](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/architecture/adr/ADR-003-telegram-authentication.md)
- [ADR-004: AI Strategy for Outfit Generation](https://github.com/veronika1977/digital_wardrobe_team_44/blob/main/docs/architecture/adr/ADR-004-ai-strategy.md)

---

## AI Assistant Rules

See [AGENTS.md](AGENTS.md) in this repo.

---

## Deployment

- **Production:** Auto-deployed via Cloudflare Pages on push to `main`
- **Staging:** Preview deployments for PR branches via Cloudflare Pages

### Deployment Process

1. **PR created** → Cloudflare Pages creates preview deployment
2. **CI checks pass** → PR approved and merged
3. **Merge to `main`** → Cloudflare Pages auto-deploys to production
4. **Verify** in production environment

---

## Telegram Bot (Python)

This repository also contains a Python Telegram bot in `tg_bot/bot.py`.

### Setup

```bash
cd tg_bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # If requirements.txt exists
python bot.py
```

### Environment Variables

```bash
TELEGRAM_BOT_TOKEN=     # From @BotFather
```

---

## Getting Help

- **Questions?** Ask in team chat or create a `question` issue
- **Code review stuck?** Tag `@veronika1977` (Scrum Master)
- **Architecture decisions?** Refer to `docs/architecture/adr/` or create new ADR
- **Course requirements?** Check Assignment 6 spec in Moodle

---

## Course-Specific Notes

This repository is part of **Innopolis University Software Project course**. Key reminders:

- **All work must be traceable:** Link every PR to a PBI/issue
- **Maintain documentation:** Update ADRs, handover docs, and testing docs in the coordination repo when relevant changes are made
- **Weekly reports** (`reports/week6/`, `reports/week7/`) are graded artifacts in the coordination repo
- **Demo Day preparation** is mandatory — ensure generated code supports the final presentation

---

*This document is a maintained artifact. It is updated when contribution workflow, verification commands, review expectations, or linked documentation change.*

*Last updated: 2026-07-07*  
*Maintained by: Team 44 — Digital Wardrobe*