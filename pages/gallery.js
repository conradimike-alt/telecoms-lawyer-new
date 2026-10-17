import { useEffect, useState } from "react";

export default function Gallery() {
  const [blobs, setBlobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/list-images")
      .then(r => r.json())
      .then(data => {
        setBlobs(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui", background: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Telecoms Lawyer Gallery</h1>
      <p style={{ opacity: 0.6, marginBottom: "30px" }}>
        {loading ? "Loading..." : `${blobs.length} permanent images stored`}
        {" "}— <a href="/" style={{ color: "#60a5fa" }}>Back to generator</a>
      </p>

      {loading ? <p>Loading images...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {blobs.map(b => (
            <div key={b.pathname} style={{ background: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
              <img src={b.url} alt={b.pathname} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
              <div style={{ padding: "12px" }}>
                <div style={{ fontSize: "12px", opacity: 0.5, wordBreak: "break-all" }}>{b.pathname}</div>
                <div style={{ fontSize: "12px", opacity: 0.5 }}>{new Date(b.uploadedAt).toLocaleString()}</div>
                <a href={b.url} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#60a5fa", marginTop: "6px", display: "inline-block" }}>Open full size →</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
