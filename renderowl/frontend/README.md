# RenderOwl Frontend

A modern, high-performance video editor frontend built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Features

### UX Polish
- **Smooth Loading States**: Comprehensive skeleton loaders for all major components
- **Toast Notifications**: Beautiful, accessible toast notifications with multiple variants
- **Mobile Responsive**: Fully responsive design with mobile-first approach
- **Dark Mode**: Full dark mode support with system preference detection

### Performance
- **Code Splitting**: Lazy loaded heavy editor components for faster initial load
- **Bundle Optimization**: Webpack optimization with separate chunks for vendor, editor, and timeline
- **React Server Components**: Leveraging Next.js 14 RSC for optimal rendering
- **Image Optimization**: Next.js Image component with remote pattern configuration

### Final Features
- **Empty State Illustrations**: Beautiful, animated empty states for all use cases
- **Onboarding Flow**: 4-step interactive onboarding for new users
- **Keyboard Shortcuts**: Comprehensive shortcut help panel (press `?` to open)

## Project Structure

```
src/
├── app/                 # Next.js 14 app router
│   ├── dashboard/       # Dashboard page with projects grid
│   ├── editor/[id]/     # Video editor page
│   ├── layout.tsx       # Root layout with theme provider
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Reusable UI components
│   ├── editor/          # Editor-specific components
│   ├── empty-state.tsx  # Empty state illustrations
│   ├── onboarding-flow.tsx
│   ├── keyboard-shortcuts.tsx
│   ├── theme-toggle.tsx
│   ├── error-boundary.tsx
│   └── lazy-load.tsx
├── hooks/
│   └── use-toast.tsx    # Toast notification hook
├── lib/
│   └── utils.ts         # Utility functions
├── providers/
│   └── theme-provider.tsx
├── styles/
│   └── globals.css      # Global styles with CSS variables
└── types/
    └── index.ts         # TypeScript types
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
# Build
npm run build

# Analyze bundle size
npm run analyze
```

## Key Features

### Loading States
The application features comprehensive skeleton loading states:
- `DashboardSkeleton`: Full dashboard loading state
- `EditorSkeleton`: Editor layout skeleton
- `ProjectCardSkeleton`: Individual project card skeleton
- `TimelineSkeleton`: Timeline tracks skeleton

### Toast Notifications
```tsx
import { toastSuccess, toastError, toastWarning, toastInfo } from '@/hooks/use-toast';

toastSuccess('Project saved', 'Your changes have been saved');
toastError('Export failed', 'Please try again');
```

### Dark Mode
Automatically detects system preference and persists user choice.

### Keyboard Shortcuts
Press `?` anywhere in the app to open the keyboard shortcuts help panel.

### Onboarding
New users see a 4-step onboarding flow:
1. Welcome to RenderOwl
2. Import Your Media
3. Build Your Timeline
4. Export & Share

## Performance Optimizations

1. **Lazy Loading**: Editor components are loaded on demand
2. **Suspense Boundaries**: Each heavy component has a suspense fallback
3. **Webpack Split Chunks**: Separate chunks for:
   - Vendor dependencies
   - Editor components
   - Timeline components
4. **Image Optimization**: Remote image patterns configured for Unsplash, Replicate

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe payment key |

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## License

MIT
