"use client";

import { useEffect, useMemo, useState } from "react";
import { Oval } from "react-loader-spinner";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { addToWatchlist, fetchNearAsteroids } from "@/app/api/neoWsapis";

type Asteroid = {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  absolute_magnitude_h?: number;
  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
    meters?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
  };
  close_approach_data?: Array<{
    close_approach_date?: string;
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
  }>;
};

type SortKey = "risk" | "closest" | "fastest";

const PAGE_SIZE = 12;

function getDiameterKm(asteroid: Asteroid): number | null {
  const km = asteroid.estimated_diameter?.kilometers;
  if (
    km?.estimated_diameter_min != null &&
    km?.estimated_diameter_max != null
  ) {
    return (km.estimated_diameter_min + km.estimated_diameter_max) / 2;
  }
  const meters = asteroid.estimated_diameter?.meters;
  if (
    meters?.estimated_diameter_min != null &&
    meters?.estimated_diameter_max != null
  ) {
    return (
      (meters.estimated_diameter_min + meters.estimated_diameter_max) / 2000
    );
  }
  return null;
}

function getApproach(asteroid: Asteroid) {
  return asteroid.close_approach_data?.[0];
}

function parseNumber(value?: string | number): number | null {
  if (value == null) return null;
  const num = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}

function getRiskScore(asteroid: Asteroid): number {
  const hazard = asteroid.is_potentially_hazardous_asteroid ? 1 : 0;
  const diameterKm = getDiameterKm(asteroid) ?? 0;
  const approach = getApproach(asteroid);
  const velocity =
    parseNumber(approach?.relative_velocity?.kilometers_per_hour) ?? 0;
  const missKm = parseNumber(approach?.miss_distance?.kilometers) ?? 0;

  const base = hazard ? 60 : 25;
  const diameterScore = Math.min(25, diameterKm * 10);
  const velocityScore = Math.min(10, velocity / 5000);
  const missScore = Math.max(0, 10 - missKm / 1_000_000);

  return Math.max(
    0,
    Math.min(100, Math.round(base + diameterScore + velocityScore + missScore)),
  );
}

function normalizeAsteroids(input: any): Asteroid[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.near_earth_objects)) return input.near_earth_objects;

  const neo = input?.near_earth_objects;
  if (neo && typeof neo === "object") {
    return Object.values(neo).flat() as Asteroid[];
  }
  return [];
}

export default function AsteroidsView() {
  const { context } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [hazardOnly, setHazardOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("risk");
  const [page, setPage] = useState(1);
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);
  const openDetails = (id?: string) => {
    if (!id) return;
    router.push(`/asteroid/${id}`);
  };

  useEffect(() => {
    if (!context.loading && !context.User) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchNearAsteroids({
          startDate: new Date(),
          endDate: new Date(),
        });
        const list = normalizeAsteroids(response?.data ?? response);
        setAsteroids(list);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load asteroid data.");
      } finally {
        setLoading(false);
      }
    };

    if (context.User) {
      load();
    }
  }, [context.User]);

  const filtered = useMemo(() => {
    let list = asteroids;
    if (hazardOnly) {
      list = list.filter((item) => item.is_potentially_hazardous_asteroid);
    }

    const sorted = [...list].sort((a, b) => {
      if (sortKey === "risk") return getRiskScore(b) - getRiskScore(a);
      if (sortKey === "fastest") {
        const av =
          parseNumber(getApproach(a)?.relative_velocity?.kilometers_per_hour) ??
          0;
        const bv =
          parseNumber(getApproach(b)?.relative_velocity?.kilometers_per_hour) ??
          0;
        return bv - av;
      }
      const am =
        parseNumber(getApproach(a)?.miss_distance?.kilometers) ??
        Number.MAX_SAFE_INTEGER;
      const bm =
        parseNumber(getApproach(b)?.miss_distance?.kilometers) ??
        Number.MAX_SAFE_INTEGER;
      return am - bm;
    });

    return sorted;
  }, [asteroids, hazardOnly, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [hazardOnly, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  if (!context.User) {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Near-Earth Asteroids</h1>
          <p>Live monitoring of near-Earth objects approaching Earth</p>
        </header>

        <section className="filters">
          <label className="toggle">
            <input
              type="checkbox"
              checked={hazardOnly}
              onChange={(e) => setHazardOnly(e.target.checked)}
            />
            <span>Hazardous only</span>
          </label>

          <div className="selectWrap">
            <span>Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="risk">Risk score</option>
              <option value="closest">Closest approach</option>
              <option value="fastest">Fastest velocity</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="loaderWrap">
            <Oval
              height={64}
              width={64}
              color="#8ab8ff"
              secondaryColor="rgba(138, 184, 255, 0.35)"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        ) : error ? (
          <div className="status error">{error}</div>
        ) : (
          <section className="grid">
            {pageItems.map((asteroid, index) => {
              const approach = getApproach(asteroid);
              const hazard = asteroid.is_potentially_hazardous_asteroid;
              const risk = getRiskScore(asteroid);
              const minKm =
                asteroid.estimated_diameter?.kilometers?.estimated_diameter_min;
              const maxKm =
                asteroid.estimated_diameter?.kilometers?.estimated_diameter_max;
              const diameterText =
                minKm != null && maxKm != null
                  ? `${minKm.toFixed(3)} - ${maxKm.toFixed(3)} km`
                  : "Unknown";

              const handleAdd = async () => {
                if (!asteroid.id) return;
                const payload = {
                  asteroidId: asteroid.id,
                  name: asteroid.name,
                  hazardous: !!hazard,
                  lastKnownRiskScore: risk,
                  nextCloseApproachDate: approach?.close_approach_date
                    ? new Date(`${approach.close_approach_date}T00:00:00Z`).toISOString()
                    : null,
                  nextMissDistanceKm: approach?.miss_distance?.kilometers
                    ? Number(approach.miss_distance.kilometers)
                    : null,
                };
                try {
                  const res = await addToWatchlist(payload);
                  setWatchlistMessage(res?.message || "Added to watchlist");
                } catch (err: any) {
                  setWatchlistMessage(err?.message ?? "Failed to add to watchlist.");
                }
              };

              return (
                <article
                  className="card"
                  key={asteroid.id ?? `${asteroid.name}-${index}`}
                  onClick={() => openDetails(asteroid.id)}
                >
                  <div className="cardHead">
                    <div>
                      <h3>{asteroid.name ?? "Unnamed object"}</h3>
                      <span className={`badge ${hazard ? "danger" : "safe"}`}>
                        {hazard ? "Hazardous" : "Stable"}
                      </span>
                    </div>
                    <span className="badge score">Risk {risk}</span>
                  </div>

                  <div className="section">
                    <div className="label">Physical data</div>
                    <div className="row">Diameter range: {diameterText}</div>
                    <div className="row">
                      Absolute magnitude:{" "}
                      {asteroid.absolute_magnitude_h ?? "Unknown"}
                    </div>
                  </div>

                  <div className="section">
                    <div className="label">Close approach</div>
                    <div className="row">
                      Date: {approach?.close_approach_date ?? "Unknown"}
                    </div>
                    <div className="row">
                      Miss distance:{" "}
                      {approach?.miss_distance?.kilometers ?? "Unknown"} km
                    </div>
                    <div className="row">
                      Velocity:{" "}
                      {approach?.relative_velocity?.kilometers_per_hour ??
                        "Unknown"}{" "}
                      km/h
                    </div>
                  </div>

                  <div className="riskBar">
                    <div className="riskTrack">
                      <div
                        className="riskFill"
                        style={{ width: `${risk}%` }}
                        aria-hidden
                      />
                    </div>
                    <span>
                      {risk >= 70 ? "High" : risk >= 40 ? "Moderate" : "Low"}{" "}
                      risk
                    </span>
                  </div>

                  <div className="actions">
                    <button
                      className="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetails(asteroid.id);
                      }}
                    >
                      View details
                    </button>
                    <button
                      className="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd();
                      }}
                    >
                      Add to watchlist
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {watchlistMessage && <div className="status">{watchlistMessage}</div>}

        {!loading && !error && totalPages > 1 && (
          <nav className="pagination" aria-label="Asteroid pages">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  className={pageNumber === page ? "active" : ""}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <style jsx>{`
        .space {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(
            circle at 20% 20%,
            #0b1f3a 0%,
            #05070f 45%,
            #020308 100%
          );
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
            radial-gradient(
              1.5px 1.5px at 50% 50%,
              #ffffff 40%,
              transparent 60%
            );
          opacity: 0.6;
          animation: twinkle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .nebula {
          position: absolute;
          inset: -20% 0 0 -10%;
          background:
            radial-gradient(
              circle at 30% 30%,
              rgba(73, 132, 255, 0.35),
              transparent 55%
            ),
            radial-gradient(
              circle at 70% 60%,
              rgba(35, 235, 199, 0.2),
              transparent 50%
            );
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
          gap: 28px;
        }

        .hero h1 {
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          margin: 0 0 10px;
          color: #a6d4ff;
          letter-spacing: 0.02em;
        }

        .hero p {
          margin: 0;
          font-size: 1.05rem;
          color: #b7c8ea;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          background: rgba(9, 17, 33, 0.6);
          border: 1px solid rgba(86, 123, 187, 0.35);
          padding: 14px 18px;
          border-radius: 18px;
          backdrop-filter: blur(6px);
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .selectWrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        select {
          background: rgba(10, 20, 40, 0.8);
          color: #d6e6ff;
          border: 1px solid rgba(86, 123, 187, 0.5);
          padding: 6px 10px;
          border-radius: 10px;
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

        .grid {
          display: grid;
          gap: 22px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .card {
          background: rgba(7, 14, 28, 0.75);
          border: 1px solid rgba(86, 123, 187, 0.35);
          border-radius: 18px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 18px 40px rgba(5, 10, 25, 0.35);
        }

        .cardHead {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .cardHead h3 {
          margin: 0 0 6px;
          font-size: 1.1rem;
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

        .section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fb2e8;
        }

        .row {
          font-size: 0.92rem;
          color: #d3dcf7;
        }

        .riskBar {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #b7c8ea;
        }

        .riskTrack {
          flex: 1;
          height: 8px;
          background: rgba(92, 115, 156, 0.2);
          border-radius: 999px;
          overflow: hidden;
        }

        .riskFill {
          height: 100%;
          background: linear-gradient(90deg, #33d3ff, #8a5bff, #ff6a6a);
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        button {
          cursor: pointer;
        }

        .ghost,
        .primary {
          border-radius: 12px;
          padding: 8px 12px;
          border: 1px solid transparent;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .ghost {
          background: transparent;
          color: #b7c8ea;
          border-color: rgba(120, 150, 210, 0.4);
        }

        .primary {
          background: #5b7bff;
          color: #f5f7ff;
          border-color: rgba(91, 123, 255, 0.5);
        }

        .pagination {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .pagination button {
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(120, 150, 210, 0.4);
          background: rgba(8, 16, 32, 0.6);
          color: #b7c8ea;
        }

        .pagination button.active {
          background: rgba(91, 123, 255, 0.7);
          color: #f5f7ff;
          border-color: rgba(91, 123, 255, 0.8);
        }

        .loaderWrap {
          min-height: 280px;
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
          .filters {
            flex-direction: column;
            align-items: flex-start;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
