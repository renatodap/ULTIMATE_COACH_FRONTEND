Planning: Full App Integration Strategy (No Code Changes Yet)

Context
The current app has dedicated Nutrition and Activities pages as primary surfaces. We’ve added a Planning system (Today, Calendar, plan instances, adherence, overrides). This document proposes full‑stack UX integration options and a phased plan to get to the best long‑term experience without disrupting current users.

High‑Level Goal
Make the plan the backbone of daily behavior (what to do now), while keeping Nutrition and Activities accessible. Reduce cognitive load by prioritizing Today and Calendar; use Dashboard as the global snapshot; use Coach/Notifications to route users to specific actions.

Key Principles
- Today‑first: The primary entry point should be “Today,” not a static plan summary. Actionable, low friction, and aligned with mobile usage.
- Calendar‑aware: Let users browse ahead on a well‑designed week view. Deep‑link to detail.
- Keep Nutrition/Activities: They remain important, but logging flows should be reachable from Today and Calendar (cards) to reduce context switching.
- Consistency: Reuse the app’s design tokens, components, BottomNav patterns, and visual language.
- No changes yet: This is a blueprint; implement in phases.

IA Options: Pros/Cons & Recommendation

Option 1 — Add a dedicated Plan tab; keep Nutrition & Activities in BottomNav
- BottomNav: Dashboard, Plan, Activities, Nutrition, Profile
- Pros: Minimal disruption; clear place for Plan.
- Cons: BottomNav becomes crowded (5–6 items). Users still split their attention between Plan and log pages.

Option 2 — Replace Activities & Nutrition tabs with a Plan tab (Recommended)
- BottomNav: Dashboard, Plan, Coach, Profile (4 tabs)
- Activities and Nutrition remain as dedicated pages but become secondary entry points, reachable via Dashboard tiles and within Plan (Today/Calendar cards: “Log & Attach”).
- Users still can open Activities/Nutrition from Dashboard, and from Plan’s Log Hub or day cards.
- Pros: Focuses on behavior (Today/Calendar). Cleaner nav. Logging is in context.
- Cons: Some power users may initially miss direct tabs; offset by dashboard tiles and internal links.

Option 3 — Dashboard‑only (no Plan tab)
- BottomNav: Dashboard, Activities, Nutrition, Profile
- Dashboard shows “Today” as a card and “This Week” as a link.
- Pros: Minimal change to nav; Plan exists as content, not a top‑level.
- Cons: Plan feels buried; more taps to reach Calendar and Today.

Decision: Option 2 (Replace Activities & Nutrition tabs with a Plan tab), with a safety net
- BottomNav becomes: Dashboard, Plan, Coach, Profile.
- Add strong Dashboard tiles (“Log a Meal,” “Log Activity,” “Your Plan → Today / This Week”).
- Activities & Nutrition remain first‑class pages but not in BottomNav; they are accessible via Dashboard and within Plan pages.
- For regressions, we can A/B test a variant that keeps Activities in BottomNav for heavy users.

Page‑Level Behavior
- Dashboard
  - Tiles: “Your Plan” (Goal + Reassess CTA: Today), “This Week” (Calendar), “Log a Meal,” “Log Activity,” “Notifications.”
  - Show an overrides banner if Today has adjustments.
- Plan (tab)
  - Default to Today (/plan/day/today): agenda cards (Training, Multimodal, Meals) with status pills and big CTAs (Log & Attach, Completed, Similar, Skipped).
  - Calendar (/plan/calendar): week view with enriched event data; tap to detail; long‑press quick mark (optional).
  - Notifications (/plan/notifications)
  - Progress (/plan/progress): weekly counts; links to body metrics if needed.
  - Log hub (/plan/log): links to Activities and Nutrition pages for power users (keeps parity with existing UX).
- Activities & Nutrition
  - Keep the existing pages and flows; do not remove. Surface links prominently in Dashboard + Plan Log hub.
  - For in‑context logging, Plan cards will open “log & attach” flows so users don’t leave the agenda.
- Coach
  - Coach suggestions deep‑link into Plan (e.g., adherence modal) and Day view.
  - Remains a separate tab.

Micro‑Flows
- From Today
  - Training Card → Adherence (Completed/Similar/Skipped) + optional “Log & Attach Activity.”
  - Meal Card → “Log & Attach Meal” + Adherence.
  - Overrides banner → “Preview” (dry‑run) and “Apply.”
- From Calendar
  - Tap a day → Day view.
  - Tap a card → Session/Meal detail + adherence + plan change.
- From Dashboard
  - “Your Plan” tile → Today; “This Week” → Calendar; “Log a Meal/Activity” → Nutrition/Activities pages (existing flows).
- From Notifications
  - Tap → opens Today and scrolls to affected card.

Phased Rollout Plan (No Code Changes Now)
Phase 1 — Introduce Plan in parallel
- Add Plan pages (Today, Calendar, Notifications, Progress) as internal routes under /plan, without changing BottomNav.
- Add Dashboard tiles linking to Plan.
- Educate via banner/tooltips (“Try the new Today view for faster logging”).

Phase 2 — Switch BottomNav to Plan
- Replace Activities & Nutrition tabs with Plan; keep Coach and Profile.
- Ensure Activities & Nutrition remain accessible via Dashboard and Plan’s Log hub (discoverability prompts).
- Track engagement; provide in‑app education prompts.

Phase 3 — Optimize & Simplify
- Add long‑press quick mark on Calendar.
- Add “Next Up” widget on Dashboard (first card of Today).
- Consider Coach‑driven actions that deep‑link to adherence.

Migration Guide (Routing & Links)
- Keep current routes for Activities/Nutrition. Do not break bookmarks.
- Add internal links:
  - Dashboard → /plan/day/today and /plan/calendar
  - Plan Log hub → /activities and /nutrition (existing pages)
  - Notifications → /plan/day/today (scroll to card)

Analytics & Success Metrics
- Increase in adherence events marked from Today vs Activities.
- Reduced time to first log after opening app.
- Increased completion rates and fewer skipped sessions.
- Drop‑off checks: users still able to find Nutrition and Activities quickly when needed.

Accessibility Guidelines
- Large, labeled buttons for primary actions; status pills with text and icons.
- Navigation clarity: clear “Back” and “Open in Calendar” affordances.
- Single‑column, sticky headers/banners; readable contrast with iron palette.

Open Questions
- Should “Log & Attach” create adherence automatically (status=completed) by default? Proposed: ask explicitly with a modal for clarity.
- Should we add a “Plan” tile also to Coach chat header for quick access? Likely yes.

Implementation Notes (When Ready)
- No code changes now. When implementing Phase 1:
  - Reuse the planning pages already scaffolded under /plan (do not change BottomNav yet).
  - Add Dashboard tiles linking to Today and Calendar.
  - Confirm API base and auth hook wiring before shipping to production.

