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
  "Submarine cable joint build in 2 weeks",
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

function generateTotallyNewIdea() {
  const actions = ["Wrestling", "Balancing", "Carrying", "Surfing", "Juggling", "Tightrope walking on", "Lassoing", "Paragliding with", "Sumo-wrestling", "Untangling"];
  const objects = ["a live 5G cabinet", "200m of armoured fibre", "a submarine cable joint", "a runaway duct mole", "a tower crane tangled in wayleaves", "a 10MW data centre cable", "a flock of pigeons guarding a mast", "a giant spool of duct rope", "a Network Rail wayleave bundle", "a Crown Estate permit scroll"];
  const twists = ["while Ofcom watches", "in a hurricane on a rooftop", "during a wayleave tribunal", "with a farmer chasing him", "over a flooded trench", "while holding 50 wayleave notices", "blindfolded with code powers", "on top of the BT Tower", "during a client board meeting", "while riding a wayleave digger"];
  return `${actions[Math.floor(Math.random()*actions.length)]} ${objects[Math.floor(Math.random()*objects.length)]} ${twists[Math.floor(Math.random()*twists.length)]}`;
}

function getRandomChallenges() {
  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
  const generalPicked = shuffle(GENERAL_HERO).slice(0, 2);
  const telecomsPicked = shuffle(TELECOMS_HERO).slice(0, 2);
  let newIdea;
  do {
    newIdea = generateTotallyNewIdea();
  } while ([...generalPicked, ...telecomsPicked].includes(newIdea));
  return shuffle([...generalPicked, ...telecomsPicked, newIdea]);
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

        <div style={{ width: "98%", maxWidth: 1320, display: "flex", alignItems: "stretch", justifyContent: "center", gap: 16, marginTop: 28 }}>
          {/* LEFT IMAGE - NOW FULL HEIGHT */}
          <div style={{ width: 200, flexShrink: 0, display: "flex", alignSelf: "stretch" }} className="side-hero">
            <img src="https://hxs9xoachdqkxjdj.public.blob.vercel-storage.com/gallery/flying-through-the-air-superman-style-1792767018591-6rpKbR5MQ8ag3xYECFOMTLBQrRNMrL.webp" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
          </div>
          
          <div style={{ flex: 1, maxWidth: 920, border: "3px solid black", borderRadius: 18, padding: 18, background: "white", boxShadow: "5px 5px 0px 0px black" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }}>
              <h1 style={{ fontFamily: "'Bangers', cursive", fontSize: 36, letterSpacing: "2px", wordSpacing: "3px", whiteSpace: "nowrap", color: "#1a9de3", margin: 0, WebkitTextStroke: "1.2px black", textShadow: "4px 4px 0px black", lineHeight: 1.1 }}>What challenge should our hero face next?</h1>
              <button onClick={() => setSuggestions(getRandomChallenges())} style={{ background: "white", border: "2.5px solid black", borderRadius: 10, padding: "6px 12px", fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>🔄 NEW IDEAS</button>
            </div>
            <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="pick a suggestion or enter your scenario here - e.g. doing a tightrope walk on fibreoptic cable between two rooftops" style={{ width: "100%", border: "3px solid black", borderRadius: 14, padding: 12, fontSize: 13, minHeight: 85, fontFamily: "'Fredoka', sans-serif", fontWeight: 600, boxSizing: "border-box" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              {suggestions.map((s) => (<button key={s} onClick={() => setScenario(s)} style={{ background: "#d6eaff", border: "2.5px solid black", borderRadius: 999, padding: "7px 14px", fontSize: 12, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>{s}</button>))}
            </div>
            <button onClick={handleGenerate} disabled={loading || !scenario.trim()} style={{ width: "100%", marginTop: 16, background: "#ffeb00", border: "3px solid black", borderRadius: 12, padding: "12px 0", fontFamily: "'Bangers', cursive", fontSize: 22, letterSpacing: "1px", cursor: "pointer", boxShadow: "2px 2px 0px black", opacity: loading ? 0.6 : 1 }}>{loading ? "GENERATING YOUR HERO..." : "✨ GENERATE CARTOON NOW"}</button>
          </div>

          {/* RIGHT IMAGE - NOW FULL HEIGHT */}
          <div style={{ width: 200, flexShrink: 0, display: "flex", alignSelf: "stretch" }} className="side-hero">
            <img src="https://hxs9xoachdqkxjdj.public.blob.vercel-storage.com/gallery/flying-through-the-air-superman-style-1792767018591-6rpKbR5MQ8ag3xYECFOMTLBQrRNMrL.webp" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, transform: "scaleX(-1)" }} />
          </div>
        </div>

        <style>{`@media (max-width: 1100px) { .side-hero { display: none !important; } }`}</style>

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
