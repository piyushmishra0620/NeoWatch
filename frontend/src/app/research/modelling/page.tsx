"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";
import { fetchRiskModels, saveRiskModel, setDefaultRiskModel } from "@/app/api/neoWsapis";

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
  normalizationMethod?: string;
  isDefault?: boolean;
};

export default function ResearchModelling() {
  const { context } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("Model Alpha");
  const [diameterWeight, setDiameterWeight] = useState("0.35");
  const [velocityWeight, setVelocityWeight] = useState("0.25");
  const [distanceWeight, setDistanceWeight] = useState("0.25");
  const [moidWeight, setMoidWeight] = useState("0.1");
  const [hazardMultiplier, setHazardMultiplier] = useState("1.5");
  const [lowThreshold, setLowThreshold] = useState("30");
  const [mediumThreshold, setMediumThreshold] = useState("60");
  const [highThreshold, setHighThreshold] = useState("85");
  const [makeDefault, setMakeDefault] = useState(false);

  const [models, setModels] = useState<RiskModel[]>([]);
  const [defaultModelId, setDefaultModelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!context.loading && (!context.User || context.User.role !== "researcher")) {
      router.push("/");
    }
  }, [context.loading, context.User, router]);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchRiskModels();
      setModels(res?.data || []);
      setDefaultModelId(res?.defaultModelId || null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load models.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (context.User) {
      loadModels();
    }
  }, [context.User]);

  const weightsTotal = useMemo(() => {
    const sum =
      Number(diameterWeight || 0) +
      Number(velocityWeight || 0) +
      Number(distanceWeight || 0) +
      Number(moidWeight || 0);
    return Number.isFinite(sum) ? sum : 0;
  }, [diameterWeight, velocityWeight, distanceWeight, moidWeight]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await saveRiskModel({
        name,
        weights: {
          diameterWeight: Number(diameterWeight),
          velocityWeight: Number(velocityWeight),
          distanceWeight: Number(distanceWeight),
          moidWeight: Number(moidWeight),
          hazardMultiplier: Number(hazardMultiplier),
        },
        thresholds: {
          low: Number(lowThreshold),
          medium: Number(mediumThreshold),
          high: Number(highThreshold),
        },
        normalizationMethod: "linear",
        isDefault: makeDefault,
      });
      setMessage(res?.data ? "Model saved." : res?.message || "Model saved.");
      await loadModels();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save model.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (modelId?: string) => {
    if (!modelId) return;
    try {
      setSaving(true);
      setError(null);
      await setDefaultRiskModel(modelId);
      setDefaultModelId(modelId);
      setModels((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.modelId === modelId })),
      );
      setMessage("Default model updated.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to set default.");
    } finally {
      setSaving(false);
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
          <h1>Risk Model Studio</h1>
          <p>Define custom scoring weights, thresholds, and defaults for research workflows.</p>
        </header>

        <section className="panel">
          <div className="panelHead">
            <h2>Risk weights</h2>
            <button className="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save model"}
            </button>
          </div>

          <div className="grid">
            <label>
              <span>Model name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              <span>Diameter weight</span>
              <input value={diameterWeight} onChange={(e) => setDiameterWeight(e.target.value)} />
            </label>
            <label>
              <span>Velocity weight</span>
              <input value={velocityWeight} onChange={(e) => setVelocityWeight(e.target.value)} />
            </label>
            <label>
              <span>Miss distance weight</span>
              <input value={distanceWeight} onChange={(e) => setDistanceWeight(e.target.value)} />
            </label>
            <label>
              <span>MOID weight</span>
              <input value={moidWeight} onChange={(e) => setMoidWeight(e.target.value)} />
            </label>
            <label>
              <span>Hazard multiplier</span>
              <input value={hazardMultiplier} onChange={(e) => setHazardMultiplier(e.target.value)} />
            </label>
          </div>

          <div className="metaRow">
            <span className="hint">Weight sum: {weightsTotal.toFixed(2)}</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
              />
              <span>Set as default</span>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <h2>Risk category thresholds</h2>
          </div>
          <div className="grid">
            <label>
              <span>Low</span>
              <input value={lowThreshold} onChange={(e) => setLowThreshold(e.target.value)} />
            </label>
            <label>
              <span>Medium</span>
              <input value={mediumThreshold} onChange={(e) => setMediumThreshold(e.target.value)} />
            </label>
            <label>
              <span>High</span>
              <input value={highThreshold} onChange={(e) => setHighThreshold(e.target.value)} />
            </label>
          </div>
        </section>

        {message && <div className="status">{message}</div>}
        {error && <div className="status error">{error}</div>}

        <section className="panel">
          <div className="panelHead">
            <h2>Saved models</h2>
          </div>
          {loading ? (
            <div className="loaderWrap">
              <Oval
                height={56}
                width={56}
                color="#8ab8ff"
                secondaryColor="rgba(138, 184, 255, 0.35)"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
            </div>
          ) : models.length === 0 ? (
            <div className="status">No models saved yet.</div>
          ) : (
            <div className="results">
              {models.map((model) => (
                <article className="card" key={model.modelId}>
                  <div className="cardHead">
                    <div>
                      <h3>{model.name}</h3>
                      <span className={`badge ${model.modelId === defaultModelId ? "active" : "neutral"}`}>
                        {model.modelId === defaultModelId ? "Default" : "Custom"}
                      </span>
                    </div>
                    <button className="ghost" onClick={() => handleSetDefault(model.modelId)}>
                      Set default
                    </button>
                  </div>
                  <div className="section">
                    <div className="label">Weights</div>
                    <div className="row">
                      D:{model.weights?.diameterWeight ?? 0} | V:{model.weights?.velocityWeight ?? 0} | M:
                      {model.weights?.distanceWeight ?? 0} | MOID:{model.weights?.moidWeight ?? 0} | Hazard x
                      {model.weights?.hazardMultiplier ?? 1}
                    </div>
                  </div>
                  <div className="section">
                    <div className="label">Thresholds</div>
                    <div className="row">
                      Low {model.thresholds?.low ?? "-"} · Medium {model.thresholds?.medium ?? "-"} · High{" "}
                      {model.thresholds?.high ?? "-"}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
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

        input {
          background: rgba(10, 20, 40, 0.8);
          color: #d6e6ff;
          border: 1px solid rgba(86, 123, 187, 0.5);
          padding: 8px 10px;
          border-radius: 10px;
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

        .ghost {
          border-radius: 10px;
          padding: 6px 12px;
          border: 1px solid rgba(120, 150, 210, 0.4);
          background: transparent;
          color: #b7c8ea;
          cursor: pointer;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metaRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hint {
          color: #8fb2e8;
        }

        .loaderWrap {
          min-height: 220px;
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
          .panelHead {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
