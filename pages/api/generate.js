import Replicate from "replicate";

const BLOCKED_WORDS = [
  "sex", "porn", "nude", "naked", "nsfw", "xxx", "erotic", "fetish",
  "penis", "vagina", "boobs", "tits", "ass", "anal",
  "bestiality", "zoophilia", "dog sex", "having sex with a dog", "fucking a dog",
  "crack", "cocaine", "heroin", "meth", "mdma", "ecstasy",
  "kill", "murder", "suicide", "rape", "nazi", "hitler", "fuck"
];

function isBlocked(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { scenario } = req.body || {};
  const cleanScenario = (scenario || "").toString().trim();
  if (!cleanScenario) return res.status(400).json({ error: "Please enter a scenario" });
  if (isBlocked(cleanScenario)) {
    return res.status(400).json({ error: "That scenario isn't allowed. Try something heroic like 'saving a cat from a tree'!" });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "REPLICATE_API_TOKEN is missing in Vercel" });
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const stylePrompt = `Vintage American comic book panel, exact same character and art style as reference, thick bold black ink outlines, flat vibrant cel-shaded colors, Ben-Day dot halftone texture, caricature of SAME bald telecoms lawyer man: bald head, thick black rectangular glasses, wearing santa claus outfit, brown superhero cape with yellow TL shield logo, aged mid 30s, expressive face, dynamic heroic action pose, detailed comic background, dramatic action scene, comic book illustration, hand-drawn, no photorealism, no 3d render`;

    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-1.1-pro", // <-- 6x faster + better quality
      input: {
        prompt: `${stylePrompt}, SCENE: Telecoms Lawyer superhero ${cleanScenario}, full body heroic action`,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
        safety_tolerance: 2,
        prompt_upsampling: true
      }
    });

    res.status(201).json({ id: prediction.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
