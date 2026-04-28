import { useEffect, useRef } from 'react';

interface Dot {
  x:  number;
  y:  number;
  r:  number;
  op: number;
  vx: number;
  vy: number;
  el: SVGCircleElement;
}

export default function DotField({ color = '#B5AC9D' }: { color?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NS = 'http://www.w3.org/2000/svg';

    // Build SVG
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width',  '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    wrap.appendChild(svg);

    let dots:   Dot[]          = [];
    let rafId:  number | null  = null;
    let paused                 = false;
    let lastTs: number | null  = null;

    // ── Responsive dot count ───────────────────────────────────
    function targetCount(w: number): number {
      if (w < 768)  return 60;
      if (w < 1024) return 120;
      return 200;
    }

    // ── Generate dots via vignette probability ─────────────────
    function build(W: number, H: number) {
      // Remove previous circles
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      dots = [];

      const target     = targetCount(W);
      const candidates = target * 4; // ~4x over-sample, keep passing dots

      for (let i = 0; i < candidates; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;

        // Chebyshev distance from center (0 = center, 1 = corner/edge)
        const dx           = Math.abs(x / W - 0.5) * 2;
        const dy           = Math.abs(y / H - 0.5) * 2;
        const distFromEdge = Math.max(dx, dy);

        if (Math.random() >= distFromEdge * 0.8) continue;

        const r  = 1 + Math.random();                    // 1–2 px
        const op = 0.15 + Math.random() * 0.35;          // 0.15–0.50
        const spd = 0.2;
        const vx = (Math.random() - 0.5) * 2 * spd;
        const vy = (Math.random() - 0.5) * 2 * spd;

        const el = document.createElementNS(NS, 'circle');
        el.setAttribute('cx',      x.toFixed(1));
        el.setAttribute('cy',      y.toFixed(1));
        el.setAttribute('r',       r.toFixed(2));
        el.setAttribute('fill',    color);
        el.setAttribute('opacity', op.toFixed(3));
        svg.appendChild(el);

        dots.push({ x, y, r, op, vx, vy, el });
      }
    }

    // ── Animation loop ─────────────────────────────────────────
    function tick(ts: number) {
      rafId = requestAnimationFrame(tick);
      if (paused) return;

      const dt = lastTs !== null ? (ts - lastTs) / 1000 : 0;
      lastTs   = ts;

      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      if (!W || !H) return;

      for (const d of dots) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        // Toroidal wrap
        if (d.x < 0) d.x += W; else if (d.x > W) d.x -= W;
        if (d.y < 0) d.y += H; else if (d.y > H) d.y -= H;
        d.el.setAttribute('cx', d.x.toFixed(1));
        d.el.setAttribute('cy', d.y.toFixed(1));
      }
    }

    // ── Initial build ─────────────────────────────────────────
    // The wrapper is position:absolute inside a position:relative section.
    // clientWidth/Height may be 0 if layout hasn't settled at mount time.
    // We try immediately; if dimensions are zero we wait one rAF tick for
    // the browser to finish laying out the section, then build.
    function tryBuild() {
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      if (W > 0 && H > 0) {
        build(W, H);
        if (!prefersReduced) rafId = requestAnimationFrame(tick);
      } else {
        // Defer one frame and retry
        requestAnimationFrame(() => {
          build(wrap.clientWidth || 900, wrap.clientHeight || 500);
          if (!prefersReduced) rafId = requestAnimationFrame(tick);
        });
      }
    }
    tryBuild();

    // ── Pause when off-screen ──────────────────────────────────
    const io = new IntersectionObserver(
      ([entry]) => {
        paused = !entry.isIntersecting;
        if (!paused && rafId === null && !prefersReduced) {
          lastTs = null;
          rafId  = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    // ── Pause on hidden tab ────────────────────────────────────
    const onVis = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    // ── Rebuild on resize ──────────────────────────────────────
    let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeDebounce) clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        build(wrap.clientWidth, wrap.clientHeight);
      }, 250);
    });
    ro.observe(wrap);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resizeDebounce) clearTimeout(resizeDebounce);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (wrap.contains(svg)) wrap.removeChild(svg);
    };
  }, [color]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
    />
  );
}
