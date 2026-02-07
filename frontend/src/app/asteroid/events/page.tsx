"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";
import { fetchNearAsteroids } from "@/app/api/neoWsapis";

type Asteroid = {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  close_approach_data?: Array<{
    close_approach_date?: string;
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
  }>;
};

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

export default function AsteroidEvents() {
  const { context } = useAuth();
  const router = useRouter();

  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [hazardOnly, setHazardOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Asteroid[]>([]);

  useEffect(() => {
    if (!context.loading && !context.User) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchNearAsteroids({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      const list = normalizeAsteroids(response?.data ?? response);
      setEvents(list);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (context.User) {
      loadEvents();
    }
  }, [context.User]);

  const filtered = useMemo(() => {
    if (!hazardOnly) return events;
    return events.filter((item) => item.is_potentially_hazardous_asteroid);
  }, [events, hazardOnly]);

  if (!context.User) {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Approach Events</h1>
          <p>Track near-Earth encounters in your selected window.</p>
        </header>

        <section className="filters">
          <div className="fieldGroup">
            <label>
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={hazardOnly}
              onChange={(e) => setHazardOnly(e.target.checked)}
            />
            <span>Hazardous only</span>
          </label>
          <button className="primary" onClick={loadEvents}>
            Apply
          </button>
        </section>

        {loading ? (
          <div className="loaderWrap">
            <Oval
              height={60}
              width={60}
              color="#8ab8ff"
              secondaryColor="rgba(138, 184, 255, 0.35)"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        ) : error ? (
          <div className="status error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="status">No events found for this range.</div>
        ) : (
          <section className="grid">
            {filtered.map((asteroid, index) => {
              const approach = asteroid.close_approach_data?.[0];
              const hazard = asteroid.is_potentially_hazardous_asteroid;
              return (
                <article
                  className="card"
                  key={asteroid.id ?? `${asteroid.name}-${index}`}
                  onClick={() => asteroid.id && router.push(`/asteroid/${asteroid.id}`)}
                >
                  <div className="cardHead">
                    <div>
                      <h3>{asteroid.name ?? "Unnamed object"}</h3>
                      <span className={`badge ${hazard ? "danger" : "safe"}`}>
                        {hazard ? "Hazardous" : "Stable"}
                      </span>
                    </div>
                    <span className="pill">{approach?.close_approach_date ?? "Unknown date"}</span>
                  </div>
                  <div className="section">
                    <div className="label">Close approach</div>
                    <div className="row">
                      Miss distance: {approach?.miss_distance?.kilometers ?? "Unknown"} km
                    </div>
                    <div className="row">
                      Velocity: {approach?.relative_velocity?.kilometers_per_hour ?? "Unknown"} km/h
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
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
          gap: 28px;
        }

        .hero h1 {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
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

        .fieldGroup {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: #b7c8ea;
        }

        input[type="date"] {
          background: rgba(10, 20, 40, 0.8);
          color: #d6e6ff;
          border: 1px solid rgba(86, 123, 187, 0.5);
          padding: 6px 10px;
          border-radius: 10px;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .primary {
          border-radius: 12px;
          padding: 8px 14px;
          border: 1px solid transparent;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: #5b7bff;
          color: #f5f7ff;
          cursor: pointer;
        }

        .loaderWrap {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          cursor: pointer;
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

        .pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(12, 22, 44, 0.6);
          border: 1px solid rgba(86, 123, 187, 0.35);
          font-size: 0.8rem;
          color: #c6d7ff;
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
        }
      `}</style>
    </div>
  );
}
