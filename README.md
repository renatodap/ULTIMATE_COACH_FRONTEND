# Instagram Carousel Generator - Frontend

🎨 **Complete Next.js Frontend with Onboarding UI**

Modern, responsive frontend for AI-powered Instagram carousel generation with comprehensive business profile onboarding.

## Features

- ✨ **5-Step Onboarding Wizard**: Progressive disclosure onboarding flow
- 👤 **Business Profile Management**: Complete profile system with completion tracking
- 📊 **Dashboard**: Carousel management and status tracking
- 🎯 **Approval Workflow**: Multi-stage variant approval interface
- 📈 **Analytics & Insights**: Performance tracking and learning insights
- 🎨 **Responsive Design**: Mobile-first, works on all devices
- ⚡ **Optimized Performance**: Code splitting, React Query caching

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: react-hook-form + Zod validation
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000`

## Project Structure

```
frontend/
├── app/
│   ├── onboarding/       # Onboarding flow page
│   ├── profile/          # Profile management page
│   ├── dashboard/        # Main dashboard
│   ├── create/           # Carousel creation
│   └── carousel/[id]/    # Carousel details
├── components/
│   ├── onboarding/       # Onboarding components
│   │   ├── form-components.tsx
│   │   ├── progress-indicator.tsx
│   │   ├── onboarding-wizard.tsx
│   │   └── steps/        # 5 step components
│   ├── skeletons/        # Loading skeletons
│   └── ...
├── hooks/
│   ├── useOnboardingFlow.ts
│   ├── useBusinessProfile.ts
│   └── ...
├── lib/
│   ├── api.ts            # API client
│   ├── types/            # TypeScript types
│   └── validation/       # Zod schemas
```

## Key Features

### Onboarding Wizard

**5 Steps:**
1. **Business Basics** - Name, industry, target audience
2. **Brand Voice** - Voice, personality, values
3. **Content Strategy** - Goals, topics, examples
4. **Visual Identity** - Colors, style preferences
5. **Review** - USPs, competitors, final submission

**Features:**
- Progressive saving (each step auto-saves)
- Form validation with helpful error messages
- Mobile-responsive with adaptive layouts
- Quick suggestions for common inputs
- Profile completion tracking

### Profile Management

- View complete business profile
- Completion percentage with recommendations
- AI embedding status indicators
- Edit capability (redirects to onboarding)
- Profile summary with metadata

### Dashboard Integration

- Automatic redirect to onboarding for new users
- Profile link in navigation
- Carousel status tracking
- Approval workflow integration

## API Integration

All endpoints are integrated via `lib/api.ts`:

```typescript
// Onboarding
onboardingApi.start()
onboardingApi.getProgress()
onboardingApi.updateStep({ step, data })
onboardingApi.complete({ profile_data })

// Business Profile
businessProfileApi.get()
businessProfileApi.update({ profile_data })
businessProfileApi.getCompletionStatus()
```

## Validation

Uses Zod for type-safe validation:

```typescript
// Example step schema
export const step1Schema = z.object({
  business_name: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  target_audience: z.string().min(5).max(200),
  // ...
})
```

## State Management

React Query for server state:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['onboarding', 'progress'],
  queryFn: onboardingApi.getProgress,
  staleTime: 30000,
})
```

## Build & Deploy

### Build

```bash
npm run build
```

**Bundle Sizes:**
- Onboarding page: 31.1 kB
- Profile page: 2.64 kB
- Dashboard: 5.81 kB

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL=your_backend_url
```

### Docker

```bash
docker build -t insta-carousel-frontend .
docker run -p 3000:3000 insta-carousel-frontend
```

## Testing

```bash
# Type check
npm run type-check

# Build check
npm run build

# Start and test manually
npm run dev
```

## Development Workflow

1. **Start Backend**: Ensure backend is running on port 8000
2. **Start Frontend**: `npm run dev`
3. **Test Flow**:
   - Navigate to `/dashboard`
   - Should redirect to `/onboarding`
   - Complete all 5 steps
   - Verify data saves
   - Check profile page

## Common Issues

### API Connection Fails

- Verify `NEXT_PUBLIC_API_URL` is set
- Check backend is running
- Check CORS settings in backend

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Type Errors

```bash
# Run type check
npm run type-check
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **First Load JS**: 81.9 kB shared
- **Lighthouse Score**: 95+ (aim)
- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## License

MIT License

## Support

For issues, open a GitHub issue.
