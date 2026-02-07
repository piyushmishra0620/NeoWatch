"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";

type WatchItem = {
  asteroidId?: string;
  name?: string;
  hazardous?: boolean;
  lastKnownRiskScore?: number;
  nextCloseApproachDate?: string;
  nextMissDistanceKm?: number;
  addedAt?: string;
};

type Preferences = {
  notifyHazardousOnly?: boolean;
  notifyIfDistanceBelowKm?: number;
  notifyHoursBeforeApproach?: number;
  dailySummary?: boolean;
  emailMotifications?: boolean;
};

type SavedQuery = {
  name?: string;
  filters?: {
    minDiameter?: number;
    maxDiameter?: number;
    minMissDistanceKm?: number;
    maxMissDistanceKm?: number;
    hazardousOnly?: boolean;
    minVelocity?: number;
    maxVelocity?: number;
    orbitingBody?: string;
    startDate?: string;
    endDate?: string;
  };
  resultCount?: number;
  lastExecutedAt?: string;
};

type RiskModel = {
  modelId?: string;
  name?: string;
  weights?: {
    diameterWeight?: number;
    velocityWeight?: number;
    distanceWeight?: number;
    moidWeight?: number;
    hazardMultiplier?: number;
  };
  thresholds?: {
    low?: number;
    medium?: number;
    high?: number;
  };
  isDefault?: boolean;
};

export default function Dashboard() {
  const { context } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!context.loading && !context.User) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  const user = context.User as any;
  const watchList: WatchItem[] = user?.watchList || [];
  const preferences: Preferences = user?.preferences || {};
  const savedQueries: SavedQuery[] = user?.savedqueries
    ? [user.savedqueries]
    : [];
  const riskModels: RiskModel[] = user?.riskmodels?.models || [];
  const defaultModelId = user?.riskmodels?.defaultModelId || null;

  const recentWatchlist = useMemo(() => watchList.slice(0, 3), [watchList]);

  if (!context.User) {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Profile Dashboard</h1>
          <p>Your mission control for NeoWatch activity and preferences.</p>
        </header>

        <section className="panel">
          <div className="panelHead">
            <h2>User overview</h2>
            <span className="pill">{user?.role || "user"}</span>
          </div>
          <div className="grid">
            <div className="statCard">
              <div className="label">Username</div>
              <div className="value">{user?.username || "Unknown"}</div>
            </div>
            <div className="statCard">
              <div className="label">Email</div>
              <div className="value">{user?.emailId || "Unknown"}</div>
            </div>
            <div className="statCard">
              <div className="label">Watchlist items</div>
              <div className="value">{watchList.length}</div>
            </div>
            <div className="statCard">
              <div className="label">Role</div>
              <div className="value">{user?.role || "user"}</div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <h2>Watchlist snapshot</h2>
          </div>
          {watchList.length === 0 ? (
            <div className="status">No asteroids saved yet.</div>
          ) : (
            <div className="cards">
              {recentWatchlist.map((item, index) => (
                <article className="card" key={item.asteroidId ?? index}>
                  <div className="cardHead">
                    <div>
                      <h3>{item.name || "Unnamed object"}</h3>
                      <span className={`badge ${item.hazardous ? "danger" : "safe"}`}>
                        {item.hazardous ? "Hazardous" : "Stable"}
                      </span>
                    </div>
                    <span className="pill">Risk {item.lastKnownRiskScore ?? "N/A"}</span>
                  </div>
                  <div className="section">
                    <div className="label">Next approach</div>
                    <div className="row">Date: {item.nextCloseApproachDate ?? "Unknown"}</div>
                    <div className="row">
                      Miss distance: {item.nextMissDistanceKm ?? "Unknown"} km
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panelHead">
            <h2>Notification preferences</h2>
          </div>
          <div className="grid">
            <div className="statCard">
              <div className="label">Hazardous-only alerts</div>
              <div className="value">{preferences.notifyHazardousOnly ? "Enabled" : "Off"}</div>
            </div>
            <div className="statCard">
              <div className="label">Distance threshold (km)</div>
              <div className="value">
                {preferences.notifyIfDistanceBelowKm ?? "Not set"}
              </div>
            </div>
            <div className="statCard">
              <div className="label">Hours before approach</div>
              <div className="value">
                {preferences.notifyHoursBeforeApproach ?? "Not set"}
              </div>
            </div>
            <div className="statCard">
              <div className="label">Daily summary</div>
              <div className="value">{preferences.dailySummary ? "Enabled" : "Off"}</div>
            </div>
            <div className="statCard">
              <div className="label">Email notifications</div>
              <div className="value">{preferences.emailMotifications ? "Enabled" : "Off"}</div>
            </div>
          </div>
        </section>

        {user?.role === "researcher" && (
          <>
            <section className="panel">
              <div className="panelHead">
                <h2>Saved query</h2>
              </div>
              {savedQueries.length === 0 ? (
                <div className="status">No queries saved yet.</div>
              ) : (
                savedQueries.map((query, index) => (
                  <div className="statCard" key={`query-${index}`}>
                    <div className="label">{query.name || "Last query"}</div>
                    <div className="row">
                      Window: {query.filters?.startDate || "N/A"} →{" "}
                      {query.filters?.endDate || "N/A"}
                    </div>
                    <div className="row">
                      Filters: {query.filters?.hazardousOnly ? "Hazardous only" : "All"} ·
                      Min diameter {query.filters?.minDiameter ?? "—"} km · Min velocity{" "}
                      {query.filters?.minVelocity ?? "—"} km/h
                    </div>
                    <div className="row">Results: {query.resultCount ?? 0}</div>
                  </div>
                ))
              )}
            </section>

            <section className="panel">
              <div className="panelHead">
                <h2>Risk models</h2>
                <span className="pill">{riskModels.length} models</span>
              </div>
              {riskModels.length === 0 ? (
                <div className="status">No risk models saved yet.</div>
              ) : (
                <div className="cards">
                  {riskModels.map((model) => (
                    <article className="card" key={model.modelId}>
                      <div className="cardHead">
                        <div>
                          <h3>{model.name || "Untitled model"}</h3>
                          <span className={`badge ${model.modelId === defaultModelId ? "active" : "neutral"}`}>
                            {model.modelId === defaultModelId ? "Default" : "Custom"}
                          </span>
                        </div>
                        <span className="pill">MOID {model.weights?.moidWeight ?? "—"}</span>
                      </div>
                      <div className="section">
                        <div className="label">Weights</div>
                        <div className="row">
                          D {model.weights?.diameterWeight ?? "—"} · V{" "}
                          {model.weights?.velocityWeight ?? "—"} · Dist{" "}
                          {model.weights?.distanceWeight ?? "—"} · Hazard x{" "}
                          {model.weights?.hazardMultiplier ?? "—"}
                        </div>
                      </div>
                      <div className="section">
                        <div className="label">Thresholds</div>
                        <div className="row">
                          Low {model.thresholds?.low ?? "—"} · Medium{" "}
                          {model.thresholds?.medium ?? "—"} · High{" "}
                          {model.thresholds?.high ?? "—"}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
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

        .statCard {
          background: rgba(10, 18, 36, 0.65);
          border: 1px solid rgba(86, 123, 187, 0.35);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cards {
          display: grid;
          gap: 20px;
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

        .badge.active {
          background: rgba(91, 123, 255, 0.2);
          color: #d7e2ff;
          border-color: rgba(91, 123, 255, 0.5);
        }

        .badge.neutral {
          background: rgba(73, 196, 255, 0.12);
          color: #8fd9ff;
          border-color: rgba(73, 196, 255, 0.35);
        }

        .pill {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(12, 22, 44, 0.6);
          border: 1px solid rgba(86, 123, 187, 0.35);
          font-size: 0.8rem;
          color: #c6d7ff;
        }

        .label {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fb2e8;
        }

        .value {
          font-size: 1rem;
          color: #d3dcf7;
        }

        .row {
          font-size: 0.92rem;
          color: #d3dcf7;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status {
          padding: 18px;
          background: rgba(10, 18, 36, 0.65);
          border-radius: 16px;
          border: 1px solid rgba(86, 123, 187, 0.4);
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