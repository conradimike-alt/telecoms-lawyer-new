import { useState, useEffect } from "react";
import Head from "next/head";

const GENERAL_HERO = [
  "Saving a cat stuck up a telecoms mast",
  "Rescuing a dog tangled in fibre cables",
  "Helping an old lady cross the road during a fibre dig",
  "Stopping a runaway 5G street cabinet",
  "Saving a kid's balloon from a cell tower",
  "Untangling Christmas lights from overhead lines",
  "Rescuing lunch from the top of a telephone pole",
  "Saving the office plants during a power outage",
  "Carrying groceries across a closed wayleave",
  "Fixing a kid's bike chain with a cable tie",
  "Saving a pizza delivery from a road closure",
  "Helping a lost tourist find the nearest exchange",
  "Stopping a pigeon nesting in a small cell",
  "Rescuing a kite caught on a telegraph pole",
  "Saving a football from a fenced-off cabinet",
  "Helping move a sofa around a wayleave trench",
  "Chasing a runaway shopping trolley away from a fibre joint",
  "Saving an ice cream from melting during a duct blockage",
  "Helping a kid retrieve a frisbee from a rooftop antenna",
  "Rescuing a hat blown onto a cell site",
  "Saving the office biscuit tin from falling",
  "Helping a neighbour jump-start their car in a car park with code powers",
  "Stopping a leaf blower from blowing wayleave notices away",
  "Rescuing a drone stuck in a tree near a mast",
  "Saving a laptop from a coffee spill during an MSA negotiation",
  "Helping carry a ladder for a building survey",
  "Saving a garden gnome from a trenching machine",
  "Stopping a bus from splashing a wayleave officer",
  "Rescuing a football scarf from a fence",
  "Helping find a lost phone down a duct",
  "Saving a whiteboard from falling in a client meeting",
  "Stopping a seagull stealing chips near the pier cable landing",
  "Rescuing a toddler's teddy from a cabinet",
  "Helping an intern find the right meeting room",
  "Saving a tie from getting caught in a shredder",
  "Stopping a door from slamming in the wind on site",
  "Rescuing a umbrella from inside-out in a storm",
  "Helping push a stuck van out of a muddy wayleave",
  "Saving the last slice of cake in the office",
  "Stopping a printer jam before a deadline",
];

const TELECOMS_HERO = [
  "ROAMING REGULATION RUMBLE",
  "FIBRE WAYLEAVE WRAITH",
  "500-page MSA in 30 mins",
  " cable joint build in 2 weeks",
  "OF-COM investigation at 5pm Friday",
  "Indefeasible Right of Use drafted on a napkin",
  "Data centre power outage during live migration",
  "Wayleave blocked by angry farmer",
  "Subsea cable cut by fishing trawler",
  "MVNO wants to launch tomorrow",
  "Code powers vs. landlord standoff",
  "Pension fund wants to buy the whole fibre network",
  "Wayleave expired yesterday, build starts tomorrow",
  "BT PIA blocked - build your own ducts",
  "Building owner wants 10x wayleave fee",
  "Ofcom code powers tribunal at dawn",
  "Wayleave agreement lost in 1997",
  "Fibre cut by farmer's plough",
  "Data centre needs 10MW by Monday",
  "Client needs a new submarine cable joint build agreement on just 2 weeks notice",
  "IRU capacity sold twice by mistake",
  "Dark fibre lease with no termination clause",
  "Wayleave for 200 flats - one freeholder objects",
  "Openreach wayleave vs. private wayleave overlap",
  "Subsea cable permit denied by Crown Estate",
  "Landing party agreement in 3 languages",
  "Wayleave indemnity uncapped forever",
  "Fibre network built without any wayleaves",
  "Code agreement - 54 weeks to agree access",
  "Wayleave assignment - landlord in liquidation",
  "Street works permit refused by council",
  "Wayleave for listed building - English Heritage objects",
  "Wayleave rent review - RPI + 25%",
  "Duct access blocked by competitor",
  "Wayleave for church - vicar says no",
  "Altnets overbuild fight in same street",
  "Wayleave for railway crossing - Network Rail wants £1m",
  "Wayleave for MOD land - security clearance needed",
  "Subsea cable repair in storm season",
  "Wayleave for hospital - no weekend working allowed",
];

function getRandomChallenges() {
  // Shuffle copy helper
  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
  
  // Decide mix: either 2 general + 3 telecoms OR 3 general + 2 telecoms
  const generalCount = Math.random() > 0.5 ? 2 : 3;
  const telecomsCount = 5 - generalCount;
  
  const generalPicked = shuffle(GENERAL_HERO).slice(0, generalCount);
  const telecomsPicked = shuffle(TELECOMS_HERO).slice(0, telecomsCount);
  
  // Combine and shuffle final 5 - guaranteed unique and at least 2 general
  const combined = [...generalPicked, ...telecomsPicked];
  return shuffle(combined);
}

export default function Home() {
  const [io, setio] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  useEffect(() => { setSuggestions(getRandomChallenges()); }, []);

  const handleGenerate = async () => {
    if (!io.trim()) return;
    setLoading(true); setImageUrl(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ io }) });
      const { id } = await res.json();
      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 2000));
        const sRes = await fetch(`/api/status?id=${id}&io=${encodeURIComponent(io)}`);
        const d = await sRes.json();
        const url = d.imageUrl || d.output || (Array.isArray(d.output) ? d.output[0] : null);
        if (d.status === "succeeded" && url) { setImageUrl(url); done = true; }
        if (d.status === "failed") throw new Error(d.error || "Failed");
      }
    } catch (e) { alert(e.message); } finally { setLoading(false); }
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
        <div style={{ width: "95%", maxWidth: 920, border: "3px solid black", borderRadius: 18, padding: 18, background: "white", boxShadow: "5px 5px 0px 0px black", marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
            <h1 style={{ fontFamily: "'Bangers', cursive", fontSize: 36, letterSpacing: "2px", wordSpacing: "3px", whiteSpace: "nowrap", color: "#1a9de3", margin: 0, WebkitTextStroke: "1.2px black", textShadow: "4px 4px 0px black", lineHeight: 1.1 }}>
              What challenge should our hero face next?
            </h1>
            <button onClick={() => setSuggestions(getRandomChallenges())} style={{ background: "white", border: "2.5px solid black", borderRadius: 10, padding: "6px 12px", fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>🔄 NEW IDEAS</button>
          </div>
          <textarea value={io} onChange={(e) => setScenario(e.target.value)} placeholder="enter the scenario here e.g. rescuing a client's cat from a tree  - or pick one from the suggestions" style={{ width: "100%", border: "3px solid black", borderRadius: 14, padding: 12, fontSize: 13, minHeight: 85, fontFamily: "'Fredoka', sans-serif", fontWeight: 600, boxSizing: "border-box" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => setScenario(s)} style={{ background: "#d6eaff", border: "2.5px solid black", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>{s}</button>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={loading || !scenario.trim()} style={{ width: "100%", marginTop: 16, background: "#ffeb00", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontFamily: "'Bangers', cursive", fontSize: 22, letterSpacing: "1px", cursor: "pointer", boxShadow: "2px 2px 0px black", opacity: loading ? 0.6 : 1 }}>
            {loading ? "GENERATING YOUR HERO..." : "✨ GENERATE CARTOON NOW"}
          </button>
        </div>

        {imageUrl && (
          <div style={{ marginTop: 32, width: "95%", maxWidth: 920, border: "3px solid black", borderRadius: 18, padding: 18, background: "white", boxShadow: "5px 5px 0px 0px black", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Bangers', cursive", fontSize: 28, margin: "0 0 12px 0" }}>YOUR HERO IS READY!</h2>
            <p style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600, margin: "0 0 16px 0" }}>{scenario}</p>
            <img src={imageUrl} alt={scenario} style={{ width: "100%", borderRadius: 12, border: "3px solid black", display: "block" }} />
            <button onClick={() => { const subject = encodeURIComponent(`New Telecoms Lawyer cartoon: ${scenario}`); const body = encodeURIComponent(`Hi Mike,\n\nHere's the latest Telecoms Lawyer hero cartoon:\n\nChallenge: ${scenario}\n\nPermanent image link (Blob store - won't expire):\n${imageUrl}\n\nBest,\n`); window.location.href = `mailto:mike.conradi@dlapiper.com?subject=${subject}&body=${body}`; }} style={{ width: "100%", marginTop: 16, background: "#1a9de3", color: "white", border: "3px solid black", borderRadius: 12, padding: "14px 0", fontFamily: "'Bangers', cursive", fontSize: 20, letterSpacing: "1px", cursor: "pointer", boxShadow: "3px 3px 0px black" }}>📧 EMAIL THIS TO MIKE</button>
          </div>
        )}
      </div>
    </>
  );
}
