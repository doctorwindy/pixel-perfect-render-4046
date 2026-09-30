# InfoVault — Personal Information Copy Dashboard

A private, account-based hub where you store your personal, academic and professional information once, then find and copy any piece of it in seconds.

## How it works for you

- You sign up with email and password (or Google) and log in on any device — your information syncs.
- The app starts empty, with a short optional welcome and helpful prompts in each section.
- Press Cmd/Ctrl+K (or `/`) anywhere to search everything and copy a result without leaving the keyboard.
- Every field has a Copy button that confirms with a checkmark and remembers what you copied recently.
- Star the fields you use most so they sit on the dashboard.
- Sensitive fields (ID numbers, address, phone) can be hidden behind a Reveal button.
- Export everything to a backup file, or import one back in.

## Sections

- Overview — greeting, counts, profile completeness, favorites, quick copy, recently copied
- Personal — full set of name, contact, location and link fields
- Education — multiple records with degree, institution, dates, CGPA, achievements
- Tests — IELTS, TOEFL, PTE, GRE, GMAT, SAT and custom tests with sub-scores
- Experience — multiple roles with responsibilities, achievements, technologies
- Skills — grouped, copy one skill, a group, or all
- Projects — description, tech, links, role, contributions, with per-part copy
- Applications — company, role, link, status pipeline, salary, contacts, notes
- Answers — reusable application answers with tags
- Cover letter snippets — reusable intros and variations
- Documents — metadata only (name, type, status, last updated); no file contents shown
- Settings — profile name, theme (light/dark/system), copy preferences, data export/import/reset

## Copying

- Single field copy, exact value, no reformatting
- Multi-select copy with a choice of "labels + values" or "values only"
- Record copy in three formats: plain block, single line, JSON
- Clear message and manual-copy fallback if the browser blocks clipboard access

## Design

Calm, dense, productivity-first: Linear/Notion/Raycast feel. Sidebar plus content on desktop, collapsible on tablet, bottom navigation on mobile with large tap targets. Strong type, generous spacing, minimal decoration, light and dark themes, reduced-motion support.

## Technical notes

- TanStack Start + React + TypeScript + Tailwind + shadcn/ui + lucide icons (Next.js is not available on this stack; the structure and component names from the spec are preserved).
- Lovable Cloud backend: email/password + Google sign-in, one `profiles` row per user, and per-section tables (`education`, `tests`, `experience`, `skill_groups`, `skills`, `projects`, `applications`, `answers`, `snippets`, `documents`, `settings`, `copy_history`, `favorites`), all with row-level security scoped to the owner and explicit grants.
- All data access goes through a typed data-service layer (`lib/data/*`) so UI never talks to the database directly; reads use TanStack Query with route loaders.
- Zod validation on every form and on imported JSON before it is written.
- Shared components: CopyField, CopyButton, EditableField, SectionCard, RecordCard, CommandPalette, EmptyState, ConfirmDialog, ImportDialog, StatusBadge, Tag.
- Toasts via sonner; no personal data logged or sent anywhere beyond your own account.

## Build order

1. Enable Cloud, auth pages, protected app shell, navigation, theme
2. Database schema + data service layer + settings/export/import
3. Copy system, favorites, copy history, command palette and global search
4. Personal, Education, Tests, Skills
5. Experience, Projects, Applications
6. Answers, Snippets, Documents
7. Responsive polish, accessibility pass, empty states, onboarding
