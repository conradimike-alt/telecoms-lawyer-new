import Replicate from "replicate";
import { put, list, del } from "@vercel/blob";

export default async function handler(req, res) {
  const { id, scenario } = req.query;
  if (!id) return res.status(400).json({ error: "Missing prediction id" });
  if (!process.env.REPLICATE_API_TOKEN) return res.status(500).json({ error: "REPLICATE_API_TOKEN missing" });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const prediction = await replicate.predictions.get(id);

    if (prediction.status !== "succeeded") {
      return res.status(200).json(prediction);
    }

    let outputUrl = prediction.output?.[0] || prediction.output;
    if (!outputUrl) return res.status(200).json(prediction);

    // Already permanent
    if (outputUrl.includes("blob.vercel-storage.com") || outputUrl.includes("public.blob.vercel-storage")) {
      return res.status(200).json({ status: "succeeded", output: outputUrl, output_permanent: outputUrl });
    }

    // Download + re-upload permanently
    const imageRes = await fetch(outputUrl);
    if (!imageRes.ok) throw new Error("Failed to download from Replicate");
    const imageBuffer = await imageRes.arrayBuffer();

    const rawPrompt = (scenario || "telecoms lawyer").toString().slice(0, 200);
    const safePrompt = rawPrompt.replace(/[^a-zA-Z0-9- ]/g, "").slice(0, 60).replace(/\s+/g, "-").toLowerCase() || "telecoms-lawyer";
    const timestamp = Date.now();

    const filename = `gallery/${safePrompt}-${timestamp}.webp`;
    const blob = await put(filename, imageBuffer, { access: "public", contentType: "image/webp", addRandomSuffix: false });

    // Save json sidecar
    const jsonFilename = `gallery/${safePrompt}-${timestamp}.json`;
    await put(jsonFilename, JSON.stringify({ prompt: rawPrompt, url: blob.url }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Auto-delete at 500 — fast version
    try {
      const { blobs } = await list({ limit: 1000, prefix: "gallery/" });
      const images = blobs.filter(b => b.pathname.endsWith(".webp"));
      if (images.length > 500) {
        images.sort((a,b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        const excess = images.length - 500;
        const toDelete = images.slice(0, Math.min(excess, 5));
        for (const old of toDelete) {
          await del(old.url);
          const j = blobs.find(b => b.pathname === old.pathname.replace(/\.webp$/, ".json"));
          if (j) await del(j.url);
        }
      }
    } catch (e) {
      console.log("cleanup skip:", e.message);
    }

    return res.status(200).json({ status: "succeeded", output: blob.url, output_permanent: blob.url, prompt: rawPrompt });

  } catch (e) {
    console.error("status error", e);
    return res.status(500).json({ error: e.message });
  }
}
