# Fix: Voice Selector Z-Index & Scenario in Teacher Mode

## Context

### Original Request
Fix two issues in the German Tutor app:
1. VoiceSelector dropdown is covered by the "Start Mission" button due to z-index stacking context issues
2. Selected scenario is ignored when using "teacher" mode (default) - only works in "immersive" mode

### Interview Summary
**Key Discussions**:
- Z-index fix: User provided exact fix approach (relative z-20 on section, z-50 on dropdown)
- Scenario in teacher mode: Should provide topic/context without full immersive roleplay
- Auto-start conversation: Decided AGAINST - keep manual conversation start

**Research Findings**:
- Root cause of z-index issue: `animate-fade-in-up` animation uses `transform: translateY()` which creates a stacking context, trapping child z-indexes
- Current dropdown z-index `z-10` is insufficient when parent has transform-based stacking context
- `tutor.py` line 84 only processes scenarios when `learning_mode == "immersive"`

---

## Work Objectives

### Core Objective
Fix two UI/UX bugs: dropdown visibility and scenario applicability in teacher mode.

### Concrete Deliverables
- `src/frontend/src/pages/Home.tsx` - z-index fix on VoiceSelector section
- `src/frontend/src/components/tutor/VoiceSelector.tsx` - increased dropdown z-index
- `src/backend/app/services/tutor.py` - scenario context in teacher mode prompt

### Definition of Done
- [ ] VoiceSelector dropdown appears above "Start Mission" button when expanded
- [ ] Selecting a scenario in teacher mode affects the AI tutor's conversation topic
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without errors
- [ ] `uv run mypy src/backend` passes without errors

### Must Have
- Z-index fix must work regardless of animation state
- Teacher mode with scenario must still allow explanations in student's language (not strict roleplay)
- Must preserve existing behavior when NO scenario is selected

### Must NOT Have (Guardrails)
- Do NOT change immersive mode behavior
- Do NOT add auto-start conversation feature
- Do NOT modify the animation itself (transform is intentional for visual effect)
- Do NOT add new dependencies
- Do NOT change scenario data structure

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no automated frontend/backend tests)
- **User wants tests**: Manual verification only
- **Framework**: N/A

### Manual QA Procedures
Each task includes specific manual verification steps.

---

## Task Flow

```
Task 1 (Frontend z-index) ─┬→ Task 3 (Verify frontend)
                           │
Task 2 (Backend prompt)   ─┴→ Task 4 (Verify backend) → Task 5 (End-to-end)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2 | Frontend and backend changes are independent |

| Task | Depends On | Reason |
|------|------------|--------|
| 3 | 1 | Verify frontend after changes |
| 4 | 2 | Verify backend after changes |
| 5 | 3, 4 | End-to-end requires both fixes |

---

## TODOs

- [ ] 1. Fix VoiceSelector dropdown z-index in frontend

  **What to do**:
  1. Open `src/frontend/src/pages/Home.tsx`
  2. Find line ~134: `<section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>`
  3. Add `relative z-20` to the className to elevate the section's stacking context
  4. Open `src/frontend/src/components/tutor/VoiceSelector.tsx`
  5. Find line ~144: `className="absolute z-10 mt-1 w-full bg-white..."`
  6. Change `z-10` to `z-50`

  **Must NOT do**:
  - Do not remove or modify the `animate-fade-in-up` class
  - Do not change animation timing or delay
  - Do not modify other sections' z-index

  **Parallelizable**: YES (with Task 2)

  **References**:

  **Pattern References**:
  - `src/frontend/src/pages/Home.tsx:134` - Current section wrapper for VoiceSelector (needs z-index)
  - `src/frontend/src/components/tutor/VoiceSelector.tsx:144` - Dropdown ul element with z-10

  **Technical References**:
  - `src/frontend/src/index.css:79-81` - `animate-fade-in-up` class definition
  - `src/frontend/src/index.css:115-124` - `@keyframes fadeInUp` using transform (creates stacking context)

  **WHY Each Reference Matters**:
  - Home.tsx:134 shows the section that needs `relative z-20` to establish a higher stacking context
  - VoiceSelector.tsx:144 shows the dropdown element whose z-10 needs to become z-50
  - index.css confirms the transform-based animation is the root cause (don't remove it)

  **Acceptance Criteria**:

  **Manual Verification (Browser)**:
  - [ ] Run `npm run dev` in `src/frontend`
  - [ ] Navigate to `http://localhost:5173/`
  - [ ] Click on the VoiceSelector dropdown
  - [ ] Verify: Dropdown appears ABOVE the "Start Mission" button
  - [ ] Verify: Dropdown items are fully clickable and visible
  - [ ] Close dropdown, verify button is still clickable below

  **Build Verification**:
  - [ ] `npm run build` → Exit code 0, no errors
  - [ ] `npm run lint` → Exit code 0, no lint errors

  **Commit**: YES
  - Message: `fix(frontend): resolve VoiceSelector dropdown z-index issue`
  - Files: `src/frontend/src/pages/Home.tsx`, `src/frontend/src/components/tutor/VoiceSelector.tsx`
  - Pre-commit: `npm run lint && npm run build`

---

- [ ] 2. Add scenario context to teacher mode system prompt

  **What to do**:
  1. Open `src/backend/app/services/tutor.py`
  2. Locate the `get_system_prompt` function (line 66)
  3. After the immersive mode check (lines 84-89), add a new condition for teacher mode + scenario
  4. Create a new helper function `_build_teacher_with_scenario_prompt` that:
     - Uses the existing teacher mode template as base
     - Injects scenario context (title, description, topics) as conversation focus
     - Keeps the language bridge (allows explanations in student's language)
     - Modifies the greeting to reference the scenario topic
  5. The logic flow should be:
     - If immersive + scenario → `_build_immersive_prompt` (existing, strict roleplay)
     - If teacher + scenario → `_build_teacher_with_scenario_prompt` (new, guided practice)
     - Else → generic teacher prompt (existing)

  **Must NOT do**:
  - Do not modify `_build_immersive_prompt` function
  - Do not change the parameter signature of `get_system_prompt`
  - Do not break existing behavior when no scenario is selected
  - Do not make scenario required for teacher mode

  **Parallelizable**: YES (with Task 1)

  **References**:

  **Pattern References**:
  - `src/backend/app/services/tutor.py:66-118` - `get_system_prompt` function with current logic
  - `src/backend/app/services/tutor.py:121-145` - `_build_immersive_prompt` as pattern for scenario handling
  - `src/backend/app/services/tutor.py:92-96` - `language_bridge` dict to preserve in new prompt

  **API/Type References**:
  - `src/backend/app/services/scenarios.py:8-19` - `Scenario` model with `title`, `description`, `topics`, `target_role`
  - `src/backend/app/services/tutor.py:4` - `get_scenario` import already exists

  **WHY Each Reference Matters**:
  - Lines 66-118 show the teacher mode template that needs scenario enhancement
  - Lines 121-145 show how to incorporate scenario data (title, description, topics)
  - Lines 92-96 show language bridge must be preserved for teacher mode
  - scenarios.py shows available scenario fields to use (title_de, description, topics)

  **Acceptance Criteria**:

  **Unit Verification (Python REPL)**:
  ```python
  from app.services.tutor import get_system_prompt
  
  # Test 1: Teacher mode WITHOUT scenario (unchanged behavior)
  prompt1 = get_system_prompt("A1", "en", "teacher", None)
  assert "scenario" not in prompt1.lower() or "what they would like to practice" in prompt1
  
  # Test 2: Teacher mode WITH scenario (new behavior)
  prompt2 = get_system_prompt("A1", "en", "teacher", "cafe-order")
  assert "coffee" in prompt2.lower() or "cafe" in prompt2.lower() or "Kaffee" in prompt2
  assert "explain" in prompt2.lower() or "English" in prompt2  # Still allows explanations
  
  # Test 3: Immersive mode WITH scenario (unchanged behavior)
  prompt3 = get_system_prompt("A1", "en", "immersive", "cafe-order")
  assert "ONLY speak German" in prompt3  # Strict roleplay unchanged
  ```

  **Type Check Verification**:
  - [ ] `uv run mypy src/backend` → Exit code 0, no type errors

  **Commit**: YES
  - Message: `fix(backend): incorporate scenario context in teacher mode prompts`
  - Files: `src/backend/app/services/tutor.py`
  - Pre-commit: `uv run mypy src/backend && uv run ruff check src/backend`

---

- [ ] 3. Verify frontend fixes (lint + build)

  **What to do**:
  1. Run `npm run lint` in `src/frontend` directory
  2. Run `npm run build` in `src/frontend` directory
  3. Fix any errors that arise

  **Must NOT do**:
  - Do not disable lint rules to make errors go away

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References**:
  - `src/frontend/package.json` - Contains lint and build scripts

  **Acceptance Criteria**:

  **CLI Verification**:
  - [ ] `npm run lint` → Exit code 0
  - [ ] `npm run build` → Exit code 0, `dist/` directory created

  **Commit**: NO (verification only, no file changes unless fixing lint issues from Task 1)

---

- [ ] 4. Verify backend fixes (mypy + ruff)

  **What to do**:
  1. Run `uv run mypy src/backend` from repo root
  2. Run `uv run ruff check src/backend` from repo root
  3. Fix any type errors or lint issues

  **Must NOT do**:
  - Do not add `# type: ignore` comments unless absolutely necessary

  **Parallelizable**: NO (depends on Task 2)

  **References**:

  **Pattern References**:
  - `pyproject.toml` - Contains mypy and ruff configuration

  **Acceptance Criteria**:

  **CLI Verification**:
  - [ ] `uv run mypy src/backend` → Exit code 0
  - [ ] `uv run ruff check src/backend` → Exit code 0

  **Commit**: NO (verification only, no file changes unless fixing type/lint issues from Task 2)

---

- [ ] 5. End-to-end manual verification

  **What to do**:
  1. Start backend: `cd src/backend && uvicorn app.main:app --reload`
  2. Start frontend: `cd src/frontend && npm run dev`
  3. Open browser to `http://localhost:5173/`
  4. Test Issue 1 fix (z-index):
     - Click VoiceSelector dropdown
     - Verify dropdown appears above "Start Mission" button
     - Select a different voice
     - Verify selection works correctly
  5. Test Issue 2 fix (scenario in teacher mode):
     - Select proficiency level (e.g., A1)
     - Keep "Teacher" mode selected (default)
     - Select a scenario (e.g., "Ordering Coffee")
     - Click "Start Mission"
     - Start a conversation with the tutor
     - Verify: AI references the scenario topic (coffee, cafe, ordering)
     - Verify: AI still offers explanations when student struggles (not strict immersive)

  **Must NOT do**:
  - Do not test immersive mode (out of scope for this fix)

  **Parallelizable**: NO (depends on Tasks 3 and 4)

  **References**:

  **Pattern References**:
  - `src/frontend/src/pages/Home.tsx` - Home page with all selectors
  - `src/frontend/src/pages/Tutor.tsx` - Tutor page where conversation happens

  **Acceptance Criteria**:

  **Manual Browser Verification**:
  - [ ] VoiceSelector dropdown is fully visible above Start Mission button
  - [ ] Voice selection changes persist
  - [ ] Teacher mode + scenario → AI mentions scenario topic in conversation
  - [ ] Teacher mode + scenario → AI still explains when asked (not German-only)
  - [ ] Teacher mode WITHOUT scenario → Unchanged generic greeting behavior

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(frontend): resolve VoiceSelector dropdown z-index issue` | Home.tsx, VoiceSelector.tsx | npm run lint && npm run build |
| 2 | `fix(backend): incorporate scenario context in teacher mode prompts` | tutor.py | uv run mypy src/backend |

---

## Success Criteria

### Verification Commands
```bash
# Frontend
cd src/frontend && npm run lint   # Expected: 0 errors
cd src/frontend && npm run build  # Expected: exit 0, dist/ created

# Backend  
uv run mypy src/backend           # Expected: Success: no issues found
uv run ruff check src/backend     # Expected: All checks passed
```

### Final Checklist
- [ ] VoiceSelector dropdown appears above all elements below it
- [ ] Teacher mode with scenario uses scenario context in system prompt
- [ ] Teacher mode without scenario works unchanged
- [ ] Immersive mode works unchanged
- [ ] All lint checks pass
- [ ] All type checks pass
