import Replicate from "replicate";

export default async function handler(req, res) {
  const { scenario } = req.body;
  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "REPLICATE_API_TOKEN is missing in Vercel" });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // STYLE-LOCKED PROMPT MATCHED TO YOUR 6-PANEL CARTOON
    const stylePrompt = `Vintage American comic book panel, exact same character and art style as reference, thick bold black ink outlines, flat vibrant cel-shaded colors, Ben-Day dot halftone texture, caricature of SAME bald telecoms lawyer man: bald head, thick black rectangular glasses, white button-up shirt, black tie, brown superhero cape with yellow TL shield logo, aged mid 30s, expressive face, dynamic heroic action pose, detailed comic background, dramatic action scene, comic book illustration, hand-drawn, no photorealism, no 3d render`;

    const prediction = await replicate.predictions.create({
      // KEEPING flux-schnell for speed, but we can upgrade to flux-dev for better quality
      model: "black-forest-labs/flux-dev",
      input: {
        prompt: `${stylePrompt}, SCENE: Telecoms Lawyer superhero ${scenario}, full body heroic action`,
        go_fast: false,
        guidance: 3.5,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
        num_inference_steps: 28
      }
    });
    res.status(201).json({ id: prediction.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
