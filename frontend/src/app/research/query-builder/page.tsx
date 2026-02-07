"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";
import { runResearchQuery } from "@/app/api/neoWsapis";

type Asteroid = {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;
  estimated_diameter?: {
    kilometers?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
  };
  close_approach_data?: Array<{
    close_approach_date?: string;
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
    orbiting_body?: string;
  }>;
};

export default function ResearchQueryBuilder() {
  const { context } = useAuth();
  const router = useRouter();

  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [minDiameter, setMinDiameter] = useState("");
  const [maxDiameter, setMaxDiameter] = useState("");
  const [hazardousOnly, setHazardousOnly] = useState(false);
  const [minVelocity, setMinVelocity] = useState("");
  const [maxVelocity, setMaxVelocity] = useState("");
  const [minMiss, setMinMiss] = useState("");
  const [maxMiss, setMaxMiss] = useState("");
  const [orbitingBody, setOrbitingBody] = useState("Earth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Asteroid[]>([]);

  useEffect(() => {
    if (!context.loading && (!context.User || context.User.role !== "researcher")) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  const filtersPayload = useMemo(
    () => ({
      minDiameter: minDiameter ? Number(minDiameter) : undefined,
      maxDiameter: maxDiameter ? Number(maxDiameter) : undefined,
      hazardousOnly,
      minVelocity: minVelocity ? Number(minVelocity) : undefined,
      maxVelocity: maxVelocity ? Number(maxVelocity) : undefined,
      minMissDistanceKm: minMiss ? Number(minMiss) : undefined,
      maxMissDistanceKm: maxMiss ? Number(maxMiss) : undefined,
      orbitingBody: orbitingBody || undefined,
    }),
    [minDiameter, maxDiameter, hazardousOnly, minVelocity, maxVelocity, minMiss, maxMiss, orbitingBody],
  );

  const runQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await runResearchQuery({
        startDate,
        endDate,
        filters: filtersPayload,
      });
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to run query.");
    } finally {
      setLoading(false);
    }
  };

  if (!context.User || context.User.role !== "researcher") {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Research Query Builder</h1>
          <p>Compose asteroid filters and preview matches from the NASA feed.</p>
        </header>

        <section className="panel">
          <div className="panelHead">
            <h2>Filter configuration</h2>
            <button className="primary" onClick={runQuery} disabled={loading}>
              {loading ? "Running..." : "Run query"}
            </button>
          </div>

          <div className="grid">
            <label>
              <span>Start date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <span>End date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <label>
              <span>Min diameter (km)</span>
              <input value={minDiameter} onChange={(e) => setMinDiameter(e.target.value)} placeholder="0.05" />
            </label>
            <label>
              <span>Max diameter (km)</span>
              <input value={maxDiameter} onChange={(e) => setMaxDiameter(e.target.value)} placeholder="1.2" />
            </label>
            <label>
              <span>Min velocity (km/h)</span>
              <input value={minVelocity} onChange={(e) => setMinVelocity(e.target.value)} placeholder="15000" />
            </label>
            <label>
              <span>Max velocity (km/h)</span>
              <input value={maxVelocity} onChange={(e) => setMaxVelocity(e.target.value)} placeholder="80000" />
            </label>
            <label>
              <span>Min miss distance (km)</span>
              <input value={minMiss} onChange={(e) => setMinMiss(e.target.value)} placeholder="50000" />
            </label>
            <label>
              <span>Max miss distance (km)</span>
              <input value={maxMiss} onChange={(e) => setMaxMiss(e.target.value)} placeholder="1000000" />
            </label>
            <label>
              <span>Orbiting body</span>
              <select value={orbitingBody} onChange={(e) => setOrbitingBody(e.target.value)}>
                <option value="Earth">Earth</option>
                <option value="Moon">Moon</option>
                <option value="Mars">Mars</option>
                <option value="Jupiter">Jupiter</option>
                <option value="Venus">Venus</option>
                <option value="Saturn">Saturn</option>
              </select>
            </label>
            <label className="toggle">
              <span>Hazardous only</span>
              <input
                type="checkbox"
                checked={hazardousOnly}
                onChange={(e) => setHazardousOnly(e.target.checked)}
              />
            </label>
          </div>
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
        ) : results.length === 0 ? (
          <div className="status">No results yet. Run a query to see matches.</div>
        ) : (
          <section className="results">
            {results.map((asteroid, idx) => {
              const approach = asteroid.close_approach_data?.[0];
              const hazard = asteroid.is_potentially_hazardous_asteroid;
              const minKm = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min;
              const maxKm = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max;
              return (
                <article className="card" key={asteroid.id ?? `${asteroid.name}-${idx}`}>
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
                    <div className="label">Diameter range</div>
                    <div className="row">
                      {minKm != null && maxKm != null
                        ? `${minKm.toFixed(3)} - ${maxKm.toFixed(3)} km`
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="section">
                    <div className="label">Approach metrics</div>
                    <div className="row">
                      Miss distance: {approach?.miss_distance?.kilometers ?? "Unknown"} km
                    </div>
                    <div className="row">
                      Velocity: {approach?.relative_velocity?.kilometers_per_hour ?? "Unknown"} km/h
                    </div>
                    <div className="row">
                      Orbiting: {approach?.orbiting_body ?? "Unknown"}
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

        .panel {
          background: rgba(7, 14, 28, 0.75);
          border: 1px solid rgba(86, 123, 187, 0.35);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panelHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .panel h2 {
          margin: 0;
          font-size: 1.2rem;
          color: #c6dcff;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: #b7c8ea;
        }

        input,
        select {
          background: rgba(10, 20, 40, 0.8);
          color: #d6e6ff;
          border: 1px solid rgba(86, 123, 187, 0.5);
          padding: 8px 10px;
          border-radius: 10px;
        }

        .toggle {
          flex-direction: row;
          align-items: center;
          gap: 10px;
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

        .results {
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
      `}</style>
    </div>
  );
}
