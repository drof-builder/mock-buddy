# mock-buddy

A personal, mobile-first web app for practicing job interviews. Pick a
question, answer it out loud while the app records audio, play it back, and
rate yourself. Everything stays on your device — no account, no server.

**Live app:** https://mock-buddy-pi.vercel.app/

## Features

- **Quick Practice** — random questions by role and category; record, play back, rate 1–5, add a note.
- **Mock Interview** — 5 questions in a row with a 2-minute countdown each, then review and rate them all.
- **History** — every practice answer and mock session, with ratings and playback.
- **My Questions** — add your own questions and hide starter questions you don't need.
- **Works offline** and installs to your home screen.

Starter roles and question types (132 questions):

- **Behavioral:** Basic / screening · Past experience (STAR) · Work style
- **Technical Support:** Basic / screening · Technical knowledge · Databases & SQL · Hotel systems · Troubleshooting · Soft skills
- **Customer Service:** Basic / screening · Situational · Role-play · Tools & metrics · Soft skills

## Install on your phone

- **Android (Chrome):** open the live app → menu (⋮) → **Install app** / **Add to Home screen**.
- **iPhone (Safari):** open the live app → **Share** → **Add to Home Screen**.

Installing matters on iPhone: Safari may clear a website's stored data after
about a week of not visiting it, but not for apps added to the home screen.

## Development

```bash
npm install
npm run dev        # http://localhost:5173/
npm test           # run the test suite
npm run lint       # oxlint
npm run typecheck
npm run build      # production build in dist/
```

The microphone only works on `https://` or `localhost`, so test recording on a
phone using the deployed app.

GitHub Actions runs lint, typecheck, tests and build on every PR and push.
Vercel deploys the app: every push to `main` updates the live site, and every
PR gets its own preview link (handy for testing on a phone before merging).

Design spec and implementation plan live in `docs/superpowers/`.

## Manual release checklist

One-time setup: sign in at [vercel.com](https://vercel.com) with GitHub →
**Add New → Project** → import `drof-builder/mock-buddy`. Vercel detects Vite
(build `npm run build`, output `dist`) — keep the defaults and deploy.

Run on a real phone (Android and/or iPhone) against the live app:

- [ ] Microphone permission prompt appears; record, play back, and save in Quick Practice.
- [ ] Playback shows the recording length and you can drag the progress bar.
- [ ] Mock Interview: the countdown auto-stops at 0:00; Review plays all answers.
- [ ] Turn the screen off during a mock answer near the end; the take stops at about 2:00.
- [ ] Close and reopen the app: History and recordings are still there.
- [ ] Install to home screen; open it in airplane mode — the app loads and records.
- [ ] Leave Quick Practice mid-recording: the phone's mic indicator turns off.
