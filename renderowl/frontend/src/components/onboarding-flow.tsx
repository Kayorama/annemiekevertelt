'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Film, Upload, Share2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RenderOwl',
    description: 'Your journey to creating stunning videos starts here.',
    icon: <Sparkles className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Create professional videos in minutes</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag, drop, and export. No video editing experience required.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-lg font-bold">1</span>
            </div>
            <p className="text-xs text-muted-foreground">Import Media</p>
          </div>
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-lg font-bold">2</span>
            </div>
            <p className="text-xs text-muted-foreground">Edit Timeline</p>
          </div>
          <div>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-lg font-bold">3</span>
            </div>
            <p className="text-xs text-muted-foreground">Export & Share</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'media',
    title: 'Import Your Media',
    description: 'Add images, videos, and audio to your project library.',
    icon: <Upload className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-medium">Drag and drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports MP4, MOV, PNG, JPG, GIF, MP3, WAV
          </p>
          <Button variant="outline" className="mt-4" size="sm">
            Browse Files
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Tips:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Use high-quality images for best results
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Keep videos under 5 minutes for faster processing
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              MP4 format works best for all browsers
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'timeline',
    title: 'Build Your Timeline',
    description: 'Arrange clips, add transitions, and create your story.',
    icon: <Film className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded bg-background p-2">
              <div className="h-8 w-12 rounded bg-primary/20" />
              <div className="flex-1">
                <div className="h-2 w-20 rounded bg-muted" />
                <div className="mt-1 h-2 w-12 rounded bg-muted" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded bg-background p-2">
              <div className="h-8 w-12 rounded bg-primary/20" />
              <div className="flex-1">
                <div className="h-2 w-24 rounded bg-muted" />
                <div className="mt-1 h-2 w-10 rounded bg-muted" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded border-2 border-dashed border-primary/30 bg-primary/5 p-2">
              <div className="text-xs text-primary">Drop items here</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium">⌨️ Shortcuts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Space: Play/Pause
              <br />
              Delete: Remove clip
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium">✨ Features</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Trim, split, and reorder clips easily
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'export',
    title: 'Export & Share',
    description: 'Render your video and share it with the world.',
    icon: <Share2 className="h-6 w-6" />,
    content: (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Export Options</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">1080p HD</p>
                <p className="text-xs text-muted-foreground">Best for social media</p>
              </div>
              <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3 opacity-50">
              <div>
                <p className="text-sm font-medium">4K Ultra HD</p>
                <p className="text-xs text-muted-foreground">Premium quality</p>
              </div>
              <div className="h-4 w-4 rounded-full border-2" />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium mb-2">Direct Share</p>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-red-500/20" />
            <div className="h-8 w-8 rounded bg-pink-500/20" />
            <div className="h-8 w-8 rounded bg-blue-500/20" />
            <div className="h-8 w-8 rounded bg-sky-500/20" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Connect your accounts to upload directly to YouTube, TikTok, Instagram, and X
          </p>
        </div>
      </div>
    ),
  },
];

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function OnboardingFlow({ isOpen, onClose, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('renderowl-onboarding-seen');
    if (seen) {
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('renderowl-onboarding-seen', 'true');
    setHasSeenOnboarding(true);
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('renderowl-onboarding-seen', 'true');
    setHasSeenOnboarding(true);
    onClose();
  };

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute left-0 top-0 h-1 w-full bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <div>
                  <DialogTitle className="text-left">{step.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step.content}
              </motion.div>
            </AnimatePresence>

            {/* Step indicators */}
            <div className="mt-6 flex justify-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    index === currentStep
                      ? 'w-6 bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleComplete}>
                    Get Started
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('renderowl-onboarding-seen');
    if (!seen) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showOnboarding,
    setShowOnboarding,
  };
}
