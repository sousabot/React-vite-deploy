import React, { useCallback, useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * Unified particles background.
 * Replaces the old separate InteractiveBackground.jsx and ParticlesBackground.jsx,
 * which both imported @tsparticles independently and duplicated it in the bundle.
 *
 * - mouseGlow={true}  -> behaves like the old InteractiveBackground (gradient + cursor glow + particles)
 * - mouseGlow={false} -> behaves like the old ParticlesBackground (just particles)
 *
 * IMPORTANT: import this component lazily wherever it's used, e.g.:
 *
 *   import { lazy, Suspense } from "react";
 *   const ParticlesBackground = lazy(() => import("./components/ParticlesBackground"));
 *
 *   <Suspense fallback={null}>
 *     <ParticlesBackground mouseGlow density={55} />
 *   </Suspense>
 *
 * This is what actually splits @tsparticles out of the main vendor bundle —
 * the lazy import at the USE site is what matters, not this file itself.
 */
export default function ParticlesBackground({
  density = 55,
  mouseGlow = false,
  className = "",
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!mouseGlow) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouseGlow]);

  const glowStyle = useMemo(
    () => (mouseGlow ? { "--mx": `${pos.x}%`, "--my": `${pos.y}%` } : undefined),
    [mouseGlow, pos]
  );

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: density, density: { enable: true, area: 900 } },
        color: { value: ["#ff7a00", "#ffb000", "#ffffff"] },
        links: { enable: true, distance: 140, opacity: mouseGlow ? 0.2 : 0.25, width: 1 },
        move: { enable: true, speed: mouseGlow ? 1.15 : 1.2, outModes: { default: "out" } },
        opacity: { value: { min: mouseGlow ? 0.12 : 0.15, max: mouseGlow ? 0.55 : 0.6 } },
        size: { value: { min: 1, max: 3 } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          repulse: { distance: 120, duration: 0.2 },
          push: { quantity: mouseGlow ? 2 : 3 },
        },
      },
    }),
    [density, mouseGlow]
  );

  return (
    <div
      className={mouseGlow ? `bgWrap ${className}` : `particlesLayer ${className}`}
      style={glowStyle}
      aria-hidden="true"
    >
      {mouseGlow && (
        <>
          <div className="bgGradient" />
          <div className="bgGlow" />
        </>
      )}
      <Particles init={particlesInit} options={particlesOptions} />
    </div>
  );
}