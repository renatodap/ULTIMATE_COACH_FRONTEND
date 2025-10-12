## React Native Migration Guide

> **Purpose:** Make it extremely easy to port this app to React Native for iOS/Android

---

## Overview

This codebase is structured to be **React Native ready**. Follow these guidelines to ensure maximum compatibility.

## Architecture Compatibility

### ✅ What's Already Compatible

1. **API Client** (`lib/api/client.ts`)
   - Uses standard `fetch` API (works in RN)
   - No browser-specific code
   - httpOnly cookies → Need adjustment (see below)

2. **Business Logic** (`lib/` utilities)
   - Pure JavaScript/TypeScript
   - No DOM dependencies
   - Fully portable

3. **Design System** (`lib/design-system/tokens.ts`)
   - Platform-agnostic tokens
   - Can be used with React Native StyleSheet

4. **State Management** (Future: Zustand/Redux)
   - Framework agnostic
   - Works identically in RN

### ⚠️ What Needs Adjustment

1. **Authentication Storage**
   - **Web:** httpOnly cookies
   - **RN:** Secure storage (expo-secure-store or react-native-keychain)
   - **Solution:** Abstract storage layer (see below)

2. **Routing**
   - **Web:** Next.js App Router
   - **RN:** React Navigation
   - **Solution:** Keep routes in constants file

3. **Styling**
   - **Web:** Tailwind CSS
   - **RN:** StyleSheet / NativeWind / Tamagui
   - **Solution:** Use design tokens, not Tailwind classes directly

---

## File Structure for RN Compatibility

```
lib/
├── api/                  # ✅ Fully compatible
│   ├── client.ts        # Uses fetch (works in RN)
│   ├── auth.ts          # Works with storage adapter
│   └── users.ts
├── design-system/        # ✅ Fully compatible
│   └── tokens.ts        # Platform-agnostic
├── hooks/                # ✅ Mostly compatible
│   └── use-auth.ts      # Works with storage adapter
├── storage/              # 🔧 Platform-specific adapter needed
│   ├── storage.web.ts   # Web implementation (cookies)
│   └── storage.native.ts # RN implementation (SecureStore)
├── utils/                # ✅ Fully compatible
│   └── validators.ts
└── env.ts                # ✅ Compatible (use process.env or expo-constants)

components/
├── primitives/           # 🔧 Platform-specific implementations
│   ├── Button.tsx       # <button> on web, <Pressable> on RN
│   ├── Text.tsx         # <span> on web, <Text> on RN
│   ├── View.tsx         # <div> on web, <View> on RN
│   └── Input.tsx        # <input> on web, <TextInput> on RN
└── [feature-components]  # Use primitives, stay compatible
```

---

## Step 1: Create Storage Adapter

Create `lib/storage/index.ts`:

\`\`\`typescript
export interface StorageAdapter {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
}

// Dynamically import based on platform
export const storage: StorageAdapter =
  process.env.NEXT_PUBLIC_PLATFORM === 'native'
    ? require('./storage.native').default
    : require('./storage.web').default
\`\`\`

Create `lib/storage/storage.web.ts`:

\`\`\`typescript
import { StorageAdapter } from './index'

// Web uses httpOnly cookies (set by backend)
// For client-side needs, use localStorage
const webStorage: StorageAdapter = {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  },

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  },

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  },
}

export default webStorage
\`\`\`

Create `lib/storage/storage.native.ts`:

\`\`\`typescript
import * as SecureStore from 'expo-secure-store'
import { StorageAdapter } from './index'

const nativeStorage: StorageAdapter = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value)
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key)
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key)
  },
}

export default nativeStorage
\`\`\`

---

## Step 2: Create Primitive Components

These components work identically on web and RN but use platform-specific implementations under the hood.

### Example: `components/primitives/Text.tsx`

\`\`\`typescript
// For web (Next.js)
export function Text({ children, className, ...props }: TextProps) {
  return <span className={className} {...props}>{children}</span>
}

// For React Native (separate file or conditional export)
import { Text as RNText } from 'react-native'

export function Text({ children, style, ...props }: TextProps) {
  return <RNText style={style} {...props}>{children}</RNText>
}
\`\`\`

### Recommended: Use a UI library that supports both

- **NativeWind** - Tailwind for React Native
- **Tamagui** - Universal UI framework
- **Solito** - Next.js + React Native routing

---

## Step 3: Abstract Platform-Specific Code

### Routing

Create `lib/navigation/routes.ts`:

\`\`\`typescript
export const routes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  profile: '/profile',
} as const

// Web: Use Next.js router
import { useRouter } from 'next/navigation'
export const navigate = (route: string) => {
  const router = useRouter()
  router.push(route)
}

// RN: Use React Navigation
import { useNavigation } from '@react-navigation/native'
export const navigate = (route: string) => {
  const navigation = useNavigation()
  navigation.navigate(route)
}
\`\`\`

### Image Handling

\`\`\`typescript
// Web
import Image from 'next/image'

// RN
import { Image } from 'react-native'

// Create universal Image component
export const UniversalImage = Platform.select({
  web: NextImage,
  native: RNImage,
})
\`\`\`

---

## Step 4: Styling Strategy

### Option 1: StyleSheet with Design Tokens (Recommended)

\`\`\`typescript
import { StyleSheet } from 'react-native'
import { theme } from '@/lib/design-system/tokens'

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary.DEFAULT,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.borderRadius.md,
  },
})
\`\`\`

### Option 2: NativeWind (Tailwind for RN)

\`\`\`typescript
import { styled } from 'nativewind'
import { View, Text } from 'react-native'

const StyledView = styled(View)
const StyledText = styled(Text)

// Use Tailwind classes like on web
<StyledView className="bg-primary p-4 rounded-md">
  <StyledText className="text-white">Hello</StyledText>
</StyledView>
\`\`\`

---

## Step 5: API Client Adjustments

For React Native, update API client to handle auth differently:

\`\`\`typescript
// lib/api/client.ts
import { storage } from '@/lib/storage'

class ApiClient {
  async request(endpoint, options) {
    // On RN, manually add auth header from SecureStore
    const token = await storage.getItem('access_token')

    const headers = {
      ...options.headers,
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    }

    return fetch(url, { ...options, headers })
  }
}
\`\`\`

---

## Step 6: Environment Variables

### Web (Next.js)

\`\`\`.env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
\`\`\`

### React Native (Expo)

\`\`\`app.config.js
export default {
  extra: {
    apiBaseUrl: process.env.API_BASE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
  },
}
\`\`\`

\`\`\`typescript
import Constants from 'expo-constants'

const API_BASE_URL = Constants.expoConfig.extra.apiBaseUrl
\`\`\`

---

## Migration Checklist

When ready to create RN version:

- [ ] Install RN dependencies: `expo install react-native`
- [ ] Create storage adapter (web vs native)
- [ ] Create primitive components (View, Text, Button, etc.)
- [ ] Set up React Navigation
- [ ] Install NativeWind or Tamagui for styling
- [ ] Update API client to use Bearer tokens
- [ ] Create platform-specific entry points
- [ ] Test all features on iOS simulator
- [ ] Test all features on Android emulator
- [ ] Set up Expo EAS for builds

---

## Recommended Libraries for RN

\`\`\`json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/stack": "^6.0.0",
    "expo-secure-store": "~12.8.0",
    "nativewind": "^4.0.0",
    "react-native-safe-area-context": "4.8.0",
    "react-native-screens": "~3.29.0"
  }
}
\`\`\`

---

## Testing Cross-Platform

1. **Keep logic separate from UI**
   - Business logic in `lib/`
   - UI components in `components/`
   - Never mix

2. **Use TypeScript strictly**
   - Catches platform incompatibilities early
   - Forces proper abstractions

3. **Test early, test often**
   - Run web and RN versions side-by-side during development
   - Catch issues before they become architectural problems

---

## Summary

**Key Principle:** Write code that works everywhere by:
1. Using design tokens instead of hardcoded values
2. Abstracting platform-specific APIs (storage, navigation, etc.)
3. Creating primitive components that work on both platforms
4. Keeping business logic separate from UI

**Result:** 90% code sharing between web and mobile with minimal refactoring.
