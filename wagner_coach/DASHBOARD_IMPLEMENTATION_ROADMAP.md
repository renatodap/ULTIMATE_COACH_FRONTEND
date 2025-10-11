# Dashboard & Bottom Nav Implementation Roadmap

## ✅ Completed (Phase 1)

### Database Layer
- ✅ Created migration `024_dashboard_preferences.sql`
  - Added dashboard_preference to profiles (simple|balanced|detailed)
  - Added conditional card preferences (shows_weight_card, shows_recovery_card)
  - Created user_behavior_signals table for tracking
  - Created dashboard_adaptations table for suggestions log
  - Added helper functions (should_show_weight_card, should_show_recovery_card)
  - Added auto-detection trigger for weight card

### Type System
- ✅ Created `lib/types/dashboard.ts`
  - DashboardVariant, DashboardContext, DashboardCard types
  - BehaviorSignals, AdaptationSuggestion types
  - Card props interfaces

### Core Logic
- ✅ Created `lib/dashboard/card-definitions.ts`
  - All 17 dashboard cards defined with priorities
  - Visibility rules and conditional logic
  - Helper functions (getVisibleCards, shouldShowCard)

- ✅ Created `lib/dashboard/persona-detector.ts`
  - inferDashboardPreference() - detects from consultation
  - determineDashboardVariant() - final determination logic
  - detectPersonaMismatch() - adaptation detection
  - getDashboardPreferenceQuestion() - consultation question

- ✅ Created `lib/dashboard/behavior-tracker.ts`
  - Client-side tracking functions
  - React hooks (useBehaviorTracking)
  - Auto-initialization logic

## 🚧 In Progress (Phase 2)

### Consultation Flow
- [ ] Add dashboard preference question to consultation
- [ ] Update consultation types to include dashboard_preference
- [ ] Wire up inference logic in consultation complete handler

### Bottom Navigation
- [ ] Update BottomNavigation.tsx to 4 tabs
- [ ] Remove Meals, Recovery, Activities tabs
- [ ] Add Plan tab (placeholder)
- [ ] Update all page links

## 📋 Remaining Work (Phases 3-7)

### Phase 3: Dashboard Card Components (Day 6-8)

Create in `components/dashboard/cards/`:

1. **ConsultationBannerCard.tsx**
   - Urgent CTA for incomplete consultation
   - Day 13 review variant
   - Dismissible for review (but never for initial)

2. **NextActionCard.tsx** (Simple persona)
   - Next meal/workout with time
   - One-tap log button
   - Pre-filled data

3. **TodaysPlanCard.tsx** (Balanced/Detailed)
   - Timeline view of day
   - Variants: preview (3 items) vs detailed (all items)
   - Checkmarks for completed items

4. **QuickActionsCard.tsx** (All personas)
   - 2 primary buttons: Log Meal, Ask Coach
   - Large touch targets
   - Icons

5. **EventCountdownCard.tsx** (Existing - minor updates)
   - Use existing EventCountdownWidget
   - Add urgency styling when <7 days

6. **WeightTrackingCard.tsx**
   - Current weight + weekly change
   - Mini graph (sparkline)
   - "Log Weight" button
   - Variants: simple (compact) vs detailed (full graph)

7. **NutritionCard.tsx**
   - Calorie circle (size varies by persona)
   - Variants: simple (calories only), balanced (+ macros), detailed (+ micros)
   - "View All" link to /nutrition

8. **MacroDetailsCard.tsx**
   - Protein/Carbs/Fats circles
   - Collapsed accordion for Simple persona
   - Expanded for Balanced/Detailed

9. **StreakCard.tsx**
   - Fire emoji + streak count
   - Motivational message
   - Only show if streak >= 3

10. **ActivitySummaryCard.tsx**
    - Today's activities count
    - Duration, calories, distance
    - Link to activity history

11. **RecoveryMetricsCard.tsx**
    - Sleep hours
    - Soreness level
    - Readiness score
    - Only show if user tracks recovery

12. **CoachInsightCard.tsx**
    - AI-generated motivational message
    - Contextual suggestions
    - Types: motivation, adjustment, milestone, warning
    - Action buttons

13. **WeeklyTrendsCard.tsx**
    - Adherence chart
    - Calorie trend
    - Variants: full (Detailed) vs summary (Balanced)

### Phase 4: Dashboard Engine (Day 9-10)

Create `components/dashboard/DashboardEngine.tsx`:

```typescript
interface DashboardEngineProps {
  persona: DashboardVariant
  context: DashboardContext
}

export function DashboardEngine({ persona, context }: DashboardEngineProps) {
  const cards = getVisibleCards(persona, context)

  return (
    <div className="space-y-4">
      {cards.map(card => {
        const CardComponent = card.component
        return (
          <CardComponent
            key={card.id}
            context={context}
            variant={persona}
          />
        )
      })}
    </div>
  )
}
```

### Phase 5: API Integration (Day 11)

Create backend endpoints:

1. **GET /api/v1/dashboard/context**
   - Returns full DashboardContext
   - Includes user data, program data, behavior signals
   - Cached for 5 minutes

2. **POST /api/v1/dashboard/behavior**
   - Increments behavior signal
   - Body: { signal_type, increment }
   - Returns: updated signals

3. **POST /api/v1/dashboard/app-open**
   - Logs app open event
   - Updates daily_opens_avg
   - Returns: success

4. **PUT /api/v1/dashboard/preference**
   - Updates dashboard preference
   - Body: { variant, shows_weight_card, shows_recovery_card }
   - Returns: updated preference

5. **GET /api/v1/dashboard/adaptations**
   - Gets pending adaptation suggestions
   - Checks if user is eligible (14+ days)
   - Returns: list of suggestions

6. **POST /api/v1/dashboard/adaptations/:id/respond**
   - User accepts/rejects adaptation
   - Body: { accepted, feedback }
   - Returns: success

### Phase 6: Profile Page Refactor (Day 12)

Update `app/profile/page.tsx`:

```typescript
<ProfilePage>
  <Header />
  <QuickStats />

  <Sections>
    <Section icon="📊" title="Meal History" href="/nutrition/history" />
    <Section icon="🏃" title="Activity History" href="/activities/history" />
    <Section icon="😴" title="Recovery Logs" href="/recovery/logs" />
    <Section icon="🎯" title="Events" href="/events" />
    <Section icon="📈" title="Analytics" href="/analytics" />
    <Section icon="⚙️" title="Settings" href="/profile/settings" />
  </Sections>

  <DashboardPreferences>
    <VariantSelector />
    <CardToggles />
  </DashboardPreferences>
</ProfilePage>
```

Move pages:
- /nutrition → /nutrition/history
- /activities → /activities/history
- /recovery → /recovery/logs

### Phase 7: Adaptation System (Day 13)

Create `components/dashboard/AdaptationNotification.tsx`:

```typescript
<AdaptationNotification>
  <Title>I've learned about your preferences</Title>
  <Message>{adaptation.reason}</Message>
  <Actions>
    <Button primary onClick={accept}>Switch to {newVariant}</Button>
    <Button ghost onClick={dismiss}>Keep Current</Button>
  </Actions>
</AdaptationNotification>
```

Logic:
- Check eligibility on dashboard load
- Show notification if adaptations detected
- Store response in dashboard_adaptations table
- Apply preference if accepted

### Phase 8: Testing & Polish (Day 14)

- [ ] Test all 3 dashboard variants
- [ ] Test conditional card visibility
- [ ] Test behavior tracking
- [ ] Test adaptation suggestions
- [ ] Test on mobile (iPhone, Android)
- [ ] Test bottom nav on all pages
- [ ] Empty states for all cards
- [ ] Loading states for all cards
- [ ] Error states
- [ ] Accessibility (keyboard nav, screen reader)

## Key Files to Create

### Components
- [ ] `components/dashboard/DashboardEngine.tsx`
- [ ] `components/dashboard/cards/ConsultationBannerCard.tsx`
- [ ] `components/dashboard/cards/NextActionCard.tsx`
- [ ] `components/dashboard/cards/TodaysPlanCard.tsx`
- [ ] `components/dashboard/cards/QuickActionsCard.tsx`
- [ ] `components/dashboard/cards/WeightTrackingCard.tsx`
- [ ] `components/dashboard/cards/NutritionCard.tsx`
- [ ] `components/dashboard/cards/MacroDetailsCard.tsx`
- [ ] `components/dashboard/cards/StreakCard.tsx`
- [ ] `components/dashboard/cards/ActivitySummaryCard.tsx`
- [ ] `components/dashboard/cards/RecoveryMetricsCard.tsx`
- [ ] `components/dashboard/cards/CoachInsightCard.tsx`
- [ ] `components/dashboard/cards/WeeklyTrendsCard.tsx`
- [ ] `components/dashboard/AdaptationNotification.tsx`

### API
- [ ] `lib/api/dashboard.ts` (client-side API functions)
- [ ] Backend: `app/api/v1/dashboard.py` (endpoints)

### Pages
- [ ] Update `app/dashboard/DashboardClient.tsx` to use DashboardEngine
- [ ] Update `app/profile/page.tsx` with new sections
- [ ] Update `app/components/BottomNavigation.tsx` to 4 tabs

## Migration Path

### For Existing Users
1. Run migration `024_dashboard_preferences.sql`
2. All users default to 'balanced'
3. Auto-detect weight tracking (if 2+ logs in 14 days)
4. Show adaptation notification after 14 days

### For New Users
1. Land on dashboard with consultation banner
2. See balanced variant by default
3. Get asked dashboard preference in consultation
4. Preference applied after consultation complete
5. Behavior tracking starts immediately

## Success Metrics

### Week 1 (Internal Testing)
- [ ] All 3 variants render correctly
- [ ] All conditional cards show/hide properly
- [ ] Behavior tracking works
- [ ] No console errors

### Week 2-4 (Beta Rollout)
- [ ] 90%+ users stay on assigned variant
- [ ] Weight card shows for 70%+ of weight trackers
- [ ] <5% error rate on dashboard load
- [ ] Adaptation suggestions have 50%+ acceptance

### Month 2-3 (Full Production)
- [ ] Dashboard load time <500ms
- [ ] Behavior tracking coverage 95%+
- [ ] Adaptation accuracy 80%+
- [ ] User satisfaction score 4+/5

## Notes

- **Don't over-engineer**: Start with 3 variants, add more only if needed
- **Track everything**: Behavior data is gold for future improvements
- **Fail gracefully**: Missing data shouldn't break the dashboard
- **Mobile first**: 80% of users are on mobile
- **Performance matters**: Keep dashboard fast (<500ms load)
