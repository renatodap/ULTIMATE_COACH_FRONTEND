# ULTIMATE COACH Frontend

**Production-ready Next.js 14 frontend for ULTIMATE COACH fitness application**

## 🚀 Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript with strict mode
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Supabase authentication
- ✅ Responsive mobile-first design
- ✅ AI coach chat with streaming
- ✅ Multimodal input (text, voice, images)
- ✅ Optimistic UI updates
- ✅ Comprehensive test coverage

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Backend API running (ULTIMATE_COACH_BACKEND)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual values
# Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_BASE_URL
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Access Application

- **App**: http://localhost:3000
- **API Health**: http://localhost:8000/api/v1/health

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 🏗️ Project Structure

```
ULTIMATE_COACH_FRONTEND/
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Signup page
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── coach/page.tsx           # AI coach chat
│   ├── nutrition/page.tsx       # Meal logging
│   ├── activities/page.tsx      # Workout logging
│   ├── profile/page.tsx         # User profile
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── Coach/                    # Coach-specific components
│   ├── Nutrition/                # Nutrition components
│   └── shared/                   # Shared components
│       ├── BottomNav.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── api/                      # API client functions
│   ├── supabase/                 # Supabase clients
│   └── utils/                    # Helper functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
├── middleware.ts                 # Auth middleware
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔧 Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 🎨 Design System

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui (headless, customizable)
- **Icons**: Lucide React
- **Colors**: Custom brand palette
- **Typography**: Inter font
- **Spacing**: Tailwind spacing scale (4px base)

## 📱 Mobile-First

All components are designed mobile-first with breakpoints:
- **Mobile**: 320px - 639px (default)
- **Tablet**: 640px - 1023px (`sm:`)
- **Desktop**: 1024px+ (`lg:`)

## ♿ Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader optimized
- Color contrast ratios validated
- Focus indicators on all interactive elements

## 🔐 Security

- Supabase Auth for authentication
- Row Level Security (RLS) enforced
- HTTPS only in production
- XSS prevention (React escaping)
- CSRF protection (Next.js built-in)
- Input validation with Zod

## 📊 Performance

- Lighthouse Performance Score: ≥90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1
- Next.js Image optimization
- Code splitting & lazy loading

## 📝 Contributing

1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Ensure tests pass
5. Format and lint code
6. Submit pull request

## 📞 Support

For issues or questions: support@ultimatecoach.com

## 📄 License

Private - ULTIMATE COACH Application
