import { list } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  try {
    const { blobs } = await list({ limit: 1000, prefix: "gallery/" });
    
    const jsons = {};
    blobs.filter(b => b.pathname.endsWith(".json")).forEach(b => {
      jsons[b.pathname.replace(".json", "")] = b;
    });

    const images = blobs
      .filter(b => b.pathname.endsWith(".webp"))
      .map(b => {
        const base = b.pathname.replace(".webp", "");
        const jsonEntry = jsons[base];
        return {
          url: b.url,
          pathname: b.pathname,
          uploadedAt: b.uploadedAt,
          prompt: base, // fallback
          // if you stored prompt in json, you can fetch it client side or here
        };
      })
      .sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Also fetch prompts from json files
    const withPrompts = await Promise.all(images.map(async (img) => {
      const base = img.pathname.replace(".webp", "");
      const jsonBlob = blobs.find(b => b.pathname === `${base}.json`);
      if (jsonBlob) {
        try {
          const r = await fetch(jsonBlob.url, { cache: 'no-store' });
          if (r.ok) {
            const j = await r.json();
            return { ...img, prompt: j.prompt || img.prompt, jsonUrl: jsonBlob.url };
          }
        } catch {}
      }
      // fallback: prettify filename
      const pretty = base.replace("gallery/", "").replace(/-\d+$/, "").replace(/-/g, " ");
      return { ...img, prompt: pretty };
    }));

    return res.status(200).json({ images: withPrompts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
