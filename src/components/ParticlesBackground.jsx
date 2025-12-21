import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="particlesLayer" aria-hidden="true">
      <Particles
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          detectRetina: true,
          particles: {
            number: { value: 55, density: { enable: true, area: 900 } },
color: { value: ["#ff7a00", "#ffb000", "#ffffff"] },
            links: { enable: true, distance: 140, opacity: 0.25, width: 1 },
            move: { enable: true, speed: 1.2, outModes: { default: "out" } },
            opacity: { value: { min: 0.15, max: 0.6 } },
            size: { value: { min: 1, max: 3 } },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 120, duration: 0.2 },
              push: { quantity: 3 },
            },
          },
        }}
      />
    </div>
  );
}
