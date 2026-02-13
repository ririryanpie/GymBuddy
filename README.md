# GymBuddy (Expo + SQLite)

Personal strength training app for fixed A/B programming, coach feedback loop, and fast session logging.

## Architecture proposal

- **Frontend:** Expo React Native (TypeScript), single-process local app.
- **Storage:** `expo-sqlite` local DB with migrations in app startup.
- **Core modules:**
  - `src/config/program.ts` – non-negotiable routine + increments + rest-time config.
  - `src/logic/sessionGenerator.ts` – A/B alternation, lunge direction, B-session arm/lateral rotation.
  - `src/logic/progression.ts` – rule-based suggestions for main lifts, pullups, accessories.
  - `src/logic/coachValidation.ts` – strict JSON schema for coach overrides, with bounded constraints.
  - `src/services/openaiCoach.ts` – optional in-app coach call using user API key.
- **Screens:** Today, History (with CSV export/import), Coach (check-in + in-app/copy-paste/manual JSON), Summaries.

## DB schema

- `workouts`: session headers (A/B + start/end timestamps)
- `workout_logs`: set-level row storage with required CSV shape fields
- `app_state`: counters and persistent generation state (`bCount`, `lungeDirection`)
- `coach_checkins`: post-workout check-in form
- `coach_responses`: raw coach responses metadata
- `coach_overrides`: active override payloads
- `audit_log`: who/what/when of override application

## Program constraints implemented

- Session A/B fixed order and alternation.
- Main lift prescriptions fixed: Squat/Bench 3x5, Deadlift 3x3, OHP 3x5.
- Pullups fixed at 3 sets with progression target by total reps.
- Lunge direction alternates forward/reverse and persists.
- Arms superset handling:
  - A: quick add default 2 sets
  - B: every second B swaps lateral raises for arms superset
- Rest timer shown per exercise and usable per set.
- Warmup sets supported and marked.

## Run instructions

### 1) Install deps

```bash
npm install
```

### 2) Start app

```bash
npm run start
```

### iPhone (Expo Go)

1. Install **Expo Go** from App Store.
2. Ensure iPhone and dev machine are on same network.
3. Run `npm run start`, scan QR code in Expo Go.
4. Open GymBuddy and verify Today screen defaults to Session A on fresh DB.

### iOS Simulator (macOS)

```bash
npm run ios
```

(Requires Xcode + simulator installed.)

### Optional iOS build (EAS)

```bash
npm i -g eas-cli
# login + configure project
# eas build -p ios
```

## Tests

```bash
npm run test
npm run typecheck
```

Unit tests cover progression logic + coach override schema constraints.

## UAT script (human-style acceptance)

Use `UAT_CHECKLIST.md` and execute UAT-0..UAT-7 in order. Fix issues and rerun until pass.

