import Replicate from "replicate";

const BLOCKED_WORDS = [
  // sexual / NSFW
  "sex", "porn", "nude", "naked", "nsfw", "xxx", "erotic", "fetish",
  "penis", "vagina", "boobs", "tits", "ass", "anal",
  // bestiality / animal abuse - what you saw
  "bestiality", "zoophilia", "dog sex", "having sex with a dog", "fucking a dog", "fucking dog",
  // hate / extreme violence / self-harm - keep it heroic
  "kill", "murder", "suicide", "rape", "nazi", "hitler",
  // just block "dog" + sexual context is covered above, but block obvious trolling
  "fuck", "shit", "cunt"
];

function isBlocked(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { scenario } = req.body || {};
  const cleanScenario = (scenario || "").toString().trim();

  if (!cleanScenario) {
    return res.status(400).json({ error: "Please enter a scenario" });
  }

  if (cleanScenario.length > 200) {
    return res.status(400).json({ error: "Scenario too long (200 chars max)" });
  }

  // BLOCK INAPPROPRIATE PROMPTS
  if (isBlocked(cleanScenario)) {
    return res.status(400).json({ 
      error: "That scenario isn't allowed for this event. Try something heroic like 'saving a cat from a tree' or 'stopping a runaway train'!" 
    });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "REPLICATE_API_TOKEN is missing in Vercel" });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // STYLE-LOCKED PROMPT MATCHED TO YOUR 6-PANEL CARTOON
    const stylePrompt = `Vintage American comic book panel, exact same character and art style as reference, thick bold black ink outlines, flat vibrant cel-shaded colors, Ben-Day dot halftone texture, caricature of SAME bald telecoms lawyer man: completely bald head, clean shaven face, smooth face with no beard, baby smooth skin, bald head, thick black rectangular glasses, wearing santa claus hat only, brown superhero cape with yellow TL shield logo, aged mid 30s, young clean shaven superhero, expressive face, dynamic heroic action pose, detailed comic background, dramatic action scene, comic book illustration, hand-drawn, no photorealism, no 3d render, clean shaven`

    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-dev",
      input: {
        prompt: `${stylePrompt}, SCENE: Telecoms Lawyer superhero ${cleanScenario}, full body heroic action`,
        go_fast: true, // FAST hardware - 30% speed boost
        guidance: 3, // was 3.5 - slightly faster, still locked style
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80, // was 90 - faster upload, looks identical
        num_inference_steps: 20 // was 28 - sweet spot for comics, saves 4-5 sec
      }
    });

    res.status(201).json({ id: prediction.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
