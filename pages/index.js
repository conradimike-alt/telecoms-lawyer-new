import { useState, useEffect } from 'react';

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('scenario');
    if (p) {
      const d = decodeURIComponent(p.replace(/\+/g, ' '));
      setScenario(d);
      generate(d);
    }
  }, []);

  async function generate(customScen) {
    const s = customScen || scenario;
    if (!s.trim()) return;
    setLoading(true); setImage(null);
    const url = new URL(window.location); url.searchParams.set('scenario', s);
    window.history.replaceState({}, '', url);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: s }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const { id } = json;
      let tries = 0;
      while (tries < 60) {
        await new Promise(r => setTimeout(r, 2000));
        const poll = await fetch(`/api/status?id=${id}`);
        const data = await poll.json();
        if (data.status === 'succeeded') {
          const out = data.output?.[0] || data.output;
          if (out) { setImage(out); setLoading(false); return; }
        }
        if (data.status === 'failed') throw new Error(data.error);
        tries++;
      }
      throw new Error("Timed out");
    } catch (e) { alert(e.message); setLoading(false); }
  }
  function emailToMike() {
    const viewLink = window.location.href;
    const subject = "Here's my Telecoms Lawyer image";
    const body = `Hi Mike,\n\nScenario: ${scenario}\n\nView as webpage: ${viewLink}\nDirect image: ${image}\n\nThanks!`;

    // Try mailto
    const mailtoLink = `mailto:mike.conradi@dlapiper.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // This method works more reliably than window.location.href
    const a = document.createElement('a');
    a.href = mailtoLink;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Fallback: If nothing happened after 1 second, offer Gmail + Copy
    setTimeout(() => {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=mike.conradi@dlapiper.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      if (confirm("If your email didn't open, click OK to open in Gmail, or Cancel to copy the link to clipboard.")) {
        window.open(gmailUrl, '_blank');
      } else {
        navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
        alert("Copied to clipboard! You can now paste into Outlook/Teams:\n\n" + body);
      }
    }, 1000);
  }
 
  return (
    <div style={{fontFamily:'Arial Black, Arial', background:'#fefefe', minHeight:'100vh'}}>
      <div style={{textAlign:'center', padding:'15px'}}><img src="/header.png" alt="header" style={{maxWidth:'100%', maxHeight:'140px'}} /></div>
      <div style={{maxWidth:'680px', margin:'0 auto', padding:'16px'}}>
        <div style={{border:'3px solid #000', borderRadius:'14px', padding:'16px', background:'#fff', boxShadow:'6px 6px 0 #000'}}>
          <input value={scenario} onChange={e=>setScenario(e.target.value)} placeholder="e.g. saves cat from a tree" style={{width:'100%', padding:'14px', border:'3px solid #000', borderRadius:'10px', fontSize:'16px', boxSizing:'border-box'}} />
          <button onClick={()=>generate()} disabled={loading} style={{width:'100%', marginTop:'12px', background:'#ffeb3b', border:'3px solid #000', padding:'14px', fontWeight:900, fontSize:'1.1rem', borderRadius:'10px', cursor:'pointer'}}>{loading? '⚡ GENERATING...' : '🎨 GENERATE CARTOON NOW'}</button>
        </div>
        {image && (
          <>
            <div style={{marginTop:'24px', border:'4px solid #000', borderRadius:'12px', overflow:'hidden', boxShadow:'6px 6px 0 #000', position:'relative', lineHeight:0}}>
              <img src={image} style={{width:'100%', display:'block'}} />
              <div style={{position:'absolute', top:0, left:0, right:0, background:'#1e88e5', color:'#fff', padding:'12px', textAlign:'center', fontWeight:900, borderBottom:'4px solid #000'}}>TELECOMS LAWYER..</div>
              <div style={{position:'absolute', bottom:'18px', left:'50%', transform:'translateX(-50%)', filter:'drop-shadow(3px 3px 0 #000)'}}>
                <div style={{background:'#ffeb3b', border:'3px solid #000', padding:'10px 36px', fontWeight:900, clipPath:'polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%, 8% 50%)', textTransform:'uppercase'}}>{scenario}</div>
              </div>
            </div>
            <button onClick={emailToMike} style={{width:'100%', marginTop:'20px', background:'#1e88e5', color:'#fff', border:'3px solid #000', padding:'16px', fontWeight:900, fontSize:'1.1rem', borderRadius:'12px', cursor:'pointer', boxShadow:'6px 6px 0 #000'}}>📧 EMAIL THIS TO MIKE</button>
          </>
        )}
      </div>
    </div>
  );
}
