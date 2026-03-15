import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CategoryIcon, InlineIcon } from './CategoryIcons';

interface NavItem {
  href: string;
  label: string;
  category: 'columns' | 'verhalen' | 'hardop' | 'over-zichzelf';
}

const navItems: NavItem[] = [
  { href: '/columns', label: '…in columns', category: 'columns' },
  { href: '/verhalen', label: '…verhalen voor kinderen', category: 'verhalen' },
  { href: '/hardop', label: '…hardop', category: 'hardop' },
  { href: '/over-zichzelf', label: '…over zichzelf', category: 'over-zichzelf' },
];

interface EnhancedNavigationProps {
  transparent?: boolean;
}

export function EnhancedNavigation({ transparent = false }: EnhancedNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Main Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: transparent && !scrolled 
            ? 'transparent' 
            : 'rgba(253, 246, 233, 0.95)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex items-center justify-between h-20">
            {/* Hamburger Menu Button */}
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative p-2 -ml-2 rounded-xl group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu openen"
            >
              <div className="relative w-6 h-6">
                <motion.span
                  className="absolute left-0 top-1 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: '#4A4036' }}
                  animate={{ 
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 4 : 0
                  }}
                />
                <motion.span
                  className="absolute left-0 top-3 w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: '#4A4036' }}
                  animate={{ 
                    opacity: isOpen ? 0 : 1,
                    x: isOpen ? -10 : 0
                  }}
                />
                <motion.span
                  className="absolute left-0 top-5 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: '#4A4036' }}
                  animate={{ 
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -4 : 0
                  }}
                />
              </div>
              
              {/* Hover background */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}
              />
            </motion.button>

            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                  {/* Book icon */}
                  <rect width="40" height="40" rx="10" fill="#C4A77D"/>
                  <rect x="10" y="8" width="20" height="24" rx="2" fill="#FDF6E9"/>
                  <rect x="10" y="8" width="10" height="24" rx="2" fill="#F5ECD8"/>
                  <line x1="14" y1="14" x2="26" y2="14" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="20" x2="24" y2="20" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="14" y1="26" x2="22" y2="26" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                
                {/* Little sparkle decoration */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <InlineIcon type="sparkle" className="w-3 h-3 text-gold" />
                </motion.div>
              </div>
              
              <span 
                className="hidden sm:block text-xl transition-colors group-hover:text-warm-brown"
                style={{ 
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: '#4A4036'
                }}
              >
                Annemieke
              </span>
            </motion.a>

            {/* Right spacer / maybe search icon in future */}
            <div className="w-10" />
          </nav>
        </div>
      </motion.header>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(44, 36, 25, 0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm z-50 overflow-hidden"
              style={{ 
                backgroundColor: '#FDF6E9',
                boxShadow: '10px 0 40px rgba(0,0,0,0.2)'
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  mixBlendMode: 'multiply'
                }}
              />

              <div className="relative h-full flex flex-col p-6">
                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  className="absolute top-5 right-5 p-2 rounded-xl group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" style={{ color: '#4A4036' }} />
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}
                  />
                </motion.button>

                {/* Menu Header */}
                <div className="pt-16 pb-8 text-center">
                  <motion.p
                    className="text-lg italic mb-2"
                    style={{ 
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: '#8B7355'
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Annemieke vertelt…
                  </motion.p>
                  
                  <motion.div
                    className="flex items-center justify-center gap-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
                    <InlineIcon type="heart" className="w-4 h-4 text-gold/60" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
                  </motion.div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1">
                  <ul className="space-y-3">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.08 }}
                      >
                        <motion.a
                          href={item.href}
                          className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
                          style={{
                            backgroundColor: 'rgba(245, 236, 216, 0.5)',
                            border: '1px solid transparent'
                          }}
                          whileHover={{ 
                            x: 8,
                            backgroundColor: 'rgba(245, 236, 216, 1)',
                            borderColor: '#C4A77D'
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleClose}
                        >
                          <CategoryIcon category={item.category} size="sm" animate={false} />
                          
                          <span 
                            className="text-lg group-hover:text-warm-brown transition-colors"
                            style={{ 
                              fontFamily: "'Cormorant Garamond', Georgia, serif",
                              color: '#4A4036'
                            }}
                          >
                            {item.label}
                          </span>
                          
                          <motion.svg
                            className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100"
                            style={{ color: '#C4A77D' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            initial={{ x: -10 }}
                            whileHover={{ x: 0 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </motion.a>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Footer Quote */}
                <motion.div
                  className="pt-6 border-t text-center"
                  style={{ borderColor: 'rgba(196, 167, 125, 0.3)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p 
                    className="text-sm italic"
                    style={{ 
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: '#6B5E4F'
                    }}
                  >
                    "Mocht je me gemist hebben…"
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <InlineIcon type="star" className="w-3 h-3 text-gold/50" />
                    <InlineIcon type="sparkle" className="w-3 h-3 text-gold/50" />
                    <InlineIcon type="star" className="w-3 h-3 text-gold/50" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
