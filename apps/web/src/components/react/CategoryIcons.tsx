import { motion } from 'framer-motion';

interface CategoryIconProps {
  category: 'columns' | 'verhalen' | 'hardop' | 'over-zichzelf';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', icon: 'w-5 h-5' },
  md: { container: 'w-16 h-16', icon: 'w-7 h-7' },
  lg: { container: 'w-20 h-20', icon: 'w-9 h-9' }
};

// Simple illustrative SVG icons inspired by pauliencornelisse.nl style
const Icons = {
  columns: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Newspaper / Column icon - stacked lines representing text */}
      <rect x="10" y="8" width="28" height="32" rx="2" strokeWidth="1.5"/>
      <line x1="16" y1="16" x2="32" y2="16" strokeWidth="1.5"/>
      <line x1="16" y1="22" x2="32" y2="22" strokeWidth="1.5"/>
      <line x1="16" y1="28" x2="28" y2="28" strokeWidth="1.5"/>
      <line x1="16" y1="34" x2="24" y2="34" strokeWidth="1.5"/>
      {/* Small pen mark */}
      <path d="M34 30L38 26" strokeWidth="1.5"/>
      <circle cx="38" cy="26" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  verhalen: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Story book with magic sparkles */}
      <path d="M12 12C12 10.8954 12.8954 10 14 10H20C21.1046 10 22 10.8954 22 12V36C22 37.1046 21.1046 38 20 38H14C12.8954 38 12 37.1046 12 36V12Z" strokeWidth="1.5"/>
      <path d="M26 12C26 10.8954 26.8954 10 28 10H34C35.1046 10 36 10.8954 36 12V36C36 37.1046 35.1046 38 34 38H28C26.8954 38 26 37.1046 26 36V12Z" strokeWidth="1.5"/>
      {/* Little star sparkle */}
      <path d="M24 6L25 8L27 8L25.5 9.5L26 11.5L24 10.5L22 11.5L22.5 9.5L21 8L23 8L24 6Z" fill="currentColor" stroke="none"/>
      {/* Simple smiley face */}
      <circle cx="17" cy="22" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="31" cy="22" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M15 28C15 28 16.5 30 17 30C17.5 30 19 28 19 28" strokeWidth="1.5"/>
      <path d="M29 28C29 28 30.5 30 31 30C31.5 30 33 28 33 28" strokeWidth="1.5"/>
    </svg>
  ),
  hardop: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Headphones with sound waves */}
      <path d="M14 24C14 16.268 20.268 10 28 10C35.732 10 42 16.268 42 24" strokeWidth="1.5"/>
      <rect x="10" y="22" width="8" height="12" rx="2" strokeWidth="1.5"/>
      <rect x="38" y="22" width="8" height="12" rx="2" strokeWidth="1.5"/>
      {/* Sound waves */}
      <path d="M6 26C4.5 26 4 27 4 28C4 29 4.5 30 6 30" strokeWidth="1.5"/>
      <path d="M2 24C-0.5 24 -1 27 -1 28C-1 29 -0.5 32 2 32" strokeWidth="1.5"/>
      <path d="M42 26C43.5 26 44 27 44 28C44 29 43.5 30 42 30" strokeWidth="1.5"/>
      <path d="M46 24C48.5 24 49 27 49 28C49 29 48.5 32 46 32" strokeWidth="1.5"/>
      {/* Little music note */}
      <path d="M20 36V30C20 30 22 29 24 29V35" strokeWidth="1.5"/>
      <circle cx="19" cy="36" r="2" fill="currentColor" stroke="none"/>
      <circle cx="23" cy="35" r="2" fill="currentColor" stroke="none"/>
    </svg>
  ),
  'over-zichzelf': (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Person/profile icon */}
      <circle cx="24" cy="16" r="8" strokeWidth="1.5"/>
      <path d="M8 42C8 33.1634 15.1634 26 24 26C32.8366 26 40 33.1634 40 42" strokeWidth="1.5"/>
      {/* Decorative elements - little stars/personality */}
      <circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="40" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <path d="M21 14C21 14 22.5 15.5 24 15.5C25.5 15.5 27 14 27 14" strokeWidth="1.5"/>
      <circle cx="21" cy="13" r="1" fill="currentColor" stroke="none"/>
      <circle cx="27" cy="13" r="1" fill="currentColor" stroke="none"/>
      {/* Heart element */}
      <path d="M36 20C36 18 34 16 32 18C30 16 28 18 28 20C28 22 32 25 32 25C32 25 36 22 36 20Z" fill="currentColor" stroke="none" opacity="0.6"/>
    </svg>
  )
};

export function CategoryIcon({ category, size = 'md', animate = true }: CategoryIconProps) {
  const { container, icon } = sizeMap[size];
  const IconComponent = Icons[category];

  const handleHover = animate ? {
    whileHover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 }
    },
    whileTap: { scale: 0.95 }
  } : {};

  return (
    <motion.div
      className={`${container} rounded-full flex items-center justify-center relative`}
      style={{
        background: 'linear-gradient(135deg, #F5ECD8 0%, #FDF6E9 100%)',
        border: '2px solid #C4A77D',
        boxShadow: `
          inset 0 2px 4px rgba(255,255,255,0.8),
          0 4px 12px rgba(0,0,0,0.08),
          0 0 0 1px rgba(196, 167, 125, 0.2)
        `
      }}
      {...handleHover}
    >
      <div className={`${icon} text-warm-brown`}>
        {IconComponent}
      </div>
      
      {/* Subtle shimmer effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)'
          }}
          animate={{
            backgroundPosition: ['200% 200%', '-200% -200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </motion.div>
  );
}

// Animated category card with icon
interface CategoryCardProps {
  href: string;
  category: 'columns' | 'verhalen' | 'hardop' | 'over-zichzelf';
  label: string;
  description: string;
  index?: number;
}

const categoryColors = {
  columns: {
    gradient: 'from-[#C4A77D]/20 to-[#C4A77D]/5',
    hoverBorder: '#C4A77D',
    iconColor: '#C4A77D'
  },
  verhalen: {
    gradient: 'from-[#8B7355]/20 to-[#8B7355]/5',
    hoverBorder: '#8B7355',
    iconColor: '#8B7355'
  },
  hardop: {
    gradient: 'from-[#4A4036]/20 to-[#4A4036]/5',
    hoverBorder: '#4A4036',
    iconColor: '#4A4036'
  },
  'over-zichzelf': {
    gradient: 'from-[#D4B88D]/25 to-[#C4A77D]/10',
    hoverBorder: '#D4B88D',
    iconColor: '#D4B88D'
  }
};

export function CategoryCard({ href, category, label, description, index = 0 }: CategoryCardProps) {
  const colors = categoryColors[category];

  return (
    <motion.a
      href={href}
      className="group relative bg-white rounded-2xl p-6 overflow-hidden block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}
    >
      {/* Hover background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      
      {/* Border highlight on hover */}
      <div 
        className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-warm-brown/20 transition-colors duration-300"
      />

      <div className="relative flex items-start gap-4">
        <CategoryIcon category={category} size="md" />
        
        <div className="flex-1 text-left pt-1">
          <h3 
            className="text-xl mb-1 group-hover:text-warm-brown transition-colors"
            style={{ 
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#4A4036'
            }}
          >
            {label}
          </h3>
          <p className="text-sm" style={{ color: '#6B5E4F' }}>
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
          initial={{ x: -5 }}
          whileHover={{ x: 0 }}
        >
          <svg 
            className="w-5 h-5 transition-colors duration-300" 
            style={{ color: colors.iconColor }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </motion.div>
      </div>
    </motion.a>
  );
}

// Small decorative icons for inline use
export function InlineIcon({ type, className = '' }: { type: 'sparkle' | 'heart' | 'star' | 'leaf'; className?: string }) {
  const icons = {
    sparkle: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
      </svg>
    ),
    heart: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ),
    star: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    leaf: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.82 0 3.53-.5 5-1.35C13.5 18.5 8 14 8 8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 4-3 6-5 10 3.5-1.5 7-5 7-10 0-5.52-4.48-10-10-10z"/>
      </svg>
    )
  };

  return icons[type] || null;
}
