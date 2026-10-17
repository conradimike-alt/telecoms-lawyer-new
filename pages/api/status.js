import Replicate from "replicate";
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  const { id, scenario } = req.query;

  if (!id) return res.status(400).json({ error: "Missing prediction id" });
  if (!process.env.REPLICATE_API_TOKEN) return res.status(500).json({ error: "REPLICATE_API_TOKEN missing" });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === "succeeded") {
      let outputUrl = prediction.output?.[0] || prediction.output;
      if (!outputUrl) return res.status(200).json(prediction);

      if (outputUrl.includes("blob.vercel-storage.com") || outputUrl.includes("public.blob.vercel-storage")) {
        return res.status(200).json({ ...prediction, output: outputUrl });
      }

      const imageRes = await fetch(outputUrl);
      if (!imageRes.ok) throw new Error("Failed to download image from Replicate");
      const imageBuffer = await imageRes.arrayBuffer();

      // FIX: Use ONE timestamp for both files
      const rawPrompt = scenario ? decodeURIComponent(scenario) : "telecoms-lawyer";
      const safePrompt = rawPrompt.replace(/[^a-zA-Z0-9- ]/g, "").slice(0, 80).replace(/\s+/g, "-").toLowerCase() || "telecoms-lawyer";
      const timestamp = Date.now();

      const filename = `gallery/${safePrompt}-${timestamp}.webp`;
      const blob = await put(filename, imageBuffer, { access: "public", contentType: "image/webp" });

      // Use SAME timestamp so we can find it later
      const jsonFilename = `gallery/${safePrompt}-${timestamp}.json`;
      await put(jsonFilename, JSON.stringify({ prompt: rawPrompt, url: blob.url, id, createdAt: new Date().toISOString() }), {
        access: "public",
        contentType: "application/json",
      });

      return res.status(200).json({ status: "succeeded", output: blob.url, output_permanent: blob.url, prompt: rawPrompt });
    }

    return res.status(200).json(prediction);
  } catch (e) {
    console.error("status error", e);
    return res.status(500).json({ error: e.message });
  }
}
