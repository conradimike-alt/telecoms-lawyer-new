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
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        prompt: `Cartoon superhero comic book style, Telecoms Lawyer hero, bald man with glasses, wearing brown cape with yellow TL shield logo, white shirt black tie, heroic pose, scenario: ${scenario}, bright colors, white background, 2D flat cartoon`,
        go_fast: true,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90
      }
    });
    res.status(201).json({ id: prediction.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}