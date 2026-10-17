import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/list-images', { cache: 'no-store' });
        const data = await res.json();
        let list = data.images || [];

        // Fetch the real prompt from each json file in the browser (fast, doesn't time out server)
        const enriched = await Promise.all(list.map(async (img) => {
          if (img.jsonUrl) {
            try {
              const r = await fetch(img.jsonUrl, { cache: 'no-store' });
              if (r.ok) {
                const j = await r.json();
                if (j.prompt) return { ...img, prompt: j.prompt };
              }
            } catch {}
          }
          return img;
        }));

        setImages(enriched);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ background: '#111', minHeight: '100vh', color: '#fff', padding: '24px', fontFamily: 'Arial Black, Arial' }}>
        <h1 style={{ fontFamily: "'Bangers', cursive", fontSize: '42px', letterSpacing: '1.5px', margin: 0 }}>Telecoms Lawyer Gallery</h1>
        <div style={{ marginTop: '8px', color: '#aaa', fontFamily: 'Arial' }}>
          {loading ? 'Loading...' : `${images.length} permanent images — `} 
          <Link href="/" style={{ color: '#5ea8ff' }}>Back to generator</Link>
        </div>

        {loading ? null : images.length === 0 ? (
          <div style={{ marginTop: '40px', color: '#888' }}>No images yet. Generate one!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px', marginTop: '28px' }}>
            {images.map((img, i) => (
              <div key={img.pathname || i} style={{ border: '3px solid #fff', borderRadius: '12px', overflow: 'hidden', background: '#222' }}>
                <img src={img.url} style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ padding: '10px 12px', background: '#ffeb3b', color: '#000', fontFamily: "'Bangers', cursive", fontSize: '18px', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                  {img.prompt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
