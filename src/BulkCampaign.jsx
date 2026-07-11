import { useState } from 'react'
import { AlertCircle, BookOpen, Download, FileSpreadsheet, Loader2, Play, Sparkles } from 'lucide-react'

async function generateBulkPost({ apiKey, topic }){
 const prompt = `You are an expert LinkedIn content writer. Write a highly engaging, professional, and scannable LinkedIn post about the topic: "${topic}".
  
Also, design a highly specific, editorial text-to-image prompt to create a background illustration for this post.
  
Guidelines for the post:
1. Start with a scroll-stopping hook.
2. Space out short paragraphs.
3. Use bullet points or numbers with emojis.
4. End with a question.
5. Include exactly 3 hashtags.
6. Do not include markdown bold (**) or code blocks.
  
Guidelines for the illustration prompt:
- It must be artistic, editorial, technology-focused, with a dark background.
- Do not include any text, letters, words, or watermarks in the prompt.
- Example: "Abstract editorial illustration of connected digital networks, dark purple and cyan theme, synthwave style"
  
Format your output EXACTLY as follows:
===POST===
[Your LinkedIn post here]
===PROMPT===
[Your 1-sentence image prompt here]`;

 const endpoints = [
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
 ];

 let lastError = null;
 for (const url of endpoints) {
  try {
   const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     contents: [{ parts: [{ text: prompt }] }],
     generationConfig: { temperature: 0.75, maxOutputTokens: 1000 }
    })
   });
   if (response.ok) {
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    const parts = text.split('===PROMPT===');
    const postContent = parts[0].replace('===POST===', '').trim();
    const imgPrompt = parts[1] ? parts[1].trim() : `Editorial digital technology illustration, dark background, topic of ${topic}`;
    
    return { postContent, imgPrompt };
   }
   const err = await response.json();
   lastError = new Error(err.error?.message || `Gemini API returned ${response.status}`);
  } catch (e) {
   lastError = e;
  }
 }
 throw lastError || new Error("Failed to generate content with Gemini API.");
}

const sampleTopics = [
 "Why learning AI is about system design, not prompting",
 "How to build a coding agent from scratch using python",
 "The truth about remote developer productivity in 2026",
 "Why static pages are making a massive comeback",
 "How I structure my daily learning schedule for tech topics",
 "Why you should stop copying generic LinkedIn templates",
 "How vector databases work without the complex math",
 "What I learned from deploying my first LLM model locally",
 "Why the terminal is still the most powerful tool in software engineering"
]

export default function BulkCampaign({ geminiKey, onSaveDrafts }){
 const [rawTopics, setRawTopics] = useState(sampleTopics.join('\n'));
 const [postsPerDay, setPostsPerDay] = useState(3);
 const [progress, setProgress] = useState([]);
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState('');
 const [generated, setGenerated] = useState([]);

 const loadSamples = () => {
  setRawTopics(sampleTopics.join('\n'));
 };

 const handleGenerate = async () => {
  if (!geminiKey) {
   setStatus('You need a Google Gemini API Key to run bulk campaign generations. Please add it in the Compose tab.');
   return;
  }
  const topics = rawTopics.split('\n').map(t => t.trim()).filter(Boolean);
  if (topics.length === 0) {
   setStatus('Please enter at least one topic.');
   return;
  }

  setLoading(true);
  setStatus('');
  setGenerated([]);
  const activeProgress = topics.map(t => ({ topic: t, state: 'pending' }));
  setProgress(activeProgress);

  const results = [];
  for (let i = 0; i < topics.length; i++) {
   const currentTopic = topics[i];
   activeProgress[i].state = 'generating';
   setProgress([...activeProgress]);

   try {
    const { postContent, imgPrompt } = await generateBulkPost({ apiKey: geminiKey, topic: currentTopic });
    const seed = Math.floor(Math.random() * 1000000);
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}?width=720&height=900&nologo=true&seed=${seed}&model=flux`;
    
    results.push({
     id: Date.now() + i,
     topic: currentTopic,
     post: postContent,
     imageUrl: imgUrl,
     date: new Date().toLocaleDateString(),
     status: 'Scheduled'
    });

    activeProgress[i].state = 'done';
   } catch (e) {
    activeProgress[i].state = 'error';
    setStatus(`Failed at topic "${currentTopic}": ${e.message}`);
   }
   setProgress([...activeProgress]);
  }

  setGenerated(results);
  if (results.length > 0) {
   onSaveDrafts(results);
  }
  setLoading(false);
 };

 const downloadCampaignCSV = () => {
  if (generated.length === 0) return;
  const headers = ['Date', 'Time', 'Content', 'Link'];
  const rows = generated.map((x, idx) => {
   const dateObj = new Date();
   const daysOffset = Math.floor(idx / postsPerDay) + 1;
   dateObj.setDate(dateObj.getDate() + daysOffset);
   
   const times = postsPerDay === 1 
     ? ['12:00'] 
     : postsPerDay === 2 
       ? ['09:00', '17:00'] 
       : ['09:00', '14:00', '19:00'];
   
   const time = times[idx % postsPerDay];
   const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
   const escapedPost = x.post.replace(/"/g, '""');
   return [`"${dateStr}"`, `"${time}"`, `"${escapedPost}"`, `"${x.imageUrl}"`]
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `linkedin_bulk_campaign_${generated.length}_posts.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 return (
  <div className="page-panel" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', padding: '30px' }}>
   <section className="visual-controls" style={{ padding: 0 }}>
    <div className="page-heading">
     <small>BULK CAMPAIGN ENGINE</small>
     <h1>Scale your pipeline,<br/><em>not your hours.</em></h1>
     <p>Enter a list of topics. We'll write the posts with Gemini AI and auto-generate matching background illustrations.</p>
    </div>

    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#aaa', marginBottom: '8px' }}>Topics (One topic per line)</label>
    <textarea 
     value={rawTopics} 
     onChange={e => setRawTopics(e.target.value)} 
     rows="8" 
     placeholder="Enter your topics here..."
     style={{ width: '100%', background: '#0d0e12', border: '1px solid #2b2d34', borderRadius: '8px', color: '#eee', padding: '12px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'inherit', marginBottom: '15px' }}
     disabled={loading}
    />

    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
     <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '5px' }}>Posts Per Day</label>
      <select 
       value={postsPerDay} 
       onChange={e => setPostsPerDay(Number(e.target.value))}
       style={{ width: '100%', padding: '10px', background: '#0d0e12', border: '1px solid #2b2d34', borderRadius: '8px', color: '#eee' }}
       disabled={loading}
      >
       <option value={1}>1 post per day</option>
       <option value={2}>2 posts per day</option>
       <option value={3}>3 posts per day</option>
      </select>
     </div>
     <button 
      onClick={loadSamples} 
      style={{ padding: '10px 14px', background: '#1c1e24', border: '1px solid #2d3037', borderRadius: '8px', color: '#aaa', cursor: 'pointer', fontSize: '12px', marginTop: '18px' }}
      disabled={loading}
     >
      Load Sample Topics
     </button>
    </div>

    <button 
     onClick={handleGenerate} 
     disabled={loading}
     style={{ width: '100%', padding: '14px', background: '#ab7fc0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
    >
     {loading ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
     {loading ? 'Generating Campaign...' : 'Generate AI Posts & Graphics'}
    </button>

    {status && (
     <div style={{ marginTop: '15px', background: '#25161c', border: '1px solid #4a1d25', color: '#f8a8b8', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '8px' }}>
      <AlertCircle size={16} style={{ flexShrink: 0 }} />
      <span>{status}</span>
     </div>
    )}
   </section>

   <section style={{ background: '#111216', border: '1px solid #22242a', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
    <h3 style={{ fontSize: '15px', color: '#eee', margin: '0 0 16px 0', borderBottom: '1px solid #22242a', paddingBottom: '10px' }}>Campaign Status</h3>

    {progress.length === 0 ? (
     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#686a74', textAlign: 'center' }}>
      <BookOpen size={36} style={{ marginBottom: '12px' }} />
      <h4 style={{ margin: '0 0 4px 0', color: '#aaa' }}>No Campaign Active</h4>
      <p style={{ fontSize: '12px', margin: 0 }}>Add topics and click Generate to start.</p>
     </div>
    ) : (
     <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', marginBottom: '20px', paddingRight: '5px' }}>
      {progress.map((item, idx) => (
       <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #16171c' }}>
        <div style={{ maxWidth: '80%' }}>
         <div style={{ fontSize: '12px', color: '#eee', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.topic}</div>
         <small style={{ color: '#666', fontSize: '10px' }}>Post {idx + 1}</small>
        </div>
        <div>
         {item.state === 'pending' && <span style={{ fontSize: '10px', color: '#555', background: '#1c1e24', padding: '3px 8px', borderRadius: '12px' }}>Waiting</span>}
         {item.state === 'generating' && <span style={{ fontSize: '10px', color: '#dca6f7', background: '#251a2e', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 className="spin" size={10}/> AI Writing</span>}
         {item.state === 'done' && <span style={{ fontSize: '10px', color: '#a6e22e', background: '#1d2a18', padding: '3px 8px', borderRadius: '12px' }}>✓ Ready</span>}
         {item.state === 'error' && <span style={{ fontSize: '10px', color: '#f92672', background: '#2e181e', padding: '3px 8px', borderRadius: '12px' }}>Error</span>}
        </div>
       </div>
      ))}
     </div>
    )}

    {generated.length > 0 && (
     <div style={{ background: '#151c14', border: '1px dashed #2d4f21', borderRadius: '8px', padding: '16px', marginTop: 'auto' }}>
      <h4 style={{ margin: '0 0 4px 0', color: '#a6e22e', fontSize: '14px' }}>✓ Campaign Generated!</h4>
      <p style={{ fontSize: '11px', color: '#88a47e', margin: '0 0 12px 0' }}>{generated.length} posts and background graphics have been added to your local library.</p>
      <button 
       onClick={downloadCampaignCSV}
       style={{ width: '100%', padding: '10px', background: '#2d4f21', color: '#a6e22e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
       <FileSpreadsheet size={15} /> Download Campaign CSV
      </button>
     </div>
    )}
   </section>
  </div>
 )
}
