import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface PageTurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  originRect?: DOMRect | null;
}

// Paper texture SVG pattern
const PaperTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
    <filter id="paper-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paper-noise)" />
  </svg>
);

// Spine shadow for book effect
const SpineShadow = () => (
  <div 
    className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
    style={{
      background: 'linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 40%, rgba(0,0,0,0) 100%)'
    }}
  />
);

// Page edge gradient
const PageEdge = () => (
  <div 
    className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
    style={{
      background: 'linear-gradient(to left, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)'
    }}
  />
);

export function PageTurnModal({ isOpen, onClose, children, title, originRect }: PageTurnModalProps) {
  const controls = useAnimation();
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Small delay to allow DOM to render for measurement
      const timer = setTimeout(() => {
        controls.start('open');
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen, controls]);

  const handleClose = async () => {
    setIsClosing(true);
    await controls.start('closing');
    onClose();
  };

  // Calculate initial transform based on origin if provided
  const getInitialState = () => {
    if (originRect) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const originX = originRect.left + originRect.width / 2;
      const originY = originRect.top + originRect.height / 2;
      
      return {
        x: originX - centerX,
        y: originY - centerY,
        scale: originRect.width / Math.min(window.innerWidth * 0.9, 900),
        rotateY: 35,
        opacity: 0.5
      };
    }
    return {
      x: -100,
      y: 0,
      scale: 0.3,
      rotateY: 90,
      opacity: 0
    };
  };

  const variants = {
    closed: {
      ...getInitialState(),
      transition: { duration: 0 }
    },
    open: {
      x: 0,
      y: 0,
      scale: 1,
      rotateY: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120,
        mass: 0.8,
        opacity: { duration: 0.3 }
      }
    },
    closing: {
      rotateY: -25,
      scale: 0.95,
      x: 50,
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 200,
        opacity: { duration: 0.2 }
      }
    }
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
    closing: { opacity: 0 }
  };

  const contentVariants = {
    closed: { opacity: 0, y: 20 },
    open: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.15, 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    closing: { 
      opacity: 0, 
      y: 10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              background: 'linear-gradient(135deg, rgba(74, 64, 54, 0.4) 0%, rgba(44, 36, 25, 0.6) 100%)',
              backdropFilter: 'blur(8px)'
            }}
            variants={backdropVariants}
            initial="closed"
            animate={controls}
            exit="closing"
            onClick={handleClose}
          />
          
          {/* Book Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none">
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] pointer-events-auto"
              style={{ 
                perspective: 1500,
                transformStyle: 'preserve-3d'
              }}
              variants={variants}
              initial="closed"
              animate={controls}
              exit="closing"
            >
              {/* Book Page */}
              <div 
                className="relative bg-[#FDF8F0] rounded-r-lg rounded-l-sm shadow-2xl overflow-hidden"
                style={{
                  boxShadow: `
                    inset 20px 0 40px -20px rgba(0,0,0,0.15),
                    inset -2px 0 5px rgba(0,0,0,0.05),
                    0 25px 50px -12px rgba(0,0,0,0.35),
                    0 0 0 1px rgba(0,0,0,0.05)
                  `
                }}
              >
                <PaperTexture />
                <SpineShadow />
                <PageEdge />
                
                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  className="absolute top-4 right-6 z-20 p-2 rounded-full hover:bg-warm-brown/10 transition-colors group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.3 } }}
                  style={{ color: '#8B7355' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                {/* Page Content */}
                <motion.div
                  ref={contentRef}
                  className="relative z-10 overflow-y-auto max-h-[90vh]"
                  variants={contentVariants}
                  initial="closed"
                  animate={controls}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#C4A77D transparent'
                  }}
                >
                  {/* Decorative header line */}
                  <div className="pt-8 px-8 sm:px-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                      <div className="w-2 h-2 rounded-full bg-gold/60" />
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                    </div>
                  </div>
                  
                  <div className="px-8 sm:px-12 pb-12">
                    {children}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing the modal state
export function usePageTurnModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [title, setTitle] = useState<string>('');
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const open = (newContent: ReactNode, newTitle?: string, triggerElement?: HTMLElement) => {
    if (triggerElement) {
      setOriginRect(triggerElement.getBoundingClientRect());
    }
    setContent(newContent);
    setTitle(newTitle || '');
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, open, close, content, title, originRect };
}
