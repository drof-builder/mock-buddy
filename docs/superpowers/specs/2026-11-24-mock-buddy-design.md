# mock-buddy — Design Spec

Date: 2026-11-24
Status: Approved in brainstorming, pending written-spec review

## 1. Purpose

A personal, mobile-first web app for practicing job interviews. The user
answers interview questions out loud, records the answer as audio, plays it
back, and rates themselves. No AI, no accounts, no server, no running cost.

**Audience:** one user (the author), on their own phone.
**Success:** the user can open the app on their phone, practice single
questions or a 5-question mock interview, hear themselves back, rate each
answer, and see past answers in a history — all offline, with data kept on
the device.

### What the user decided

- Personal tool (not a product, not primarily a showcase).
- Question bank + timer + self-review (no AI interviewer).
- Questions: a built-in starter set **and** user-added custom questions.
- Starter roles: General Behavioral, Technical Support, Customer Service.
  More roles in future updates.
- Recording: audio only, stored on the device.
- Two modes: Quick Practice and Mock Interview.
- Stack: React + TypeScript + Vite PWA, hosted on Vercel (changed from GitHub Pages on 2026-11-24).

### Out of scope (v1)

AI feedback, video recording, accounts/sync, exporting recordings, stats
charts, roles beyond the three above.

## 2. Screens and flow

### Home
- Two primary buttons: **Quick Practice**, **Mock Interview**.
- Links: **History**, **My Questions**.
- Shows an unsupported-browser banner (and disables practice) when audio
  recording is not available.

### Quick Practice
1. Choose a role (Behavioral / Technical Support / Customer Service) and
   optionally a category within it. Default: any category.
2. A random question is shown (from starter + custom, minus hidden).
3. Tap **Record** → a count-up timer runs from 0:00.
4. Tap **Stop** → audio player appears for playback.
5. **Re-record** discards the take and returns to step 3.
6. Rate 1–5 (required to save) and optional note → **Save & Next** (new
   question, same filters) or **Done** (back to Home).
- **Skip** shows a different question without saving.
- Questions are not repeated within one Quick Practice visit until the
  filtered pool is exhausted; then the pool resets.

### Mock Interview
1. Choose a role. The app builds a 5-question set:
   - Role = Behavioral → 5 behavioral questions.
   - Role = Technical Support or Customer Service → 2 behavioral + 3
     role-specific questions (if the role pool has fewer than 3, fill the
     remainder from behavioral; if the combined pool has fewer than 5, use
     as many as exist, minimum 1).
   - No duplicates within the set; order: behavioral first, then role.
2. A `MockSession` is created (`completed: false`).
3. For each question: question text shown, **Start answer** begins
   recording and a **2:00 countdown**. Recording auto-stops at 0:00, or the
   user taps **Stop** early. The answer is saved immediately (unrated) and
   the next question is shown. No playback or rating between questions.
4. After the last question → **Review** screen: lists all answers with
   playback, 1–5 rating, and note per answer. **Finish** saves
   ratings/notes and marks the session `completed: true`. Ratings are
   optional in Review.

### History
- Two tabs: **Practice** (Quick Practice answers, newest first) and
  **Mock sessions** (one row per session: date, role, average rating,
  "Unfinished" badge if `completed: false`).
- Tapping an answer: question text, playback, rating, note; edit
  rating/note; delete.
- Tapping a session: opens the Review screen for it (works for unfinished
  sessions too); delete session deletes its answers.
- Shows storage used / available (from `navigator.storage.estimate()`).
- Shows a hint to install the app to the home screen when persistent
  storage was not granted.

### My Questions
- List of custom questions with add / edit / delete. Fields: role (one of
  the three), category (free text, with existing categories suggested),
  text (required, non-empty after trim).
- Separate section listing starter questions with a **Hide/Show** toggle
  per question. Starter questions cannot be edited or deleted.

### Empty states
Every list screen has a friendly empty-state message (no history yet, no
custom questions yet). If a role+category filter yields no questions, show
"No questions match — try another category."

## 3. Architecture

Three layers, each with one job. UI depends on services and domain;
services depend on domain types; domain depends on nothing.

```
src/
  domain/           pure logic, no browser APIs
    types.ts        Question, Answer, MockSession, Role, Settings
    questionPicker.ts  filter pool, random pick w/o repeats, build mock set
    ratings.ts      average rating, etc.
  services/         browser boundaries, behind interfaces
    recorder.ts     Recorder interface + MediaRecorder implementation
    db.ts           Dexie database + repository functions
    storage.ts      storage estimate + persist request
  ui/
    App.tsx         router (HashRouter)
    screens/        Home, QuickPractice, MockInterview, MockReview,
                    History, AnswerDetail, MyQuestions
    components/     RecordButton, Timer, AudioPlayer, RatingInput,
                    RoleCategoryPicker, ErrorBanner
  data/
    questions.json  starter questions
```

### Recorder interface
```ts
interface Recorder {
  isSupported(): boolean;
  start(): Promise<void>;          // throws RecorderError('permission-denied' | 'unsupported' | 'failed')
  stop(): Promise<{ blob: Blob; mimeType: string; durationSec: number }>;
  cancel(): void;
}
```
- Implementation picks the first supported MIME type from
  `['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']` via
  `MediaRecorder.isTypeSupported`, else lets the browser choose.
- Releases the microphone (stops all tracks) on stop/cancel.
- An empty blob (size 0) is a `failed` error.
- UI receives the recorder via React context so tests can inject a fake.

### Database (Dexie / IndexedDB)
Tables: `answers`, `sessions`, `customQuestions`, `settings` (single row).
Repository functions (e.g. `saveAnswer`, `listQuickAnswers`,
`deleteSession`) are the only way UI touches data; provided via React
context so tests can use `fake-indexeddb`.

### Starter questions
`src/data/questions.json`: 131 entries, each
`{ id, role, category, text }`. IDs are stable strings (e.g. `beh-001`,
`ts-001`, `cs-001`). Adding a role later = add a value to the `Role` type
and entries to the JSON.

Roles: `behavioral`, `tech-support`, `customer-service`.
Categories are question types (changed 2026-11-24 from topic categories),
each with at least 6 questions — behavioral: basic-screening,
past-experience, work-style; tech-support: basic-screening, networking,
windows-ad, computer-basics-security, databases-sql, hotel-systems,
troubleshooting, soft-skills (2026-11-24: fresh-graduate hospitality-tech
set added; technical-knowledge split into three topics; Technical Support
is pitched at people with no support-job experience, so ts-018 was retired); customer-service:
basic-screening, situational, role-play, tools-metrics, soft-skills.
Display names and order live in `src/ui/format.ts`. Question ids never
change (hidden-question settings depend on them).

### Tooling
- Vite, React (current version from the Vite react-ts template), TypeScript strict, React Router (HashRouter), Dexie.
- `vite-plugin-pwa`: manifest, icons, offline precache of app shell.
- Plain CSS with CSS variables, mobile-first; light and dark theme via
  `prefers-color-scheme`. Touch targets ≥ 44px.
- Vitest + React Testing Library + `fake-indexeddb`; oxlint (the Vite template's linter).
- GitHub Actions: on PR and push → lint, typecheck, test, build.
- Hosting: Vercel Git integration — push to `main` deploys production, each PR
  gets a preview URL. App served from the site root (`base: '/'`).

## 4. Data model

```ts
type Role = 'behavioral' | 'tech-support' | 'customer-service';

interface Question {
  id: string; role: Role; category: string; text: string;
  source: 'starter' | 'custom';
}

interface Answer {
  id: string;                 // crypto.randomUUID()
  questionId: string;
  questionText: string;       // snapshot at record time
  role: Role;
  mode: 'quick' | 'mock';
  sessionId?: string;         // set when mode === 'mock'
  audio: Blob;
  mimeType: string;
  durationSec: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: number;          // epoch ms
}

interface MockSession {
  id: string; role: Role; answerIds: string[];
  createdAt: number; completed: boolean;
}

interface Settings { hiddenStarterIds: string[] }
```

- `questionText` is snapshotted so editing/deleting a custom question never
  changes history.
- Mock answers are persisted as each one is recorded (crash-safe).
- Average rating ignores unrated answers; shows "—" when none are rated.

## 5. Error handling

| Situation | Behavior |
|---|---|
| `MediaRecorder` / `getUserMedia` unavailable | Home banner "Recording isn't supported in this browser — try Chrome or Safari"; practice buttons disabled. |
| Mic permission denied | Message with steps to re-enable mic in browser settings + **Try again**. |
| Recording empty / recorder error | "Recording failed — try again." Nothing saved. |
| IndexedDB write fails (e.g. `QuotaExceededError`) | "Storage full — delete old recordings in History." Current take stays in memory so the user can still play/retry. |
| Leaving during recording | `beforeunload` prompt while recording. Already-saved mock answers persist. |
| Persistent storage | `navigator.storage.persist()` requested on first launch; if not granted, History shows "Add to home screen to keep your recordings safe." |
| Mic held after leaving a screen | Recorder is cancelled on screen unmount, releasing the mic. |

## 6. Testing

Test-first (TDD) for domain, services, and UI flows.

- **Domain:** question filtering (role, category, hidden), random pick
  without repeats + pool reset, mock-set composition rules incl. small
  pools, average rating with unrated answers.
- **Data file:** every starter question has a unique id, a valid role,
  non-empty category and text; each role has ≥ 5 questions.
- **Services:** db repository against `fake-indexeddb` (save/read/list
  order, delete answer, delete session cascades to answers, hidden
  starter IDs, custom question CRUD). Recorder with mocked `MediaRecorder`
  / `getUserMedia` (MIME selection, empty blob → failed, permission
  denied mapping, tracks stopped).
- **UI (RTL, fake recorder + fake db):** Quick Practice record → stop →
  rate → save; Skip; Re-record. Mock: countdown auto-stops at 0:00 (fake
  timers), advances, reaches Review, Finish marks complete. History
  playback/edit/delete. My Questions add/edit/delete/hide. Error states:
  unsupported, permission denied, quota exceeded.
- **Manual release checklist (README):** on a real Android and/or iPhone —
  mic prompt, record, playback, save; countdown auto-stop; data persists
  after closing app; install to home screen; works offline.

## 7. Delivery

Public repo `drof-builder/mock-buddy`. One PR per milestone, CI must be
green before merge.

1. **Foundation** — scaffold, CI, domain logic, db + recorder services,
   starter questions.
2. **Quick Practice + History** — first usable version.
3. **Mock Interview + Review.**
4. **My Questions + PWA/offline + Vercel deploy** → v1.0.0.
