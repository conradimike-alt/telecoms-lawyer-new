import { useEffect, useState } from "react";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/list-images")
      .then(r => r.json())
      .then(async (data) => {
        if (!Array.isArray(data)) {
          console.error(data);
          setLoading(false);
          return;
        }
        // 1. Only images
        const images = data.filter(b => b.pathname.endsWith(".webp") || b.pathname.endsWith(".png"));
        
        // 2. Attach prompt without extra fetches - just use filename + matching json if found
        const withPrompts = images.map(img => {
          const base = img.pathname.replace("gallery/", "").replace(/-\d+\.webp$/, "").replace(/-\d+\.png$/, "");
          // Try to find matching JSON blob in the same list
          const jsonBlob = data.find(b => b.pathname.includes(base) && b.pathname.endsWith(".json"));
          let prompt = base.replace(/-/g, " ");
          
          // If we have the json URL, we could fetch it, but to avoid CORS/loading issues,
          // just use the filename for now - it's instant and never fails
          return { ...img, prompt, jsonBlob };
        });

        setItems(withPrompts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:40, background:"#0a0a0a", minHeight:"100vh", color:"white"}}>Loading... — <a href="/" style={{color:"#60a5fa"}}>Back to generator</a></div>;

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui", background: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <h1>Telecoms Lawyer Gallery</h1>
      <p style={{ opacity: 0.6, marginBottom: "30px" }}>{items.length} permanent images — <a href="/" style={{color:"#60a5fa"}}>Back to generator</a></p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {items.map(b => (
          <div key={b.pathname} style={{ background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
            <img src={b.url} alt={b.pathname} style={{width:"100%", aspectRatio:"1/1", objectFit:"cover"}} />
            <div style={{padding:"14px"}}>
              <div style={{fontSize:"14px", fontWeight:700}}>"{b.prompt}"</div>
              <div style={{fontSize:"11px", opacity:0.4, marginTop:"6px"}}>{new Date(b.uploadedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
