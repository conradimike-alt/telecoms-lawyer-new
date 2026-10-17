import { list } from "@vercel/blob";

export const dynamic = 'force-dynamic';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  try {
    const { blobs } = await list({ limit: 1000, prefix: "gallery/" });

    const images = blobs
      .filter(b => b.pathname.endsWith(".webp"))
      .map(b => {
        // Try to get prompt from matching json filename if it exists
        const base = b.pathname.replace(".webp", "");
        const jsonFile = blobs.find(x => x.pathname === `${base}.json`);
        
        // Fallback prompt from filename
        let prompt = base.replace("gallery/", "").replace(/-\d+$/, "").replace(/-/g, " ");
        
        return {
          url: b.url,
          pathname: b.pathname,
          jsonPathname: jsonFile ? jsonFile.pathname : null,
          jsonUrl: jsonFile ? jsonFile.url : null,
          uploadedAt: b.uploadedAt,
          prompt: prompt
        };
      })
      .sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Now enrich prompts — but do it safely without extra fetches
    // Your gallery.js should fetch the json url client-side if you want the exact prompt
    return res.status(200).json({ images });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
