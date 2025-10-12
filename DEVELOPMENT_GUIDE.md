# SHARPENED Frontend - Development Guide

> **Last Updated:** 2025-10-12
> **Purpose:** Enforce consistency, prevent code duplication, maintain clean architecture

---

## Table of Contents

1. [Code Standards](#code-standards)
2. [File Organization](#file-organization)
3. [Component Guidelines](#component-guidelines)
4. [Styling Rules](#styling-rules)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Internationalization](#internationalization)
8. [Testing](#testing)
9. [Common Patterns](#common-patterns)
10. [Anti-Patterns](#anti-patterns)

---

## Code Standards

### TypeScript

- ✅ **ALWAYS** use TypeScript, never `any`
- ✅ **ALWAYS** export types and interfaces
- ✅ **ALWAYS** use strict mode
- ❌ **NEVER** use `@ts-ignore` (fix the issue instead)

```typescript
// ✅ GOOD
interface User {
  id: string
  email: string
  fullName?: string
}

async function getUser(id: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`)
  return response
}

// ❌ BAD
function getUser(id: any): any {
  return fetch(`/users/${id}`).then(r => r.json())
}
```

### Naming Conventions

- **Files:** kebab-case → `user-profile.tsx`, `api-client.ts`
- **Components:** PascalCase → `UserProfile`, `NavBar`
- **Functions:** camelCase → `getUserData`, `handleSubmit`
- **Constants:** UPPER_SNAKE_CASE → `API_BASE_URL`, `MAX_RETRIES`
- **Types/Interfaces:** PascalCase → `User`, `ApiResponse<T>`

### Imports Organization

```typescript
// 1. React and Next.js
import React from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'
import clsx from 'clsx'

// 3. Internal - absolute imports with @/
import { apiClient } from '@/lib/api/client'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/primitives/Button'

// 4. Relative imports (same directory only)
import { UserCard } from './user-card'

// 5. Types
import type { User } from '@/types'

// 6. Styles (if not using Tailwind)
import styles from './component.module.css'
```

---

## File Organization

```
app/                          # Next.js App Router
├── (auth)/                   # Route group
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── signup/
│       └── page.tsx         # Signup page
├── dashboard/
│   ├── page.tsx             # Dashboard main page
│   ├── layout.tsx           # Dashboard layout
│   └── loading.tsx          # Loading state
├── layout.tsx               # Root layout
├── error.tsx                # Error boundary
└── globals.css              # Global styles

components/
├── primitives/              # Base components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   └── View.tsx
├── features/                # Feature-specific components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── nutrition/
│   └── activities/
└── layouts/                 # Layout components
    ├── Header.tsx
    └── Sidebar.tsx

lib/
├── api/                     # API client and endpoints
├── design-system/           # Design tokens
├── i18n/                    # Translations
├── hooks/                   # Custom hooks
├── utils/                   # Utility functions
└── env.ts                   # Environment validation

types/                       # Global TypeScript types
└── index.ts
```

### Rules

1. **One component per file** (except small sub-components)
2. **Co-locate related files** (component + test + styles)
3. **No logic in `app/`** - only routing and layouts
4. **Business logic in `lib/`** - reusable, testable
5. **Feature components in `components/features/`** - domain-specific

---

## Component Guidelines

### Component Structure

```typescript
/**
 * ComponentName - Brief description
 *
 * Detailed description of what this component does,
 * when to use it, and any important notes.
 */

import React from 'react'
import type { ComponentProps } from './types'

// 1. Types/Interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// 2. Component
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  // 3. Hooks (at the top)
  const { t } = useTranslation()
  const router = useRouter()

  // 4. State
  const [isHovered, setIsHovered] = React.useState(false)

  // 5. Effects
  React.useEffect(() => {
    // ...
  }, [])

  // 6. Event handlers
  const handleClick = () => {
    if (disabled || loading) return
    onClick?.()
  }

  // 7. Render helpers (optional)
  const renderIcon = () => {
    if (loading) return <Spinner />
    return null
  }

  // 8. Render
  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        { 'opacity-50 cursor-not-allowed': disabled }
      )}
    >
      {renderIcon()}
      {children}
    </button>
  )
}
```

### Component Best Practices

- ✅ **Small, focused components** (< 200 lines)
- ✅ **Extract custom hooks** for complex logic
- ✅ **Use composition** over prop drilling
- ✅ **Memoize expensive calculations** with `useMemo`
- ✅ **Memoize callbacks** with `useCallback` (when passing to children)
- ❌ **No inline functions** in JSX (use `useCallback`)
- ❌ **No complex logic** in render (move to helper functions)

```typescript
// ✅ GOOD - Extracted hook
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])

  return { user, loading }
}

// ❌ BAD - Logic in component
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])

  // ... rest of component
}
```

---

## Styling Rules

### NEVER Hardcode Values

```typescript
// ❌ BAD - Hardcoded values
<div style={{ color: '#FF6B35', padding: '16px', borderRadius: '8px' }}>

// ✅ GOOD - Use design tokens via Tailwind
<div className="text-primary p-4 rounded-md">

// ✅ GOOD - Use design tokens directly (if needed)
import { theme } from '@/lib/design-system/tokens'
<div style={{ color: theme.colors.primary.DEFAULT }}>
```

### Class Name Organization

```typescript
import clsx from 'clsx'

// ✅ GOOD - Logical grouping with clsx
<button
  className={clsx(
    // Layout
    'flex items-center gap-2',
    // Spacing
    'px-6 py-3',
    // Colors
    'bg-primary text-white',
    // Effects
    'rounded-md shadow-md',
    'transition-all duration-200',
    'hover:bg-primary-dark',
    // Conditional
    {
      'opacity-50 cursor-not-allowed': disabled,
      'animate-pulse': loading,
    }
  )}
>

// ❌ BAD - Long string, hard to read
<button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md shadow-md transition-all duration-200 hover:bg-primary-dark opacity-50 cursor-not-allowed">
```

### Responsive Design

```typescript
// ✅ GOOD - Mobile-first, progressive enhancement
<div className="
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

---

## State Management

### Local State

Use `useState` for component-local state:

```typescript
const [count, setCount] = useState(0)
```

### Form State

Use controlled components or form libraries:

```typescript
// Simple forms - controlled components
const [email, setEmail] = useState('')

// Complex forms - react-hook-form (recommended)
import { useForm } from 'react-hook-form'

const { register, handleSubmit, errors } = useForm()
```

### Server State

Use React Query (recommended for future):

```typescript
// Future implementation
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => apiClient.get(`/users/${userId}`),
})
```

### Global State

Use Context API for simple state, Zustand for complex:

```typescript
// Context API (for theme, auth, etc.)
const AuthContext = React.createContext<AuthState | null>(null)

// Zustand (recommended for complex state)
import create from 'zustand'

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

---

## API Integration

### ALWAYS Use API Client

```typescript
// ✅ GOOD
import { apiClient } from '@/lib/api/client'
const response = await apiClient.get<User>('/users/me')

// ❌ BAD
const response = await fetch('/api/users/me')
```

### Handle Errors Properly

```typescript
// ✅ GOOD
import { ApiRequestError } from '@/lib/api/client'

try {
  const user = await apiClient.get<User>('/users/me')
} catch (error) {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      // Redirect to login
      router.push('/login')
    } else {
      toast.error(error.detail)
    }
  } else {
    toast.error('Something went wrong')
  }
}
```

### Create API Hooks

```typescript
// ✅ GOOD - Reusable hook
function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient
      .get<User>('/api/v1/users/me')
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, error }
}

// Usage
const { user, loading, error } = useCurrentUser()
```

---

## Internationalization

### NEVER Hardcode Text

```typescript
// ❌ BAD
<button>Log In</button>

// ✅ GOOD
import { useTranslation } from '@/lib/i18n'

const { t } = useTranslation()
<button>{t('auth.loginButton')}</button>
```

### With Interpolation

```typescript
// ✅ GOOD
<h1>{t('dashboard.greeting', { name: user.fullName })}</h1>
// Renders: "Hello, John!"
```

### Add New Translations

1. Add to `lib/i18n/translations/en.ts`
2. TypeScript will enforce usage everywhere
3. No missing translations possible!

---

## Testing

### Unit Tests

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

---

## Common Patterns

### Loading States

```typescript
if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!data) return null

return <Content data={data} />
```

### Conditional Rendering

```typescript
// ✅ GOOD - Early returns
if (!user) return <LoginPrompt />
return <Dashboard user={user} />

// ❌ BAD - Nested ternaries
return user ? <Dashboard user={user} /> : <LoginPrompt />
```

### List Rendering

```typescript
// ✅ GOOD
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}

// ❌ BAD - Index as key
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}
```

---

## Anti-Patterns

### ❌ Props Drilling

```typescript
// BAD
<Parent>
  <Child1 user={user}>
    <Child2 user={user}>
      <Child3 user={user} />
    </Child2>
  </Child1>
</Parent>

// GOOD - Use Context
const UserContext = React.createContext<User | null>(null)

<UserContext.Provider value={user}>
  <Parent>
    <Child1>
      <Child2>
        <Child3 />
      </Child2>
    </Child1>
  </Parent>
</UserContext.Provider>
```

### ❌ Massive Components

```typescript
// BAD - 1000 line component

// GOOD - Split into smaller components
<UserProfile>
  <ProfileHeader />
  <ProfileStats />
  <ProfileActivities />
  <ProfileSettings />
</UserProfile>
```

### ❌ Inline Styles

```typescript
// BAD
<div style={{ color: 'red', padding: '20px' }}>

// GOOD
<div className="text-error p-5">
```

---

## Quick Checklist

Before committing code, verify:

- [ ] No `any` types
- [ ] No hardcoded colors/sizes (use design tokens)
- [ ] No hardcoded text (use i18n)
- [ ] No direct `fetch` calls (use API client)
- [ ] Proper error handling
- [ ] TypeScript strict mode passing
- [ ] Component < 200 lines
- [ ] Imports organized correctly
- [ ] No console.logs (use proper logging)

---

## Questions?

If anything is unclear or you're unsure about a pattern, **ask first**.
It's better to discuss than to create technical debt!
