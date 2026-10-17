import Replicate from "replicate";
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing prediction id" });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "REPLICATE_API_TOKEN missing" });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === "succeeded") {
      let outputUrl = prediction.output?.[0] || prediction.output;
      
      if (!outputUrl) {
        return res.status(200).json(prediction);
      }

      // If it's already our permanent blob URL, return as-is
      if (outputUrl.includes("blob.vercel-storage.com") || outputUrl.includes("public.blob.vercel-storage")) {
        return res.status(200).json({
          ...prediction,
          output: outputUrl,
        });
      }

      // Download from Replicate (temporary 1-hour URL)
      const imageRes = await fetch(outputUrl);
      if (!imageRes.ok) throw new Error("Failed to download image from Replicate");
      
      const imageBuffer = await imageRes.arrayBuffer();

      // Upload to Vercel Blob permanently
      const filename = `telecoms-lawyer-${id}-${Date.now()}.webp`;
      const blob = await put(filename, imageBuffer, {
        access: "public",
        contentType: "image/webp",
      });

      // Return permanent URL
      return res.status(200).json({
        status: "succeeded",
        output: blob.url,
        output_permanent: blob.url,
      });
    }

    // If still processing or failed, return original status
    return res.status(200).json(prediction);

  } catch (e) {
    console.error("status error", e);
    return res.status(500).json({ error: e.message });
  }
}
