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
  "Emergency restoration of a core PoP",
  "Regulatory filing due in 1 hour",
  "Customer claims force majeure for late payment",
  "Duct access denied at midnight",
  "Capacity contract in USD, client pays in GBP",
  "Wayleave expired yesterday, build starts tomorrow",
  "Liability cap unlimited? No chance!",
  "GDPR breach from a misconfigured router",
  "Tackling a 100-page wayleave schedule",
  "Negotiating IRU vs lease",
  "Dark fibre deal with no SLA",
  "Colocation contract with 99.999% uptime"
];

function getRandomChallenges() {
  const shuffled = [...ALL_CHALLENGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    setSuggestions(getRandomChallenges());
  }, []);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const { id, error } = await res.json();
      if (error) throw new Error(error);

      // poll status.js (your fixed version)
      let done = false;
      while (!done) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`/api/status?id=${id}&scenario=${encodeURIComponent(scenario)}`);
        const data = await statusRes.json();
        if (data.status === "succeeded") {
          setImageUrl(data.imageUrl || data.image || data.url);
          done = true;
        }
        if (data.status === "failed") throw new Error(data.error);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      {/* THE BLACK BOX FROM YOUR SCREENSHOT */}
      <div className="w-full max-w-[720px] border-[3px] border-black rounded-[16px] p-4 bg-white shadow-[4px_4px_0px_0px_black]">
        <h1 className="font-black text-[18px] mb-2 leading-tight">
          What should the Telecoms Lawyer face next?
        </h1>

        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="e.g. client needs a new submarine cable joint build agreement on just 2 weeks notice"
          className="w-full border-[3px] border-black rounded-[12px] p-3 text-[14px] min-h-[80px] focus:outline-none placeholder:font-bold placeholder:text-[#999]"
        />

        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className="bg-[#d6eaff] border-[2px] border-black rounded-full px-3 py-1 text-[12px] font-bold uppercase hover:bg-black hover:text-white transition-colors text-left"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !scenario.trim()}
          className="w-full mt-4 bg-[#ffeb00] border-[3px] border-black rounded-[12px] py-3 font-black uppercase text-[16px] tracking-wide hover:translate-y-[-2px] active:translate-y-[1px] transition-transform disabled:opacity-50"
        >
          {loading ? "GENERATING..." : "🎨 GENERATE CARTOON NOW"}
        </button>
        <p className="text-[11px] text-[#666] mt-2">
          Same hero every time: bald, black glasses, white shirt, brown cape, TL badge
        </p>
      </div>

      {imageUrl && (
        <div className="mt-6 w-full max-w-[720px] border-[3px] border-black rounded-[16px] overflow-hidden">
          <img src={imageUrl} alt={scenario} className="w-full" />
        </div>
      )}
    </div>
  );
}
