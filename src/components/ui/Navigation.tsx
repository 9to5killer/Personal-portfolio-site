import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

const SECTIONS = [
  { id: 'about',      label: 'About' },
  { id: 'domains',    label: 'Domains' },
  { id: 'manifesto',   label: 'Manifesto' },
  { id: 'deployment',  label: 'Deployment' },
  { id: 'projects',    label: 'Projects' },
  { id: 'writing',    label: 'Writing' },
  { id: 'connect',    label: 'Connect' },
];

export default function Navigation() {
  const [active, setActive]     = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isHero, setIsHero]     = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress }     = useScroll();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.1, rootMargin: '-60px 0px -50% 0px' }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });

    const onScroll = () => {
      setScrolled(window.scrollY > 64);
      // Stay light through the full curtain reveal (hero visible 0→150vh).
      // Switch to dark exactly when curtain completes — 300ms CSS transition
      // carries through the brief moment before curtain unmounts at 1.55*vh.
      setIsHero(window.scrollY < window.innerHeight * 0.75);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isHero
            ? 'bg-[#0A0E1A]/90 backdrop-blur-sm border-b border-white/10'
            : 'bg-parchment/90 backdrop-blur-sm border-b border-rule'
          : 'bg-transparent'
      }`}
    >
      {/* Scroll progress line */}
      <motion.div
        className="nav-progress absolute bottom-0 left-0 h-[1px] bg-oxblood"
        style={{ scaleX: scrollYProgress, width: '100%' }}
      />

      <div className="max-w-5xl mx-auto px-8 md:px-14 h-11 flex items-center justify-between">
        {/* Logo lockup: monogram + divider + wordmark */}
        <a
          href="#hero"
          className="flex items-center group"
          aria-label="Kevin Clark — home"
        >
          <svg
            width={48}
            height={28}
            viewBox="0 0 138 80"
            fill="currentColor"
            aria-hidden="true"
            className={`transition-colors duration-300 ${
              isHero ? 'text-[#A8A095] group-hover:text-[#F5F0E6]' : 'text-ink-3 group-hover:text-ink'
            }`}
          >
            <rect x="0"   y="0"  width="22" height="80" rx="11"/>
            <rect x="36"  y="20" width="22" height="60" rx="11"/>
            <rect x="80"  y="0"  width="22" height="80" rx="11"/>
            <rect x="116" y="20" width="22" height="60" rx="11"/>
          </svg>
          <div
            className={`w-px h-[14px] mx-4 transition-colors duration-300 ${
              isHero ? 'bg-white/20' : 'bg-rule-2'
            }`}
            aria-hidden="true"
          />
          <span className={`font-mono text-[10px] tracking-[0.18em] transition-colors duration-300 ${
            isHero ? 'text-[#A8A095] group-hover:text-[#F5F0E6]' : 'text-ink-3 group-hover:text-ink'
          }`}>
            KEVIN CLARK
          </span>
        </a>

        {/* Desktop section nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Site sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-300 ${
                active === s.id
                  ? isHero ? 'text-[#F5F0E6]' : 'text-ink'
                  : isHero ? 'text-[#A8A095] hover:text-[#E8DFC9]' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-px transition-all duration-300 bg-[#F5F0E6] ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 bg-[#F5F0E6] ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 bg-[#F5F0E6] ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className={`md:hidden border-t ${isHero ? 'border-white/10 bg-[#0A0E1A]' : 'border-rule bg-parchment'}`}>
          <nav className="max-w-5xl mx-auto px-8 py-6 flex flex-col gap-5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenuOpen(false)}
                className={`font-mono text-[10px] tracking-[0.14em] uppercase ${isHero ? 'text-[#A8A095]' : 'text-ink-3'}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
