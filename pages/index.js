import { useState, useEffect } from "react";
import Head from "next/head";

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
    setLoading(true); 
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) });
      const data = await res.json();
      const id = data.id || data.predictionId;
      
      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 2000));
        const sRes = await fetch(`/api/status?id=${id}&scenario=${encodeURIComponent(scenario)}`);
        const statusData = await sRes.json();
        
        // Handle different possible response shapes
        const url = statusData.imageUrl || statusData.output || (Array.isArray(statusData.output) ? statusData.output[0] : null);
        
        if (statusData.status === "succeeded" && url) { 
          setImageUrl(url); 
          done = true; 
        }
        if (statusData.status === "failed") throw new Error(statusData.error || "Generation failed");
      }
    } catch (e) { 
      alert(e.message); 
      console.error(e);
    } finally { 
      setLoading(false); 
    }
  };

  const emailToMike = () => {
    const subject = encodeURIComponent(`New Telecoms Lawyer cartoon: ${scenario}`);
    const body = encodeURIComponent(`Mike - check out this new Telecoms Lawyer cartoon I just generated:\n\nChallenge: ${scenario}\n\nImage: ${imageUrl}\n\nView all: https://telecoms-lawyer-new.vercel.app/gallery`);
    window.location.href = `mailto:mike?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#fffaf0", display: "flex", flexDirection: "column", alignItems: "center", padding: 0 }}>
        <div style={{ width: "100%", background: "white", borderBottom: "3px solid black", display: "flex", justifyContent: "center", padding: "10px 0" }}>
          <img src="/header.png" alt="Telecoms Lawyer: Hero of Connectivity" style={{ maxWidth: 760, width: "95%", height: "auto" }} />
        </div>

        {/* FIX #1 - WIDE BOX FOR ONE LINE TITLE */}
        <div style={{ width: "95%", maxWidth: 920, border: "3px solid black", borderRadius: 18, padding: 18, background: "white", boxShadow: "5px 5px 0px 0px black", marginTop: 28 }}>

          <h1 style={{ fontFamily: "'Bangers', cursive", fontSize: 36, letterSpacing: "2px", wordSpacing: "3px", whiteSpace: "nowrap", color: "#1a9de3", margin: "0 0 18px 0", WebkitTextStroke: "1.2px black", textShadow: "4px 4px 0px black", lineHeight: 1.1 }}>
            What challenge should our hero face next?
          </h1>

          <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="e.g. client needs a new submarine cable joint build agreement on just 2 weeks notice" style={{ width: "100%", border: "3px solid black", borderRadius: 14, padding: 12, fontSize: 13, minHeight: 85, fontFamily: "'Fredoka', sans-serif", fontWeight: 600, boxSizing: "border-box" }} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => setScenario(s)} style={{ background: "#d6eaff", border: "2.5px solid black", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>{s}</button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading || !scenario.trim()} style={{ width: "100%", marginTop: 16, background: "#ffeb00", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontFamily: "'Bangers', cursive", fontSize: 22, letterSpacing: "1px", cursor: "pointer", boxShadow: "2px 2px 0px black", opacity: loading ? 0.6 : 1 }}>
            {loading ? "GENERATING YOUR HERO..." : "✨ GENERATE CARTOON NOW"}
          </button>
        </div>

        {/* FIX #2 - THIS WAS MISSING - SHOW IMAGE + EMAIL TO MIKE */}
        {imageUrl && (
          <div style={{ marginTop: 32, width: "95%", maxWidth: 920, border: "3px solid black", borderRadius: 18, padding: 18, background: "white", boxShadow: "5px 5px 0px 0px black", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Bangers', cursive", fontSize: 28, margin: "0 0 12px 0" }}>YOUR HERO IS READY!</h2>
            <p style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, margin: "0 0 16px 0" }}>Challenge: {scenario}</p>
            <img src={imageUrl} alt={scenario} style={{ width: "100%", borderRadius: 12, border: "3px solid black", display: "block" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button onClick={emailToMike} style={{ flex: 1, background: "#1a9de3", color: "white", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontFamily: "'Bangers', cursive", fontSize: 18, cursor: "pointer" }}>📧 EMAIL THIS TO MIKE</button>
              <a href="/gallery" style={{ flex: 1, background: "white", color: "black", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontFamily: "'Bangers', cursive", fontSize: 18, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>VIEW GALLERY</a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
