# Fix Stale Messages Bug and Missing i18n Translations

## TL;DR

> **Quick Summary**: Fix two frontend bugs: (1) Clear previous session messages when starting a new learning session, (2) Replace hardcoded strings with i18n translation wrappers across 4 components.
> 
> **Deliverables**:
> - `Home.tsx` - Call `clearMessages()` in `handleStart()` + wrap ~10 hardcoded strings with `t()`
> - `Header.tsx` - Wrap 2 hardcoded strings ("German Tutor", "AI Learning")
> - `ModeSelector.tsx` - Add `useTranslation` import + wrap 4 strings
> - `ScenarioCard.tsx` - Add `useTranslation` import + wrap 3 strings + add new keys
> - 3 locale JSON files - Add `scenario.role` and `scenario.level` keys
> 
> **Estimated Effort**: Quick (2-3 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 6 (sequential dependency on translation keys)

---

## Context

### Original Request
Fix two bugs in the German Tutor frontend:
1. **Stale Conversation Bug**: Previous session messages persist when starting a new learning session. Root cause: `clearMessages()` exists but is never called.
2. **Missing i18n Translations**: Many UI elements don't respond to language switching. Translation keys exist but components use hardcoded strings.

### Interview Summary
**Key Discussions**:
- Issue 1 fix is straightforward: call `clearMessages()` in `handleStart()` before navigation
- Issue 2 affects Home.tsx, Header.tsx, ModeSelector.tsx, ScenarioCard.tsx
- Most translation keys already exist in common.json
- Need to add 2 new keys: `scenario.role` and `scenario.level`

**Research Findings**:
- `clearMessages()` defined at `store/index.ts:57` but never invoked
- ModeSelector.tsx and ScenarioCard.tsx don't import `useTranslation` (critical gap)
- Home.tsx has ~10 hardcoded strings, more than initially identified
- Line 93-94 in Home.tsx should use interpolation: `t('home.scenariosAvailable', {count, level})`

### Metis Review
**Identified Gaps** (addressed):
- ModeSelector.tsx and ScenarioCard.tsx need `useTranslation` import added
- Home.tsx has additional hardcoded strings (lines 67, 77-80, 93-94, 101, 125-127, 146, 157-158, 163-164)
- Should use `t('key', 'fallback')` pattern for safety
- Question raised about clearing `selectedScenarioId` - decided NOT to clear (user only reported messages issue)

---

## Work Objectives

### Core Objective
Ensure new learning sessions start with a clean message history, and all UI text responds to language switching.

### Concrete Deliverables
- Bug 1: `handleStart()` clears message state before navigation
- Bug 2: All hardcoded strings in 4 files use `t()` translation wrapper
- Bug 2: New translation keys added to en/zh/de common.json

### Definition of Done
- [ ] `cd src/frontend && npm run lint` passes with no errors
- [ ] `cd src/frontend && npm run build` completes successfully
- [ ] Starting new session shows empty transcript (no stale messages)
- [ ] Switching language updates all text in Home, Header, ModeSelector, ScenarioCard

### Must Have
- `clearMessages()` called synchronously before `navigate('/tutor')`
- All visible text in affected components uses `t()` wrapper
- Translation keys for `scenario.role` and `scenario.level` in all 3 locales

### Must NOT Have (Guardrails)
- Do NOT clear `selectedScenarioId` - only messages (scope boundary)
- Do NOT modify existing translation key structure
- Do NOT change component logic, styling, or layout
- Do NOT touch backend or Tutor.tsx
- Do NOT refactor - only add i18n wrappers
- Do NOT add new dependencies

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no frontend test runner configured)
- **User wants tests**: NO (manual verification per constraints)
- **QA approach**: Manual verification via lint, build, and browser testing

### Manual QA Procedures

**Build Verification:**
```bash
cd src/frontend && npm run lint    # Expected: 0 errors
cd src/frontend && npm run build   # Expected: build succeeds
```

**Browser Verification (Bug 1 - Stale Messages):**
1. Start app, begin a tutor session, say something to create messages
2. Navigate back to Home
3. Click "Start Learning" to begin new session
4. Verify transcript is empty (no previous messages)

**Browser Verification (Bug 2 - i18n):**
1. Start app at Home page
2. Switch language to Chinese (zh) using LanguageSwitcher
3. Verify: "German Tutor" → "德语家教", "AI Learning" → shows Chinese
4. Verify: ModeSelector shows "教师模式", "沉浸模式"
5. Verify: ScenarioCard shows "角色", "级别", difficulty badges in Chinese
6. Switch to German (de) and verify similar translations

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent):
├── Task 1: Fix stale messages bug (Home.tsx - handleStart)
├── Task 2: Add translation keys (all 3 JSON files)
└── Task 3: Fix Header.tsx i18n

Wave 2 (After Task 2):
├── Task 4: Fix ModeSelector.tsx i18n (needs keys from Task 2)
├── Task 5: Fix ScenarioCard.tsx i18n (needs keys from Task 2)
└── Task 6: Fix Home.tsx i18n (needs keys from Task 2)

Wave 3 (After Wave 2):
└── Task 7: Final verification (lint, build, manual test)

Critical Path: Task 2 → Tasks 4,5,6 → Task 7
Parallel Speedup: Tasks 1,2,3 run simultaneously
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 7 | 2, 3 |
| 2 | None | 4, 5, 6 | 1, 3 |
| 3 | None | 7 | 1, 2 |
| 4 | 2 | 7 | 5, 6 |
| 5 | 2 | 7 | 4, 6 |
| 6 | 2 | 7 | 4, 5 |
| 7 | 1, 3, 4, 5, 6 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3 | `delegate_task(category="quick", load_skills=[], run_in_background=true)` × 3 |
| 2 | 4, 5, 6 | `delegate_task(category="quick", load_skills=[], run_in_background=true)` × 3 |
| 3 | 7 | `delegate_task(category="quick", load_skills=["playwright"], run_in_background=false)` |

---

## TODOs

- [ ] 1. Fix stale messages bug - call clearMessages() in handleStart

  **What to do**:
  - Add `clearMessages` to the destructured values from `useAppStore()` (line 18-24)
  - Call `clearMessages()` at the beginning of `handleStart()` before `navigate('/tutor')`

  **Must NOT do**:
  - Do NOT clear `selectedScenarioId` or any other state
  - Do NOT modify navigation logic
  - Do NOT add async/await (clearMessages is synchronous)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, 2-line change, clear instructions
  - **Skills**: `[]`
    - No special skills needed for simple React state call

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 7 (verification)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/frontend/src/pages/Home.tsx:18-24` - Current useAppStore destructuring (add `clearMessages` here)
  - `src/frontend/src/pages/Home.tsx:40-42` - Current handleStart function (add call here)
  - `src/frontend/src/store/index.ts:57` - clearMessages implementation (`() => set({ messages: [] })`)

  **Acceptance Criteria**:
  - [ ] `clearMessages` added to useAppStore destructuring on line ~18-24
  - [ ] `clearMessages()` called at start of `handleStart()` before `navigate('/tutor')`
  - [ ] No lint errors: `cd src/frontend && npm run lint`

  **Commit**: YES
  - Message: `fix(home): clear messages when starting new session`
  - Files: `src/frontend/src/pages/Home.tsx`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 2. Add missing translation keys to locale files

  **What to do**:
  - Add `"role": "Role"` and `"level": "Level"` inside the `scenario` object in `en/common.json`
  - Add `"role": "角色"` and `"level": "级别"` inside the `scenario` object in `zh/common.json`
  - Add `"role": "Rolle"` and `"level": "Stufe"` inside the `scenario` object in `de/common.json`

  **Must NOT do**:
  - Do NOT modify any existing translation keys
  - Do NOT change the structure of the JSON files
  - Do NOT add keys outside the `scenario` object

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple JSON additions, 3 files, identical pattern
  - **Skills**: `[]`
    - No special skills needed for JSON editing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 6 (i18n component fixes need these keys)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/frontend/public/locales/en/common.json:39-46` - Existing `scenario` object structure
  - `src/frontend/public/locales/zh/common.json:39-46` - Chinese translations
  - `src/frontend/public/locales/de/common.json:39-46` - German translations

  **Acceptance Criteria**:
  - [ ] `en/common.json` contains `"scenario": { ..., "role": "Role", "level": "Level" }`
  - [ ] `zh/common.json` contains `"scenario": { ..., "role": "角色", "level": "级别" }`
  - [ ] `de/common.json` contains `"scenario": { ..., "role": "Rolle", "level": "Stufe" }`
  - [ ] All JSON files are valid (no syntax errors): `cd src/frontend && npm run build`

  **Commit**: YES
  - Message: `i18n: add scenario.role and scenario.level translation keys`
  - Files: `src/frontend/public/locales/en/common.json`, `src/frontend/public/locales/zh/common.json`, `src/frontend/public/locales/de/common.json`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 3. Fix Header.tsx i18n - wrap hardcoded strings

  **What to do**:
  - Line 29: Change `German Tutor` to `{t('app.name')}`
  - Line 30: Change `AI Learning` to `{t('app.tagline')}`
  - Note: `useTranslation` is already imported and `t` is already available

  **Must NOT do**:
  - Do NOT modify styling or layout
  - Do NOT change any logic
  - Do NOT add fallback strings (keys already exist)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, 2 string replacements, straightforward
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 7 (verification)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/frontend/src/components/layout/Header.tsx:8` - Existing `const { t } = useTranslation('common')`
  - `src/frontend/src/components/layout/Header.tsx:29-30` - Hardcoded strings to replace
  - `src/frontend/public/locales/en/common.json:3-4` - Translation keys: `app.name`, `app.tagline`

  **Acceptance Criteria**:
  - [ ] Line 29 shows `{t('app.name')}` instead of hardcoded "German Tutor"
  - [ ] Line 30 shows `{t('app.tagline')}` instead of hardcoded "AI Learning"
  - [ ] No lint errors: `cd src/frontend && npm run lint`

  **Commit**: YES
  - Message: `i18n(header): use translation keys for app name and tagline`
  - Files: `src/frontend/src/components/layout/Header.tsx`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 4. Fix ModeSelector.tsx i18n - add import and wrap strings

  **What to do**:
  - Add import: `import { useTranslation } from 'react-i18next';`
  - Add hook call inside component: `const { t } = useTranslation('common');`
  - Line 40: Change `Teacher Mode` to `{t('mode.teacher')}`
  - Line 42-43: Change description to `{t('mode.teacherDesc')}`
  - Line 80: Change `Immersive Roleplay` to `{t('mode.immersive')}`
  - Line 83-84: Change description to `{t('mode.immersiveDesc')}`

  **Must NOT do**:
  - Do NOT modify button logic, styling, or aria attributes
  - Do NOT change the component structure
  - Do NOT add new translation keys (use existing ones)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, pattern is clear (add import + wrap strings)
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7 (verification)
  - **Blocked By**: Task 2 (translation keys must exist first - though these keys already exist)

  **References**:
  - `src/frontend/src/components/tutor/ModeSelector.tsx:1-8` - Import section (add useTranslation)
  - `src/frontend/src/components/tutor/ModeSelector.tsx:10-14` - Component function start (add t hook)
  - `src/frontend/src/components/tutor/ModeSelector.tsx:39-44` - Teacher Mode strings
  - `src/frontend/src/components/tutor/ModeSelector.tsx:80-85` - Immersive Mode strings
  - `src/frontend/public/locales/en/common.json:33-37` - Translation keys: `mode.teacher`, `mode.teacherDesc`, `mode.immersive`, `mode.immersiveDesc`
  - `src/frontend/src/components/layout/Header.tsx:2,8` - Example pattern for useTranslation import and usage

  **Acceptance Criteria**:
  - [ ] `useTranslation` imported from 'react-i18next'
  - [ ] `const { t } = useTranslation('common')` added inside component
  - [ ] All 4 hardcoded mode strings replaced with `t()` calls
  - [ ] No lint errors: `cd src/frontend && npm run lint`

  **Commit**: YES
  - Message: `i18n(mode-selector): add translations for mode titles and descriptions`
  - Files: `src/frontend/src/components/tutor/ModeSelector.tsx`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 5. Fix ScenarioCard.tsx i18n - add import and wrap strings

  **What to do**:
  - Add import: `import { useTranslation } from 'react-i18next';`
  - Add hook call inside component: `const { t } = useTranslation('common');`
  - Line 54: Change `{difficulty}` to `{t(\`scenario.difficulty.${difficulty}\`)}`
  - Line 72-73: Change `Role` to `{t('scenario.role')}`
  - Line 80-81: Change `Level` to `{t('scenario.level')}`

  **Must NOT do**:
  - Do NOT modify card styling or layout
  - Do NOT change click handlers or props
  - Do NOT translate dynamic content (title, titleDe, description, targetRole, suggestedLevel)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, 3 string replacements + import
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 7 (verification)
  - **Blocked By**: Task 2 (needs `scenario.role` and `scenario.level` keys)

  **References**:
  - `src/frontend/src/components/tutor/ScenarioCard.tsx:1-8` - Import section (add useTranslation)
  - `src/frontend/src/components/tutor/ScenarioCard.tsx:10-14` - Component function start (add t hook)
  - `src/frontend/src/components/tutor/ScenarioCard.tsx:53-54` - Difficulty badge (wrap with t)
  - `src/frontend/src/components/tutor/ScenarioCard.tsx:72-73` - "Role" label
  - `src/frontend/src/components/tutor/ScenarioCard.tsx:80-81` - "Level" label
  - `src/frontend/public/locales/en/common.json:42-45` - Translation keys: `scenario.difficulty.Easy/Medium/Hard`

  **Acceptance Criteria**:
  - [ ] `useTranslation` imported from 'react-i18next'
  - [ ] `const { t } = useTranslation('common')` added inside component
  - [ ] Difficulty badge uses `t(\`scenario.difficulty.${difficulty}\`)`
  - [ ] "Role" label uses `t('scenario.role')`
  - [ ] "Level" label uses `t('scenario.level')`
  - [ ] No lint errors: `cd src/frontend && npm run lint`

  **Commit**: YES
  - Message: `i18n(scenario-card): add translations for difficulty, role, and level labels`
  - Files: `src/frontend/src/components/tutor/ScenarioCard.tsx`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 6. Fix Home.tsx i18n - wrap remaining hardcoded strings

  **What to do**:
  - Note: `useTranslation` is already imported and `t` is already available
  - Line 51: Change `German Tutor` to `{t('app.name')}`
  - Line 52: Change `AI Learning` to `{t('app.tagline')}`
  - Line 67: Change `This helps us adapt the conversation difficulty` to `{t('home.levelHelp')}`
  - Line 77: Change `Choose Your Learning Mode` to `{t('home.chooseLearningMode')}`
  - Line 79-80: Change `Teacher mode provides guidance...` to `{t('home.modeHelp')}`
  - Line 89-90: Change `Choose a Scenario` to `{t('home.chooseScenario')}`
  - Line 93: Change hardcoded scenario count text to `{t('home.scenarioHelp')} • {t('home.scenariosAvailable', { count: filteredScenarios.length, level: germanLevel })}`
  - Line 101: Change `Clear selection` to `{t('home.clearSelection')}`
  - Line 125-127: Change show more/less text to use `{showAllScenarios ? t('home.showLess') : t('home.showMore', { count: filteredScenarios.length - 6 })}`
  - Line 146: Change `Starting scenario:` to `{t('home.startingScenario')}`
  - Line 157-158: Change `Start Mission` to `{t('home.startMission')}`
  - Line 163-164: Change `Or select a scenario above...` to `{t('home.selectScenarioHint')}`

  **Must NOT do**:
  - Do NOT modify component logic or state management
  - Do NOT change styling or animations
  - Do NOT alter the handleStart function (already modified in Task 1)
  - Do NOT modify LevelSelector, VoiceSelector, ModeSelector, or ScenarioCard imports/usage

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, multiple straightforward string replacements following existing pattern
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 7 (verification)
  - **Blocked By**: Task 1 (Task 1 modifies same file, coordinate), Task 2 (translation keys)

  **References**:
  - `src/frontend/src/pages/Home.tsx:14` - Existing `const { t } = useTranslation('common')`
  - `src/frontend/src/pages/Home.tsx:51-56` - Hero section title and tagline
  - `src/frontend/src/pages/Home.tsx:63-70` - Level section header
  - `src/frontend/src/pages/Home.tsx:74-84` - Learning mode section
  - `src/frontend/src/pages/Home.tsx:86-104` - Scenario section header
  - `src/frontend/src/pages/Home.tsx:119-131` - Show more/less button
  - `src/frontend/src/pages/Home.tsx:143-166` - Start button section
  - `src/frontend/public/locales/en/common.json:15-31` - All `home.*` translation keys

  **Acceptance Criteria**:
  - [ ] Hero title uses `t('app.name')` and `t('app.tagline')`
  - [ ] All section headers use appropriate `t('home.*')` keys
  - [ ] Scenario count uses interpolation: `t('home.scenariosAvailable', { count, level })`
  - [ ] Show more/less uses `t('home.showMore', { count })` and `t('home.showLess')`
  - [ ] Start button uses `t('home.startMission')` and `t('home.start')`
  - [ ] No lint errors: `cd src/frontend && npm run lint`

  **Commit**: YES
  - Message: `i18n(home): replace all hardcoded strings with translation keys`
  - Files: `src/frontend/src/pages/Home.tsx`
  - Pre-commit: `cd src/frontend && npm run lint`

---

- [ ] 7. Final verification - lint, build, and manual test

  **What to do**:
  - Run `npm run lint` and verify 0 errors
  - Run `npm run build` and verify successful build
  - Manual browser testing:
    1. Start dev server: `npm run dev`
    2. Open http://localhost:5173
    3. Start a session, speak, verify messages appear
    4. Navigate home, start new session
    5. Verify transcript is empty (Bug 1 fixed)
    6. Switch language to Chinese, verify all text changes (Bug 2 fixed)
    7. Switch language to German, verify all text changes

  **Must NOT do**:
  - Do NOT make additional code changes
  - Do NOT commit during verification

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, running commands and browser checks
  - **Skills**: `["playwright"]`
    - Playwright can automate browser verification for language switching

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 3, 4, 5, 6 (all code changes must be complete)

  **References**:
  - `src/frontend/package.json` - Scripts: `lint`, `build`, `dev`
  - All modified files from Tasks 1-6

  **Acceptance Criteria**:
  - [ ] `cd src/frontend && npm run lint` → 0 errors, 0 warnings related to changes
  - [ ] `cd src/frontend && npm run build` → Build successful
  - [ ] Browser: New session starts with empty transcript
  - [ ] Browser: Switching to Chinese shows Chinese text in Header, Home, ModeSelector, ScenarioCard
  - [ ] Browser: Switching to German shows German text in same components

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(home): clear messages when starting new session` | Home.tsx | npm run lint |
| 2 | `i18n: add scenario.role and scenario.level translation keys` | en/zh/de common.json | npm run lint |
| 3 | `i18n(header): use translation keys for app name and tagline` | Header.tsx | npm run lint |
| 4 | `i18n(mode-selector): add translations for mode titles and descriptions` | ModeSelector.tsx | npm run lint |
| 5 | `i18n(scenario-card): add translations for difficulty, role, and level labels` | ScenarioCard.tsx | npm run lint |
| 6 | `i18n(home): replace all hardcoded strings with translation keys` | Home.tsx | npm run lint |

---

## Success Criteria

### Verification Commands
```bash
cd src/frontend && npm run lint    # Expected: 0 errors
cd src/frontend && npm run build   # Expected: vite build succeeds
```

### Final Checklist
- [ ] Bug 1: New session starts with empty messages (clearMessages called)
- [ ] Bug 2: All UI text in affected files responds to language switching
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
