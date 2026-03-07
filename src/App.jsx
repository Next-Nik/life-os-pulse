import { useState, useEffect } from "react";

// ============================================================
// STORAGE LAYER
// Currently: localStorage for testing.
// Supabase swap — replace these functions only, nothing else changes:
//
//   import { supabase } from "./supabaseClient"
//
//   async function loadData() {
//     const { data } = await supabase
//       .from('pulse_entries')
//       .select('*')
//       .order('date', { ascending: true });
//     return data || { weekly: [], daily: [] };
//   }
//
//   async function saveData(data) {
//     await supabase.from('pulse_entries').upsert(data);
//     return true;
//   }
// ============================================================

const STORAGE_KEY = "life_os_pulse_v2";

async function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { weekly: [], daily: [] };
  } catch (e) {
    return { weekly: [], daily: [] };
  }
}

async function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================
// DESIGN TOKENS
// ============================================================

const T = {
  gold:        "#C8A96E",
  goldLight:   "#C8A96E",
  goldMid:     "#B8943A",
  goldMuted:   "#6B6B6B",
  goldFaint:   "rgba(200,169,110,0.10)",
  goldBorder:  "rgba(200,169,110,0.25)",
  goldBorderHi:"rgba(200,169,110,0.55)",
  goldGlow:    "#FFFFFF",
  bg:          "#FAFAF7",
  text:        "#1A1A1A",
  textBody:    "#4A4A4A",
  textMeta:    "#6B6B6B",
  card:        "#FFFFFF",
  green:       "#4A7A44",
  amber:       "#8A7030",
  orange:      "#8A5030",
  red:         "#8A3030",
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontBody:    "Georgia, serif",
};

// ============================================================
// DATA
// ============================================================

const HORIZON_SCALE = [
  { value: 10,  tier: "World-Class",  label: "Complete coherence",      description: "Effortless mastery. Luminous presence. Contribution that uplifts everyone around you. The art and the artist are one." },
  { value: 9.5, tier: "Exemplar+",    label: "Integrated and at ease",  description: "Leading by example without effort. Influence radiates naturally. Others orient toward you." },
  { value: 9,   tier: "Exemplar",     label: "Excellence feels natural", description: "Deeply skilled, balanced, reliable. You are not striving — you are expressing." },
  { value: 8.5, tier: "Fluent+",      label: "Competence meets wisdom", description: "Solid and growing. You bring both skill and perspective. Depth is increasing." },
  { value: 8,   tier: "Fluent",       label: "Steady and grounded",     description: "Strong foundations. Consistent excellence. Self-aware and calm under pressure." },
  { value: 7.5, tier: "Capable+",     label: "Building confidence",     description: "Clear progress. Deliberate practice paying off. You can feel the momentum." },
  { value: 7,   tier: "Capable",      label: "Dependable and engaged",  description: "Showing up reliably. Purposeful. Contributing well." },
  { value: 6.5, tier: "Functional+",  label: "Rebuilding rhythm",       description: "Mostly consistent. Habits stabilising. Pacing yourself. Moving in the right direction." },
  { value: 6,   tier: "Functional",   label: "Managing the basics",     description: "Holding it together. Responsible and competent. Sometimes fatigued." },
  { value: 5.5, tier: "Plateau+",     label: "Something stirring",      description: "Curiosity returning. Not quite moving yet, but the stillness is ending." },
  { value: 5,   tier: "Plateau",      label: "Holding steady",          description: "Maintaining without expanding. Uninspired but not in pain. The viability threshold." },
  { value: 4.5, tier: "Friction+",    label: "Awareness of stuckness",  description: "Restless. You can feel that something needs to change. Not yet moving." },
  { value: 4,   tier: "Friction",     label: "Stuck but willing",       description: "Desire present, momentum low. Self-judgment softening into openness." },
  { value: 3.5, tier: "Strain+",      label: "Fatigue and doubt",       description: "Inconsistent. Overwhelmed at times. Starting to see the pattern you're in." },
  { value: 3,   tier: "Strain",       label: "Contracted",              description: "Energy collapsed inward. Fear or shame present. Rest, not force, is what's needed." },
  { value: 2.5, tier: "Crisis+",      label: "Holding on",              description: "High stress, low support. Survival instincts active. One day at a time." },
  { value: 2,   tier: "Crisis",       label: "Depleted",                description: "Basics unmet. Clarity lost. Exhaustion or anxiety is chronic." },
  { value: 1.5, tier: "Emergency+",   label: "Deep pain or numb",       description: "Alternating between intensity and shutdown. Not okay, and that is real." },
  { value: 1,   tier: "Emergency",    label: "Disconnected",            description: "Spiritually or emotionally collapsed. The light has dimmed. Support is needed." },
  { value: 0,   tier: "Ground Zero",  label: "Complete reset",          description: "End of a cycle. Everything cleared. Stillness before what comes next." },
];

const DOMAINS = [
  { key: "path",          label: "Path",         description: "Your calling, contribution & the work you're here to do" },
  { key: "spark",         label: "Spark",        description: "The animating fire — aliveness, joy, play & the godspark" },
  { key: "body",          label: "Body",         description: "Physical vitality, health, energy & embodiment" },
  { key: "finances",      label: "Finances",     description: "Your relationship with money, resources & abundance" },
  { key: "relationships", label: "Relationships",description: "Intimacy, friendship, community & belonging" },
  { key: "innergame",     label: "Inner Game",   description: "Your relationship with yourself — beliefs, values & self-trust" },
  { key: "outergame",     label: "Outer Game",   description: "How you show up in the world — presence, expression & public identity" },
];

const BEHAVIOUR_SIGNALS = [
  { key: "slept_well",      label: "Slept well",                    group: "body" },
  { key: "moved",           label: "Moved my body",                 group: "body" },
  { key: "nourished",       label: "Nourished well",                group: "body" },
  { key: "depleted",        label: "Physically depleted",           group: "body" },
  { key: "meaningful_work", label: "Meaningful work done",          group: "work" },
  { key: "creative_output", label: "Creative output happened",      group: "work" },
  { key: "avoided",         label: "Avoided something important",   group: "work" },
  { key: "in_flow",         label: "In flow today",                 group: "work" },
  { key: "connected",       label: "Connected with someone",        group: "relating" },
  { key: "solitude",        label: "Time in solitude",              group: "relating" },
  { key: "conflict",        label: "Conflict or tension present",   group: "relating" },
  { key: "felt_seen",       label: "Felt seen today",               group: "relating" },
  { key: "stillness",       label: "Stillness or reflection",       group: "inner" },
  { key: "alive",           label: "Something felt alive today",    group: "inner" },
  { key: "heavy",           label: "Carrying something heavy",      group: "inner" },
  { key: "money_mind",      label: "Money on my mind",              group: "inner" },
  { key: "nature",          label: "Time in nature",                group: "environment" },
  { key: "overstimulated",  label: "Overstimulated / overwhelmed",  group: "environment" },
  { key: "good_energy",     label: "Good energy in my environment", group: "environment" },
];

const SIGNAL_GROUPS = [
  { label: "MOVEMENT & BODY", keys: ["slept_well","moved","nourished","depleted"] },
  { label: "WORK & OUTPUT",   keys: ["meaningful_work","creative_output","avoided","in_flow"] },
  { label: "CONNECTION",      keys: ["connected","solitude","conflict","felt_seen"] },
  { label: "INNER",           keys: ["stillness","alive","heavy","money_mind"] },
  { label: "ENVIRONMENT",     keys: ["nature","overstimulated","good_energy"] },
];

const SCALE_BANDS = [
  { label: "Exemplar → World-Class", range: "8 – 10",   color: T.green  },
  { label: "Capable → Fluent",       range: "6.5 – 7.5", color: T.gold  },
  { label: "Functional → Plateau",   range: "5 – 6",    color: T.amber  },
  { label: "Friction → Strain",      range: "3 – 4.5",  color: T.orange },
  { label: "Crisis → Ground Zero",   range: "0 – 2.5",  color: T.red    },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ============================================================
// HELPERS
// ============================================================

function formatDate(iso) {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getTierColor(value) {
  if (value >= 8)   return T.green;
  if (value >= 6.5) return T.gold;
  if (value >= 5)   return T.amber;
  if (value >= 3)   return T.orange;
  return T.red;
}

function getScaleEntry(value) {
  if (value == null) return null;
  const rounded = Math.round(value * 2) / 2;
  return HORIZON_SCALE.find(s => s.value === rounded) || HORIZON_SCALE[HORIZON_SCALE.length - 1];
}

function calcAvg(scores) {
  const vals = Object.values(scores).filter(v => v != null);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function getInsights(weeklyHistory) {
  if (weeklyHistory.length < 2) return [];
  const insights = [];
  DOMAINS.forEach(d => {
    const recent = weeklyHistory.slice(-3).map(h => h.scores[d.key]).filter(s => s != null);
    if (recent.length >= 2) {
      const allLow   = recent.every(s => s <= 4);
      const dropping = recent[recent.length - 1] < recent[0] - 1;
      const rising   = recent[recent.length - 1] > recent[0] + 1;
      if (allLow)         insights.push({ type: "persistent", domain: d.label, message: `${d.label} has been in Friction or below for ${recent.length} consecutive check-ins.` });
      else if (dropping)  insights.push({ type: "declining",  domain: d.label, message: `${d.label} has been declining across your recent check-ins.` });
      else if (rising)    insights.push({ type: "rising",     domain: d.label, message: `${d.label} is showing consistent upward movement. Something is working.` });
    }
  });
  return insights;
}

function getRecentDailyEntries(dailyHistory, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return (dailyHistory || []).filter(e => new Date(e.date).getTime() > cutoff);
}

// ============================================================
// AI AGENT
// ============================================================

async function callAgent(systemPrompt, userMessage) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No API key configured. Add VITE_ANTHROPIC_API_KEY to your .env file.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

const AGENT_SYSTEM_PROMPT = `You are the reflection agent for Life OS: Pulse — a personal development tool built on the Horizon Scale.

THE HORIZON SCALE
The scale runs 0–10 in 0.5 increments across four bands:
- 0–3: Stabilise (Emergency through Strain) — needs rest and restoration, not expansion
- 4–6: Rebuild (Friction through Functional) — structure forming, consistency over intensity
- 7–8: Develop (Capable through Fluent) — solid foundation, intentional growth available
- 9–10: Steward (Exemplar through World-Class) — mastery in service, contribution

THE SEVEN DOMAINS
- Path: calling, contribution, the work someone is here to do
- Spark: the animating fire — aliveness, joy, play, the godspark. The question: is the fire on?
- Body: physical vitality, health, energy, embodiment. Honour the instrument.
- Finances: relationship with money and resources — sufficiency and right relationship, not just wealth
- Relationships: intimacy, friendship, community, belonging — genuine contact, not just adjacency
- Inner Game: relationship with self — beliefs, values, self-trust, inner authority. Are they on their own side?
- Outer Game: how someone shows up in the world — presence, expression, public identity. Does how they show up reflect who they are?

KEY DOMAIN COUPLINGS (notice these in the data)
- Inner Game → Path: when self-trust builds, purposeful action follows
- Body declining → often a leading indicator for systemic strain across domains
- Finances ↔ Path: a large gap between these two is one of the most common sources of chronic friction
- Outer Game lagging Path: high Path + low Outer Game often signals readiness at a threshold, not a capacity problem
- Spark low despite stable other domains: functioning but not living

YOUR VOICE
You are a senior practitioner — warm but not familiar, precise but not clinical. You witness; you do not fix. You notice; you do not prescribe. You orient toward desire and agency — what someone wants and how to get there — rather than reflecting back complaint or blame.

Deliver language flat, low, matter-of-fact. Devoted through steadiness, not emotional display.

Never say: "you should", "you need to", "that's amazing", "incredible", "I can see", "I notice"
Never: diagnose, pathologise, compare to others, catastrophise low scores, ask more than one question
Always: name what the data shows, hold low scores without alarm, use "yes and" architecture — validate current reality then gently expand scope

SCOPE
You are not a therapist. You are not a coach. You do not process emotional material. You do not provide action plans. You hold the map and reflect the pattern. If scores are in Emergency or Crisis bands (0–2.5) across multiple domains, respond with particular steadiness and gently note that professional support may be valuable alongside this practice.

RESPONSE LENGTH
- Weekly synthesis: 100–180 words. End with one question or observation only.
- Monthly reflection: 180–280 words. End with one question or observation only.`;

function buildWeeklySynthesisPrompt(weeklyEntry, recentDailyEntries, previousWeekly) {
  const scores = weeklyEntry.scores;
  const avg = calcAvg(scores);
  const avgEntry = getScaleEntry(parseFloat(avg));

  const domainLines = DOMAINS.map(d => {
    const s = scores[d.key];
    const note = weeklyEntry.sayMore?.[d.key];
    return `${d.label}: ${s} (${getScaleEntry(s)?.tier})${note ? ` — "${note}"` : ""}`;
  }).join("\n");

  const dailyLines = recentDailyEntries.length
    ? recentDailyEntries.map(e => {
        const active = BEHAVIOUR_SIGNALS.filter(s => e.signals?.[s.key]).map(s => s.label);
        const domainScores = e.scores ? DOMAINS.map(d => `${d.label} ${e.scores[d.key] ?? "—"}`).join(", ") : (e.energy ? `Energy: ${e.energy}/10` : "—");
        return `${formatDate(e.date)} — ${domainScores} — Focus: ${DOMAINS.find(d => d.key === e.loudestDomain)?.label || "—"} — Signals: ${active.join(", ") || "none"} — "${e.note || e.word || ""}"`;
      }).join("\n")
    : "No daily signals this week.";

  const historyLines = previousWeekly.slice(-2).map(h => {
    const a = calcAvg(h.scores);
    return `${formatDate(h.date)}: avg ${a} — ${DOMAINS.map(d => `${d.label} ${h.scores[d.key]}`).join(", ")}`;
  }).join("\n") || "No previous history.";

  return `WEEKLY PULSE — ${formatDate(weeklyEntry.date)}
Overall average: ${avg} (${avgEntry?.tier})

DOMAIN SCORES:
${domainLines}

DAILY SIGNALS THIS WEEK (${recentDailyEntries.length} entries):
${dailyLines}

PREVIOUS WEEKS:
${historyLines}

${weeklyEntry.reflection ? `REFLECTION NOTE: "${weeklyEntry.reflection}"` : ""}
${weeklyEntry.oneThingDomain ? `FOCUS DOMAIN: ${DOMAINS.find(d => d.key === weeklyEntry.oneThingDomain)?.label}` : ""}

Generate a weekly synthesis. Name what the data shows — domain patterns, correlations with behaviour signals, movement since last week. Hold low scores without alarm. End with one question or observation.`;
}

function buildMonthlyReflectionPrompt(weeklyHistory, dailyHistory) {
  const recent = weeklyHistory.slice(-4);
  const avgTrend = recent.map(h => `${formatDate(h.date)}: ${calcAvg(h.scores)}`).join(", ");

  const domainTrends = DOMAINS.map(d => {
    const vals = recent.map(h => h.scores[d.key]).filter(v => v != null);
    const first = vals[0], last = vals[vals.length - 1];
    const delta = first != null && last != null ? (last - first).toFixed(1) : "n/a";
    return `${d.label}: ${vals.join(" → ")} (change: ${delta})`;
  }).join("\n");

  const recentSignals = getRecentDailyEntries(dailyHistory, 30);
  const signalCounts = {};
  BEHAVIOUR_SIGNALS.forEach(s => { signalCounts[s.label] = recentSignals.filter(e => e.signals?.[s.key]).length; });
  const topSignals = Object.entries(signalCounts).filter(([,c]) => c > 0).sort((a,b) => b[1]-a[1]).slice(0,6).map(([l,c]) => `${l}: ${c}x`).join(", ");

  return `MONTHLY REFLECTION — ${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}

AVERAGE TREND (last 4 weekly check-ins):
${avgTrend}

DOMAIN MOVEMENT:
${domainTrends}

TOP BEHAVIOUR SIGNALS THIS MONTH:
${topSignals || "Insufficient data."}

Generate a monthly reflection. Look at the arc — what is shifting, what is holding, what patterns are visible across the month that weren't obvious week-to-week. Note significant domain correlations. If any domain has been persistently below 5, name it. End with one question or observation.`;
}

// ============================================================
// CSS
// ============================================================

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAFAF7; color: #1A1A1A; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.35); border-radius: 2px; }
  textarea { resize: vertical; }
  input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; cursor: pointer; }
  input[type=range]::-webkit-slider-runnable-track { height: 2px; background: rgba(200,169,110,0.25); border-radius: 1px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #C8A96E; margin-top: -8px; }
  ::placeholder { color: #BBAB90; font-style: italic; }
`;

// ============================================================
// SHARED COMPONENTS
// ============================================================

function SectionLabel({ children }) {
  return <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: T.gold, marginBottom: "12px", fontFamily: T.fontBody, fontWeight: "600" }}>{children}</div>;
}

function Divider({ margin = "28px 0" }) {
  return <div style={{ borderBottom: "1px solid rgba(200,169,110,0.3)", margin }} />;
}

function InsightCard({ insight }) {
  const isRising = insight.type === "rising";
  return (
    <div style={{ padding: "13px 16px", marginBottom: "8px", borderLeft: `3px solid ${isRising ? T.green : T.orange}`, background: isRising ? "rgba(74,122,68,0.05)" : "rgba(138,80,48,0.05)", borderRadius: "0 6px 6px 0" }}>
      <p style={{ margin: 0, fontSize: "13px", color: isRising ? T.green : T.orange, fontStyle: "italic", lineHeight: 1.6 }}>{insight.message}</p>
    </div>
  );
}

function AgentReflection({ text, loading, error }) {
  if (loading) return (
    <div style={{ padding: "24px", border: `1px solid ${T.goldBorder}`, borderRadius: "10px", background: T.card, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ color: T.gold, fontFamily: T.fontDisplay, fontSize: "16px", fontStyle: "italic" }}>Reading your map...</div>
    </div>
  );
  if (error) return (
    <div style={{ padding: "16px", border: "1px solid rgba(138,80,48,0.2)", borderRadius: "10px", background: "rgba(138,80,48,0.04)" }}>
      <p style={{ color: T.orange, fontSize: "13px", margin: 0 }}>{error}</p>
    </div>
  );
  if (!text) return null;
  return (
    <div style={{ padding: "22px 24px", border: `1px solid ${T.goldBorderHi}`, borderRadius: "10px", background: T.card, borderLeft: `3px solid ${T.gold}`, boxShadow: "0 2px 8px rgba(200,169,110,0.08)" }}>
      <SectionLabel>YOUR REFLECTION</SectionLabel>
      <p style={{ margin: 0, fontSize: "15px", color: T.textBody, fontFamily: T.fontDisplay, fontStyle: "italic", lineHeight: 1.8, fontWeight: "400" }}>{text}</p>
    </div>
  );
}

// ============================================================
// PULSE WHEEL
// ============================================================

function PulseWheel({ scores, size = 320 }) {
  const cx = size / 2, cy = size / 2, maxR = size * 0.37, n = DOMAINS.length;
  const getPoint = (i, s) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = maxR * ((s ?? 5) / 10);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const getLabelPoint = (i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + maxR * 1.26 * Math.cos(a), y: cy + maxR * 1.26 * Math.sin(a) };
  };
  const polygonPoints = DOMAINS.map((d, i) => { const p = getPoint(i, scores[d.key] ?? 5); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[2,4,6,8,10].map(r => {
        const pts = DOMAINS.map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; const rad = maxR * (r / 10); return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`; }).join(" ");
        return <polygon key={r} points={pts} fill="none" stroke="rgba(200,169,110,0.2)" strokeWidth="1" />;
      })}
      {DOMAINS.map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)} stroke="rgba(200,169,110,0.2)" strokeWidth="1" />; })}
      <polygon points={polygonPoints} fill="rgba(200,169,110,0.1)" stroke={T.gold} strokeWidth="1.5" strokeLinejoin="round" style={{ transition: "all 0.4s ease" }} />
      {DOMAINS.map((d, i) => { const s = scores[d.key] ?? 5; const p = getPoint(i, s); return <circle key={d.key} cx={p.x} cy={p.y} r={4} fill={getTierColor(s)} stroke={T.bg} strokeWidth="1.5" />; })}
      {DOMAINS.map((d, i) => {
        const lp = getLabelPoint(i); const s = scores[d.key] ?? 5;
        return (
          <g key={d.key}>
            <text x={lp.x} y={lp.y - 7} textAnchor="middle" fill="#1A1A1A" fontSize="11" fontFamily={T.fontDisplay} fontWeight="600">{d.label}</text>
            <text x={lp.x} y={lp.y + 7} textAnchor="middle" fill={getTierColor(s)} fontSize="9.5" fontFamily={T.fontBody} opacity="0.85">{getScaleEntry(s)?.tier}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={2.5} fill="rgba(200,169,110,0.25)" />
    </svg>
  );
}

// ============================================================
// HORIZON SCALE PICKER
// ============================================================

function HorizonScalePicker({ domain, value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const selected = getScaleEntry(value);
  return (
    <div style={{ marginBottom: "12px", border: `1px solid ${expanded ? T.goldBorderHi : T.goldBorder}`, borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s", background: T.card, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "19px", fontWeight: "600", color: T.text }}>{domain.label}</div>
          <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic", marginTop: "3px" }}>{domain.description}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {value !== null ? (
            <>
              <div style={{ fontFamily: T.fontDisplay, fontSize: "28px", fontWeight: "700", color: getTierColor(value), lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: "10px", color: getTierColor(value), opacity: 0.85, marginTop: "2px" }}>{selected?.tier}</div>
            </>
          ) : <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic" }}>tap to assess</div>}
        </div>
      </div>
      {value !== null && !expanded && (
        <div style={{ padding: "0 20px 14px", borderTop: "1px solid rgba(200,169,110,0.15)" }}>
          <p style={{ fontSize: "12px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>"{selected?.description}"</p>
          <button onClick={e => { e.stopPropagation(); setExpanded(true); }} style={{ marginTop: "8px", background: "none", border: "none", color: T.gold, fontSize: "10px", cursor: "pointer", padding: 0, fontFamily: T.fontBody, letterSpacing: "0.12em" }}>CHANGE →</button>
        </div>
      )}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(200,169,110,0.15)", maxHeight: "400px", overflowY: "auto" }}>
          <div style={{ padding: "10px 16px 6px", fontSize: "9px", color: T.textMeta, letterSpacing: "0.18em" }}>READ EACH LEVEL — SELECT WHERE YOU RECOGNISE YOURSELF TODAY</div>
          {HORIZON_SCALE.map(entry => {
            const isSel = value === entry.value;
            return (
              <div key={entry.value} onClick={() => { onChange(entry.value); setExpanded(false); }}
                style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid rgba(200,169,110,0.1)", background: isSel ? "rgba(200,169,110,0.08)" : "transparent", transition: "background 0.12s", display: "flex", gap: "14px", alignItems: "flex-start" }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(200,169,110,0.04)"; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: "42px" }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "20px", fontWeight: "700", color: getTierColor(entry.value), lineHeight: 1 }}>{entry.value}</div>
                  <div style={{ fontSize: "9px", color: getTierColor(entry.value), opacity: 0.8, marginTop: "2px" }}>{entry.tier}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: "600", color: T.text, marginBottom: "3px" }}>{entry.label}</div>
                  <div style={{ fontSize: "12px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.55 }}>{entry.description}</div>
                </div>
                {isSel && <div style={{ color: getTierColor(entry.value), fontSize: "14px", flexShrink: 0, marginTop: "4px" }}>✓</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// HISTORY CARD
// ============================================================

function HistoryCard({ entry, expanded, onExpand }) {
  const avg = calcAvg(entry.scores);
  return (
    <div onClick={onExpand} style={{ border: `1px solid ${expanded ? T.goldBorderHi : T.goldBorder}`, borderRadius: "10px", overflow: "hidden", marginBottom: "10px", background: T.card, cursor: "pointer", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "17px", color: T.text, fontWeight: "600" }}>{formatDate(entry.date)}</div>
          {entry.oneThingDomain && <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic", marginTop: "3px" }}>Focus: {DOMAINS.find(d => d.key === entry.oneThingDomain)?.label}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "30px", color: getTierColor(parseFloat(avg)), fontWeight: "700", lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: "10px", color: T.textMeta, letterSpacing: "0.08em", marginTop: "2px" }}>{getScaleEntry(parseFloat(avg))?.tier}</div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(200,169,110,0.15)", padding: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center", marginBottom: "16px" }}>
            <PulseWheel scores={entry.scores} size={200} />
            <div style={{ flex: 1, minWidth: "160px" }}>
              {DOMAINS.map(d => (
                <div key={d.key} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: T.textMeta }}>{d.label}</span>
                    <span style={{ fontSize: "11px", color: getTierColor(entry.scores[d.key]), fontWeight: "bold" }}>{entry.scores[d.key]} · {getScaleEntry(entry.scores[d.key])?.tier}</span>
                  </div>
                  <div style={{ height: "2px", background: "rgba(200,169,110,0.15)", borderRadius: "1px" }}>
                    <div style={{ height: "100%", width: `${entry.scores[d.key] * 10}%`, background: getTierColor(entry.scores[d.key]), borderRadius: "1px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {entry.reflection && (
            <div style={{ padding: "13px 16px", background: "rgba(200,169,110,0.05)", borderLeft: `3px solid ${T.gold}`, borderRadius: "0 6px 6px 0", marginBottom: entry.agentReflection ? "12px" : 0 }}>
              <SectionLabel>REFLECTION</SectionLabel>
              <p style={{ margin: 0, fontSize: "13px", color: T.textBody, fontStyle: "italic", lineHeight: 1.65 }}>{entry.reflection}</p>
            </div>
          )}
          {entry.agentReflection && <AgentReflection text={entry.agentReflection} />}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DAILY DOMAIN PICKER — hybrid: collapsed by default, expandable
// ============================================================

function DailyDomainPicker({ domain, value, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const selected = getScaleEntry(value);

  return (
    <div style={{ marginBottom: "8px", border: `1px solid ${expanded ? T.goldBorderHi : T.goldBorder}`, borderRadius: "10px", overflow: "hidden", background: T.card, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Collapsed row */}
      <div onClick={() => setExpanded(!expanded)}
        style={{ padding: "13px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: "16px", fontWeight: "600", color: T.text }}>{domain.label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {value !== null ? (
            <>
              <span style={{ fontSize: "11px", color: getTierColor(value), fontStyle: "italic" }}>{selected?.tier}</span>
              <span style={{ fontFamily: T.fontDisplay, fontSize: "22px", fontWeight: "700", color: getTierColor(value), lineHeight: 1 }}>{value}</span>
            </>
          ) : (
            <span style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic" }}>tap to score</span>
          )}
          <span style={{ color: T.textMeta, fontSize: "10px" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded level list */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(200,169,110,0.15)", maxHeight: "320px", overflowY: "auto" }}>
          <div style={{ padding: "8px 16px 4px", fontSize: "9px", color: T.textMeta, letterSpacing: "0.18em" }}>READ THE LEVELS — CHOOSE THE ONE THAT MATCHES TODAY</div>
          {HORIZON_SCALE.map(entry => {
            const isSel = value === entry.value;
            return (
              <div key={entry.value} onClick={() => { onChange(entry.value); setExpanded(false); }}
                style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid rgba(200,169,110,0.08)", background: isSel ? "rgba(200,169,110,0.08)" : "transparent", transition: "background 0.12s", display: "flex", gap: "12px", alignItems: "flex-start" }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(200,169,110,0.04)"; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ flexShrink: 0, textAlign: "center", minWidth: "38px" }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "18px", fontWeight: "700", color: getTierColor(entry.value), lineHeight: 1 }}>{entry.value}</div>
                  <div style={{ fontSize: "8px", color: getTierColor(entry.value), opacity: 0.8, marginTop: "2px" }}>{entry.tier}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "13px", fontWeight: "600", color: T.text, marginBottom: "2px" }}>{entry.label}</div>
                  <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.5 }}>{entry.description}</div>
                </div>
                {isSel && <div style={{ color: getTierColor(entry.value), fontSize: "13px", flexShrink: 0, marginTop: "3px" }}>✓</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DAILY CHECK-IN
// ============================================================

function DailyCheckIn({ onSave, onClose }) {
  const [scores, setScores] = useState(Object.fromEntries(DOMAINS.map(d => [d.key, null])));
  const [loudestDomain, setLoudestDomain] = useState("");
  const [note, setNote] = useState("");
  const [signals, setSignals] = useState({});
  const [saving, setSaving] = useState(false);
  const toggleSignal = k => setSignals(prev => ({ ...prev, [k]: !prev[k] }));
  const scoredCount = DOMAINS.filter(d => scores[d.key] !== null).length;
  const allScored = scoredCount === DOMAINS.length;
  const dailyAvg = allScored ? calcAvg(Object.fromEntries(DOMAINS.map(d => [d.key, scores[d.key] ?? 5]))) : null;

  async function handleSave() {
    setSaving(true);
    await onSave({ date: new Date().toISOString(), type: "daily", scores, loudestDomain, note, signals });
    setSaving(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.goldBorder}`, color: T.textMeta, padding: "7px 14px", borderRadius: "4px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "10px", letterSpacing: "0.12em" }}>← BACK</button>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: "26px", color: T.text, fontWeight: "400" }}>Check Your Pulse</div>
          <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic", marginTop: "2px" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      {/* Progress + avg */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: T.gold, letterSpacing: "0.12em", fontWeight: "600" }}>{scoredCount} OF {DOMAINS.length} DOMAINS</span>
          {dailyAvg && <span style={{ fontFamily: T.fontDisplay, fontSize: "14px", color: getTierColor(parseFloat(dailyAvg)), fontWeight: "600" }}>{dailyAvg} · {getScaleEntry(parseFloat(dailyAvg))?.tier}</span>}
        </div>
        <div style={{ height: "2px", background: "rgba(200,169,110,0.15)", borderRadius: "1px" }}>
          <div style={{ height: "100%", width: `${(scoredCount / DOMAINS.length) * 100}%`, background: T.gold, borderRadius: "1px", transition: "width 0.3s ease" }} />
        </div>
      </div>

      <p style={{ fontSize: "12px", color: T.textMeta, fontStyle: "italic", marginBottom: "18px", lineHeight: 1.6, fontFamily: T.fontDisplay }}>
        Read the levels and choose the one that matches today.
      </p>

      {/* 7 domain pickers */}
      {DOMAINS.map(d => (
        <DailyDomainPicker key={d.key} domain={d} value={scores[d.key]}
          onChange={val => setScores(prev => ({ ...prev, [d.key]: val }))} />
      ))}

      <div style={{ marginTop: "24px", marginBottom: "20px" }}>
        <SectionLabel>A NOTE FROM TODAY (optional)</SectionLabel>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} maxLength={80}
          placeholder="scattered / present / something shifting..."
          style={{ width: "100%", background: T.card, border: `1px solid ${T.goldBorder}`, borderRadius: "8px", color: T.text, fontFamily: T.fontDisplay, fontSize: "15px", fontStyle: "italic", padding: "13px 16px", outline: "none" }}
          onFocus={e => { e.currentTarget.style.borderColor = T.goldBorderHi; }}
          onBlur={e => { e.currentTarget.style.borderColor = T.goldBorder; }} />
      </div>

      {/* Loudest domain */}
      <div style={{ marginBottom: "24px" }}>
        <SectionLabel>WHAT DOMAIN IS LOUDEST TODAY? (optional)</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {DOMAINS.map(d => (
            <button key={d.key} onClick={() => setLoudestDomain(loudestDomain === d.key ? "" : d.key)}
              style={{ padding: "10px 14px", background: loudestDomain === d.key ? "rgba(200,169,110,0.1)" : T.card, border: `1px solid ${loudestDomain === d.key ? T.goldBorderHi : T.goldBorder}`, borderRadius: "8px", color: loudestDomain === d.key ? T.text : T.textMeta, cursor: "pointer", fontFamily: T.fontDisplay, fontSize: "14px", fontWeight: "600", textAlign: "left", transition: "all 0.15s" }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Behaviour signals */}
      <div style={{ marginBottom: "32px" }}>
        <SectionLabel>MARK WHAT APPLIES TODAY (optional)</SectionLabel>
        {SIGNAL_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "9px", color: T.textMeta, letterSpacing: "0.15em", marginBottom: "8px" }}>{group.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {group.keys.map(key => {
                const sig = BEHAVIOUR_SIGNALS.find(s => s.key === key);
                const active = signals[key];
                return (
                  <button key={key} onClick={() => toggleSignal(key)}
                    style={{ padding: "7px 13px", background: active ? "rgba(200,169,110,0.12)" : T.card, border: `1px solid ${active ? T.goldBorderHi : T.goldBorder}`, borderRadius: "20px", color: active ? T.text : T.textMeta, cursor: "pointer", fontFamily: T.fontBody, fontSize: "12px", transition: "all 0.15s" }}>
                    {sig?.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ width: "100%", padding: "18px", background: T.gold, border: "none", color: "#FFFFFF", borderRadius: "8px", cursor: saving ? "wait" : "pointer", fontFamily: T.fontDisplay, fontSize: "19px", fontWeight: "500", letterSpacing: "0.06em", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving..." : "Log Today's Signal"}
      </button>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [view, setView] = useState("intro");
  const [scores, setScores] = useState(Object.fromEntries(DOMAINS.map(d => [d.key, null])));
  const [sayMore, setSayMore] = useState(Object.fromEntries(DOMAINS.map(d => [d.key, ""])));
  const [reflection, setReflection] = useState("");
  const [oneThingDomain, setOneThingDomain] = useState("");
  const [data, setData] = useState({ weekly: [], daily: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [agentText, setAgentText] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [savedEntry, setSavedEntry] = useState(null);

  const completedScores = Object.fromEntries(DOMAINS.map(d => [d.key, scores[d.key] ?? 5]));
  const allScored = DOMAINS.every(d => scores[d.key] !== null);
  const scoredCount = DOMAINS.filter(d => scores[d.key] !== null).length;
  const avg = allScored ? calcAvg(completedScores) : null;
  const insights = getInsights(data.weekly);

  useEffect(() => { loadData().then(d => { setData(d); setLoading(false); }); }, []);

  async function handleDailySave(entry) {
    const newData = { ...data, daily: [...(data.daily || []), entry] };
    await saveData(newData);
    setData(newData);
    setView("intro");
  }

  async function handleWeeklySave() {
    setSaving(true);
    const entry = { date: new Date().toISOString(), type: "weekly", scores: { ...completedScores }, sayMore: { ...sayMore }, reflection, oneThingDomain };
    const newWeekly = [...(data.weekly || []), entry];
    const newData = { ...data, weekly: newWeekly };
    await saveData(newData);
    setData(newData);
    setSavedEntry(entry);
    setView("saved");
    setSaving(false);
  }

  async function handleRequestReflection(entry) {
    setAgentText(""); setAgentError(""); setAgentLoading(true);
    try {
      const recentDaily = getRecentDailyEntries(data.daily || [], 7);
      const previousWeekly = (data.weekly || []).filter(e => e.date !== entry.date);
      const text = await callAgent(AGENT_SYSTEM_PROMPT, buildWeeklySynthesisPrompt(entry, recentDaily, previousWeekly));
      setAgentText(text);
      const updatedWeekly = (data.weekly || []).map(e => e.date === entry.date ? { ...e, agentReflection: text } : e);
      const newData = { ...data, weekly: updatedWeekly };
      await saveData(newData);
      setData(newData);
    } catch (err) {
      setAgentError("The reflection couldn't be generated. Check your VITE_ANTHROPIC_API_KEY in .env and try again.");
    }
    setAgentLoading(false);
  }

  async function handleRequestMonthlyReflection() {
    setAgentText(""); setAgentError(""); setAgentLoading(true);
    try {
      const text = await callAgent(AGENT_SYSTEM_PROMPT, buildMonthlyReflectionPrompt(data.weekly, data.daily || []));
      setAgentText(text);
    } catch (err) {
      setAgentError("The reflection couldn't be generated. Check your VITE_ANTHROPIC_API_KEY in .env and try again.");
    }
    setAgentLoading(false);
  }

  function resetForm() {
    setScores(Object.fromEntries(DOMAINS.map(d => [d.key, null])));
    setSayMore(Object.fromEntries(DOMAINS.map(d => [d.key, ""])));
    setReflection(""); setOneThingDomain(""); setAgentText(""); setAgentError(""); setSavedEntry(null);
    setView("intro");
  }

  const btnPrimary = { width: "100%", padding: "18px", background: T.gold, border: "none", color: "#FFFFFF", borderRadius: "8px", cursor: "pointer", fontFamily: T.fontDisplay, fontSize: "19px", fontWeight: "500", letterSpacing: "0.06em" };
  const btnSecondary = { width: "100%", padding: "14px", background: "none", border: `1px solid ${T.goldBorder}`, color: T.textMeta, borderRadius: "8px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "11px", letterSpacing: "0.1em" };
  const btnAgent = { width: "100%", padding: "16px", background: T.card, border: `1px solid ${T.goldBorderHi}`, color: T.gold, borderRadius: "8px", cursor: "pointer", fontFamily: T.fontDisplay, fontSize: "16px", fontWeight: "500", letterSpacing: "0.05em", boxShadow: "0 1px 4px rgba(200,169,110,0.1)" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg }}>
      <div style={{ color: T.textMeta, fontFamily: T.fontBody, fontStyle: "italic" }}>Loading your records...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.fontBody }}>
      <style>{css}</style>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "44px 24px 120px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "40px", borderBottom: `1px solid rgba(200,169,110,0.25)`, paddingBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: T.gold, marginBottom: "8px", fontWeight: "600" }}>LIFE OS</div>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: "52px", fontWeight: "300", color: T.text, lineHeight: 1, letterSpacing: "-0.01em" }}>Pulse</h1>
            <p style={{ fontSize: "12px", color: T.textMeta, margin: "8px 0 0", fontStyle: "italic", fontFamily: T.fontDisplay }}>The Horizon Scale self-assessment</p>
          </div>
          {view !== "history" && (
            <button onClick={() => setView("history")}
              style={{ background: T.card, border: `1px solid ${T.goldBorder}`, color: T.textMeta, padding: "9px 16px", borderRadius: "4px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "10px", letterSpacing: "0.15em", flexShrink: 0, marginTop: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldBorderHi; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.color = T.textMeta; }}>
              RECORD {data.weekly.length > 0 ? `(${data.weekly.length})` : ""}
            </button>
          )}
        </div>

        {/* DAILY */}
        {view === "daily" && <DailyCheckIn onSave={handleDailySave} onClose={() => setView("intro")} />}

        {/* INTRO */}
        {view === "intro" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "36px", padding: "36px 24px", border: `1px solid ${T.goldBorder}`, borderRadius: "14px", background: T.card, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <PulseWheel scores={{ path: 7, spark: 5, body: 6.5, finances: 3.5, relationships: 8, innergame: 6, outergame: 4.5 }} size={270} />
              <p style={{ fontSize: "16px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.75, margin: "24px auto 0", fontFamily: T.fontDisplay, maxWidth: "400px" }}>
                Not a rating. A recognition.<br />Read each level and find where you actually are today.
              </p>
            </div>

            <div style={{ marginBottom: "28px", padding: "18px 22px", background: T.card, border: `1px solid ${T.goldBorder}`, borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <SectionLabel>THE HORIZON SCALE</SectionLabel>
              {SCALE_BANDS.map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
                  <span style={{ fontSize: "13px", color: item.color, fontFamily: T.fontDisplay, fontWeight: "500" }}>{item.label}</span>
                  <span style={{ fontSize: "11px", color: T.textMeta }}>{item.range}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {[
                { label: "Daily Signal", sub: "Energy · what's loud · behaviour signals", time: "~2 min", target: "daily" },
                { label: "Weekly Pulse", sub: "Full Horizon Scale across all 7 domains", time: "~10 min", target: "scan" },
              ].map(btn => (
                <button key={btn.target} onClick={() => setView(btn.target)}
                  style={{ padding: "20px 16px", background: T.card, border: `1px solid ${T.goldBorder}`, borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldBorderHi; e.currentTarget.style.boxShadow = "0 2px 8px rgba(200,169,110,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: "18px", color: T.text, fontWeight: "600", marginBottom: "4px" }}>{btn.label}</div>
                  <div style={{ fontSize: "11px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.5 }}>{btn.sub}</div>
                  <div style={{ fontSize: "10px", color: T.gold, marginTop: "8px" }}>{btn.time}</div>
                </button>
              ))}
            </div>

            {data.weekly.length >= 3 && (
              <div style={{ marginTop: "24px" }}>
                <Divider margin="0 0 20px" />
                <SectionLabel>MONTHLY REFLECTION</SectionLabel>
                <button onClick={handleRequestMonthlyReflection} disabled={agentLoading} style={{ ...btnAgent, opacity: agentLoading ? 0.6 : 1 }}>
                  {agentLoading ? "Reading your record..." : "See your monthly reflection →"}
                </button>
                {(agentText || agentError) && <div style={{ marginTop: "16px" }}><AgentReflection text={agentText} loading={false} error={agentError} /></div>}
              </div>
            )}

            {(data.weekly.length > 0 || (data.daily || []).length > 0) && (
              <p style={{ textAlign: "center", fontSize: "11px", color: T.textMeta, fontStyle: "italic", marginTop: "20px" }}>
                {data.weekly.length} weekly check-in{data.weekly.length !== 1 ? "s" : ""} · {(data.daily || []).length} daily signal{(data.daily || []).length !== 1 ? "s" : ""} on record
              </p>
            )}
          </div>
        )}

        {/* SCAN */}
        {view === "scan" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", color: T.gold, letterSpacing: "0.12em", fontWeight: "600" }}>{scoredCount} OF {DOMAINS.length} DOMAINS</span>
                <span style={{ fontSize: "10px", color: T.textMeta, letterSpacing: "0.12em" }}>{allScored ? "COMPLETE" : "IN PROGRESS"}</span>
              </div>
              <div style={{ height: "2px", background: "rgba(200,169,110,0.15)", borderRadius: "1px" }}>
                <div style={{ height: "100%", width: `${(scoredCount / DOMAINS.length) * 100}%`, background: T.gold, borderRadius: "1px", transition: "width 0.4s ease" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
              <PulseWheel scores={completedScores} size={270} />
            </div>
            <p style={{ fontSize: "13px", color: T.textMeta, fontStyle: "italic", textAlign: "center", marginBottom: "24px", lineHeight: 1.65, fontFamily: T.fontDisplay }}>
              Open each domain. Read down through the levels.<br />Select where you recognise yourself today — not where you want to be.
            </p>
            {DOMAINS.map(domain => (
              <HorizonScalePicker key={domain.key} domain={domain} value={scores[domain.key]}
                onChange={val => setScores(prev => ({ ...prev, [domain.key]: val }))} />
            ))}
            <div style={{ marginTop: "12px" }}>
              {allScored
                ? <button onClick={() => setView("sayMore")} style={btnPrimary}>Continue →</button>
                : <div style={{ textAlign: "center", padding: "16px", color: T.textMeta, fontSize: "13px", fontStyle: "italic", fontFamily: T.fontDisplay }}>{DOMAINS.length - scoredCount} domain{DOMAINS.length - scoredCount !== 1 ? "s" : ""} remaining</div>
              }
            </div>
          </div>
        )}

        {/* SAY MORE */}
        {view === "sayMore" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: T.gold, marginBottom: "8px", fontWeight: "600" }}>WEEKLY PULSE</div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "32px", color: T.text, fontWeight: "400", margin: "0 0 6px" }}>Anything to add?</h2>
              <p style={{ fontSize: "12px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.65, fontFamily: T.fontDisplay }}>
                Optional. For any domain where a number alone doesn't capture it — say a little more.
              </p>
            </div>
            {DOMAINS.map(d => {
              const s = completedScores[d.key];
              return (
                <div key={d.key} style={{ marginBottom: "12px", padding: "16px 18px", border: `1px solid ${T.goldBorder}`, borderRadius: "10px", background: T.card, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontFamily: T.fontDisplay, fontSize: "16px", fontWeight: "600", color: T.text }}>{d.label}</div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: T.fontDisplay, fontSize: "20px", fontWeight: "700", color: getTierColor(s) }}>{s}</span>
                      <span style={{ fontSize: "10px", color: getTierColor(s), marginLeft: "6px" }}>{getScaleEntry(s)?.tier}</span>
                    </div>
                  </div>
                  <textarea
                    value={sayMore[d.key]}
                    onChange={e => setSayMore(prev => ({ ...prev, [d.key]: e.target.value }))}
                    placeholder="What's true here today?"
                    rows={2}
                    style={{ width: "100%", background: T.bg, border: `1px solid ${T.goldBorder}`, borderRadius: "6px", color: T.text, fontFamily: T.fontDisplay, fontSize: "13px", fontStyle: "italic", padding: "10px 14px", outline: "none", lineHeight: 1.6, resize: "none" }}
                    onFocus={e => { e.currentTarget.style.borderColor = T.goldBorderHi; e.currentTarget.style.background = T.card; }}
                    onBlur={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.background = T.bg; }}
                  />
                </div>
              );
            })}
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => setView("reveal")} style={btnPrimary}>See Your Map →</button>
              <button onClick={() => setView("scan")} style={btnSecondary}>← Back to scores</button>
            </div>
          </div>
        )}

        {/* REVEAL */}
        {view === "reveal" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <SectionLabel>YOUR LIFE MAP TODAY</SectionLabel>
              <PulseWheel scores={completedScores} size={310} />
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: "58px", fontWeight: "300", color: getTierColor(parseFloat(avg)), lineHeight: 1 }}>{avg}</div>
                <div style={{ fontSize: "10px", color: T.textMeta, letterSpacing: "0.2em", marginTop: "6px" }}>{getScaleEntry(parseFloat(avg))?.tier?.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ marginBottom: "28px" }}>
              {DOMAINS.map(d => {
                const s = completedScores[d.key];
                return (
                  <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 0", borderBottom: "1px solid rgba(200,169,110,0.15)" }}>
                    <div style={{ width: "100px", flexShrink: 0, fontFamily: T.fontDisplay, fontSize: "15px", color: T.text, fontWeight: "600" }}>{d.label}</div>
                    <div style={{ flex: 1, height: "3px", background: "rgba(200,169,110,0.15)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${s * 10}%`, background: getTierColor(s), borderRadius: "2px", transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, minWidth: "110px" }}>
                      <span style={{ fontFamily: T.fontDisplay, fontSize: "18px", fontWeight: "700", color: getTierColor(s) }}>{s}</span>
                      <span style={{ fontSize: "11px", color: T.textMeta, marginLeft: "6px" }}>{getScaleEntry(s)?.tier}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {insights.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <SectionLabel>WHAT YOUR RECORD IS SHOWING</SectionLabel>
                {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
              </div>
            )}
            <Divider />
            <div style={{ marginBottom: "24px" }}>
              <SectionLabel>WHAT DOES YOUR MAP REVEAL? (optional)</SectionLabel>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)}
                placeholder="What surprises you? What doesn't? What are you ready to see clearly?"
                rows={4}
                style={{ width: "100%", background: T.card, border: `1px solid ${T.goldBorder}`, borderRadius: "8px", color: T.text, fontFamily: T.fontDisplay, fontSize: "15px", fontStyle: "italic", padding: "14px 18px", outline: "none", lineHeight: 1.65 }}
                onFocus={e => { e.currentTarget.style.borderColor = T.goldBorderHi; }}
                onBlur={e => { e.currentTarget.style.borderColor = T.goldBorder; }} />
            </div>
            <div style={{ marginBottom: "32px" }}>
              <SectionLabel>IF ONE DOMAIN GETS YOUR ATTENTION THIS WEEK (optional)</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {DOMAINS.map(d => {
                  const s = completedScores[d.key];
                  const active = oneThingDomain === d.key;
                  return (
                    <button key={d.key} onClick={() => setOneThingDomain(active ? "" : d.key)}
                      style={{ padding: "12px 14px", background: active ? "rgba(200,169,110,0.1)" : T.card, border: `1px solid ${active ? T.goldBorderHi : T.goldBorder}`, borderRadius: "8px", color: active ? T.text : T.textMeta, cursor: "pointer", fontFamily: T.fontDisplay, fontSize: "14px", textAlign: "left", transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ fontWeight: "600" }}>{d.label}</div>
                      <div style={{ fontSize: "11px", color: getTierColor(s), marginTop: "3px", fontStyle: "italic" }}>{s} · {getScaleEntry(s)?.tier}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={handleWeeklySave} disabled={saving} style={{ ...btnPrimary, marginBottom: "10px", opacity: saving ? 0.6 : 1, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Saving..." : "Save to Your Record"}
            </button>
            <button onClick={() => setView("sayMore")} style={btnSecondary}>← Adjust my assessment</button>
          </div>
        )}

        {/* SAVED */}
        {view === "saved" && savedEntry && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: "58px", fontWeight: "300", color: T.gold, marginBottom: "10px" }}>Recorded.</div>
            <p style={{ fontSize: "16px", color: T.textMeta, fontStyle: "italic", lineHeight: 1.75, maxWidth: "380px", margin: "0 auto 36px", fontFamily: T.fontDisplay }}>
              Your pulse is on record.<br />Return next week and watch the pattern emerge.
            </p>
            <PulseWheel scores={savedEntry.scores} size={270} />
            {savedEntry.oneThingDomain && (
              <div style={{ marginTop: "28px", padding: "22px 28px", border: `1px solid ${T.goldBorder}`, borderRadius: "10px", display: "inline-block", minWidth: "220px", background: T.card, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "9px", letterSpacing: "0.22em", color: T.gold, marginBottom: "10px", fontWeight: "600" }}>YOUR FOCUS THIS WEEK</div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: "26px", color: T.text, fontWeight: "500" }}>{DOMAINS.find(d => d.key === savedEntry.oneThingDomain)?.label}</div>
                <div style={{ fontSize: "12px", color: T.textMeta, fontStyle: "italic", marginTop: "5px", fontFamily: T.fontDisplay }}>{getScaleEntry(savedEntry.scores[savedEntry.oneThingDomain])?.label}</div>
              </div>
            )}
            <div style={{ marginTop: "32px", marginBottom: "8px" }}>
              {!agentText && !agentLoading && !agentError && (
                <button onClick={() => handleRequestReflection(savedEntry)} style={btnAgent}>See your weekly reflection →</button>
              )}
              {(agentText || agentLoading || agentError) && <AgentReflection text={agentText} loading={agentLoading} error={agentError} />}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "center" }}>
              <button onClick={resetForm} style={{ padding: "13px 22px", background: T.card, border: `1px solid ${T.goldBorder}`, color: T.textMeta, borderRadius: "6px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "10px", letterSpacing: "0.12em" }}>DONE</button>
              <button onClick={() => setView("history")} style={{ padding: "13px 22px", background: T.gold, border: "none", color: "#FFFFFF", borderRadius: "6px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "10px", letterSpacing: "0.12em" }}>VIEW MY RECORD</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <button onClick={() => setView("intro")} style={{ background: T.card, border: `1px solid ${T.goldBorder}`, color: T.textMeta, padding: "7px 14px", borderRadius: "4px", cursor: "pointer", fontFamily: T.fontBody, fontSize: "10px", letterSpacing: "0.12em" }}>← BACK</button>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: "30px", color: T.text, fontWeight: "400", margin: 0 }}>Your Record</h2>
            </div>
            {data.weekly.length === 0 ? (
              <p style={{ color: T.textMeta, fontStyle: "italic", textAlign: "center", padding: "48px 0", fontFamily: T.fontDisplay, fontSize: "16px" }}>No check-ins yet. Complete your first Pulse to begin your record.</p>
            ) : (
              <>
                {data.weekly.length > 1 && (
                  <div style={{ padding: "20px 22px", border: `1px solid ${T.goldBorder}`, borderRadius: "10px", marginBottom: "24px", background: T.card, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <SectionLabel>DOMAIN TRENDS</SectionLabel>
                    {DOMAINS.map(d => {
                      const values = data.weekly.map(h => h.scores[d.key]);
                      const latest = values[values.length - 1];
                      const prev = values[values.length - 2];
                      const trend = Math.round((latest - prev) * 2) / 2;
                      return (
                        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                          <span style={{ width: "100px", fontSize: "12px", color: T.textMeta, flexShrink: 0 }}>{d.label}</span>
                          <div style={{ flex: 1, height: "3px", background: "rgba(200,169,110,0.15)", borderRadius: "2px" }}>
                            <div style={{ height: "100%", width: `${latest * 10}%`, background: getTierColor(latest), borderRadius: "2px" }} />
                          </div>
                          <span style={{ fontSize: "11px", color: getTierColor(latest), width: "76px", textAlign: "right" }}>{getScaleEntry(latest)?.tier}</span>
                          <span style={{ fontSize: "12px", width: "32px", textAlign: "right", color: trend > 0 ? T.green : trend < 0 ? T.orange : T.textMeta, fontWeight: "bold" }}>
                            {trend > 0 ? `+${trend}` : trend < 0 ? trend : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {insights.length > 0 && (
                  <div style={{ marginBottom: "22px" }}>
                    <SectionLabel>YOUR RECORD IS NOTICING</SectionLabel>
                    {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                  </div>
                )}
                {[...data.weekly].reverse().map((entry, idx) => (
                  <HistoryCard key={idx} entry={entry} expanded={expandedHistory === idx}
                    onExpand={() => setExpandedHistory(expandedHistory === idx ? null : idx)} />
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
