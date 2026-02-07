"use client";

import { useEffect, useMemo, useState } from "react";
import { Oval } from "react-loader-spinner";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/authContext";
import { addToWatchlist, fetchAsteroidById } from "@/app/api/neoWsapis";

type Asteroid = {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  absolute_magnitude_h?: number;
  estimated_diameter?: {
    kilometers?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
    meters?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
  };
  close_approach_data?: Array<{
    close_approach_date?: string;
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
    orbiting_body?: string;
  }>;
};

type Unit = "km" | "m";

function parseNumber(value?: string | number): number | null {
  if (value == null) return null;
  const num = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}

function getDiameterKm(asteroid: Asteroid): number | null {
  const km = asteroid.estimated_diameter?.kilometers;
  if (km?.estimated_diameter_min != null && km?.estimated_diameter_max != null) {
    return (km.estimated_diameter_min + km.estimated_diameter_max) / 2;
  }
  const meters = asteroid.estimated_diameter?.meters;
  if (meters?.estimated_diameter_min != null && meters?.estimated_diameter_max != null) {
    return (meters.estimated_diameter_min + meters.estimated_diameter_max) / 2000;
  }
  return null;
}

function getApproach(asteroid: Asteroid) {
  return asteroid.close_approach_data?.[0];
}

function getRiskScore(asteroid: Asteroid): number {
  const hazard = asteroid.is_potentially_hazardous_asteroid ? 1 : 0;
  const diameterKm = getDiameterKm(asteroid) ?? 0;
  const approach = getApproach(asteroid);
  const velocity = parseNumber(approach?.relative_velocity?.kilometers_per_hour) ?? 0;
  const missKm = parseNumber(approach?.miss_distance?.kilometers) ?? 0;

  const base = hazard ? 60 : 25;
  const diameterScore = Math.min(25, diameterKm * 10);
  const velocityScore = Math.min(10, velocity / 5000);
  const missScore = Math.max(0, 10 - missKm / 1_000_000);

  return Math.max(0, Math.min(100, Math.round(base + diameterScore + velocityScore + missScore)));
}

function getSizeCategory(avgKm: number | null): "Small" | "Medium" | "Large" | "Unknown" {
  if (avgKm == null) return "Unknown";
  if (avgKm < 0.1) return "Small";
  if (avgKm > 1) return "Large";
  return "Medium";
}

function formatCountdown(target?: string) {
  if (!target) return "Unknown";
  const targetDate = new Date(`${target}T00:00:00`);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (!Number.isFinite(diff)) return "Unknown";
  if (diff <= 0) return "Approach reached";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function AsteroidDetailPage() {
  const { context } = useAuth();
  const router = useRouter();
  const params = useParams();
  const asteroidId = typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asteroid, setAsteroid] = useState<Asteroid | null>(null);
  const [unit, setUnit] = useState<Unit>("km");
  const [tick, setTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!context.loading && !context.User) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (asteroid?.close_approach_data?.[0]?.close_approach_date) {
      timer = setInterval(() => setTick((v) => v + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [asteroid]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!asteroidId) {
          setError("Missing asteroid id.");
          return;
        }
        const response = await fetchAsteroidById(asteroidId);
        setAsteroid(response ?? null);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load asteroid data.");
      } finally {
        setLoading(false);
      }
    };

    if (context.User) {
      load();
    }
  }, [context.User, asteroidId]);

  const averageKm = useMemo(() => getDiameterKm(asteroid ?? {}), [asteroid]);
  const approach = useMemo(() => (asteroid ? getApproach(asteroid) : undefined), [asteroid]);
  const riskScore = asteroid ? getRiskScore(asteroid) : 0;
  const sizeCategory = getSizeCategory(averageKm);
  const countdown = useMemo(() => {
    void tick;
    return formatCountdown(approach?.close_approach_date);
  }, [approach, tick]);

  const handleAddWatchlist = async () => {
    if (!asteroid?.id) return;
    const payload = {
      asteroidId: asteroid.id,
      name: asteroid.name,
      hazardous: !!asteroid.is_potentially_hazardous_asteroid,
      lastKnownRiskScore: riskScore,
      nextCloseApproachDate: approach?.close_approach_date
        ? new Date(`${approach.close_approach_date}T00:00:00Z`).toISOString()
        : null,
      nextMissDistanceKm: approach?.miss_distance?.kilometers
        ? Number(approach.miss_distance.kilometers)
        : null,
    };
    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await addToWatchlist(payload);
      setSaveMessage(res?.message || "Added to watchlist");
    } catch (err: any) {
      setSaveMessage(err?.message ?? "Failed to add to watchlist.");
    } finally {
      setSaving(false);
    }
  };

  if (!context.User) {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />

      <div className="content">
        {loading ? (
          <div className="loaderWrap">
            <Oval
              height={70}
              width={70}
              color="#8ab8ff"
              secondaryColor="rgba(138, 184, 255, 0.35)"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        ) : error ? (
          <div className="status error">{error}</div>
        ) : asteroid ? (
          <>
            <header className="hero">
              <div>
                <h1>{asteroid.name ?? "Unnamed object"}</h1>
                <div className="heroMeta">
                  <span
                    className={`badge ${asteroid.is_potentially_hazardous_asteroid ? "danger" : "safe"}`}
                  >
                    {asteroid.is_potentially_hazardous_asteroid ? "Hazardous" : "Stable"}
                  </span>
                  <span className="badge score">Risk {riskScore}</span>
                  <span className="pill">Abs. mag: {asteroid.absolute_magnitude_h ?? "Unknown"}</span>
                </div>
              </div>
              <button className="primary" onClick={handleAddWatchlist} disabled={saving}>
                {saving ? "Saving..." : "Add to watchlist"}
              </button>
            </header>
            {saveMessage && <div className="status">{saveMessage}</div>}

            <section className="panel">
              <div className="panelHead">
                <h2>Physical Characteristics</h2>
                <div className="unitToggle">
                  <button
                    className={unit === "km" ? "active" : ""}
                    onClick={() => setUnit("km")}
                  >
                    km
                  </button>
                  <button
                    className={unit === "m" ? "active" : ""}
                    onClick={() => setUnit("m")}
                  >
                    m
                  </button>
                </div>
              </div>
              <div className="panelGrid">
                <div>
                  <div className="label">Estimated diameter</div>
                  <div className="value">
                    {unit === "km"
                      ? asteroid.estimated_diameter?.kilometers
                        ? `${asteroid.estimated_diameter.kilometers.estimated_diameter_min?.toFixed(3)} - ${asteroid.estimated_diameter.kilometers.estimated_diameter_max?.toFixed(3)} km`
                        : "Unknown"
                      : asteroid.estimated_diameter?.meters
                        ? `${Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min ?? 0)} - ${Math.round(
                            asteroid.estimated_diameter.meters.estimated_diameter_max ?? 0
                          )} m`
                        : "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="label">Absolute magnitude</div>
                  <div className="value">{asteroid.absolute_magnitude_h ?? "Unknown"}</div>
                </div>
                <div>
                  <div className="label">Size category</div>
                  <div className="value">{sizeCategory}</div>
                </div>
              </div>
            </section>

            <section className="panel">
              <h2>Close Approach Summary</h2>
              <div className="panelGrid">
                <div>
                  <div className="label">Date</div>
                  <div className="value">{approach?.close_approach_date ?? "Unknown"}</div>
                </div>
                <div>
                  <div className="label">Miss distance</div>
                  <div className="value">
                    {approach?.miss_distance?.kilometers ?? "Unknown"} km
                  </div>
                </div>
                <div>
                  <div className="label">Relative velocity</div>
                  <div className="value">
                    {approach?.relative_velocity?.kilometers_per_hour ?? "Unknown"} km/h
                  </div>
                </div>
                <div>
                  <div className="label">Orbiting body</div>
                  <div className="value">{approach?.orbiting_body ?? "Unknown"}</div>
                </div>
                <div>
                  <div className="label">Countdown</div>
                  <div className="value">{countdown}</div>
                </div>
              </div>
            </section>

            <section className="panel">
              <h2>Risk Analysis</h2>
              <div className="panelGrid">
                <div>
                  <div className="label">NASA classification</div>
                  <div className="value">
                    {asteroid.is_potentially_hazardous_asteroid ? "Potentially hazardous" : "Not hazardous"}
                  </div>
                </div>
                <div>
                  <div className="label">Risk score</div>
                  <div className="value">{riskScore} / 100</div>
                </div>
                <div className="riskTrack">
                  <div className="riskFill" style={{ width: `${riskScore}%` }} />
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>

      <style jsx>{`
        .space {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at 20% 20%, #0b1f3a 0%, #05070f 45%, #020308 100%);
          color: #d6e6ff;
          padding: 80px 6vw 64px;
        }

        .stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(2px 2px at 20% 30%, #c8e6ff 40%, transparent 60%),
            radial-gradient(1px 1px at 70% 10%, #9cc8ff 40%, transparent 60%),
            radial-gradient(2px 2px at 80% 80%, #d6f0ff 40%, transparent 60%),
            radial-gradient(1px 1px at 30% 70%, #b4d5ff 40%, transparent 60%),
            radial-gradient(1.5px 1.5px at 50% 50%, #ffffff 40%, transparent 60%);
          opacity: 0.6;
          animation: twinkle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .nebula {
          position: absolute;
          inset: -20% 0 0 -10%;
          background: radial-gradient(circle at 30% 30%, rgba(73, 132, 255, 0.35), transparent 55%),
            radial-gradient(circle at 70% 60%, rgba(35, 235, 199, 0.2), transparent 50%);
          filter: blur(10px);
          opacity: 0.6;
          animation: drift 18s linear infinite;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .hero h1 {
          font-size: clamp(2.4rem, 4.5vw, 4rem);
          margin: 0 0 12px;
          color: #a6d4ff;
          letter-spacing: 0.02em;
        }

        .heroMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid transparent;
        }

        .badge.safe {
          background: rgba(73, 196, 255, 0.12);
          color: #8fd9ff;
          border-color: rgba(73, 196, 255, 0.35);
        }

        .badge.danger {
          background: rgba(255, 95, 95, 0.12);
          color: #ffb1b1;
          border-color: rgba(255, 95, 95, 0.4);
        }

        .badge.score {
          background: rgba(133, 105, 255, 0.15);
          color: #d7c8ff;
          border-color: rgba(133, 105, 255, 0.4);
        }

        .pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(12, 22, 44, 0.6);
          border: 1px solid rgba(86, 123, 187, 0.35);
          font-size: 0.8rem;
          color: #c6d7ff;
        }

        .panel {
          background: rgba(7, 14, 28, 0.75);
          border: 1px solid rgba(86, 123, 187, 0.35);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panel h2 {
          margin: 0;
          font-size: 1.2rem;
          color: #c6dcff;
        }

        .panelHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .panelGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .label {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fb2e8;
        }

        .value {
          margin-top: 6px;
          font-size: 0.95rem;
          color: #d3dcf7;
        }

        .unitToggle {
          display: flex;
          gap: 8px;
          background: rgba(10, 20, 40, 0.7);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid rgba(86, 123, 187, 0.4);
        }

        .unitToggle button {
          border: none;
          background: transparent;
          color: #b7c8ea;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
        }

        .unitToggle button.active {
          background: rgba(91, 123, 255, 0.7);
          color: #f5f7ff;
        }

        .riskTrack {
          grid-column: 1 / -1;
          height: 10px;
          border-radius: 999px;
          background: rgba(92, 115, 156, 0.2);
          overflow: hidden;
        }

        .riskFill {
          height: 100%;
          background: linear-gradient(90deg, #33d3ff, #8a5bff, #ff6a6a);
        }

        .status {
          padding: 18px;
          background: rgba(10, 18, 36, 0.65);
          border-radius: 16px;
          border: 1px solid rgba(86, 123, 187, 0.4);
        }

        .status.error {
          border-color: rgba(255, 95, 95, 0.55);
          color: #ffb6b6;
        }

        .primary {
          border-radius: 12px;
          padding: 10px 16px;
          border: 1px solid transparent;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: #5b7bff;
          color: #f5f7ff;
        }

        .loaderWrap {
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(30px, -20px, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }


        @media (max-width: 720px) {
          .hero {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
