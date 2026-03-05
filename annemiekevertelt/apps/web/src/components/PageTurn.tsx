import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PageTurnProps {
  children: React.ReactNode;
}

export default function PageTurn({ children }: PageTurnProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Small delay to ensure smooth animation on mount
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page"
        initial={{ 
          opacity: 0,
          rotateY: -30,
          transformPerspective: 1200,
          transformOrigin: 'left center'
        }}
        animate={{ 
          opacity: 1,
          rotateY: 0,
          transformPerspective: 1200,
          transformOrigin: 'left center'
        }}
        exit={{ 
          opacity: 0,
          rotateY: 30,
          transformPerspective: 1200,
          transformOrigin: 'right center'
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="book-page paper-texture"
      >
        {/* Page curl shadow effect */}
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 8%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Page texture lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 24px,
              rgba(0,0,0,0.1) 24px,
              rgba(0,0,0,0.1) 25px
            )`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
