import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CREAM = '#F5F0E6';
const TRANSITION = {
  type:     'tween',
  duration: 1.1,
  ease:     [0.6, 0.05, 0.4, 0.95] as [number, number, number, number],
};

const PANELS = [
  {
    bg: '#1A2A3F', line1: 'DISCOVER', line2: 'THE WORKFLOW', counter: '01 / 04',
    body: 'MOST AI STRATEGIES OPTIMIZE FOR USE CASES. THE WINNERS OPTIMIZE FOR WORKFLOWS. THE FIRST CREATES DEMOS. THE SECOND CREATES LEVERAGE. WE START BY MAPPING WHERE THE WORK ACTUALLY HAPPENS.',
    illus: 'signal' as const,
  },
  {
    bg: '#C65D3A', line1: 'BUILD', line2: 'PRODUCTION SYSTEMS', counter: '02 / 04',
    body: "PILOTS ARE NOT DEPLOYMENT. AI THEATER IS NOT AI VALUE. PRODUCTION SYSTEMS HANDLE VOLUME, EDGE CASES, AND ORGANIZATIONAL RESISTANCE — AND KEEP WORKING WHEN THE NOVELTY WEARS OFF.",
    illus: 'concentric' as const,
  },
  {
    bg: '#7A8B6F', line1: 'EVALUATE', line2: 'THE THRESHOLD', counter: '03 / 04',
    body: "THE EVALUATION GAP IS THE MOST UNDERREPORTED PROBLEM IN ENTERPRISE AI. HOW GOOD IS GOOD ENOUGH? THE ABSENCE OF RIGOROUS EVAL ISN'T A RESEARCH PROBLEM. IT'S A LEADERSHIP PROBLEM.",
    illus: 'radial' as const,
  },
  {
    bg: '#8B8682', line1: 'SCALE', line2: 'ACROSS THE ORG', counter: '04 / 04',
    body: "AI LITERACY FOR THE MASSES SOLVES THE WRONG PROBLEM. THE BOTTLENECK IS LEADERSHIP FLUENCY. SCALE HAPPENS WHEN AI BECOMES PART OF HOW WORK HAPPENS — NOT A NEW INITIATIVE BOLTED ON TOP.",
    illus: 'wave' as const,
  },
];

// ─────────────────────────────────────────────────────────────
// Illustrations
// ─────────────────────────────────────────────────────────────

function SignalNoise({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef   = useRef<((t: number) => void) | null>(null);
  const rafRef    = useRef<number | null>(null);
  const totalMs   = useRef(0);
  const lastTs    = useRef<number | null>(null);
  const W = 254, H = 338, COLS = 36, ROWS = 48;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const sp = 7, r = 1.5;
    function noise(c: number, row: number, t: number) {
      const v1 = Math.sin(c * 0.15 + row * 0.10 + t) * 0.5;
      const v2 = Math.sin(c * 0.08 - row * 0.12 + 2.0 + t * 0.7) * 0.3;
      const v3 = Math.sin(c * 0.20 + row * 0.05 - 1.5 + t * 1.3) * 0.2;
      let op = Math.pow((v1 + v2 + v3 + 1) / 2, 2.5);
      return Math.min(Math.max(op, 0.05), 0.95);
    }
    function draw(t: number) {
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = CREAM;
      for (let row = 0; row < ROWS; row++)
        for (let col = 0; col < COLS; col++) {
          ctx.globalAlpha = noise(col, row, t);
          ctx.beginPath(); ctx.arc(col*sp+r+1, row*sp+r+1, r, 0, Math.PI*2); ctx.fill();
        }
    }
    draw(0); drawRef.current = draw;
  }, []);

  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      lastTs.current = null; return;
    }
    lastTs.current = null;
    function tick(ts: number) {
      if (lastTs.current !== null) totalMs.current += ts - lastTs.current;
      lastTs.current = ts;
      draw!((totalMs.current / 8000) * Math.PI * 2);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [active]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <canvas ref={canvasRef} width={W} height={H}
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: '100%' }}
        role="img" aria-label="Signal from noise — organic dot field" />
    </div>
  );
}

function Concentric() {
  const W = 260, H = 340, cx = W, cy = H / 2;
  const arcs = Array.from({ length: 24 }, (_, i) => {
    const r = 18 + (W - 22) * i / 23;
    const pts = Array.from({ length: 25 }, (_, j) => {
      const a = (120 + 120 * j / 24) * Math.PI / 180;
      return `${(cx + r*Math.cos(a)).toFixed(1)},${(cy + r*Math.sin(a)).toFixed(1)}`;
    });
    return { d: `M ${pts.join(' L ')}`, op: i%4===0 ? 1 : 0.3, sw: i%4===0 ? '1.5' : '1' };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" fill="none" stroke={CREAM}
      role="img" aria-label="Concentric arcs" className="illus-concentric w-full">
      <g className="illus-group" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {arcs.map((a, i) => <path key={i} d={a.d} strokeWidth={a.sw} opacity={a.op} strokeLinecap="round" />)}
      </g>
    </svg>
  );
}

function PrecisionRadial() {
  const W = 260, H = 340, cx = W/2, cy = H/2, maxR = 115, innerR = 6;
  const lines = Array.from({ length: 36 }, (_, i) => {
    const a = i * 10 * Math.PI / 180;
    const lf = i%9===0 ? 1 : i%3===0 ? 0.75 : 0.5;
    return {
      x1: +(cx + innerR*Math.cos(a)).toFixed(1), y1: +(cy + innerR*Math.sin(a)).toFixed(1),
      x2: +(cx + maxR*lf*Math.cos(a)).toFixed(1), y2: +(cy + maxR*lf*Math.sin(a)).toFixed(1),
    };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" fill={CREAM} stroke={CREAM}
      role="img" aria-label="Precision radial" className="illus-radial w-full">
      <g className="illus-group" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={maxR+8} fill="none" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.3" />
        <circle cx={cx} cy={cy} r={innerR-2} opacity="0.6" />
        <circle cx={cx} cy={cy} r="3" />
        {lines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="1" strokeLinecap="round" opacity="0.9" />)}
      </g>
    </svg>
  );
}

function WaveExpansion() {
  const nw = 24, W = 280, wl = 80, steps = 100;
  const cYs: number[] = [10];
  for (let i = 1; i < nw; i++) cYs.push(cYs[i-1] + 8 + (i/nw)*12);
  const H = Math.ceil(cYs[nw-1] + 48 + 14);
  const md = 3 * (nw-1) / nw;
  const waves = Array.from({ length: nw }, (_, i) => {
    const t = i / (nw-1);
    const amp = 4 + Math.pow(t, 2) * 44;
    const pts = Array.from({ length: steps }, (_, j) => {
      const x = -wl + (j/(steps-1))*(W+2*wl);
      return `${x.toFixed(1)},${(cYs[i] + amp*Math.sin((x/wl)*2*Math.PI)).toFixed(1)}`;
    });
    return { d: `M ${pts.join(' L ')}`, op: +(1-t*0.85).toFixed(2), delay: (-(md*(nw-1-i)/(nw-1))).toFixed(3) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" overflow="hidden" fill="none"
      stroke={CREAM} strokeWidth="1" strokeLinecap="round"
      role="img" aria-label="Wave expansion" className="illus-wave w-full">
      <g className="illus-group">
        {waves.map((w, i) => <path key={i} d={w.d} opacity={w.op} className="wave-path" style={{ animationDelay: `${w.delay}s` }} />)}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Border radius per panel position and hover state
// ─────────────────────────────────────────────────────────────
function radius(i: number, isHov: boolean, mobile: boolean): string {
  if (mobile)  return '24px 24px 24px 24px';
  if (isHov)   return '24px 24px 24px 24px';
  if (i === 0) return '24px 0px 0px 24px';
  if (i === 3) return '0px 24px 24px 0px';
  return '0px 0px 0px 0px';
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export default function DeploymentPanels() {
  const [hoveredIndex,  setHoveredIndex] = useState<number | null>(null);
  const [isMobile,      setIsMobile]     = useState(false);
  const [reducedMotion, setReduced]      = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const interactive = !reducedMotion && !isMobile;

  function handleEnter(i: number) {
    if (!interactive) return;
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setHoveredIndex(i);
  }

  function handleLeave() {
    if (!interactive) return;
    leaveTimer.current = setTimeout(() => {
      setHoveredIndex(null);
      leaveTimer.current = null;
    }, 50);
  }

  function flexValue(i: number): number {
    if (!interactive || hoveredIndex === null) return 1;
    return hoveredIndex === i ? 2 : 0.66;
  }

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width:         '100%',
        gap:           isMobile ? '16px' : '4px',
      }}
    >
      {PANELS.map((panel, i) => {
        const isHov = hoveredIndex === i;

        return (
          <motion.div
            key={i}
            onHoverStart={() => handleEnter(i)}
            onHoverEnd={handleLeave}
            onFocus={() => handleEnter(i)}
            onBlur={handleLeave}
            animate={{
              flex:         flexValue(i),
              borderRadius: radius(i, isHov, isMobile),
              boxShadow:    isHov
                ? 'inset 0 0 0 1px rgba(245,240,230,0.2)'
                : 'inset 0 0 0 0px rgba(245,240,230,0)',
            }}
            initial={false}
            transition={TRANSITION}
            style={{
              flexBasis:       0,
              minWidth:        0,
              overflow:        'hidden',
              backgroundColor: panel.bg,
              color:           CREAM,
              display:         'flex',
              flexDirection:   'column',
              justifyContent:  'space-between',
              cursor:          'pointer',
              minHeight:       isMobile ? 'auto' : '640px',
              willChange:      'flex',
            }}
            tabIndex={0}
            role="article"
            aria-label={`${panel.line1} ${panel.line2}`}
          >
            {/* Title */}
            <div style={{ padding: '36px 32px 16px' }}>
              <p
                style={{
                  fontFamily:    'var(--font-sans)',
                  fontWeight:    900,
                  fontSize:      'clamp(1.75rem, 3.2vw, 2.75rem)',
                  textTransform: 'uppercase',
                  lineHeight:    0.95,
                  letterSpacing: '-0.02em',
                  margin:        0,
                }}
                aria-hidden="true"
              >
                {panel.line1}<br />{panel.line2}
              </p>
            </div>

            {/* Illustration */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 32px' }}>
              <motion.div
                animate={{ scale: isHov ? 1.15 : 1 }}
                transition={TRANSITION}
                style={{ width: '100%', maxWidth: '220px', willChange: 'transform' }}
              >
                {panel.illus === 'signal'     && <SignalNoise active={isHov} />}
                {panel.illus === 'concentric' && <Concentric />}
                {panel.illus === 'radial'     && <PrecisionRadial />}
                {panel.illus === 'wave'       && <WaveExpansion />}
              </motion.div>
            </div>

            {/* Counter + body */}
            <div style={{ padding: '16px 32px 36px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', opacity: 0.6 }}>
                {panel.counter}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: 1.7, letterSpacing: '0.02em', textTransform: 'uppercase', opacity: 0.85, maxWidth: '85%' }}>
                {panel.body}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
