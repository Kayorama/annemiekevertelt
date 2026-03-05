import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the skeleton
   * - text: Single line text placeholder
   * - avatar: Circular avatar placeholder
   * - card: Card-shaped placeholder
   * - thumbnail: Image/video thumbnail placeholder
   * - timeline: Timeline item placeholder
   */
  variant?: 'text' | 'avatar' | 'card' | 'thumbnail' | 'timeline' | 'default';
  /**
   * Number of lines for text variant
   */
  lines?: number;
  /**
   * Show shimmer animation
   */
  shimmer?: boolean;
}

function Skeleton({
  className,
  variant = 'default',
  lines = 1,
  shimmer = true,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'animate-pulse rounded-md bg-muted',
    shimmer && 'shimmer',
    className
  );

  if (variant === 'text') {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 w-full', i === lines - 1 && 'w-3/4')}
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={cn(baseClasses, 'h-10 w-10 rounded-full')} {...props} />;
  }

  if (variant === 'card') {
    return (
      <div className={cn(baseClasses, 'h-48 w-full')} {...props}>
        <div className="h-full w-full space-y-3 p-4">
          <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
          <div className="h-4 w-1/2 rounded bg-muted-foreground/10" />
          <div className="flex-1 rounded bg-muted-foreground/5" />
        </div>
      </div>
    );
  }

  if (variant === 'thumbnail') {
    return (
      <div
        className={cn(baseClasses, 'aspect-video w-full overflow-hidden', className)}
        {...props}
      >
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cn('flex items-center gap-3 py-2', className)} {...props}>
        <Skeleton variant="thumbnail" className="h-16 w-24 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className={cn(baseClasses, 'h-4 w-1/3')} />
          <div className={cn(baseClasses, 'h-3 w-1/4')} />
        </div>
        <div className={cn(baseClasses, 'h-8 w-16')} />
      </div>
    );
  }

  return <div className={baseClasses} {...props} />;
}

// Specialized skeleton loaders for different sections

function ProjectCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <Skeleton variant="thumbnail" className="rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton variant="text" className="h-5 w-2/3" />
        <Skeleton variant="text" className="h-4 w-1/3" />
      </div>
    </div>
  );
}

function TimelineSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="timeline" />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="avatar" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>

      {/* Projects grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 border-b p-3">
        <Skeleton variant="text" className="h-8 w-32" />
        <div className="flex-1" />
        <Skeleton variant="avatar" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton variant="text" className="h-6 w-20" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>

        {/* Preview */}
        <div className="flex-1 bg-muted/50 p-8">
          <Skeleton variant="thumbnail" className="mx-auto max-w-3xl" />
        </div>

        {/* Properties */}
        <div className="w-72 border-l p-4 space-y-4">
          <Skeleton variant="text" className="h-6 w-24" />
          <Skeleton variant="text" lines={3} />
          <Skeleton className="h-32" />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 border-t p-4">
        <TimelineSkeleton count={4} />
      </div>
    </div>
  );
}

export {
  Skeleton,
  ProjectCardSkeleton,
  TimelineSkeleton,
  DashboardSkeleton,
  EditorSkeleton,
};
