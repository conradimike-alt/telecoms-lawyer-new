import Replicate from "replicate";
import { put } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  const { id, scenario } = req.query;

  if (!id) return res.status(400).json({ error: "Missing id" });

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "REPLICATE_API_TOKEN missing" });
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const prediction = await replicate.predictions.get(id);

    // Still running? Just tell frontend to keep polling
    if (prediction.status !== "succeeded") {
      return res.status(200).json({ status: prediction.status });
    }

    // --- IT SUCCEEDED ---
    let outputUrl = null;

    // FIX: Handle both string and array returns
    if (typeof prediction.output === "string") {
      outputUrl = prediction.output;
    } else if (Array.isArray(prediction.output) && prediction.output.length > 0) {
      outputUrl = prediction.output[0];
    }

    if (!outputUrl) {
      return res.status(500).json({ error: "No output URL from Replicate", prediction });
    }

    // Save permanently to Vercel Blob for gallery
    const imageRes = await fetch(outputUrl);
    const imageBuffer = await imageRes.arrayBuffer();

    const cleanName = (scenario || "telecoms-lawyer").toString().trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
    
    const fileName = `gallery/${cleanName}-${Date.now()}.webp`;
    const jsonFileName = `gallery/${cleanName}-${Date.now()}.json`;

    const blob = await put(fileName, imageBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    // Save prompt JSON sidecar for gallery
    await put(jsonFileName, JSON.stringify({ prompt: scenario, url: blob.url, createdAt: new Date().toISOString() }), {
      access: "public",
      contentType: "application/json",
    });

    return res.status(200).json({ 
      status: "succeeded", 
      imageUrl: blob.url, // use the permanent blob url
      replicateUrl: outputUrl 
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
