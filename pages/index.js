import { useState } from 'react';

export default function Home() {
  const [scenario, setScenario] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate image - calls your existing API
  async function generateImage() {
    if (!scenario) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      if (data.image) {
        setImage(data.image);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate image');
    }
    setLoading(false);
  }

  // FIXED email function - no popup, no View as Webpage line, with Loved line
  function emailToMike() {
    const subject = "Here's my Telecoms Lawyer image";
    const body = `Hi Mike,

I *loved* your superhero telecoms lawyer! Here's what i had him do

Scenario: ${scenario}

Direct image: ${image}

Thanks!`;

    const mailtoLink = `mailto:mike.conradi@dlapiper.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const a = document.createElement('a');
    a.href = mailtoLink;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Superhero Telecoms Lawyer</h1>
      
      <input
        type="text"
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        placeholder="Enter scenario e.g. fighting a BT fibre monster in London"
        style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '12px' }}
      />

      <button 
        onClick={generateImage} 
        disabled={loading}
        style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>

      {image && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <img 
              src={image} 
              alt="Generated telecoms lawyer" 
              style={{ maxWidth: '100%', display: 'block', borderRadius: '8px' }} 
            />
            {/* FIXED BANNER - WRAPS FOR LONG PROMPTS */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              padding: '12px 20px',
              textAlign: 'center',
              fontSize: 'clamp(12px, 2.5vw, 16px)',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              maxHeight: '40%',
              overflowY: 'auto',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}>
              {scenario}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={emailToMike}
              style={{ padding: '12px 24px', fontSize: '16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Email Image to Mike
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
