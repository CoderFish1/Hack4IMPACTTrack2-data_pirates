const fs = require('fs');

async function testGroq() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const match = env.match(/GROQ_API_KEY=["']?(.*?)["']?(\n|$)/);
  if (!match) { console.log('NO KEY'); return; }
  const key = match[1].trim();

  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    const d = await r.json();
    if (d.error) {
      console.log('GROQ ERROR:', d.error);
    } else {
      const models = d.data.map(m => m.id);
      console.log('Models with vision or 3.3:', models.filter(id => id.includes('vision') || id.includes('3.3')));
    }
  } catch(e) { console.log('FETCH ERR', e); }
}
testGroq();
