import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Phase durations (seconds) — total cycle = 12s
const CYCLE        = 12;
const CHAOS_END    = 3;
const ORG_END      = 6;
const STRUCT_END   = 9;
const MAX_ROT      = 0.087; // ~5 degrees in radians

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function fillChaos(arr: Float32Array, count: number) {
  for (let i = 0; i < count; i++) {
    arr[i * 3]     = (Math.random() - 0.5) * 10;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
}

export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Mobile: fewer particles for perf
    const isMobile = window.innerWidth < 768;
    const count    = isMobile ? 800 : 2400;
    const RADIUS   = 3;

    // ── Renderer ─────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    } catch {
      return; // No WebGL — hero text still shows
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & camera ────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // ── Particle buffers ──────────────────────────────────────
    const chaosPos   = new Float32Array(count * 3);
    const spherePos  = new Float32Array(count * 3);
    const currentPos = new Float32Array(count * 3);

    // Fibonacci golden-angle sphere — even surface distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y     = 1 - (i / (count - 1)) * 2;
      const r     = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      spherePos[i * 3]     = r * Math.cos(theta) * RADIUS;
      spherePos[i * 3 + 1] = y * RADIUS;
      spherePos[i * 3 + 2] = r * Math.sin(theta) * RADIUS;
    }

    fillChaos(chaosPos, count);
    currentPos.set(chaosPos);

    // ── Geometry ──────────────────────────────────────────────
    const geometry = new THREE.BufferGeometry();
    const posAttr  = new THREE.BufferAttribute(currentPos, 3);
    geometry.setAttribute('position', posAttr);

    const material = new THREE.PointsMaterial({
      color:         0xF5F0E6,
      size:          isMobile ? 0.06 : 0.035,
      transparent:   true,
      opacity:       0.65,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ── Reduced motion: static sphere, single render ──────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      currentPos.set(spherePos);
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      return () => {
        geometry.dispose(); material.dispose(); renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    }

    // ── Mouse parallax ─────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let rotX = 0,   rotY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX =  (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Resize ────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    ro.observe(mount);

    // ── Animation loop ─────────────────────────────────────────
    let rafId: number;
    let paused    = false;
    let startTs   = performance.now();
    let prevCycleT = 0;

    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    function tick(ts: number) {
      rafId = requestAnimationFrame(tick);
      if (paused) return;
      // Skip rendering when hero has scrolled fully off-screen
      const heroEl = document.getElementById('hero');
      if (heroEl && heroEl.getBoundingClientRect().bottom <= 0) return;

      const elapsed = (ts - startTs) / 1000;
      const cycleT  = elapsed % CYCLE;

      // New cycle: regenerate chaos so dissolution never returns to same cloud
      if (prevCycleT > CYCLE - 0.1 && cycleT < 0.5) {
        fillChaos(chaosPos, count);
      }
      prevCycleT = cycleT;

      if (cycleT < CHAOS_END) {
        // ── CHAOS (0–3 s) — static random cloud
        currentPos.set(chaosPos);

      } else if (cycleT < ORG_END) {
        // ── ORGANIZING (3–6 s) — lerp chaos → sphere
        const t = easeInOutCubic((cycleT - CHAOS_END) / (ORG_END - CHAOS_END));
        for (let i = 0; i < count; i++) {
          const j = i * 3;
          currentPos[j]     = chaosPos[j]     + (spherePos[j]     - chaosPos[j])     * t;
          currentPos[j + 1] = chaosPos[j + 1] + (spherePos[j + 1] - chaosPos[j + 1]) * t;
          currentPos[j + 2] = chaosPos[j + 2] + (spherePos[j + 2] - chaosPos[j + 2]) * t;
        }

      } else if (cycleT < STRUCT_END) {
        // ── STRUCTURE (6–9 s) — sphere with single gentle breath
        const breathe = Math.sin(((cycleT - ORG_END) / (STRUCT_END - ORG_END)) * Math.PI) * 0.05;
        const scale   = 1 + breathe;
        for (let i = 0; i < count; i++) {
          const j = i * 3;
          currentPos[j]     = spherePos[j]     * scale;
          currentPos[j + 1] = spherePos[j + 1] * scale;
          currentPos[j + 2] = spherePos[j + 2] * scale;
        }

      } else {
        // ── DISSOLVING (9–12 s) — lerp sphere → chaos
        const t = 1 - easeInOutCubic((cycleT - STRUCT_END) / (CYCLE - STRUCT_END));
        for (let i = 0; i < count; i++) {
          const j = i * 3;
          currentPos[j]     = chaosPos[j]     + (spherePos[j]     - chaosPos[j])     * t;
          currentPos[j + 1] = chaosPos[j + 1] + (spherePos[j + 1] - chaosPos[j + 1]) * t;
          currentPos[j + 2] = chaosPos[j + 2] + (spherePos[j + 2] - chaosPos[j + 2]) * t;
        }
      }

      posAttr.needsUpdate = true;

      // Smooth mouse parallax (5° max rotation)
      rotY += (mouseX * MAX_ROT - rotY) * 0.04;
      rotX += (mouseY * MAX_ROT - rotX) * 0.04;
      points.rotation.y = rotY;
      points.rotation.x = rotX;

      renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      role="img"
      aria-label="Animated particle field — AI signal forming from chaos"
    />
  );
}
