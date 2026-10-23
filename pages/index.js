import { useState, useEffect } from "react";

const ALL_CHALLENGES = [
  "ROAMING REGULATION RUMBLE",
  "FIBRE WAYLEAVE WRAITH",
  "500-page MSA in 30 mins",
  "Submarine cable joint build in 2 weeks",
  "OF-COM investigation at 5pm Friday",
  "Client needs a new submarine cable joint build agreement on just 2 weeks notice",
  "Indefeasible Right of Use drafted on a napkin",
  "Data centre power outage during live migration",
  "Wayleave blocked by angry farmer",
  "Subsea cable cut by fishing trawler",
  "MVNO wants to launch tomorrow",
  "Code powers vs. landlord standoff",
  "Pension fund wants to buy the whole fibre network",
  "Wayleave expired yesterday, build starts tomorrow",
];

function getRandomChallenges() {
  return [...ALL_CHALLENGES].sort(() => 0.5 - Math.random()).slice(0, 5);
}

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => { setSuggestions(getRandomChallenges()); }, []);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setLoading(true); setImageUrl(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) });
      const { id } = await res.json();
      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 2000));
        const sRes = await fetch(`/api/status?id=${id}&scenario=${encodeURIComponent(scenario)}`);
        const data = await sRes.json();
        if (data.status === "succeeded") { setImageUrl(data.imageUrl); done = true; }
        if (data.status === "failed") throw new Error(data.error);
      }
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: 16, fontFamily: "Arial Black, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 720, border: "3px solid black", borderRadius: 16, padding: 16, background: "white", boxShadow: "4px 4px 0px 0px black" }}>
        <h1 style={{ fontWeight: 900, fontSize: 22, margin: "0 0 12px 0" }}>What should the Telecoms Lawyer face next?</h1>
        <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="e.g. client needs a new submarine cable joint build agreement on just 2 weeks notice" style={{ width: "100%", border: "3px solid black", borderRadius: 12, padding: 12, fontSize: 14, minHeight: 80, fontFamily: "monospace", boxSizing: "border-box" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => setScenario(s)} style={{ background: "#d6eaff", border: "2px solid black", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>{s}</button>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={loading || !scenario.trim()} style={{ width: "100%", marginTop: 16, background: "#ffeb00", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontWeight: 900, textTransform: "uppercase", fontSize: 16, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
          {loading ? "GENERATING..." : "🎨 GENERATE CARTOON NOW"}
        </button>
        <p style={{ fontSize: 11, color: "#666", marginTop: 8, fontFamily: "Arial" }}>Same hero every time: bald, black glasses, white shirt, brown cape, TL badge</p>
      </div>
      {imageUrl && <div style={{ marginTop: 24, width: "100%", maxWidth: 720, border: "3px solid black", borderRadius: 16, overflow: "hidden" }}><img src={imageUrl} alt={scenario} style={{ width: "100%", display: "block" }} /></div>}
    </div>
  );
}
