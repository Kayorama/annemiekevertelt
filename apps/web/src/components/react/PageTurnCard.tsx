import { useState, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PageTurnModal } from './PageTurnModal';

interface PageTurnCardProps {
  children: ReactNode;
  modalContent: ReactNode;
  title?: string;
  className?: string;
}

export function PageTurnCard({ children, modalContent, title, className = '' }: PageTurnCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      setOriginRect(cardRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`cursor-pointer ${className}`}
        onClick={handleClick}
        whileHover={{ 
          y: -4,
          transition: { type: 'spring', stiffness: 400, damping: 25 }
        }}
        whileTap={{ scale: 0.98 }}
        layoutId={`card-${title}`}
      >
        {children}
      </motion.div>

      <PageTurnModal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        originRect={originRect}
      >
        {modalContent}
      </PageTurnModal>
    </>
  );
}

// Animated Story Card with page turn effect
interface AnimatedStoryCardProps {
  href?: string;
  title: string;
  excerpt?: string;
  image?: string;
  date?: string;
  category: string;
  ageGroup?: string;
  duration?: string;
  fullContent?: ReactNode;
}

export function AnimatedStoryCard({
  title,
  excerpt,
  image,
  date,
  category,
  ageGroup,
  duration,
  fullContent
}: AnimatedStoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      setOriginRect(cardRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <motion.article
        ref={cardRef}
        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500"
        onClick={handleClick}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Image Container */}
        <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#F5ECD8] to-[#FDF6E9] relative">
          {image ? (
            <motion.img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-[#C4A77D]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
          )}
          
          {/* Hover overlay with "Open" indicator */}
          <motion.div
            className="absolute inset-0 bg-warm-brown/0 group-hover:bg-warm-brown/10 transition-colors duration-300 flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -90 }}
              whileHover={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <svg className="w-6 h-6 text-warm-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#C4A77D' }}>
              {category}
            </span>
            {ageGroup && (
              <span className="text-xs" style={{ color: '#6B5E4F' }}>· {ageGroup}</span>
            )}
            {duration && (
              <span className="text-xs" style={{ color: '#6B5E4F' }}>· {duration}</span>
            )}
          </div>

          {/* Title */}
          <h3 
            className="text-xl mb-2 line-clamp-2 group-hover:text-warm-brown transition-colors"
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#4A4036'
            }}
          >
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-sm line-clamp-2" style={{ color: '#6B5E4F' }}>
              {excerpt}
            </p>
          )}

          {/* Date */}
          {date && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#C4A77D]/20">
              <svg className="w-4 h-4" style={{ color: '#C4A77D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <time className="text-xs" style={{ color: '#6B5E4F' }} dateTime={date}>
                {formatDate(date)}
              </time>
            </div>
          )}
        </div>
      </motion.article>

      {/* Page Turn Modal */}
      <PageTurnModal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        originRect={originRect}
      >
        <article className="prose prose-warm max-w-none">
          {image && (
            <motion.div
              className="aspect-video rounded-lg overflow-hidden mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase"
                style={{ backgroundColor: '#F5ECD8', color: '#8B7355' }}
              >
                {category}
              </span>
              {ageGroup && (
                <span style={{ color: '#6B5E4F' }}>· {ageGroup}</span>
              )}
              {duration && (
                <span style={{ color: '#6B5E4F' }}>· {duration}</span>
              )}
            </div>

            {/* Title */}
            <h1 
              className="text-3xl sm:text-4xl mb-6"
              style={{ 
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: '#4A4036',
                lineHeight: 1.2
              }}
            >
              {title}
            </h1>

            {/* Date */}
            {date && (
              <div className="flex items-center gap-2 mb-8 pb-6 border-b" style={{ borderColor: '#F5ECD8' }}>
                <svg className="w-4 h-4" style={{ color: '#C4A77D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <time className="text-sm" style={{ color: '#6B5E4F' }} dateTime={date}>
                  {formatDate(date)}
                </time>
              </div>
            )}

            {/* Full Content */}
            {fullContent ? (
              <div style={{ color: '#2C2419', lineHeight: 1.8 }}>
                {fullContent}
              </div>
            ) : (
              <div style={{ color: '#2C2419', lineHeight: 1.8 }}>
                {excerpt && <p className="text-lg leading-relaxed">{excerpt}</p>}
                <p className="mt-4 italic" style={{ color: '#6B5E4F' }}>
                  Klik op een verhaal om het volledig te lezen...
                </p>
              </div>
            )}
          </motion.div>
        </article>
      </PageTurnModal>
    </>
  );
}
