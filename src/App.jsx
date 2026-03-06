import { useState, useEffect } from "react";

// ============================================================
// STORAGE LAYER
// Currently using localStorage for testing.
// When Supabase is ready, replace these three functions only.
// Everything else in this file stays exactly the same.
//
// Supabase swap will look like:
//   import { supabase } from "./supabaseClient"
//   async function loadHistory() { ...supabase query... }
//   async function saveHistory(data) { ...supabase upsert... }
// ============================================================

const STORAGE_KEY = "life_os_pulse_history_v1";

async function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
}

async function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    console.error("Failed to save history:", e);
    return false;
  }
}

// ============================================================
// DATA
// ============================================================

const HORIZON_SCALE = [
  { value: 10, tier: "World-Class", label: "Best in the World", description: "Complete coherence. Effortless mastery, luminous presence, contribution that uplifts others. The art and the artist are one." },
  { value: 9.5, tier: "Exemplar+", label: "Global Standard Setter", description: "Integrated and at ease. Leads by example; influence radiates naturally." },
  { value: 9, tier: "Exemplar", label: "Master of Craft", description: "Deeply skilled, balanced, reliable. Excellence feels natural and sustainable." },
  { value: 8.5, tier: "Fluent+", label: "Mature Steward", description: "Competence meets wisdom; growth through curiosity and depth." },
  { value: 8, tier: "Fluent", label: "Seasoned Practitioner", description: "Solid foundations, steady excellence, self-aware and grounded." },
  { value: 7.5, tier: "Capable+", label: "Evolving Practitioner", description: "Consistent progress; confidence building through deliberate practice." },
  { value: 7, tier: "Capable", label: "Reliable Contributor", description: "Dependable, engaged, purposeful." },
  { value: 6.5, tier: "Functional+", label: "Rebuilding Rhythm", description: "Mostly consistent; stabilising habits, pacing energy." },
  { value: 6, tier: "Functional", label: "Managing the Basics", description: "Competent, responsible; maintaining, sometimes fatigued." },
  { value: 5.5, tier: "Plateau+", label: "Reawakening", description: "Curiosity stirring; ready to move again." },
  { value: 5, tier: "Plateau", label: "Maintaining", description: "Holding steady but uninspired; minimal expansion." },
  { value: 4.5, tier: "Friction+", label: "Stirring Awareness", description: "Restless recognition that change is due." },
  { value: 4, tier: "Friction", label: "Stuck but Willing", description: "Desire present, momentum low; self-judgment softening into openness." },
  { value: 3.5, tier: "Strain+", label: "Fatigue and Doubt", description: "Inconsistent, overwhelmed, starting to see the cycle." },
  { value: 3, tier: "Strain", label: "Contracted", description: "Energy collapsed inward; fear or shame active. Needs rest, not force." },
  { value: 2.5, tier: "Crisis+", label: "Holding On", description: "High stress, low support; survival instincts active." },
  { value: 2, tier: "Crisis", label: "Depleted", description: "Basics unmet, clarity lost; exhaustion or anxiety chronic." },
  { value: 1.5, tier: "Emergency+", label: "Deep Pain / Numb", description: "Alternating between intensity and shutdown." },
  { value: 1, tier: "Emergency", label: "Disconnected", description: "Spiritually or emotionally collapsed; light dimmed." },
  { value: 0, tier: "Ground Zero", label: "Complete Reset", description: "End of a cycle. Stillness before rebirth." },
];

const DOMAINS = [
  { key: "path", label: "Path", description: "Your calling, contribution & meaningful work" },
  { key: "aliveness", label: "Aliveness", description: "Joy, pleasure, creativity & feeling alive" },
  { key: "body", label: "Body", description: "Physical health, energy & your relationship with your vessel" },
  { key: "resources", label: "Resources", description: "Money, time, space & material sufficiency" },
  { key: "relationships", label: "Relationships", description: "Love, connection, community & belonging" },
  { key: "inner", label: "Inner World", description: "Mental health, spirituality & your relationship with yourself" },
  { key: "expression", label: "Expression", description: "How you show up in the world & your outer impact" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ============================================================
// HELPERS
// ============================================================

function formatDate(iso) {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getTierColor(value) {
  if (value >= 8) return "#A8C8A0";
  if (value >= 6) return "#C8A96E";
  if (value >= 4) return "#C8B870";
  if (value >= 2) return "#C8907A";
  return "#C8A0A0";
}

function getScaleEntry(value) {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value * 2) / 2;
  return HORIZON_SCALE.find(s => s.value === rounded) || HORIZON_SCALE[HORIZON_SCALE.length - 1];
}

function getInsights(history) {
  if (history.length < 2) return [];
  const insights = [];
  DOMAINS.forEach(d => {
    const recentScores = history.slice(-3).map(h => h.scores[d.key]).filter(s => s !== null && s !== undefined);
    if (recentScores.length >= 2) {
      const allLow = recentScores.every(s => s <= 4);
      const dropping = recentScores[recentScores.length - 1] < recentScores[0] - 1;
      const rising = recentScores[recentScores.length - 1] > recentScores[0] + 1;
      if (allLow) {
        insights.push({ type: "persistent", domain: d.label, message: `${d.label} has been in Friction or below for ${recentScores.length} consecutive check-ins.` });
      } else if (dropping) {
        insights.push({ type: "declining", domain: d.label, message: `${d.label} has been declining across your recent check-ins.` });
      } else if (rising) {
        insights.push({ type: "rising", domain: d.label, message: `${d.label} is showing consistent upward movement. Something is working.` });
      }
    }
  });
  return insights;
}

// ============================================================
// COMPONENTS
// ============================================================

function PulseWheel({ scores, size = 320 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = DOMAINS.length;

  const getPoint = (domainIndex, score) => {
    const angle = (domainIndex / n) * 2 * Math.PI - Math.PI / 2;
    const r = maxR * ((score ?? 5) / 10);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const getLabelPoint = (domainIndex) => {
    const angle = (domainIndex / n) * 2 * Math.PI - Math.PI / 2;
    const r = maxR * 1.22;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const polygonPoints = DOMAINS.map((d, i) => {
    const p = getPoint(i, scores[d.key] ?? 5);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[2, 4, 6, 8, 10].map(r => {
        const pts = DOMAINS.map((_, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const radius = maxR * (r / 10);
          return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
        }).join(" ");
        return <polygon key={r} points={pts} fill="none" stroke="rgba(200,169,110,0.1)" strokeWidth="1" />;
      })}
      {DOMAINS.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="rgba(200,169,110,0.12)" strokeWidth="1" />;
      })}
      <polygon points={polygonPoints} fill="rgba(200,169,110,0.12)" stroke="#C8A96E" strokeWidth="2" strokeLinejoin="round" style={{ transition: "all 0.4s ease" }} />
      {DOMAINS.map((d, i) => {
        const s = scores[d.key] ?? 5;
        const p = getPoint(i, s);
        return <circle key={d.key} cx={p.x} cy={p.y} r={4} fill={getTierColor(s)} stroke="#0f0d09" strokeWidth="1.5" />;
      })}
      {DOMAINS.map((d, i) => {
        const lp = getLabelPoint(i);
        const score = scores[d.key] ?? 5;
        const entry = getScaleEntry(score);
        return (
          <g key={d.key}>
            <text x={lp.x} y={lp.y - 7} textAnchor="middle" fill="#E8D5B0" fontSize="11" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600">{d.label}</text>
            <text x={lp.x} y={lp.y + 7} textAnchor="middle" fill={getTierColor(score)} fontSize="10" fontFamily="Georgia, serif">{entry?.tier}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="rgba(200,169,110,0.3)" />
    </svg>
  );
}

function HorizonScalePicker({ domain, value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const selected = getScaleEntry(value);

  return (
    <div style={{ marginBottom: "16px", border: `1px solid ${expanded ? "rgba(200,169,110,0.35)" : "rgba(200,169,110,0.1)"}`, borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s", background: "rgba(200,169,110,0.02)" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: "600", color: "#E8D5B0" }}>{domain.label}</div>
          <div style={{ fontSize: "11px", color: "rgba(200,169,110,0.5)", fontStyle: "italic", marginTop: "2px" }}>{domain.description}</div>
        </div>
        <div style={{ textAlign: "right", marginLeft: "16px", flexShrink: 0 }}>
          {value !== null ? (
            <>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: "700", color: getTierColor(value), lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "10px", color: getTierColor(value), opacity: 0.8 }}>{selected?.tier}</div>
            </>
          ) : (
            <div style={{ fontSize: "12px", color: "rgba(200,169,110,0.35)", fontStyle: "italic" }}>tap to assess</div>
          )}
        </div>
      </div>

      {value !== null && !expanded && (
        <div style={{ padding: "0 20px 14px", borderTop: "1px solid rgba(200,169,110,0.06)" }}>
          <div style={{ fontSize: "12px", color: "rgba(200,169,110,0.6)", fontStyle: "italic", lineHeight: 1.5 }}>"{selected?.description}"</div>
          <button onClick={(e) => { e.stopPropagation(); setExpanded(true); }} style={{ marginTop: "8px", background: "none", border: "none", color: "rgba(200,169,110,0.4)", fontSize: "11px", cursor: "pointer", padding: 0, fontFamily: "Georgia, serif", letterSpacing: "0.08em" }}>CHANGE →</button>
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)", maxHeight: "420px", overflowY: "auto" }}>
          <div style={{ padding: "10px 12px 6px", fontSize: "10px", color: "rgba(200,169,110,0.35)", letterSpacing: "0.15em" }}>READ EACH LEVEL — SELECT WHERE YOU RECOGNISE YOURSELF TODAY</div>
          {HORIZON_SCALE.map(entry => {
            const isSelected = value === entry.value;
            return (
              <div key={entry.value} onClick={() => { onChange(entry.value); setExpanded(false); }}
                style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(200,169,110,0.05)", background: isSelected ? "rgba(200,169,110,0.08)" : "transparent", transition: "background 0.15s", display: "flex", gap: "14px", alignItems: "flex-start" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(200,169,110,0.04)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: "44px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: "700", color: getTierColor(entry.value), lineHeight: 1 }}>{entry.value}</div>
                  <div style={{ fontSize: "9px", color: getTierColor(entry.value), opacity: 0.7, marginTop: "2px" }}>{entry.tier}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", fontWeight: "600", color: "#E8D5B0", marginBottom: "3px" }}>{entry.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(200,169,110,0.6)", fontStyle: "italic", lineHeight: 1.5 }}>{entry.description}</div>
                </div>
                {isSelected && <div style={{ color: getTierColor(entry.value), fontSize: "16px", flexShrink: 0 }}>✓</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ entry, expanded, onExpand }) {
  const avg = (Object.values(entry.scores).reduce((a, b) => a + b, 0) / DOMAINS.length).toFixed(1);
  const avgEntry = getScaleEntry(parseFloat(avg));

  return (
    <div onClick={onExpand} style={{ border: `1px solid ${expanded ? "rgba(200,169,110,0.35)" : "rgba(200,169,110,0.1)"}`, borderRadius: "10px", overflow: "hidden", marginBottom: "12px", background: "rgba(200,169,110,0.02)", cursor: "pointer", transition: "border-color 0.2s" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", color: "#E8D5B0", fontWeight: "600" }}>{formatDate(entry.date)}</div>
          {entry.oneThingDomain && (
            <div style={{ fontSize: "11px", color: "rgba(200,169,110,0.5)", fontStyle: "italic", marginTop: "3px" }}>Focus: {DOMAINS.find(d => d.key === entry.oneThingDomain)?.label}</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", color: getTierColor(parseFloat(avg)), fontWeight: "700", lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: "10px", color: "rgba(200,169,110,0.4)", letterSpacing: "0.08em" }}>{avgEntry?.tier}</div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(200,169,110,0.08)", padding: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginBottom: "16px" }}>
            <PulseWheel scores={entry.scores} size={200} />
            <div style={{ flex: 1, minWidth: "160px" }}>
              {DOMAINS.map(d => {
                const s = entry.scores[d.key];
                const e = getScaleEntry(s);
                return (
                  <div key={d.key} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(200,169,110,0.7)", fontFamily: "Georgia, serif" }}>{d.label}</span>
                      <span style={{ fontSize: "11px", color: getTierColor(s), fontFamily: "Georgia, serif", fontWeight: "bold" }}>{s} · {e?.tier}</span>
                    </div>
                    <div style={{ height: "3px", background: "rgba(200,169,110,0.08)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${s * 10}%`, background: getTierColor(s), borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {entry.reflection && (
            <div style={{ padding: "12px 16px", background: "rgba(200,169,110,0.04)", borderLeft: "2px solid rgba(200,169,110,0.25)", borderRadius: "0 4px 4px 0" }}>
              <div style={{ fontSize: "10px", color: "rgba(200,169,110,0.4)", letterSpacing: "0.12em", marginBottom: "6px" }}>REFLECTION</div>
              <p style={{ margin: 0, fontSize: "13px", color: "#C8B890", fontStyle: "italic", lineHeight: 1.6, fontFamily: "Georgia, serif" }}>{entry.reflection}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [view, setView] = useState("intro");
  const [scores, setScores] = useState(Object.fromEntries(DOMAINS.map(d => [d.key, null])));
  const [reflection, setReflection] = useState("");
  const [oneThingDomain, setOneThingDomain] = useState("");
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState(null);

  const completedScores = Object.fromEntries(DOMAINS.map(d => [d.key, scores[d.key] ?? 5]));
  const allScored = DOMAINS.every(d => scores[d.key] !== null);
  const scoredCount = DOMAINS.filter(d => scores[d.key] !== null).length;
  const avg = allScored ? (Object.values(completedScores).reduce((a, b) => a + b, 0) / DOMAINS.length).toFixed(1) : null;
  const insights = getInsights(history);

  useEffect(() => {
    loadHistory().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const entry = {
      date: new Date().toISOString(),
      scores: { ...completedScores },
      reflection,
      oneThingDomain,
    };
    const newHistory = [...history, entry];
    const ok = await saveHistory(newHistory);
    if (ok) {
      setHistory(newHistory);
      setView("saved");
    }
    setSaving(false);
  }

  function resetForm() {
    setScores(Object.fromEntries(DOMAINS.map(d => [d.key, null])));
    setReflection("");
    setOneThingDomain("");
    setView("intro");
  }

  // Shared button styles
  const btnPrimary = { width: "100%", padding: "18px", background: "linear-gradient(135deg, rgba(200,169,110,0.16), rgba(200,169,110,0.08))", border: "1px solid rgba(200,169,110,0.35)", color: "#E8D5B0", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: "500", letterSpacing: "0.08em" };
  const btnSecondary = { width: "100%", padding: "14px", background: "none", border: "1px solid rgba(200,169,110,0.1)", color: "rgba(200,169,110,0.4)", borderRadius: "8px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "12px", letterSpacing: "0.05em" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f0d09" }}>
      <div style={{ color: "rgba(200,169,110,0.4)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Loading your records...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0d09", backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(200,169,110,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(150,120,80,0.03) 0%, transparent 60%)", color: "#E8D5B0", fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.2); border-radius: 2px; }
        textarea { resize: vertical; }
      `}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px", borderBottom: "1px solid rgba(200,169,110,0.08)", paddingBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(200,169,110,0.4)", marginBottom: "6px" }}>LIFE OS</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "44px", fontWeight: "300", color: "#E8D5B0", margin: 0, lineHeight: 1 }}>Pulse</h1>
            <p style={{ fontSize: "12px", color: "rgba(200,169,110,0.45)", margin: "6px 0 0", fontStyle: "italic" }}>The Horizon Scale self-assessment</p>
          </div>
          {view !== "history" && (
            <button onClick={() => setView("history")} style={{ background: "none", border: "1px solid rgba(200,169,110,0.15)", color: "rgba(200,169,110,0.5)", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "11px", letterSpacing: "0.1em", transition: "all 0.2s", flexShrink: 0 }}>
              RECORD {history.length > 0 ? `(${history.length})` : ""}
            </button>
          )}
        </div>

        {/* ── INTRO ── */}
        {view === "intro" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "36px", padding: "32px", border: "1px solid rgba(200,169,110,0.08)", borderRadius: "12px" }}>
              <PulseWheel scores={{ path: 7, aliveness: 5, body: 6.5, resources: 3.5, relationships: 8, inner: 6, expression: 4.5 }} size={260} />
              <p style={{ fontSize: "15px", color: "rgba(200,169,110,0.6)", fontStyle: "italic", lineHeight: 1.7, margin: "20px auto 0", fontFamily: "'Cormorant Garamond', Georgia, serif", maxWidth: "400px" }}>
                Not a rating. A recognition. Read each level and find where you actually are today.
              </p>
            </div>

            <div style={{ marginBottom: "28px", padding: "16px 20px", background: "rgba(200,169,110,0.03)", border: "1px solid rgba(200,169,110,0.08)", borderRadius: "8px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(200,169,110,0.35)", marginBottom: "12px" }}>THE HORIZON SCALE</div>
              {[
                { tier: "World-Class → Exemplar", range: "8 – 10", color: "#A8C8A0" },
                { tier: "Fluent → Capable", range: "6.5 – 7.5", color: "#C8A96E" },
                { tier: "Functional → Plateau", range: "5 – 6", color: "#C8B870" },
                { tier: "Friction → Strain", range: "3 – 4.5", color: "#C8907A" },
                { tier: "Crisis → Ground Zero", range: "0 – 2.5", color: "#C8A0A0" },
              ].map(item => (
                <div key={item.tier} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(200,169,110,0.05)" }}>
                  <span style={{ fontSize: "13px", color: item.color, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{item.tier}</span>
                  <span style={{ fontSize: "12px", color: "rgba(200,169,110,0.4)" }}>{item.range}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setView("scan")} style={btnPrimary}>Begin Your Pulse</button>

            {history.length > 0 && (
              <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(200,169,110,0.3)", fontStyle: "italic", marginTop: "14px" }}>
                {history.length} previous check-in{history.length !== 1 ? "s" : ""} on record
              </p>
            )}
          </div>
        )}

        {/* ── SCAN ── */}
        {view === "scan" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "rgba(200,169,110,0.4)", letterSpacing: "0.1em" }}>{scoredCount} OF {DOMAINS.length} DOMAINS</span>
                <span style={{ fontSize: "11px", color: "rgba(200,169,110,0.4)", letterSpacing: "0.1em" }}>{allScored ? "COMPLETE" : "IN PROGRESS"}</span>
              </div>
              <div style={{ height: "2px", background: "rgba(200,169,110,0.08)", borderRadius: "1px" }}>
                <div style={{ height: "100%", width: `${(scoredCount / DOMAINS.length) * 100}%`, background: "linear-gradient(to right, #C8A96E, #E8C87A)", borderRadius: "1px", transition: "width 0.4s" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
              <PulseWheel scores={completedScores} size={260} />
            </div>

            <p style={{ fontSize: "13px", color: "rgba(200,169,110,0.5)", fontStyle: "italic", textAlign: "center", marginBottom: "24px", lineHeight: 1.6 }}>
              Open each domain. Read down through the levels. Select where you recognise yourself today — not where you want to be.
            </p>

            {DOMAINS.map(domain => (
              <HorizonScalePicker key={domain.key} domain={domain} value={scores[domain.key]} onChange={val => setScores(prev => ({ ...prev, [domain.key]: val }))} />
            ))}

            {allScored
              ? <button onClick={() => setView("reveal")} style={{ ...btnPrimary, marginTop: "8px" }}>See Your Map →</button>
              : <div style={{ textAlign: "center", padding: "16px", color: "rgba(200,169,110,0.35)", fontSize: "13px", fontStyle: "italic" }}>{DOMAINS.length - scoredCount} domain{DOMAINS.length - scoredCount !== 1 ? "s" : ""} remaining</div>
            }
          </div>
        )}

        {/* ── REVEAL ── */}
        {view === "reveal" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(200,169,110,0.35)", marginBottom: "12px" }}>YOUR LIFE MAP TODAY</div>
              <PulseWheel scores={completedScores} size={300} />
              <div style={{ marginTop: "16px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "52px", fontWeight: "300", color: getTierColor(parseFloat(avg)), lineHeight: 1 }}>{avg}</div>
                <div style={{ fontSize: "11px", color: "rgba(200,169,110,0.4)", letterSpacing: "0.15em" }}>{getScaleEntry(parseFloat(avg))?.tier?.toUpperCase()}</div>
              </div>
            </div>

            {DOMAINS.map(d => {
              const s = completedScores[d.key];
              const entry = getScaleEntry(s);
              return (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 0", borderBottom: "1px solid rgba(200,169,110,0.06)" }}>
                  <div style={{ width: "90px", flexShrink: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "14px", color: "#E8D5B0", fontWeight: "600" }}>{d.label}</div>
                  <div style={{ flex: 1, height: "4px", background: "rgba(200,169,110,0.08)", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${s * 10}%`, background: getTierColor(s), borderRadius: "2px" }} />
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, minWidth: "100px" }}>
                    <span style={{ fontSize: "13px", color: getTierColor(s), fontWeight: "bold" }}>{s}</span>
                    <span style={{ fontSize: "11px", color: getTierColor(s), opacity: 0.7, marginLeft: "6px" }}>{entry?.tier}</span>
                  </div>
                </div>
              );
            })}

            {insights.length > 0 && (
              <div style={{ margin: "24px 0" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(200,169,110,0.4)", marginBottom: "10px" }}>WHAT YOUR RECORD IS SHOWING</div>
                {insights.map((insight, i) => (
                  <div key={i} style={{ padding: "12px 16px", marginBottom: "8px", borderLeft: `2px solid ${insight.type === "rising" ? "#A8C8A0" : "#C8907A"}`, background: "rgba(200,169,110,0.03)", borderRadius: "0 6px 6px 0" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "rgba(200,169,110,0.7)", fontStyle: "italic", lineHeight: 1.5 }}>{insight.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ margin: "24px 0 20px" }}>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", color: "rgba(200,169,110,0.4)", marginBottom: "10px" }}>WHAT DOES YOUR MAP REVEAL? (optional)</label>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What surprises you? What doesn't? What are you ready to see clearly?" rows={4}
                style={{ width: "100%", background: "rgba(200,169,110,0.03)", border: "1px solid rgba(200,169,110,0.12)", borderRadius: "8px", color: "#E8D5B0", fontFamily: "Georgia, serif", fontSize: "14px", padding: "14px 16px", outline: "none", fontStyle: "italic", lineHeight: 1.6 }} />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", color: "rgba(200,169,110,0.4)", marginBottom: "10px" }}>IF ONE DOMAIN GETS YOUR ATTENTION THIS MONTH (optional)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {DOMAINS.map(d => {
                  const s = completedScores[d.key];
                  return (
                    <button key={d.key} onClick={() => setOneThingDomain(oneThingDomain === d.key ? "" : d.key)}
                      style={{ padding: "10px 14px", background: oneThingDomain === d.key ? "rgba(200,169,110,0.12)" : "rgba(200,169,110,0.02)", border: `1px solid ${oneThingDomain === d.key ? "rgba(200,169,110,0.4)" : "rgba(200,169,110,0.08)"}`, borderRadius: "6px", color: oneThingDomain === d.key ? "#E8D5B0" : "rgba(200,169,110,0.5)", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "12px", textAlign: "left", transition: "all 0.15s" }}>
                      <div>{d.label}</div>
                      <div style={{ fontSize: "10px", color: getTierColor(s), marginTop: "2px" }}>{s} · {getScaleEntry(s)?.tier}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, marginBottom: "10px", opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Saving..." : "Save to Your Record"}
            </button>
            <button onClick={() => setView("scan")} style={btnSecondary}>← Adjust my assessment</button>
          </div>
        )}

        {/* ── SAVED ── */}
        {view === "saved" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "52px", fontWeight: "300", color: "#C8A96E", marginBottom: "8px" }}>Recorded.</div>
            <p style={{ fontSize: "15px", color: "rgba(200,169,110,0.55)", fontStyle: "italic", lineHeight: 1.7, maxWidth: "380px", margin: "0 auto 32px", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Your pulse is on record. Return next month and watch the pattern emerge.
            </p>
            <PulseWheel scores={completedScores} size={260} />
            {oneThingDomain && (
              <div style={{ marginTop: "24px", padding: "20px", border: "1px solid rgba(200,169,110,0.12)", borderRadius: "8px", display: "inline-block", minWidth: "240px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(200,169,110,0.35)", marginBottom: "8px" }}>YOUR FOCUS THIS MONTH</div>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#E8D5B0", fontWeight: "500" }}>{DOMAINS.find(d => d.key === oneThingDomain)?.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(200,169,110,0.5)", fontStyle: "italic", marginTop: "4px" }}>{getScaleEntry(completedScores[oneThingDomain])?.label}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "32px", justifyContent: "center" }}>
              <button onClick={resetForm} style={{ padding: "14px 24px", background: "none", border: "1px solid rgba(200,169,110,0.15)", color: "rgba(200,169,110,0.5)", borderRadius: "6px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "11px", letterSpacing: "0.1em" }}>DONE</button>
              <button onClick={() => setView("history")} style={{ padding: "14px 24px", background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.25)", color: "#C8A96E", borderRadius: "6px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "11px", letterSpacing: "0.1em" }}>VIEW MY RECORD</button>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {view === "history" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
              <button onClick={() => setView("intro")} style={{ background: "none", border: "1px solid rgba(200,169,110,0.2)", color: "rgba(200,169,110,0.5)", padding: "6px 14px", borderRadius: "4px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "11px", letterSpacing: "0.08em" }}>← BACK</button>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", color: "#E8D5B0", fontWeight: "400", margin: 0 }}>Your Record</h2>
            </div>

            {history.length === 0 ? (
              <p style={{ color: "rgba(200,169,110,0.4)", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>No check-ins yet. Complete your first Pulse to begin your record.</p>
            ) : (
              <>
                {history.length > 1 && (
                  <div style={{ padding: "20px", border: "1px solid rgba(200,169,110,0.1)", borderRadius: "10px", marginBottom: "24px", background: "rgba(200,169,110,0.02)" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(200,169,110,0.35)", marginBottom: "14px" }}>DOMAIN TRENDS</div>
                    {DOMAINS.map(d => {
                      const values = history.map(h => h.scores[d.key]);
                      const latest = values[values.length - 1];
                      const prev = values[values.length - 2];
                      const trend = Math.round((latest - prev) * 2) / 2;
                      return (
                        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <span style={{ width: "85px", fontSize: "12px", color: "rgba(200,169,110,0.6)", flexShrink: 0 }}>{d.label}</span>
                          <div style={{ flex: 1, height: "4px", background: "rgba(200,169,110,0.08)", borderRadius: "2px" }}>
                            <div style={{ height: "100%", width: `${latest * 10}%`, background: getTierColor(latest), borderRadius: "2px" }} />
                          </div>
                          <span style={{ fontSize: "11px", color: getTierColor(latest), width: "70px", textAlign: "right" }}>{getScaleEntry(latest)?.tier}</span>
                          <span style={{ fontSize: "12px", width: "32px", textAlign: "right", color: trend > 0 ? "#A8C8A0" : trend < 0 ? "#C8907A" : "rgba(200,169,110,0.3)", fontWeight: "bold" }}>
                            {trend > 0 ? `+${trend}` : trend < 0 ? trend : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {insights.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "rgba(200,169,110,0.35)", marginBottom: "10px" }}>YOUR RECORD IS NOTICING</div>
                    {insights.map((insight, i) => (
                      <div key={i} style={{ padding: "12px 16px", marginBottom: "8px", borderLeft: `2px solid ${insight.type === "rising" ? "#A8C8A0" : "#C8907A"}`, background: "rgba(200,169,110,0.03)", borderRadius: "0 6px 6px 0" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(200,169,110,0.65)", fontStyle: "italic", lineHeight: 1.5 }}>{insight.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {[...history].reverse().map((entry, idx) => (
                  <HistoryCard key={idx} entry={entry} expanded={expandedHistory === idx} onExpand={() => setExpandedHistory(expandedHistory === idx ? null : idx)} />
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
