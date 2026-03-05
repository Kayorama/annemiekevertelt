'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /**
   * The illustration to display
   */
  illustration?: ReactNode;
  /**
   * The title of the empty state
   */
  title: string;
  /**
   * The description text
   */
  description?: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Additional className for styling
   */
  className?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

// Pre-built illustrations
const ProjectIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-muted-foreground/30">
    <rect x="20" y="40" width="160" height="100" rx="8" stroke="currentColor" strokeWidth="2" />
    <rect x="40" y="20" width="120" height="80" rx="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="160" cy="30" r="12" fill="currentColor" />
    <path d="M60 100 L90 70 L120 90 L150 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="40" y="120" width="40" height="8" rx="2" fill="currentColor" />
    <rect x="90" y="120" width="30" height="8" rx="2" fill="currentColor" />
  </svg>
);

const TemplateIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-muted-foreground/30">
    <rect x="30" y="30" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
    <rect x="110" y="30" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
    <rect x="30" y="90" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
    <rect x="110" y="90" width="60" height="50" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M50 55 L70 55 M50 65 L65 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="150" cy="55" r="8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const SearchIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-muted-foreground/30">
    <circle cx="85" cy="75" r="40" stroke="currentColor" strokeWidth="2" />
    <path d="M115 105 L145 135" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <circle cx="85" cy="75" r="25" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M160 40 L170 50 M170 40 L160 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const UploadIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-muted-foreground/30">
    <rect x="40" y="60" width="120" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
    <path d="M70 100 L100 70 L130 100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100 70 L100 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="150" cy="40" r="15" stroke="currentColor" strokeWidth="2" />
    <path d="M150 33 L150 47 M143 40 L157 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ErrorIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-destructive/40">
    <circle cx="100" cy="80" r="50" stroke="currentColor" strokeWidth="2" />
    <path d="M80 60 L120 100 M120 60 L80 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M160 30 L170 40 M170 30 L160 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="40" r="4" fill="currentColor" />
    <circle cx="170" cy="120" r="4" fill="currentColor" />
  </svg>
);

const NoResultsIllustration = () => (
  <svg viewBox="0 0 200 160" fill="none" className="h-32 w-32 text-muted-foreground/30">
    <rect x="30" y="50" width="140" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
    <path d="M50 80 L80 80 M50 100 L120 100 M50 120 L100 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="150" cy="40" r="20" stroke="currentColor" strokeWidth="2" />
    <path d="M140 40 L160 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const illustrations = {
  project: ProjectIllustration,
  template: TemplateIllustration,
  search: SearchIllustration,
  upload: UploadIllustration,
  error: ErrorIllustration,
  noResults: NoResultsIllustration,
};

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {illustration && (
        <div className="mb-6">{illustration}</div>
      )}

      <h3 className={cn(
        'font-semibold text-foreground',
        size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'
      )}>
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Preset empty states for common use cases
export function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      illustration={<ProjectIllustration />}
      title="No projects yet"
      description="Start creating stunning videos by creating your first project or choose from our templates."
      action={{
        label: 'Create Project',
        onClick: onCreate,
      }}
      secondaryAction={{
        label: 'Browse Templates',
        onClick: () => {},
      }}
    />
  );
}

export function EmptyTemplates({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      illustration={<TemplateIllustration />}
      title="No templates found"
      description="We couldn't find any templates matching your criteria. Try adjusting your filters."
      action={{
        label: 'Clear Filters',
        onClick: onBrowse,
      }}
    />
  );
}

export function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      illustration={<SearchIllustration />}
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords."
      action={{
        label: 'Clear Search',
        onClick: onClear,
      }}
    />
  );
}

export function EmptyUploads({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      illustration={<UploadIllustration />}
      title="No media uploaded"
      description="Upload your images, videos, and audio files to use them in your projects."
      action={{
        label: 'Upload Files',
        onClick: onUpload,
      }}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading the content. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      illustration={<ErrorIllustration />}
      title={title}
      description={description}
      action={{
        label: 'Try Again',
        onClick: onRetry,
      }}
    />
  );
}
