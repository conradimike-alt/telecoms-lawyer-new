import Replicate from "replicate";
import { put, list } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const { id, scenario } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status === "failed") {
      return res.status(200).json({ status: "failed", error: prediction.error });
    }
    if (prediction.status !== "succeeded") {
      return res.status(200).json({ status: prediction.status });
    }

    // --- SUCCEEDED ---
    let outputUrl = typeof prediction.output === "string" ? prediction.output : prediction.output?.[0];
    if (!outputUrl) return res.status(500).json({ error: "No output" });

    // IDEMPOTENT: Use prediction ID as filename so we only ever save once
    const fileName = `gallery/${id}.webp`;
    const jsonFileName = `gallery/${id}.json`;

    // Check if we already saved this ID before - if so, reuse it
    const existing = await list({ prefix: fileName, limit: 1 });
    let blobUrl = existing.blobs.find(b => b.pathname === fileName)?.url;

    if (!blobUrl) {
      const imageRes = await fetch(outputUrl);
      const imageBuffer = await imageRes.arrayBuffer();

      const blob = await put(fileName, imageBuffer, {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: false, // IMPORTANT: don't make duplicates
      });
      blobUrl = blob.url;

      const cleanScenario = (scenario || "telecoms lawyer").toString().slice(0, 200);
      await put(jsonFileName, JSON.stringify({ prompt: cleanScenario, url: blobUrl, replicateId: id }), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
      });
    }

    // Return EVERY possible field name your frontend might be checking
    return res.status(200).json({ 
      status: "succeeded",
      imageUrl: blobUrl,
      image: blobUrl,
      url: blobUrl,
      output: blobUrl,
      replicateUrl: outputUrl
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
