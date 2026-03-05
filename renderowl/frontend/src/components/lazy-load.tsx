'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  delay?: number;
}

// Lazy load with preloading capability
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazy(factory);

  const LazyLoadedComponent = (props: React.ComponentProps<T>) => {
    const { fallback, delay = 0 } = options;

    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  LazyLoadedComponent.displayName = `LazyLoaded(${
    LazyComponent.displayName || 'Component'
  })`;

  return LazyLoadedComponent;
}

function DefaultFallback() {
  return (
    <div className="p-4">
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// Preload function for eager loading
export function preload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  const Component = factory();
  Component.then(() => {
    console.log('Component preloaded');
  });
  return Component;
}

// Visibility-based lazy loading
export { useInView } from 'react-intersection-observer';
