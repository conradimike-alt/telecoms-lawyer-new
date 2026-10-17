import { useEffect, useState } from "react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/list-images");
      const blobs = await res.json();
      
      // Only keep images, ignore json files
      const images = blobs.filter(b => b.pathname.endsWith(".webp") || b.pathname.endsWith(".png") || b.pathname.endsWith(".jpg"));
      
      // For each image, try to load its JSON sidecar to get the full prompt
      const withPrompts = await Promise.all(images.map(async (img) => {
        const jsonPath = img.pathname.replace(/\.webp$/, ".json").replace(/\.png$/, ".json").replace(/\.jpg$/, ".json");
        const jsonBlob = blobs.find(b => b.pathname === jsonPath);
        let prompt = "";
        if (jsonBlob) {
          try {
            const r = await fetch(jsonBlob.url);
            const j = await r.json();
            prompt = j.prompt;
          } catch {}
        }
        // Fallback: extract from filename if no JSON
        if (!prompt) {
          prompt = img.pathname.split("/").pop().replace(/-\d+\.(webp|png|jpg)$/, "").replace(/-/g, " ");
        }
        return { ...img, prompt };
      }));
      
      withPrompts.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setItems(withPrompts);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui", background: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: "28px" }}>Telecoms Lawyer Gallery</h1>
      <p style={{ opacity: 0.6, marginBottom: "30px" }}>
        {loading ? "Loading..." : `${items.length} permanent images stored`} — <a href="/" style={{ color: "#60a5fa" }}>Back to generator</a>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {items.map(b => (
          <div key={b.pathname} style={{ background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
            <img src={b.url} alt={b.pathname} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            <div style={{ padding: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: "1.3" }}>"{b.prompt}"</div>
              <div style={{ fontSize: "11px", opacity: 0.4, marginTop: "6px" }}>{new Date(b.uploadedAt).toLocaleString()}</div>
              <a href={b.url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#60a5fa", marginTop: "6px", display: "inline-block" }}>Open full size →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
