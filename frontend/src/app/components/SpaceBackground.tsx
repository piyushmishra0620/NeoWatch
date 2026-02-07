"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function SpaceBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      background: {
        color: "#02050f",
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 140,
          density: {
            enable: true,
            area: 900,
          },
        },
        color: {
          value: ["#ffffff", "#a5d8ff", "#7cc4ff"],
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: { min: 0.35, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.4,
            minimumValue: 0.2,
            sync: false,
          },
        },
        size: {
          value: { min: 0.6, max: 2.6 },
        },
        move: {
          enable: true,
          speed: 0.25,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "bounce",
          },
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "attract",
          },
        },
        modes: {
          attract: {
            distance: 180,
            duration: 0.3,
            factor: 4,
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (!ready) return null;

  return (
    <Particles
      id="space"
      className="fixed inset-0 z-0 pointer-events-none"
      options={options}
    />
  );
}
