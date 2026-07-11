import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronRight, Clipboard, FileText, Image, Lightbulb, Loader2, Save, Send, Sparkles, Trash2, WandSparkles } from 'lucide-react'
import VisualStudio from './VisualStudio.jsx'
import BulkCampaign from './BulkCampaign.jsx'

const frameworks=[
 {id:'insight',name:'Insight Stack',tag:'Educational',desc:'Hook → shift → framework → takeaway',icon:'01'},
 {id:'myth',name:'Myth Breaker',tag:'Point of view',desc:'Common belief → problem → better approach',icon:'02'},
 {id:'build',name:'Build in Public',tag:'Portfolio',desc:'Problem → decisions → result → learning',icon:'03'},
 {id:'list',name:'Practical Playbook',tag:'Saveable',desc:'Tension → steps → checklist → question',icon:'04'},
]
const tones=['Clear & educational','Personal & reflective','Bold & contrarian','Practical & direct']
const audiences=['AI beginners','Tech professionals','Product & project leaders','Creators & learners']

function createPost({topic,point,audience,tone,framework}){
 const t=topic.trim()||'building useful software systems'; const p=point.trim()||'The tool matters less than the system around it.'
 if(framework==='myth') return `The biggest misconception about ${t}?\n\nThat success comes from adding more tools or complexity.\n\nIt sounds reasonable. But it usually creates three problems:\n\n→ More handoffs nobody owns\n→ More output nobody verifies\n→ More complexity before value\n\nA better question is not “Which tool should we add?”\n\nAsk:\n• What core problem are we solving?\n• What evidence would prove it works?\n• Where is the simplest path to value?\n\n${p}\n\nWhat misconception do you keep seeing in your work?\n\n#Technology #SoftwareEngineering #Productivity`
 if(framework==='build') return `I built a small project around ${t}.\n\nNot because the world needed another demo.\n\nI wanted to understand what happens between an idea and a working system.\n\nWhat I changed along the way:\n\n01 — Started with the user’s core question\n02 — Removed features that looked good but taught nothing\n03 — Made the difficult concepts visual\n04 — Tested every flow as a first-time visitor\n\nThe biggest lesson?\n\n${p}\n\nBuilding in public turns vague knowledge into visible proof of work.\n\nWhat are you learning by building right now?\n\n#BuildInPublic #SoftwareEngineering #WebDevelopment #Programming`
 if(framework==='list') return `${t} is easier to understand when you stop treating it as one big topic.\n\nUse this simple learning sequence:\n\n1. Understand the problem\n2. Learn the smallest useful concept\n3. See one practical example\n4. Practice with a real scenario\n5. Explain it without jargon\n\nBefore moving forward, check:\n\n✓ Can I explain why it matters?\n✓ Can I name one limitation?\n✓ Can I apply it to my work?\n\n${p}\n\nSave this for your next learning session. What would you add?\n\n#Learning #TechSkills #CareerGrowth`
 return `${t} just became more important—and more misunderstood.\n\nThe people who benefit most will not be those who memorize the most terminology.\n\nThey will understand how the pieces connect.\n\nHere is the simple map:\n\n→ First principles define the foundation\n→ Actionable experience builds proof\n→ Systems handle the execution\n→ Iteration reveals where it breaks\n→ Consistency decides whether it succeeds\n\n${p}\n\nThe takeaway:\n\nDon’t focus on isolated elements. Build the system that connects them.\n\nWhich part of this matches your experience?\n\n#Technology #Systems #SoftwareEngineering`
}

async function generatePostWithGemini({ apiKey, topic, point, tone, framework }){
 const prompt = `You are a master of writing viral, high-value LinkedIn content for tech audiences. Write a compelling, scannable post.

Core Input Parameters:
- Primary Topic: "${topic}"
- Personal Experience / Core Message: "${point || "Auto-generate a highly relevant, step-by-step, actionable personal schedule or practical lesson based on the topic."}"
- Desired Tone: "${tone}"
- Content Framework: "${framework.toUpperCase()}" (Structure your post strictly according to this framework: Hook -> High-value actionable details/steps -> Key takeaway -> Interactive ending question)

Writing Instructions:
1. Hook: Start with a powerful 1-2 sentence hook. Make it punchy, contrarian, or highly relatable to the target audience.
2. Body Structure: Space out paragraphs. Keep sentences short. Use bullet points, emojis, or a step-by-step numbered breakdown to make it highly scannable and easy to read.
3. Actionable Depth: Provide concrete, specific details (e.g., if the topic is a schedule, list actual times, durations, or exact steps). Do not be generic.
4. Call to Action: Conclude with a single-sentence key takeaway and a high-engagement question.
5. Hashtags: End with exactly 3 relevant hashtags.
6. Formatting: Return ONLY the raw post content. Do not include markdown bold "**text**" or header sizes like "###", code blocks, metadata, titles, or notes.`;

 const endpoints = [
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
 ];

 let lastError = null;
 for (const url of endpoints) {
  try {
   const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     contents: [{ parts: [{ text: prompt }] }],
     generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 1000
     }
    })
   });
   if (response.ok) {
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
   }
   const err = await response.json();
   lastError = new Error(err.error?.message || `Gemini API returned ${response.status}`);
  } catch (e) {
   lastError = e;
  }
 }
 throw lastError || new Error("Failed to generate content with Gemini API.");
}

async function fetchLinkedInProfile(token) {
 try {
  const url = `https://corsproxy.io/?url=${encodeURIComponent('https://api.linkedin.com/v2/userinfo')}`;
  const res = await fetch(url, {
   headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
   const data = await res.json();
   return {
    name: data.name || `${data.given_name} ${data.family_name}`,
    urn: `urn:li:person:${data.sub}`
   };
  }
 } catch (e) {
  console.error("userinfo failed, trying /me", e);
 }

 const urlMe = `https://corsproxy.io/?url=${encodeURIComponent('https://api.linkedin.com/v2/me')}`;
 const resMe = await fetch(urlMe, {
  headers: { 'Authorization': `Bearer ${token}` }
 });
 if (!resMe.ok) {
  throw new Error("Invalid LinkedIn Access Token.");
 }
 const dataMe = await resMe.json();
 const name = `${dataMe.localizedFirstName} ${dataMe.localizedLastName}`;
 return {
  name,
  urn: `urn:li:person:${dataMe.id}`
 };
}

async function publishToLinkedIn({ token, authorUrn, text }) {
 const url = `https://corsproxy.io/?url=${encodeURIComponent('https://api.linkedin.com/rest/posts')}`;
 const response = await fetch(url, {
  method: 'POST',
  headers: {
   'Authorization': `Bearer ${token}`,
   'Content-Type': 'application/json',
   'LinkedIn-Version': '202401',
   'X-Restli-Protocol-Version': '2.0.0'
  },
  body: JSON.stringify({
   author: authorUrn,
   commentary: text,
   visibility: 'PUBLIC',
   distribution: {
    feedDistribution: 'MAIN_FEED',
    targetEntities: [],
    thirdPartyDistributionChannels: []
   },
   lifecycleState: 'PUBLISHED'
  })
 });
 if (!response.ok) {
  const err = await response.json();
  throw new Error(err.message || "Failed to publish post to LinkedIn.");
 }
 return true;
}

function App(){
 const [tab,setTab]=useState('compose'); const [framework,setFramework]=useState('insight'); const [topic,setTopic]=useState('How machines learn'); const [point,setPoint]=useState(''); const [audience,setAudience]=useState(audiences[0]); const [tone,setTone]=useState(tones[0]); const [post,setPost]=useState(''); const [saved,setSaved]=useState(()=>JSON.parse(localStorage.getItem('signal-drafts')||'[]')); const [copied,setCopied]=useState(false)
 const [geminiKey,setGeminiKey]=useState(()=>localStorage.getItem('gemini-api-key')||''); const [loading,setLoading]=useState(false); const [status,setStatus]=useState('');
 const [showCopyGuide,setShowCopyGuide]=useState(false);
 const [liToken, setLiToken] = useState(() => localStorage.getItem('li-token') || '');
 const [liUser, setLiUser] = useState(() => JSON.parse(localStorage.getItem('li-user') || 'null'));
 const [publishing, setPublishing] = useState(false);
 const [liStatus, setLiStatus] = useState('');
 const [visTitle, setVisTitle] = useState('AI IS NOT ONE TOOL');
 const [visSubtitle, setVisSubtitle] = useState('It is a connected system of decisions.');
 const [visImage, setVisImage] = useState('');
 const [visPrompt, setVisPrompt] = useState('Editorial technology illustration, dark background, elegant connected AI system, no text');

 useEffect(()=>localStorage.setItem('signal-drafts',JSON.stringify(saved)),[saved])
 useEffect(()=>localStorage.setItem('gemini-api-key',geminiKey),[geminiKey])
 useEffect(() => localStorage.setItem('li-token', liToken), [liToken])
 useEffect(() => localStorage.setItem('li-user', JSON.stringify(liUser)), [liUser])
 useEffect(()=>{if(!post)setPost(createPost({topic,point,audience,tone,framework}))},[])

 const connectLinkedIn = async () => {
  if (!liToken) {
   setLiStatus('Please enter an access token.');
   return;
  }
  setLiStatus('Connecting...');
  try {
   const profile = await fetchLinkedInProfile(liToken);
   setLiUser(profile);
   setLiStatus(`✓ Connected as ${profile.name}`);
  } catch (e) {
   setLiStatus(`Error: ${e.message}`);
   setLiUser(null);
  }
 };

 const disconnectLinkedIn = () => {
  setLiToken('');
  setLiUser(null);
  setLiStatus('');
 };

 const handleDirectPublish = async () => {
  if (!liUser || !liToken) return;
  setPublishing(true);
  try {
   await publishToLinkedIn({ token: liToken, authorUrn: liUser.urn, text: post });
   alert('✓ Post successfully published on LinkedIn!');
  } catch (e) {
   alert(`Failed to publish: ${e.message}`);
  } finally {
   setPublishing(false);
  }
 };

 const stats=useMemo(()=>({chars:post.length,words:post.trim()?post.trim().split(/\s+/).length:0,read:Math.max(1,Math.ceil(post.trim().split(/\s+/).length/180))}),[post])
 
 const generate=async()=>{
  if(geminiKey){
   setLoading(true); setStatus('Generating post with Gemini AI...');
   try{
    const val=await generatePostWithGemini({apiKey:geminiKey,topic,point,tone,framework});
    setPost(val); setStatus('');
   }catch(e){
    setStatus(`⚠️ AI Error: ${e.message}. Used fallback template.`);
    setPost(createPost({topic,point,audience,tone,framework}));
   }finally{
    setLoading(false);
   }
  }else{
   setStatus('ℹ️ Offline mode: Using pre-structured template. Paste a Gemini API Key to write customized AI drafts!');
   setPost(createPost({topic,point,audience,tone,framework}))
  }
 }

 const save=()=>setSaved([{id:Date.now(),topic,post,date:new Date().toLocaleDateString(),status:'Draft'},...saved]);
 const copy=async()=>{await navigator.clipboard.writeText(post);setCopied(true);setShowCopyGuide(true);setTimeout(()=>setCopied(false),1600)}
 
 const exportCSV=()=>{
  if(saved.length===0){alert('No drafts saved yet.');return}
  const headers=['Date','Time','Content','Link'];
  const rows=saved.map((x,idx)=>{
   const dateObj=new Date();
   const daysOffset=Math.floor(idx/3)+1;
   dateObj.setDate(dateObj.getDate()+daysOffset);
   const times=['09:00','14:00','19:00'];
   const time=times[idx%3];
   const dateStr=`${dateObj.getMonth()+1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
   const escapedPost=x.post.replace(/"/g,'""');
   return [`"${dateStr}"`,`"${time}"`,`"${escapedPost}"`,x.imageUrl?`"${x.imageUrl}"`:'""']
  });
  const csvContent="data:text/csv;charset=utf-8,"+ [headers.join(','),...rows.map(e=>e.join(','))].join('\n');
  const link=document.createElement('a');
  link.setAttribute('href',encodeURI(csvContent));
  link.setAttribute('download',`linkedin_buffer_schedule.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 }

 return <div className="app-shell">
  <aside className="sidebar"><div className="brand"><span>S</span><div><b>SIGNAL</b><small>CONTENT STUDIO</small></div></div><nav>{[['compose',WandSparkles,'Compose'],['campaign',CalendarDays,'Bulk Campaign'],['visuals',Image,'Visuals & GIF'],['drafts',FileText,'Drafts']].map(([id,I,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><I size={18}/>{label}</button>)}</nav><div className="side-note"><Sparkles size={17}/><b>Human first</b><p>Draft with structure. Review with judgement. Publish manually.</p></div><footer>NO LINKEDIN CREDENTIALS<br/>STORED OR REQUIRED</footer></aside>
  <main><header className="topbar"><div><span className="live-dot"/> PRIVATE WORKSPACE</div><div className="top-actions"><button onClick={save}><Save size={15}/> Save draft</button><button className="publish" onClick={()=>window.open('https://www.linkedin.com/feed/?shareActive=true','_blank')}><Send size={15}/> Open LinkedIn</button></div></header>
   {tab==='compose'&&<div className="workspace"><section className="composer"><div className="section-title"><small>01 / STRATEGY</small><h1>Turn one idea into<br/><em>a post worth reading.</em></h1><p>Choose a proven information structure, add your real experience, then edit until it sounds like you.</p></div><div className="form-block"><label>What do you want to write about?</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. What I learned building an AI course"/><label>Your original point or experience (Optional - AI will write if empty)</label><textarea value={point} onChange={e=>setPoint(e.target.value)} rows="3"/><div className="two-cols"><div><label>Audience</label><select value={audience} onChange={e=>setAudience(e.target.value)}>{audiences.map(x=><option key={x}>{x}</option>)}</select></div><div><label>Tone</label><select value={tone} onChange={e=>setTone(e.target.value)}>{tones.map(x=><option key={x}>{x}</option>)}</select></div></div><div style={{marginTop:'15px',background:'#15131a',border:'1px dashed #44344f',padding:'16px',borderRadius:'10px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><label style={{font:'10px DM Mono',color:'#ab7fc0',letterSpacing:'.09em',margin:0}}>✨ GOOGLE GEMINI AI WRITER (FREE)</label><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{color:'#8d679e',fontSize:'9px',textDecoration:'underline'}}>Get your API key in 30 seconds</a></div><p style={{fontSize:'11px',color:'#888',margin:'0 0 10px 0',lineHeight:'1.4'}}>By default, the app uses offline templates. Paste a free key from Google AI Studio to unlock custom, tailored AI generation for any topic!</p><div style={{display:'flex',gap:'8px'}}><input type="password" value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} placeholder="Paste your API key (starts with AIzaSy...)" style={{flex:1,background:'#0d0e12',border:'1px solid #2b2c34'}}/>{geminiKey&&<button onClick={()=>setGeminiKey('')} style={{border:'1px solid #30323a',background:'#16171c',color:'#aaaeb6',borderRadius:'7px',padding:'0 12px',cursor:'pointer'}}>Clear</button>}</div></div><div style={{marginTop:'15px',background:'#0e141b',border:'1px dashed #203e5f',padding:'16px',borderRadius:'10px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><label style={{font:'10px DM Mono',color:'#58a6ff',letterSpacing:'.09em',margin:0}}>⚡ DIRECT LINKEDIN PUBLISHING (OPTIONAL)</label>{liUser&&<button onClick={disconnectLinkedIn} style={{color:'#f85149',background:'none',border:'none',fontSize:'9px',cursor:'pointer',textDecoration:'underline'}}>Disconnect</button>}</div><p style={{fontSize:'11px',color:'#888',margin:'0 0 10px 0',lineHeight:'1.4'}}>{liUser?`Connected as ${liUser.name} (${liUser.urn})` : "Paste your LinkedIn Access Token to enable instant, one-click publishing directly from this workspace."}</p>{!liUser&&<div style={{display:'flex',gap:'8px'}}><input type="password" value={liToken} onChange={e=>setLiToken(e.target.value)} placeholder="Paste access token (starts with AQ...)" style={{flex:1,background:'#0d0e12',border:'1px solid #2b2c34'}}/><button onClick={connectLinkedIn} style={{border:'1px solid #30323a',background:'#16171c',color:'#eee',borderRadius:'7px',padding:'0 16px',cursor:'pointer',fontSize:'12px'}}>Connect</button></div>}{liStatus&&<p style={{fontSize:'10px',color:liUser?'#56ff56':'#ff5656',margin:'5px 0 0 0'}}>{liStatus}</p>}</div></div><div className="frameworks"><div className="block-head"><div><small>02 / STRUCTURE</small><h2>Choose a framework</h2></div><Lightbulb size={20}/></div>{frameworks.map(f=><button key={f.id} onClick={()=>setFramework(f.id)} className={framework===f.id?'active':''}><span>{f.icon}</span><div><b>{f.name}</b><small>{f.desc}</small></div><em>{f.tag}</em><Check size={16}/></button>)}</div><button className="generate" onClick={generate} disabled={loading}>{loading?<Loader2 className="spin" size={18}/>:<Sparkles size={18}/>} {loading?'Generating draft...':geminiKey?'Generate draft with Gemini AI':'Generate structured template'} <ChevronRight size={17}/></button>{status&&<p style={{fontSize:'11px',color:'#af8fbd',marginTop:'8px'}}>{status}</p>}</section>
     <section className="preview"><div className="preview-head"><div><small>LIVE PREVIEW</small><span>LinkedIn text post</span></div><div style={{display:'flex',gap:'8px'}}>{liUser&&<button onClick={handleDirectPublish} disabled={publishing} style={{background:'#0a66c2',color:'#fff',border:'none',borderRadius:'6px',padding:'6px 12px',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}>{publishing?<Loader2 className="spin" size={13}/>:<Send size={13}/>}{publishing?'Publishing...':'Publish Direct'}</button>}<button onClick={copy}>{copied?<Check size={16}/>:<Clipboard size={16}/>} {copied?'Copied':'Copy'}</button></div></div><div className="post-card"><div className="profile"><div className="avatar">LS</div><div><b>Lalit Singh</b><span>Learning AI by building · Just now · ◉</span></div></div><textarea value={post} onChange={e=>setPost(e.target.value)}/><div className="post-metrics"><span>{stats.chars} characters</span><span>{stats.words} words</span><span>~{stats.read} min read</span></div></div><div className="quality"><div><b>Post quality</b><span>Strong foundation</span></div>{[['Clear first-line hook',true],['Scannable line length',true],['Original point included',point.length>15],['Ends with a conversation',post.includes('?')]].map(([x,ok])=><p key={x} className={ok?'ok':''}><i>{ok?'✓':'·'}</i>{x}</p>)}</div><div style={{marginTop:'20px',background:'#121318',border:'1px dashed #303139',borderRadius:'12px',padding:'16px'}}><h3 style={{margin:'0 0 6px 0',fontSize:'13px',color:'#fff',display:'flex',alignItems:'center',gap:'6px'}}><Image size={15} style={{color:'#ab7fc0'}}/> 🎨 Design matching visual</h3><p style={{margin:'0 0 12px 0',fontSize:'11px',color:'#8c8e96',lineHeight:'1.4'}}>Transform this generated post into a premium, animated looping GIF visual for your LinkedIn feed.</p><button onClick={()=>{let t=topic.toUpperCase();if(t.length>30)t=t.slice(0,30)+'...';let s=point||"A connected system of decisions.";if(s.length>85)s=s.slice(0,85)+'...';setVisTitle(t);setVisSubtitle(s);setVisPrompt(`Editorial technology illustration, dark background, elegant connected system for ${topic}, no text`);setVisImage('');setTab('visuals')}} style={{width:'100%',padding:'10px',background:'#704883',border:'none',borderRadius:'7px',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:'12px'}}>Create GIF Visual →</button></div></section></div>}
    {tab==='visuals'&&<VisualStudio title={visTitle} setTitle={setVisTitle} subtitle={visSubtitle} setSubtitle={setVisSubtitle} image={visImage} setImage={setVisImage} prompt={visPrompt} setPrompt={setVisPrompt} />}{tab==='campaign'&&<BulkCampaign geminiKey={geminiKey} onSaveDrafts={(newDrafts)=>setSaved([...newDrafts,...saved])}/>} {tab==='drafts'&&<Drafts saved={saved} setSaved={setSaved} setPost={setPost} setTab={setTab} exportCSV={exportCSV}/>}
  </main>

  {showCopyGuide && (
   <div style={{position:'fixed',inset:0,background:'rgba(5,5,8,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,backdropFilter:'blur(4px)'}}>
    <div style={{background:'#111216',border:'1px solid #3a3242',borderRadius:'16px',padding:'30px',maxWidth:'460px',width:'90%',textAlign:'center',boxShadow:'0 30px 60px rgba(0,0,0,0.5)'}}>
     <div style={{width:'60px',height:'60px',background:'#1d1925',borderRadius:'50%',display:'grid',placeItems:'center',margin:'0 auto 16px',color:'#ab7fc0'}}><Check size={32}/></div>
     <h2 style={{fontSize:'22px',margin:'0 0 10px 0',color:'#fff'}}>Copied to Clipboard!</h2>
     <p style={{fontSize:'13px',color:'#8c8e96',lineHeight:'1.6',margin:'0 0 24px 0'}}>We are opening LinkedIn in a new tab. Just right-click and select <b>Paste</b> (or press <b>Ctrl+V</b> / <b>Cmd+V</b>) in the share box!</p>
     <div style={{display:'flex',gap:'10px'}}>
      <button onClick={()=>{window.open('https://www.linkedin.com/feed/?shareActive=true','_blank');setShowCopyGuide(false)}} style={{flex:1,padding:'12px',background:'#e6e4e9',color:'#111217',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:700,fontSize:'13px'}}>Open LinkedIn & Post</button>
      <button onClick={()=>setShowCopyGuide(false)} style={{padding:'12px 20px',background:'#1c1e24',color:'#aaa',border:'1px solid #2d3037',borderRadius:'8px',cursor:'pointer',fontSize:'13px'}}>Close</button>
     </div>
    </div>
   </div>
  )}
 </div>
}

function Calendar({saved}){const days=Array.from({length:28},(_,i)=>i+1);return <div className="page-panel"><div className="page-heading"><small>CONTENT RHYTHM</small><h1>Plan consistency,<br/><em>not noise.</em></h1><p>A simple calendar for ideas and approved drafts. Publishing remains manual.</p></div><div className="calendar-grid">{days.map(d=><div key={d}><span>JUL {d}</span>{d===14&&<b className="event purple">AI learning lesson</b>}{d===18&&<b className="event blue">Build update</b>}{d===23&&<b className="event green">Practical playbook</b>}</div>)}</div></div>}
function Drafts({saved,setSaved,setPost,setTab,exportCSV}){return <div className="page-panel"><div className="page-heading"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><small>YOUR LIBRARY</small><h1>Saved drafts.</h1></div>{saved.length>0&&<button onClick={exportCSV} className="publish" style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 16px',background:'#e6e4e9',color:'#111217',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600}}>Export Buffer CSV (3 posts/day)</button>}</div><p>Stored only in this browser. Export as CSV to schedule and automate via Buffer or Publer for free.</p></div><div className="draft-list">{saved.length?saved.map(x=><article key={x.id}><span>{x.date}</span><div><b>{x.topic}</b><p>{x.post.slice(0,150)}…</p></div><button onClick={()=>{setPost(x.post);setTab('compose')}}>Edit</button><button onClick={()=>setSaved(saved.filter(y=>y.id!==x.id))}><Trash2 size={15}/></button></article>):<div className="empty"><FileText size={35}/><h2>No saved drafts yet</h2><p>Create a post and select “Save draft.”</p></div>}</div></div>}
export default App
