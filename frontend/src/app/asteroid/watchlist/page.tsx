"use client";

import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { fetchWatchlist } from "@/app/api/neoWsapis";

type WatchItem = {
  asteroidId?: string;
  name?: string;
  hazardous?: boolean;
  lastKnownRiskScore?: number;
  nextCloseApproachDate?: string;
  nextMissDistanceKm?: number;
};

export default function WatchList() {
  const { context } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const list = await fetchWatchlist();
        setItems(Array.isArray(list) ? list : []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load watchlist.");
      } finally {
        setLoading(false);
      }
    };

    if (context.User) {
      load();
    }
  }, [context.User]);

  if (!context.User) {
    return null;
  }

  return (
    <div className="space">
      <div className="stars" />
      <div className="nebula" />
      <div className="content">
        <header className="hero">
          <h1>Watchlist</h1>
          <p>Your saved near-Earth objects</p>
        </header>

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
        ) : items.length === 0 ? (
          <div className="status">No asteroids in your watchlist yet.</div>
        ) : (
          <section className="grid">
            {items.map((item, index) => (
              <article
                className="card"
                key={item.asteroidId ?? `${item.name}-${index}`}
                onClick={() => item.asteroidId && router.push(`/asteroid/${item.asteroidId}`)}
              >
                <div className="cardHead">
                  <div>
                    <h3>{item.name ?? "Unnamed object"}</h3>
                    <span className={`badge ${item.hazardous ? "danger" : "safe"}`}>
                      {item.hazardous ? "Hazardous" : "Stable"}
                    </span>
                  </div>
                  <span className="badge score">Risk {item.lastKnownRiskScore ?? "N/A"}</span>
                </div>

                <div className="section">
                  <div className="label">Next close approach</div>
                  <div className="row">
                    Date: {item.nextCloseApproachDate ?? "Unknown"}
                  </div>
                  <div className="row">
                    Miss distance: {item.nextMissDistanceKm ?? "Unknown"} km
                  </div>
                </div>
              </article>
            ))}
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

        .loaderWrap {
          min-height: 240px;
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

      `}</style>
    </div>
  );
}
