# mock-buddy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal, offline, mobile-first PWA for practicing job interviews: pick a question, record an audio answer, play it back, rate it, and review history.

**Architecture:** Three layers. `src/domain` is pure TypeScript logic (question picking, ratings). `src/services` wraps browser APIs (MediaRecorder, IndexedDB via Dexie, StorageManager) behind interfaces. `src/ui` is React screens/components that receive services through a React context so tests inject fakes.

**Tech Stack:** Vite (react-ts template), React, TypeScript strict, react-router v7 (HashRouter), Dexie, vite-plugin-pwa, Vitest + React Testing Library + @testing-library/user-event + fake-indexeddb + jsdom, ESLint, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-24-mock-buddy-design.md`

## Global Constraints

- Roles: `behavioral`, `tech-support`, `customer-service`; labels "Behavioral", "Technical Support", "Customer Service".
- Mock set size `5`; mock answer limit `120` seconds; Behavioral mock = 5 behavioral; other roles = 2 behavioral + 3 role (fill from behavioral if role pool < 3; fewer than 5 total → use what exists, min 1).
- Ratings are integers 1–5. Quick Practice requires a rating to save; Mock Review ratings optional. Average ignores unrated; none rated → "—".
- `Answer.questionText` is a snapshot taken at record time.
- Mock answers persist as each is recorded; session `completed: false` until Finish.
- Audio only. MIME preference: `audio/webm;codecs=opus`, `audio/mp4`, `audio/webm`, else browser default.
- No network calls at runtime. All data in IndexedDB on the device.
- Vite `base: '/mock-buddy/'`; HashRouter.
- Touch targets ≥ 44px; light + dark via `prefers-color-scheme`.
- Commits are authored by drof-builder only. **No `Co-Authored-By` trailers.**
- One branch + PR per milestone; CI (lint, typecheck, test, build) green before merge.
- User-facing copy (exact strings, live in `src/ui/messages.ts`):
  - `UNSUPPORTED`: "Recording isn't supported in this browser — try Chrome or Safari."
  - `PERMISSION_DENIED`: "Microphone access is blocked. Allow microphone access for this site in your browser settings, then try again."
  - `RECORDING_FAILED`: "Recording failed — try again."
  - `STORAGE_FULL`: "Storage full — delete old recordings in History."
  - `INSTALL_HINT`: "Add to home screen to keep your recordings safe."
  - `NO_MATCH`: "No questions match — try another category."

## Review Focus

1. **Backgrounded tab during a mock countdown** — browsers throttle timers, so a tick counter drifts. Remaining time must be computed from the start timestamp, and auto-stop must fire exactly once even after a large time jump. Test added in Task 11.
2. **Double taps** (Save tapped twice, Stop tapped at the same moment as auto-stop) must not create duplicate answers. Tests added in Tasks 9 and 11.
3. **Leaving a screen mid-recording** must release the microphone (the phone's mic indicator turns off). Test added in Task 8 (`useRecording` cancels on unmount).
4. **Playback after reopening the app, especially on iPhone Safari** — audio must round-trip through IndexedDB with bytes and MIME type intact; object URLs revoked. Tests added in Task 5 (round-trip) and Task 8 (AudioPlayer revokes URL).
5. **Empty question pools** (all questions in a role hidden, or a category with none) must show `NO_MATCH` rather than crash or loop. Tests added in Tasks 3, 9 and 11.

---

## Milestone 1 — Foundation (branch `m1-foundation`)

### Task 1: Scaffold, tooling, CI

**Files:**
- Create (via template): `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `eslint.config.js`
- Create: `src/test/setup.ts`, `src/smoke.test.ts`, `.github/workflows/ci.yml`, `README.md`, `.gitattributes`
- Delete: template demo files (`src/App.css`, `src/assets/react.svg`, `public/vite.svg`, template `src/App.tsx` content)

**Interfaces:**
- Produces: `npm run lint`, `npm run typecheck`, `npm test` (vitest run), `npm run build`; vitest globals off, environment `jsdom`, setup file imports `@testing-library/jest-dom/vitest` and `fake-indexeddb/auto`.

- [ ] **Step 1:** In `C:\Users\Clifford\mock-buddy` (repo already exists with the spec), run `npm create vite@latest . -- --template react-ts` (allow non-empty dir; keep `docs/`). Then `npm install`.
- [ ] **Step 2:** Install deps: `npm i dexie react-router` and `npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom fake-indexeddb vite-plugin-pwa`.
- [ ] **Step 3:** Configure `vite.config.ts`: `base: '/mock-buddy/'`, `test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'] }` (add `/// <reference types="vitest/config" />`). Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc -b --noEmit"`. Ensure `strict: true`. Add `.gitattributes` with `* text=auto eol=lf`.
- [ ] **Step 4: Write smoke test** `src/smoke.test.ts`:

```ts
import { expect, test } from 'vitest';
test('indexedDB is available in tests', () => {
  expect(typeof indexedDB.open).toBe('function');
});
```

- [ ] **Step 5:** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass, `dist/` produced.
- [ ] **Step 6:** Write `.github/workflows/ci.yml`: on `pull_request` and `push` to `main`; job `check` on `ubuntu-latest`, Node 22, `npm ci`, lint, typecheck, test, build. (Deploy job is added in Task 14.)
- [ ] **Step 7:** `README.md`: one-paragraph description, `npm install`, `npm run dev`, `npm test`. Add `.gitignore` entries from template (`node_modules`, `dist`).
- [ ] **Step 8:** `git checkout -b m1-foundation`, commit `chore: scaffold vite react-ts app with vitest and CI`.

### Task 2: Domain types and ratings

**Files:**
- Create: `src/domain/types.ts`, `src/domain/ratings.ts`, `src/domain/ratings.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  - `type Role = 'behavioral' | 'tech-support' | 'customer-service'`
  - `const ROLES: readonly Role[]` (in that order); `const ROLE_LABELS: Record<Role, string>`
  - `type Rating = 1 | 2 | 3 | 4 | 5`
  - `interface Question { id: string; role: Role; category: string; text: string; source: 'starter' | 'custom' }`
  - `interface Answer { id; questionId; questionText; role: Role; mode: 'quick' | 'mock'; sessionId?: string; audio: Blob; mimeType: string; durationSec: number; rating?: Rating; note?: string; createdAt: number }`
  - `interface MockSession { id: string; role: Role; answerIds: string[]; createdAt: number; completed: boolean }`
  - `interface Settings { hiddenStarterIds: string[] }`
  - `const MOCK_SET_SIZE = 5`, `const MOCK_ANSWER_SECONDS = 120`
- Produces (`ratings.ts`): `averageRating(answers: Pick<Answer, 'rating'>[]): number | null`, `formatAverage(avg: number | null): string`

- [ ] **Step 1: Failing tests** in `ratings.test.ts`:

```ts
expect(averageRating([{ rating: 4 }, { rating: 5 }, {}])).toBe(4.5);
expect(averageRating([{}, {}])).toBeNull();
expect(averageRating([])).toBeNull();
expect(formatAverage(null)).toBe('—');
expect(formatAverage(4.5)).toBe('4.5');
expect(formatAverage(4)).toBe('4.0');
expect(formatAverage(10 / 3)).toBe('3.3');
```

- [ ] **Step 2:** `npm test -- ratings` → FAIL (module not found).
- [ ] **Step 3:** Implement `types.ts` and `ratings.ts` (`formatAverage` uses `toFixed(1)`).
- [ ] **Step 4:** `npm test -- ratings` → PASS.
- [ ] **Step 5:** Commit `feat(domain): add core types and rating helpers`.

### Task 3: Question picker

**Files:**
- Create: `src/domain/questionPicker.ts`, `src/domain/questionPicker.test.ts`

**Interfaces:**
- Consumes: `Question`, `Role`, `MOCK_SET_SIZE` from Task 2.
- Produces:
  - `filterQuestions(all: Question[], opts: { role: Role; category?: string; hiddenIds?: string[] }): Question[]` — empty/undefined category = any.
  - `categoriesFor(all: Question[], role: Role): string[]` — unique, sorted A→Z.
  - `createPicker(pool: Question[], random?: () => number): { next(): Question | null }` — random without repeats until the pool is exhausted, then reshuffles; after a reset the first question differs from the last one served when pool size > 1; empty pool → `null`.
  - `buildMockSet(all: Question[], role: Role, hiddenIds: string[], random?: () => number): Question[]`

- [ ] **Step 1: Failing tests.** Use a fixture helper `q(id, role, category)`. Assertions:

```ts
// filterQuestions
expect(filterQuestions(all, { role: 'tech-support' }).every(x => x.role === 'tech-support')).toBe(true);
expect(filterQuestions(all, { role: 'behavioral', category: 'conflict' }).map(x => x.id)).toEqual(['b1', 'b2']);
expect(filterQuestions(all, { role: 'behavioral', hiddenIds: ['b1'] }).some(x => x.id === 'b1')).toBe(false);
// categoriesFor
expect(categoriesFor(all, 'behavioral')).toEqual(['conflict', 'intro', 'teamwork']);
// createPicker: no repeats within a cycle
const p = createPicker(pool3);
const firstCycle = [p.next()!, p.next()!, p.next()!].map(x => x.id);
expect(new Set(firstCycle).size).toBe(3);
// after reset, never the same question twice in a row (run 50 cycles with Math.random)
// empty pool
expect(createPicker([]).next()).toBeNull();
// single-question pool keeps returning it
expect(createPicker([b1]).next()?.id).toBe('b1'); // twice
// buildMockSet
expect(buildMockSet(all, 'behavioral', []).every(x => x.role === 'behavioral')).toBe(true); // length 5 when ≥5 exist
const ts = buildMockSet(all, 'tech-support', []);
expect(ts.map(x => x.role)).toEqual(['behavioral', 'behavioral', 'tech-support', 'tech-support', 'tech-support']);
// role pool of 1 → 4 behavioral + 1 role, behavioral first, no duplicate ids
// total pool of 2 → length 2
// everything hidden → []
```

- [ ] **Step 2:** `npm test -- questionPicker` → FAIL.
- [ ] **Step 3:** Implement. Use a Fisher–Yates shuffle with the injected `random`. `buildMockSet`: shuffle role pool and behavioral pool separately; take `min(3, roleLen)` role questions, then fill behavioral up to 5 total; for `behavioral` role take 5 behavioral; output behavioral first then role.
- [ ] **Step 4:** `npm test -- questionPicker` → PASS.
- [ ] **Step 5:** Commit `feat(domain): add question filtering, picker and mock set builder`.

### Task 4: Starter questions

**Files:**
- Create: `src/data/questions.json`, `src/data/starterQuestions.ts`, `src/data/starterQuestions.test.ts`

**Interfaces:**
- Consumes: `Question`, `ROLES`.
- Produces: `STARTER_QUESTIONS: Question[]` (JSON entries `{ id, role, category, text }` with `source: 'starter'` added).

- [ ] **Step 1: Failing tests:**

```ts
const ids = STARTER_QUESTIONS.map(q => q.id);
expect(new Set(ids).size).toBe(ids.length);
for (const q of STARTER_QUESTIONS) {
  expect(ROLES).toContain(q.role);
  expect(q.category.trim()).not.toBe('');
  expect(q.text.trim()).not.toBe('');
  expect(q.source).toBe('starter');
}
for (const r of ROLES) expect(STARTER_QUESTIONS.filter(q => q.role === r).length).toBeGreaterThanOrEqual(5);
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Write `questions.json`: 25 per role (75 total). IDs `beh-001…beh-025`, `ts-001…ts-025`, `cs-001…cs-025`. Categories (lowercase, hyphenated):
  - behavioral: `intro`, `strengths-weaknesses`, `conflict`, `teamwork`, `failure`, `motivation`
  - tech-support: `troubleshooting`, `communication`, `prioritization`, `technical-basics`, `difficult-users`
  - customer-service: `difficult-customers`, `de-escalation`, `empathy`, `problem-solving`, `multitasking`
  Questions are realistic entry/mid-level interview questions, each a single sentence or two, no duplicates. Implement `starterQuestions.ts` (typed import of the JSON, maps `source`).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(data): add 75 starter interview questions`.

### Task 5: Database repository

**Files:**
- Create: `src/services/db.ts`, `src/services/db.test.ts`

**Interfaces:**
- Consumes: domain types.
- Produces:
  - `class StorageFullError extends Error`
  - `interface SessionSummary { session: MockSession; averageRating: number | null }`
  - `interface Repository {`
    - `saveAnswer(a: Answer): Promise<void>`
    - `updateAnswer(id: string, patch: { rating?: Rating; note?: string }): Promise<void>`
    - `getAnswer(id: string): Promise<Answer | undefined>`
    - `listQuickAnswers(): Promise<Answer[]>` — mode `quick`, newest first
    - `deleteAnswer(id: string): Promise<void>` — also removes id from its session's `answerIds`
    - `createSession(role: Role): Promise<MockSession>`
    - `addAnswerToSession(sessionId: string, a: Answer): Promise<void>` — one transaction: save answer + append id
    - `completeSession(id: string): Promise<void>`
    - `getSession(id: string): Promise<{ session: MockSession; answers: Answer[] } | undefined>` — answers in `answerIds` order
    - `listSessions(): Promise<SessionSummary[]>` — newest first
    - `deleteSession(id: string): Promise<void>` — cascades to its answers
    - `listCustomQuestions(): Promise<Question[]>` — oldest first
    - `addCustomQuestion(input: { role: Role; category: string; text: string }): Promise<Question>` — id `custom-<uuid>`, `source: 'custom'`
    - `updateCustomQuestion(id: string, input: { role: Role; category: string; text: string }): Promise<void>`
    - `deleteCustomQuestion(id: string): Promise<void>`
    - `getSettings(): Promise<Settings>` — default `{ hiddenStarterIds: [] }`
    - `setStarterHidden(id: string, hidden: boolean): Promise<void>`
  - `}`
  - `createRepository(dbName = 'mock-buddy'): Repository`
- Storage format: answers are stored with `audio` as an `ArrayBuffer` plus `mimeType`, rebuilt into a `Blob` on read (robust on Safari and in tests). Convert with `blob.arrayBuffer()` when present, else `FileReader.readAsArrayBuffer` (jsdom).
- All write methods rethrow `QuotaExceededError` (by `name`, also when nested in Dexie's `inner`) as `StorageFullError`.

- [ ] **Step 1: Failing tests** (each test uses `createRepository(\`test-${crypto.randomUUID()}\`)`, helper `makeAnswer(overrides)`):

```ts
// round-trip audio bytes + type
await repo.saveAnswer(makeAnswer({ id: 'a1', audio: new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mp4' }), mimeType: 'audio/mp4' }));
const got = await repo.getAnswer('a1');
expect(got!.audio.type).toBe('audio/mp4');
expect(new Uint8Array(await blobBytes(got!.audio))).toEqual(new Uint8Array([1, 2, 3]));
// listQuickAnswers excludes mock answers, newest first
// updateAnswer sets rating and note
// createSession → completed false, answerIds []
// addAnswerToSession appends in order; getSession returns answers in that order
// listSessions newest first with averageRating (null when none rated)
// deleteSession removes the session and its answers (getAnswer → undefined)
// deleteAnswer removes id from session.answerIds
// custom questions: add returns id starting 'custom-' and source 'custom'; update; delete; list oldest first
// settings: default hiddenStarterIds []; setStarterHidden(id,true) then false; no duplicates when hidden twice
// quota: stub table put to reject with DOMException('x','QuotaExceededError') → rejects.toBeInstanceOf(StorageFullError)
```

(`blobBytes` is a local test helper using the same FileReader fallback.)

- [ ] **Step 2:** `npm test -- db` → FAIL.
- [ ] **Step 3:** Implement with Dexie: schema v1 — `answers: 'id, mode, sessionId, createdAt'`, `sessions: 'id, createdAt'`, `customQuestions: 'id, createdAt'`, `settings: 'key'` (single row `key: 'settings'`). Custom question rows carry `createdAt` internally.
- [ ] **Step 4:** `npm test -- db` → PASS.
- [ ] **Step 5:** Commit `feat(services): add IndexedDB repository`.

### Task 6: Recorder service

**Files:**
- Create: `src/services/recorder.ts`, `src/services/recorder.test.ts`, `src/test/fakeRecorder.ts`

**Interfaces:**
- Produces:
  - `type RecorderErrorCode = 'unsupported' | 'permission-denied' | 'failed'`
  - `class RecorderError extends Error { code: RecorderErrorCode }`
  - `interface Recording { blob: Blob; mimeType: string; durationSec: number }`
  - `interface Recorder { isSupported(): boolean; start(): Promise<void>; stop(): Promise<Recording>; cancel(): void }`
  - `pickMimeType(isTypeSupported: (t: string) => boolean): string | undefined`
  - `createMediaRecorder(): Recorder`
  - Test helper `createFakeRecorder(opts?: { supported?: boolean; startError?: RecorderErrorCode; stopError?: RecorderErrorCode; durationSec?: number }): Recorder & { readonly startCalls: number; readonly stopCalls: number; readonly cancelCalls: number; readonly recording: boolean }` — `stop()` resolves a 3-byte `audio/webm` blob.

- [ ] **Step 1: Failing tests** (stub `navigator.mediaDevices.getUserMedia` and a minimal `MediaRecorder` class on `globalThis` with `vi.stubGlobal`):

```ts
expect(pickMimeType(t => t === 'audio/mp4')).toBe('audio/mp4');
expect(pickMimeType(t => t.startsWith('audio/webm'))).toBe('audio/webm;codecs=opus');
expect(pickMimeType(() => false)).toBeUndefined();
// isSupported false when MediaRecorder or getUserMedia missing
// start(): getUserMedia rejects NotAllowedError → RecorderError code 'permission-denied'
// start() when unsupported → code 'unsupported'
// stop(): returns blob of recorded chunks, mimeType from recorder, durationSec ≥ 0
// stop() with zero-size data → code 'failed'
// stop() and cancel() call track.stop() on every stream track
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. `durationSec` = `Math.round((Date.now() - startedAt) / 1000)`. `NotAllowedError`/`SecurityError` → `permission-denied`; other getUserMedia errors → `failed`. Collect chunks via `ondataavailable`; resolve on `onstop`. Write `fakeRecorder.ts`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(services): add MediaRecorder-based audio recorder`.

### Task 7: Storage service, services context, app shell and Home

**Files:**
- Create: `src/services/storage.ts`, `src/services/storage.test.ts`, `src/ui/services.tsx`, `src/ui/messages.ts`, `src/ui/AppRoutes.tsx`, `src/ui/screens/Home.tsx`, `src/ui/screens/Home.test.tsx`, `src/ui/styles.css`, `src/test/renderWithServices.tsx`, `src/test/fakeStorage.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces:
  - `interface StorageService { estimate(): Promise<{ usedBytes: number; quotaBytes: number } | null>; persist(): Promise<boolean>; persisted(): Promise<boolean> }`; `browserStorage: StorageService` (returns `null`/`false` when `navigator.storage` missing); `formatBytes(n: number): string` (`0 B`, `512 B`, `1.5 KB`, `12.3 MB`, `2.0 GB`, base 1024).
  - `interface Services { recorder: Recorder; repo: Repository; storage: StorageService }`; `ServicesProvider({ services, children })`; `useServices(): Services`.
  - `messages.ts`: the six copy constants from Global Constraints.
  - `AppRoutes()` route table: `/` Home, `/practice` QuickPractice, `/mock` MockInterview, `/mock/:sessionId/review` MockReview, `/history` History (`?tab=mock` selects mock tab), `/history/answer/:answerId` AnswerDetail, `/questions` MyQuestions. Screens not built yet render a placeholder `<h1>`.
  - `AppRoutes` calls `storage.persist()` once on mount.
  - `renderWithServices(path: string, services?: Partial<Services>)` → renders `AppRoutes` in `MemoryRouter initialEntries={[path]}` with defaults (fake recorder, fresh fake-indexeddb repo, fake storage); returns RTL result plus `services`.
  - `createFakeStorage(opts?: { persisted?: boolean; usedBytes?: number; quotaBytes?: number }): StorageService`
  - `main.tsx`: `HashRouter` + `ServicesProvider` with `createMediaRecorder()`, `createRepository()`, `browserStorage`.

- [ ] **Step 1: Failing tests:**

```ts
// storage.test.ts
expect(formatBytes(0)).toBe('0 B');
expect(formatBytes(1536)).toBe('1.5 KB');
expect(formatBytes(12.3 * 1024 ** 2)).toBe('12.3 MB');
// Home.test.tsx
renderWithServices('/');
expect(screen.getByRole('link', { name: 'Quick Practice' })).toBeVisible();
expect(screen.getByRole('link', { name: 'Mock Interview' })).toBeVisible();
expect(screen.getByRole('link', { name: 'History' })).toBeVisible();
expect(screen.getByRole('link', { name: 'My Questions' })).toBeVisible();
// unsupported
renderWithServices('/', { recorder: createFakeRecorder({ supported: false }) });
expect(screen.getByRole('alert')).toHaveTextContent(UNSUPPORTED);
expect(screen.queryByRole('link', { name: 'Quick Practice' })).toBeNull();
expect(screen.getByRole('button', { name: 'Quick Practice' })).toBeDisabled();
// persist requested once on mount (spy on fake storage)
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. When unsupported, practice entries render as disabled `<button>`s instead of links. `styles.css`: CSS variables for colors/spacing, dark-mode overrides under `prefers-color-scheme: dark`, `max-width: 480px` centered main column, buttons min-height 44px.
- [ ] **Step 4:** Run full suite → PASS; `npm run build` passes.
- [ ] **Step 5:** Commit `feat(ui): add services context, routes and home screen`.
- [ ] **Step 6:** Push branch; create GitHub repo `drof-builder/mock-buddy` (public) with `gh repo create` **after confirming with the user**; open PR "Milestone 1: Foundation" (body ends with the Claude Code line); wait for CI green; user merges.

---

## Milestone 2 — Quick Practice + History (branch `m2-quick-practice`)

### Task 8: Recording hook and shared components

**Files:**
- Create: `src/ui/useRecording.ts`, `src/ui/useRecording.test.tsx`, `src/ui/format.ts`, `src/ui/format.test.ts`, `src/ui/components/{Timer,AudioPlayer,RatingInput,RoleCategoryPicker,ErrorBanner}.tsx`, `src/ui/components/components.test.tsx`

**Interfaces:**
- Consumes: `Recorder`, `RecorderError`, `Recording`, messages.
- Produces:
  - `useRecording(): { status: 'idle' | 'starting' | 'recording' | 'stopping'; elapsedSec: number; error: RecorderErrorCode | null; start(): Promise<void>; stop(): Promise<Recording | null>; cancel(): void; clearError(): void }`
    - `elapsedSec` = `Math.floor((Date.now() - startedAt) / 1000)` refreshed every 250 ms (timestamp-based, not tick-counted).
    - `start()` ignored unless `idle`; `stop()` ignored (returns `null`) unless `recording` — a second concurrent `stop()` returns `null` and does not call `recorder.stop` again.
    - Calls `recorder.cancel()` on unmount if not idle; registers a `beforeunload` handler (`preventDefault`) only while `recording`.
  - `recorderErrorMessage(code: RecorderErrorCode): string` (in `messages.ts`).
  - `formatClock(sec: number): string` — `0` → `0:00`, `75` → `1:15`, negative → `0:00`.
  - `Timer({ seconds }: { seconds: number })` — renders `formatClock`, `role="timer"`.
  - `AudioPlayer({ blob }: { blob: Blob })` — `<audio controls>` with object URL; revokes on unmount and when `blob` changes.
  - `RatingInput({ value, onChange }: { value?: Rating; onChange(r: Rating): void })` — five buttons labelled `"Rate N out of 5"` with `aria-pressed`.
  - `RoleCategoryPicker({ role, category, categories, onRoleChange, onCategoryChange, showCategory = true })` — `<select>` labelled "Role" (options use `ROLE_LABELS`), `<select>` labelled "Category" with first option "Any category" (value `''`).
  - `ErrorBanner({ message, actionLabel?, onAction? })` — `role="alert"`.

- [ ] **Step 1: Failing tests:**

```ts
expect(formatClock(0)).toBe('0:00'); expect(formatClock(75)).toBe('1:15'); expect(formatClock(-3)).toBe('0:00');
// useRecording (renderHook inside ServicesProvider with fake recorder, vi.useFakeTimers)
// start → status 'recording'; advance 3000 ms → elapsedSec 3
// stop → returns Recording, status 'idle'
// two concurrent stop() calls → fake.stopCalls === 1, one result null
// start error 'permission-denied' → error === 'permission-denied', status 'idle'
// unmount while recording → fake.cancelCalls === 1
// beforeunload event while recording → defaultPrevented true; after stop → false
// AudioPlayer: URL.createObjectURL called once; unmount → URL.revokeObjectURL called with that URL
// RatingInput: clicking 'Rate 4 out of 5' calls onChange(4); value 4 → that button aria-pressed=true
```

- [ ] **Step 2:** Run → FAIL. (Stub `URL.createObjectURL`/`revokeObjectURL` with `vi.fn` in tests — jsdom lacks them.)
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add recording hook and shared components`.

### Task 9: Quick Practice screen

**Files:**
- Create: `src/ui/screens/QuickPractice.tsx`, `src/ui/screens/QuickPractice.test.tsx`, `src/ui/useQuestionBank.ts`
- Modify: `src/ui/AppRoutes.tsx`

**Interfaces:**
- Consumes: `useRecording`, components, `filterQuestions`, `categoriesFor`, `createPicker`, `STARTER_QUESTIONS`, `Repository`.
- Produces: `useQuestionBank(): { loading: boolean; all: Question[]; hiddenIds: string[] }` — starter + custom questions and hidden starter IDs from the repo (reused by Tasks 11 and 13).

Screen phases: **question** (picker, question text, **Record**, **Skip**) → **recording** (Timer counting up, **Stop**) → **review** (AudioPlayer, RatingInput, note `<textarea>` labelled "Note (optional)", **Re-record**, **Save & Next**, **Done**). Default role `behavioral`, category any. Changing role/category rebuilds the picker and shows a new question. Save buttons disabled until a rating is chosen and while saving. Saved answer: `mode: 'quick'`, `questionText` snapshot, `role` of the question, trimmed note (omit if empty). **Done** saves then navigates to `/`. Recorder errors show `ErrorBanner` with `recorderErrorMessage` and "Try again" (clears error). `StorageFullError` on save → `STORAGE_FULL` banner, stay in review with the take.

- [ ] **Step 1: Failing tests** (`renderWithServices('/practice')`, `userEvent`, fake recorder):

```ts
// shows a behavioral question by default (text found in STARTER_QUESTIONS behavioral)
// Record → Stop → audio player shown; 'Save & Next' disabled until rating
// rate 4, type note, Save & Next → repo.listQuickAnswers() has 1 answer with rating 4, note, questionText === shown text; a question is shown again
// Done → saves and navigates to Home (Quick Practice link visible)
// Skip → question text changes (seed: role with ≥2 questions)
// Re-record → back to question phase with same question; nothing saved
// double-click Save & Next → exactly 1 saved answer
// selecting a category with all its questions hidden → NO_MATCH shown, Record not shown
// permission-denied fake → PERMISSION_DENIED shown with 'Try again'
// repo.saveAnswer rejects StorageFullError → STORAGE_FULL shown, audio player still shown
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `useQuestionBank` and the screen; wire route.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add quick practice screen`.

### Task 10: History (Practice tab), answer detail, storage info

**Files:**
- Create: `src/ui/screens/History.tsx`, `src/ui/screens/AnswerDetail.tsx`, `src/ui/screens/History.test.tsx`
- Modify: `src/ui/AppRoutes.tsx`

**Interfaces:**
- Consumes: `Repository`, `StorageService`, `formatBytes`, `formatClock`, components.
- Produces: `History` with tabs **Practice** / **Mock sessions** (`?tab=mock`); the Mock tab body is a placeholder until Task 12.

Practice list rows (newest first): question text, date (`toLocaleDateString`), duration via `formatClock`, `★ N` or "Unrated"; each row links to `/history/answer/:id`. Empty: "No practice answers yet. Try Quick Practice!". Footer: "Using {used} of {quota}" when estimate available; `INSTALL_HINT` when `storage.persisted()` is false. AnswerDetail: question text, AudioPlayer, RatingInput, note, **Save changes** (updateAnswer, trimmed note), **Delete** (`window.confirm('Delete this answer?')`, then delete and navigate back to `/history`, or `/history?tab=mock` for mock answers). Missing answer → "Answer not found."

- [ ] **Step 1: Failing tests:**

```ts
// empty state text
// two seeded quick answers → rows in newest-first order, '★ 4' and 'Unrated'
// footer 'Using 1.0 MB of 1.0 GB' with fake storage; INSTALL_HINT when persisted false, absent when true
// open detail → change rating to 2, Save changes → repo.getAnswer rating 2
// Delete with confirm stubbed true → answer gone, back on History; confirm false → still exists
// unknown id → 'Answer not found.'
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; wire routes.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add practice history and answer detail`.
- [ ] **Step 6:** Push, PR "Milestone 2: Quick Practice + History", CI green. Before merge, the user checks recording/playback in a desktop browser via `npm run dev` at `http://localhost:5173/mock-buddy/` (the mic needs https or localhost, so the phone check waits for the GitHub Pages deploy in Milestone 4). User merges.

---

## Milestone 3 — Mock Interview (branch `m3-mock-interview`)

### Task 11: Mock Interview screen

**Files:**
- Create: `src/ui/screens/MockInterview.tsx`, `src/ui/screens/MockInterview.test.tsx`
- Modify: `src/ui/AppRoutes.tsx`

**Interfaces:**
- Consumes: `useQuestionBank`, `buildMockSet`, `useRecording`, `Repository.createSession` / `addAnswerToSession`, `MOCK_ANSWER_SECONDS`.
- Produces: navigation to `/mock/:sessionId/review` after the last answer.

Phases: **setup** (RoleCategoryPicker with `showCategory={false}`, **Start mock**) → per question: "Question {i} of {n}", text, **Start answer** → recording with Timer showing `MOCK_ANSWER_SECONDS - elapsedSec` and **Stop** → saved, next question. Session is created on **Start mock** only if the set is non-empty; empty set → `NO_MATCH`. Auto-stop: an effect fires `stop()` when `elapsedSec >= MOCK_ANSWER_SECONDS` (the hook's single-stop guard prevents doubles). On stop: `addAnswerToSession` with `mode: 'mock'`, `sessionId`, snapshot text, no rating. Recorder error → banner with "Try again" on the same question. `StorageFullError` → `STORAGE_FULL` banner plus **Retry save** holding the take.

- [ ] **Step 1: Failing tests** (fake timers + `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`):

```ts
// setup → Start mock (Technical Support) → 'Question 1 of 5'
// Start answer → Stop → 'Question 2 of 5'; repo.getSession(...).answers.length === 1, mode 'mock', no rating
// countdown shows '2:00' at start, '1:30' after 30 s
// auto-stop: advance 120_000 ms → advances to next question; fake.stopCalls === 1
// big jump: advance 300_000 ms at once → still exactly one answer saved for that question
// Stop clicked in the same tick as auto-stop → one answer saved
// after 5th answer → route /mock/<id>/review (placeholder heading visible)
// all questions hidden → NO_MATCH, no session created (repo.listSessions() empty)
// session left unfinished: completed === false after 2 answers
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; wire route.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add mock interview flow`.

### Task 12: Mock Review and History mock tab

**Files:**
- Create: `src/ui/screens/MockReview.tsx`, `src/ui/screens/MockReview.test.tsx`
- Modify: `src/ui/screens/History.tsx`, `src/ui/screens/History.test.tsx`, `src/ui/AppRoutes.tsx`

**Interfaces:**
- Consumes: `Repository.getSession`, `updateAnswer`, `completeSession`, `listSessions`, `deleteSession`, `formatAverage`.

MockReview: heading "Review — {role label}", one card per answer (question text, AudioPlayer, RatingInput, note). **Finish** writes each changed rating/note via `updateAnswer`, calls `completeSession`, navigates to `/history?tab=mock`. **Delete session** (confirm `'Delete this mock session and its recordings?'`) → `deleteSession`, navigate to `/history?tab=mock`. Unknown id → "Session not found." Works for unfinished sessions. History mock tab rows: date, role label, `Avg {formatAverage}`, "Unfinished" badge when not completed; row links to review. Empty: "No mock interviews yet."

- [ ] **Step 1: Failing tests:**

```ts
// seeded session with 2 answers → 2 cards; rate first 5, Finish → answer rating 5, session completed true, on History mock tab
// ratings optional: Finish with none rated → completed true
// history mock tab: 'Avg 4.5' row, 'Unfinished' badge for completed:false, 'Avg —' when none rated
// delete session confirm true → gone from list and its answers deleted
// unknown id → 'Session not found.'
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add mock review and mock history`.
- [ ] **Step 6:** Push, PR "Milestone 3: Mock Interview", CI green, user merges.

---

## Milestone 4 — My Questions, PWA, deploy (branch `m4-release`)

### Task 13: My Questions screen

**Files:**
- Create: `src/ui/screens/MyQuestions.tsx`, `src/ui/screens/MyQuestions.test.tsx`, `src/domain/customQuestion.ts`, `src/domain/customQuestion.test.ts`
- Modify: `src/ui/AppRoutes.tsx`

**Interfaces:**
- Produces: `validateCustomQuestion(input: { role: Role; category: string; text: string }): { ok: true; value: { role: Role; category: string; text: string } } | { ok: false; error: string }` — trims; empty text → `"Question text is required."`; text > 500 chars → `"Keep questions under 500 characters."`; empty category → `"general"`.

Screen: form (Role select, Category input with `<datalist>` of `categoriesFor` existing questions, Question `<textarea>`, **Add question**); list of custom questions with **Edit** (fills the form, button becomes **Save**, plus **Cancel**) and **Delete** (confirm `'Delete this question?'`). Section "Starter questions" grouped by role with a **Hide**/**Show** toggle per question (`setStarterHidden`). Empty custom list: "You haven't added any questions yet."

- [ ] **Step 1: Failing tests:**

```ts
expect(validateCustomQuestion({ role: 'behavioral', category: '  ', text: '  Why us?  ' })).toEqual({ ok: true, value: { role: 'behavioral', category: 'general', text: 'Why us?' } });
expect(validateCustomQuestion({ role: 'behavioral', category: 'x', text: '   ' })).toEqual({ ok: false, error: 'Question text is required.' });
// 501 chars → error
// UI: add → appears in list and in repo; whitespace-only → error shown, nothing saved
// edit text → saved; delete with confirm → removed
// Hide starter beh-001 → repo settings include it; Show → removed
// integration: custom tech-support question added, Quick Practice with that role/category shows it
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; wire route.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(ui): add my questions screen`.

### Task 14: PWA, deploy, release

**Files:**
- Create: `public/icon.svg`, generated `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico`
- Modify: `vite.config.ts`, `index.html`, `.github/workflows/ci.yml`, `README.md`, `package.json` (version `1.0.0`)

- [ ] **Step 1:** Create a simple `icon.svg` (microphone glyph on solid background). Run `npx @vite-pwa/assets-generator --preset minimal-2023 public/icon.svg` to produce PNGs/favicon.
- [ ] **Step 2:** Add `VitePWA({ registerType: 'autoUpdate', includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'], manifest: { name: 'mock-buddy', short_name: 'mock-buddy', description: 'Practice interview answers out loud', theme_color, background_color, display: 'standalone', start_url: '/mock-buddy/', scope: '/mock-buddy/', icons: [192, 512 (also purpose 'maskable')] } })`. In `index.html`: title "mock-buddy", `theme-color` meta, apple-touch-icon link, `viewport` with `viewport-fit=cover`.
- [ ] **Step 3:** `npm run build` → expected: `dist/sw.js` and `dist/manifest.webmanifest` exist. `npx vite preview` and in desktop Chrome DevTools → Application: manifest valid, service worker active, reload offline works.
- [ ] **Step 4:** Add `deploy` job to `ci.yml`: `needs: check`, `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`, permissions `pages: write`, `id-token: write`; `npm ci && npm run build`, `actions/upload-pages-artifact` (path `dist`), `actions/deploy-pages`. User enables Pages → Source: GitHub Actions in repo settings.
- [ ] **Step 5:** README: live URL `https://drof-builder.github.io/mock-buddy/`, install-to-home-screen steps (Android Chrome: menu → Install app; iPhone Safari: Share → Add to Home Screen), and the manual release checklist:
  - Mic permission prompt appears; record, play back, save in Quick Practice.
  - Mock: countdown auto-stops at 0:00; Review plays all answers.
  - Close and reopen the app: history and recordings still there.
  - Install to home screen; open in airplane mode — app loads and records.
  - Leave Quick Practice mid-recording: the phone's mic indicator turns off.
- [ ] **Step 6:** Full suite, lint, typecheck, build pass. Commit `feat: make app installable and deploy to GitHub Pages`; bump version to 1.0.0 in a separate commit `chore: release v1.0.0`.
- [ ] **Step 7:** Push, PR "Milestone 4: My Questions, PWA, deploy", CI green, user merges; deploy job succeeds; user runs the manual checklist on their phone at the live URL; then tag `v1.0.0` and create a GitHub release.
