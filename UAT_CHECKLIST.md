# UAT Checklist (Acceptance)

## UAT-0 Cold start
- [ ] Fresh install / empty DB
- [ ] Today defaults to Session A and correct order
- [ ] No crash, sensible defaults/rest timers visible

## UAT-1 Session A log flow
- [ ] Start A and log rowing duration+distance
- [ ] Add squat warmups + 3x5 work
- [ ] Bench warmups + 3x5 work
- [ ] Pullups 3 sets + total computed
- [ ] Incline + DB row logged
- [ ] Plank or off toggle
- [ ] Rest timer works while logging
- [ ] Workout appears in History

## UAT-2 Next generation
- [ ] Completing A -> next is B
- [ ] Lunges direction alternates and persists
- [ ] Arms quick add on A works
- [ ] Every second B swaps lateral raises for arms

## UAT-3 Progression correctness
- [ ] Squat/Bench +2.5 only if 3x5 + good
- [ ] Deadlift +5 only if 3x3 + good
- [ ] OHP hold-until-complete behavior
- [ ] Accessory double progression
- [ ] Pullup +1 target only with control

## UAT-4 Coach loop
- [ ] Fill check-in + copy packet
- [ ] Import valid coach JSON applies override + audit
- [ ] Invalid/disallowed override rejected
- [ ] Today labels rule vs coach suggestion

## UAT-5 Export/import
- [ ] CSV export exact columns
- [ ] New install import repopulates history
- [ ] Today session sequencing still correct

## UAT-6 Summaries
- [ ] Weekly: sessions, tonnage, e1RM, pullups, pain flags
- [ ] Monthly: PRs, consistency, adherence

## UAT-7 UX/perf
- [ ] One-handed Today interaction, minimal taps
- [ ] History smooth around 50+ rows
- [ ] Timer survives short tab switches

## Iteration notes
- Iteration 1 fixes: added CSV import header validation + coach JSON strict schema + lunge state persistence.
- Iteration 2 fixes: added in-app API key flow + explicit rule/override labeling + UAT checklist docs.
