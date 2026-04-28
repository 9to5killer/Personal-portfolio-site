import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Props {
  period:   string;
  duration: string;
  unit:     string;
  label:    string;
  heading:  string;
  body:     string;
}

export default function ExperienceTiltCard({ period, duration, unit, label, heading, body }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x   = useMotionValue(0);
  const y   = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div style={{ perspective: '900px' }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="bg-parchment p-8 md:p-10 flex flex-col gap-6 h-full will-change-transform"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] text-ink-3 mb-3">{period}</p>
          <p className="font-serif leading-none" style={{ fontVariationSettings: "'opsz' 144" }}>
            <span className="text-[3rem] md:text-[3.5rem] font-bold text-oxblood">{duration}</span>
            <span className="text-sm text-ink-3 font-sans ml-1">{unit}</span>
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3 mb-2">{label}</p>
          <h3 className="font-serif font-light text-lg text-ink leading-snug mb-3">{heading}</h3>
          <p className="text-sm text-ink-2 leading-relaxed">{body}</p>
        </div>
      </motion.div>
    </div>
  );
}
