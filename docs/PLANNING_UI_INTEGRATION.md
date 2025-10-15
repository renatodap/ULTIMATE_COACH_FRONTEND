Planning UI Integration Plan (Mobile‑First, Consistent, Ready for AI)

Goal
Align the new planning UX with the app’s existing design system, components, and navigation, and provide a step‑by‑step plan for full integration.

Principles
- Reuse design tokens (lib/design-system/tokens.ts) and iron* Tailwind utilities already used by BottomNav and other pages.
- Reuse shared components (components/shared, components/BottomNav) for consistent visuals.
- Mobile‑first layout (single-column, sticky headers, bottom nav) with accessible CTAs and status pills.
- Minimize network round trips by using enriched endpoints (calendar/full) and batch fetches.

What’s Already Implemented (Summary)
- Backend endpoints for plans, calendar (enriched), adherence, plan changes, overrides, notifications.
- Normalized DB tables (programs, session_instances, meal_instances, etc.).
- Frontend planning pages in app/plan (summary, calendar, day, notifications, progress, log hub).
- API client in lib/api/planning.ts.
- Plan layout now uses BottomNav and iron color utilities for consistency.

Design Consistency Checklist
1) Colors & Tokens
   - Prefer iron palette classes where available (bg-iron-black, text-iron-white, border-iron-gray/30).
   - For status pills, define a small map (planned, completed, similar, skipped, modified) using token‑compatible classes.
   - Tailwind config already extended (see globals.css / tailwind config); continue using standard spacing and rounded corners.

2) Typography & Spacing
   - Use existing sizes (text-xs/sm/base) and font-medium/semibold for headings.
   - Space: p-3/p-4 for cards, gap-2/gap-3 for lists; rounded-md on cards.

3) Components to Reuse/Extend
   - BottomNav (already integrated into plan layout)
   - Shared card shells (if present in components/shared). If not, extract a PlanCard wrapper for consistent padding/border.
   - StatusPill component to standardize colors and text/icon for planned/completed/similar/skipped/modified.
   - AdherenceModal, PlanChangeModal (new, to be added in components/shared or components/plan).

4) Navigation Integration
   - Dashboard (app/dashboard): add a “Your Plan” tile linking to /plan.
   - Global: BottomNav already includes dashboard, activities, coach, nutrition, profile. Keep plan under /plan but access it primarily from dashboard and coach suggestions.

5) Data Integration
   - Use lib/api/planning.ts for all plan calls.
   - Derive userId from auth (Supabase auth helpers) instead of localStorage.
   - Provide NEXT_PUBLIC_API_BASE_URL in .env.local.

File & Routing Plan
- app/plan/layout.tsx: Uses BottomNav; iron palette; sticky header.
- app/plan/page.tsx (Plan Summary): Program tiles (goal, duration, start, reassess), overrides banner, CTAs.
- app/plan/calendar/page.tsx (Week View): Enriched events; status pills; tap to detail.
- app/plan/day/[date]/page.tsx (Day View): Agenda with exercises/intervals/meal items and adherence CTAs.
- app/plan/notifications/page.tsx: Notification center (override alerts, etc.).
- app/plan/progress/page.tsx: 7‑day summary (completed/similar/skipped counts).
- app/plan/log/page.tsx: Simple hub linking to existing activities/nutrition pages.

Adaptations for Full Consistency
1) Replace neutral-* with iron-* across plan pages
   - page.tsx, calendar/page.tsx, day/[date]/page.tsx, notifications/page.tsx, progress/page.tsx.
   - Use border-iron-gray/30 for borders; bg-iron-black for backgrounds.

2) Extract common components
   - components/plan/PlanCard.tsx: Card container with iron styles.
   - components/plan/StatusPill.tsx: Takes status and renders consistent pill.
   - components/plan/OverridesBanner.tsx: Styled banner for override reasons.
   - components/plan/AdherenceModal.tsx & PlanChangeModal.tsx: Bottom-sheet style with large CTA buttons.

3) Hook up Auth
   - Replace localStorage user_id with real auth from @supabase/auth-helpers-nextjs.
   - Provide a small hook in lib/hooks/useUserId.ts to get userId consistently.

4) Dashboard Integration
   - In app/dashboard/page.tsx, add a “Your Plan” tile displaying: goal, reassess date, and CTA to /plan.
   - Optionally, surface today’s banner (overrides) here using getOverridesToday.

5) Coach Integration (optional)
   - Coach suggestions page can pull /calendar/summary, /notifications, and /overrides/today to proactively suggest: “Mark this completed?”, “Apply adjustment?”, or “Move session to morning?”

6) Skeletons & Toasters
   - Add loading skeletons for tiles and cards (consistent with app’s existing skeleton patterns).
   - Use react-hot-toast or sonner (present in package.json) for errors with minimal copy.

7) Accessibility
   - All action buttons have aria-labels; status text paired with icons.
   - Focusable, keyboard-accessible modals; trap focus; ESC to dismiss.
   - Tap targets min 40x40 on mobile; bottom FAB for frequent log actions.

API Usage Map (Frontend)
- Summary: getCurrentProgram(false), getOverridesToday(userId)
- Calendar Week/Day: getCalendarFull(userId, dateISO, range)
- Adherence: postAdherence({ planned_entity_type, planned_entity_id, status, … })
- Plan changes: POST /api/v1/plan_changes
- Log + attach in one: logAndAttachActivity, logAndAttachMeal (and optionally include status)
- Overrides: getOverridesToday, runOverrides(dry_run=true for preview)
- Notifications: getNotifications, markNotificationRead
- Progress round‑up: getCalendarSummary(userId, startDate, endDate)

Implementation Tasks (Step‑By‑Step)
1) Auth wiring
   - Implement lib/hooks/useUserId.ts using Supabase auth session (fallback to demo for dev).
   - Replace userId localStorage usage in plan pages with hook.

2) Styling refactor to iron palette
   - Update classes in plan pages to iron-* and border-iron-gray/30.
   - Extract PlanCard and StatusPill to components/plan and replace inline styling.

3) Adherence & Plan Change modals
   - Build AdherenceModal and PlanChangeModal with bottom-sheet UX and wire to postAdherence/plan_changes.
   - Reflect updates optimistically on cards; reconcile on response.

4) Dashboard integration
   - Add a “Your Plan” tile to app/dashboard with goal, reassess date; link to /plan.

5) Notifications & Overrides
   - Show a small badge on the tab or header if notifications unread.
   - Surface overrides banner on /plan and /plan/day.

6) QA & Polishing
   - Ensure time_of_day vs start/end display logic is clean (e.g., 'Evening' fallback when no fixed hour).
   - Verify RLS in backend prevents cross‑user data in calendar/notifications.
   - Dark mode alignment and contrast checks.

Acceptance Criteria
- The plan pages look and feel aligned with existing app (iron palette, BottomNav, spacing/typography).
- All key flows work: calendar, day, adherence marking, plan changes, log & attach, notifications, overrides.
- Dashboard shows an entry point and today’s pertinent info.
- API error states are communicated with toasts; loading skeletons appear for initial fetches.

Notes for AI Developers
- Follow API client functions in lib/api/planning.ts.
- Use getCalendarFull for minimal round trips; it already includes plan details.
- When in doubt about visuals, mirror BottomNav’s palette and spacing.

