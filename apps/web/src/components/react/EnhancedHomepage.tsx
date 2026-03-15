import { motion } from 'framer-motion';
import { CategoryCard, InlineIcon } from './CategoryIcons';
import { AnimatedStoryCard } from './PageTurnCard';

// Demo story data
const demoStories = [
  {
    id: 1,
    title: 'De Verdwenen Regenboog',
    excerpt: 'Een magisch verhaal over een klein meisje dat op zoek gaat naar de kleuren van de wereld...',
    category: 'verhalen',
    ageGroup: '4-8 jaar',
    image: null
  },
  {
    id: 2,
    title: 'Gedachten bij een kop thee',
    excerpt: 'Sommige ochtenden beginnen met stilte en de geur van verse munt...',
    category: 'columns',
    date: '2024-03-01',
    image: null
  },
  {
    id: 3,
    title: 'Het Avontuur van Sam',
    excerpt: 'Sam de eekhoorn ontdekte op een dag een geheime tunnel in het bos...',
    category: 'verhalen',
    ageGroup: '6-10 jaar',
    image: null
  }
];

const categoryData = [
  {
    href: '/columns',
    category: 'columns' as const,
    label: '…in columns',
    description: 'Gedachten, observaties \u0026 reflecties'
  },
  {
    href: '/verhalen',
    category: 'verhalen' as const,
    label: '…verhalen voor kinderen',
    description: 'Magische verhalen voor kleine oren'
  },
  {
    href: '/hardop',
    category: 'hardop' as const,
    label: '…hardop',
    description: 'Voorleesverhalen om naar te luisteren'
  },
  {
    href: '/over-zichzelf',
    category: 'over-zichzelf' as const,
    label: '…over zichzelf',
    description: 'Het verhaal achter het verhaal'
  }
];

export function EnhancedHomepage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-32 w-64 h-64 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(196, 167, 125, 0.15)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 -right-32 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(139, 115, 85, 0.1)' }}
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(212, 184, 141, 0.05)' }}
          />
        </div>

        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Main Title with character animation */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#4A4036'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {'Annemieke vertelt…'.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.03,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>
          
          {/* Tagline */}
          <motion.p
            className="text-2xl sm:text-3xl mb-16"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#8B7355',
              fontStyle: 'italic'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Mocht je me gemist hebben…
          </motion.p>

          {/* Decorative element */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C4A77D]" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <InlineIcon type="sparkle" className="w-6 h-6 text-gold" />
            </motion.div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C4A77D]" />
          </motion.div>

          {/* Category Grid */}
          <motion.div
            className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {categoryData.map((category, index) => (
              <CategoryCard
                key={category.href}
                href={category.href}
                category={category.category}
                label={category.label}
                description={category.description}
                index={index}
              />
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2 }}
        >
          <span 
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: '#6B5E4F' }}
          >
            Ontdek
          </span>
          <motion.div
            className="w-px h-12"
            style={{ 
              background: 'linear-gradient(to bottom, #C4A77D, transparent)'
            }}
            animate={{ 
              scaleY: [1, 0.6, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* Latest Stories Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
                <InlineIcon type="star" className="w-4 h-4 text-gold" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
              </div>
              
              <h2 
                className="text-3xl sm:text-4xl mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: '#4A4036'
                }}
              >
                Laatste verhalen
              </h2>
              
              <p style={{ color: '#6B5E4F' }}>
                Een selectie van recente verhalen en columns
              </p>
            </motion.div>
          </div>

          {/* Story Grid with Page Turn Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <AnimatedStoryCard
                  title={story.title}
                  excerpt={story.excerpt}
                  category={story.category}
                  ageGroup={story.ageGroup}
                  date={story.date}
                  image={story.image || undefined}
                  fullContent={
                    <div className="space-y-4">
                      <p className="text-lg leading-relaxed">
                        {story.excerpt}
                      </p>
                      <p className="leading-relaxed">
                        Hier komt het volledige verhaal te staan. De pagina draait open als een boek, 
                        waardoor het lezen een magische ervaring wordt. De warme kleuren en zachte 
                        animaties nodigen uit om te blijven lezen...
                      </p>
                      <p className="leading-relaxed">
                        De tekst stroomt natuurlijk over de pagina, met voldoende witruimte 
                        om de ogen te laten rusten tussen de paragrafen door.
                      </p>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="/verhalen"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all"
              style={{
                backgroundColor: '#8B7355',
                color: '#FDF6E9'
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#4A4036'
              }}
              whileTap={{ scale: 0.98 }}
            >
              Alle verhalen bekijken
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(245, 236, 216, 0.5)' }}
        />
        
        <div className="max-w-xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(196, 167, 125, 0.2)',
                border: '2px solid #C4A77D'
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.div>
            
            <h2 
              className="text-3xl mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                color: '#4A4036'
              }}
            >
              Blijf op de hoogte
            </h2>
            
            <p className="mb-8" style={{ color: '#6B5E4F' }}>
              Ontvang een berichtje wanneer er een nieuw verhaal online staat. 
              Geen spam, alleen verhalen.
            </p>

            <form 
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                // Handle newsletter signup
              }}
            >
              <input
                type="text"
                placeholder="Je naam (optioneel)"
                className="flex-1 px-5 py-3 rounded-full border bg-white focus:outline-none transition-all"
                style={{
                  borderColor: 'rgba(196, 167, 125, 0.3)',
                  color: '#2C2419'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C4A77D'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(196, 167, 125, 0.3)'}
              />
              <input
                type="email"
                placeholder="je@email.nl"
                required
                className="flex-1 px-5 py-3 rounded-full border bg-white focus:outline-none transition-all"
                style={{
                  borderColor: 'rgba(196, 167, 125, 0.3)',
                  color: '#2C2419'
                }}
                onFocus={(e) => e.target.style.borderColor = '#C4A77D'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(196, 167, 125, 0.3)'}
              />
              <motion.button
                type="submit"
                className="px-8 py-3 rounded-full font-medium whitespace-nowrap"
                style={{
                  backgroundColor: '#8B7355',
                  color: '#FDF6E9'
                }}
                whileHover={{ backgroundColor: '#4A4036' }}
                whileTap={{ scale: 0.98 }}
              >
                Inschrijven
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
