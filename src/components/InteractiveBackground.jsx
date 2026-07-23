import React, { useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function InteractiveBackground({ density = 55, className = "" }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const glowStyle = useMemo(
    () => ({
      "--mx": `${pos.x}%`,
      "--my": `${pos.y}%`,
    }),
    [pos]
  );

  return (
    <div className={`bgWrap ${className}`} style={glowStyle} aria-hidden="true">
      {/* Slow animated gradient */}
      <div className="bgGradient" />

      {/* Mouse-follow glow */}
      <div className="bgGlow" />

      {/* Particles */}
      <Particles
        init={async (engine) => {
          await loadSlim(engine);
        }}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: density, density: { enable: true, area: 900 } },
            color: { value: ["#ff7a00", "#ffb000", "#ffffff"] },
            links: { enable: true, distance: 140, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1.15, outModes: { default: "out" } },
            opacity: { value: { min: 0.12, max: 0.55 } },
            size: { value: { min: 1, max: 3 } },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 120, duration: 0.2 },
              push: { quantity: 2 },
            },
          },
        }}
      />
    </div>
  );
}
