Planning UX: Is a central "Plan" page the best choice?

Summary
- Best overall UX: Make “Today” the primary entry, with Calendar and Dashboard as secondary hubs. A dedicated “Plan” summary page can be optional or folded into Dashboard. Notifications and Coach should deep‑link users to specific actions.

Why “Today” first?
- Intent frequency: Most daily interactions are about what to do now, not reading a static plan. A Today view reduces friction, presents actionable items, and drives adherence.
- Decision simplicity: One screen drives behavior for the day, with context banners (overrides), big CTAs (log/attach, completed/similar/skipped), and minimal navigation.

Information Architecture Options

Option A — Today‑first (Recommended)
- Primary entry: Today (day agenda)
- Secondary: Calendar (week), Dashboard (summary + tiles), Notifications
- “Plan” summary becomes a tile in Dashboard (“Your Plan”) rather than a standalone hub.
- Pros: action‑oriented, minimal cognitive load; aligns with mobile usage; late binding of details via deep links.
- Cons: heavy plan readers need to go to Calendar/Details to browse ahead.

Option B — Calendar‑first
- Primary entry: Calendar week view
- Secondary: Today (quick filter), Dashboard tile, Notifications
- Pros: good for planners and athletes juggling multiple modalities; gives situational awareness for week.
- Cons: more taps to complete a single day’s tasks; increased cognitive load on mobile.

Option C — Dashboard‑first
- Primary entry: Dashboard (cards: Today, Next Up, Adherence, Reassessment)
- Secondary: Today, Calendar, Notifications, Coach
- Pros: high‑level insights and CTAs without drilling into plan; good for returning users.
- Cons: can become a kitchen sink if not curated; requires careful prioritization.

Option D — Coach‑driven
- Primary entry: Coach chat suggests actions; plan functions are surfaced as smart cards.
- Secondary: Today, Calendar
- Pros: conversational, adaptive; can prompt adherence; good for users who want guidance.
- Cons: risks burying controls inside chat; must preserve direct access to plan.

Recommended Hybrid (A+D)
- Default landing: Today view (app/plan/day/today)
- Quick switcher: Calendar in tab bar; Dashboard remains the global “snapshot”
- Coach deep‑links: Notifications and Coach cards open specific session/meal modals directly
- Keep a small “Plan summary” surface as a Dashboard tile (goal, reassess date, Start/Open Calendar CTAs)

Navigation & Tabs
- Keep existing tabs (Dashboard, Activities, Coach, Nutrition, Profile)
- No need for a separate “Plan” tab: 
  - Today sits under /plan/day/today, accessible via Dashboard tile, Coach CTA, or a small “Today” quick entry
  - Calendar sits under /plan/calendar but accessed via Dashboard/Coach/Notifications
- If you prefer a tab: rename “Activities” → “Plan” and nest Activities under Plan, but this is optional.

Entry Points & Deep Links
- Dashboard: “Your Plan” tile links to Today; “This Week” links to Calendar.
- Notifications: Tapping an override opens Today with a banner and scrolled to the affected card.
- Calendar: Selecting a day opens Day view; selecting a card opens Session/Meal detail.
- Coach: Cards (suggestions) deep‑link to adherence or plan change modals.

Core Screens (Mobile‑first)
- Today: 
  - Sticky date header + overrides banner
  - Cards for training/multimodal/meals with status pill + large CTAs
  - FAB: “Log Activity/Meal”
- Calendar (week): 
  - Day headings + cards; long‑press to quick mark (planned → completed/similar/skipped)
- Session/Meal Detail:
  - Exercises or intervals/drills, or meal items
  - Bottom sheet modals for Adherence and Plan Change
- Notifications: simple list with “Mark Read”; override and plan change messages
- Dashboard tile: “Your Plan” (goal, reassess date) + CTA to Today/Calendar

Micro‑interactions & Guidance
- Context banners for overrides show reason + CTA (“Apply change” if configurable)
- After logging or adherence: toast confirmation, optimistic UI update, subtle haptics (mobile)
- Habit nudges: If user repeatedly misses evening sessions, show a soft suggestion card: “Move to morning?”

Accessibility
- All pills paired with label + icon; sufficient contrast with iron palette
- Large touch targets; focus states; accessible bottom sheets with proper focus trap

Analytics & A/B Testing
- Log entry source: dashboard tile vs notifications vs coach vs calendar vs Deep Link
- Measure conversion: viewed → log/attach → adherence marked
- A/B: Today‑first vs Calendar‑first landing for high‑frequency users

Implementation Plan (Integrating with Current UI)
1) Make Today the default entry from Dashboard
   - Add “Your Plan” dashboard tile → links to /plan/day/today
   - Show a subline if Today has overrides (“Adjusted: HIIT → Easy Z1/Z2”)

2) Keep Calendar accessible but secondary
   - Dashboard tile “This Week” → /plan/calendar
   - In Today, link to Calendar at the top (small control)

3) Remove Plan Summary as a hub
   - Optionally keep /plan as a minimal summary; do not surface prominently
   - Focus on Today + Calendar as main surfaces

4) Coach & Notifications deep‑links
   - Notifications open Today and scroll to card; highlight affected card (shake/pulse for 1s)
   - Coach buttons (“Mark Completed”, “Apply change”, “Log & Attach”) map to the existing endpoints and the same modals

5) Styling & Components
   - Standardize status pills and cards with iron palette
   - Extract shared PlanCard, StatusPill, OverridesBanner, and modals as reusable components

6) Auth integration
   - Replace localStorage user_id with Supabase auth; provide useUserId hook

7) Progressive enhancement
   - Use /calendar/full to hydrate Today and Calendar;
   - Fallback: show skeletons then refine with updates (socket/polling optional)

8) Validation & QA
   - Cross‑check with RLS; prevent leakage between users
   - Confirm consistency with existing Activities and Nutrition flows

Conclusion
- The best UX is action‑oriented: start with Today, expose Calendar for planning ahead, and use Dashboard/Coach/Notifications to route users into the right place. A central “Plan” page is optional and can be reduced to a dashboard tile. This keeps the app consistent, fast, and focused on daily adherence while still supporting power users who want to browse the week.

