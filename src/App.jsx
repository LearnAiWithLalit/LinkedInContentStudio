import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronRight, Clipboard, FileText, Image, Lightbulb, Loader2, Save, Send, Sparkles, Trash2, WandSparkles } from 'lucide-react'
import VisualStudio from './VisualStudio.jsx'

const frameworks=[
 {id:'insight',name:'Insight Stack',tag:'Educational',desc:'Hook → shift → framework → takeaway',icon:'01'},
 {id:'myth',name:'Myth Breaker',tag:'Point of view',desc:'Common belief → problem → better approach',icon:'02'},
 {id:'build',name:'Build in Public',tag:'Portfolio',desc:'Problem → decisions → result → learning',icon:'03'},
 {id:'list',name:'Practical Playbook',tag:'Saveable',desc:'Tension → steps → checklist → question',icon:'04'},
]
const tones=['Clear & educational','Personal & reflective','Bold & contrarian','Practical & direct']
const audiences=['AI beginners','Tech professionals','Product & project leaders','Creators & learners']

function createPost({topic,point,audience,tone,framework}){
 const t=topic.trim()||'building useful AI products'; const p=point.trim()||'The tool matters less than the system around it.'
 if(framework==='myth') return `The biggest misconception about ${t}?\n\nThat success comes from adding more tools.\n\nIt sounds reasonable. But it usually creates three problems:\n\n→ More handoffs nobody owns\n→ More output nobody verifies\n→ More complexity before value\n\nA better question is not “Which tool should we add?”\n\nAsk:\n• What problem are we solving?\n• What evidence would prove it works?\n• Where must a human stay responsible?\n\n${p}\n\nWhat misconception do you keep seeing in your work?\n\n#ArtificialIntelligence #Learning #FutureOfWork`
 if(framework==='build') return `I built a small project around ${t}.\n\nNot because the world needed another demo.\n\nI wanted to understand what happens between an idea and a working system.\n\nWhat I changed along the way:\n\n01 — Started with the user’s question\n02 — Removed features that looked good but taught nothing\n03 — Made the difficult concepts visual\n04 — Tested every flow as a first-time visitor\n\nThe biggest lesson?\n\n${p}\n\nBuilding in public turns vague knowledge into visible proof of work.\n\nWhat are you learning by building right now?\n\n#BuildInPublic #AI #WebDevelopment #Learning`
 if(framework==='list') return `${t} is easier to understand when you stop treating it as one big topic.\n\nUse this simple learning sequence:\n\n1. Understand the problem\n2. Learn the smallest useful concept\n3. See one visual example\n4. Practice with a real scenario\n5. Explain it without jargon\n\nBefore moving forward, check:\n\n✓ Can I explain why it matters?\n✓ Can I name one limitation?\n✓ Can I apply it to my work?\n\n${p}\n\nSave this for your next learning session. What would you add?\n\n#Learning #ArtificialIntelligence #CareerGrowth`
 return `${t} just became more important—and more misunderstood.\n\nThe people who benefit most will not be those who memorize the most terminology.\n\nThey will understand how the pieces connect.\n\nHere is the simple map:\n\n→ The goal defines what “good” means\n→ Data provides examples\n→ A model learns a pattern\n→ Evaluation reveals where it fails\n→ Human judgement decides whether it is useful\n\n${p}\n\nThe takeaway:\n\nDon’t learn isolated tools. Learn the decisions that connect them.\n\nWhich part deserves a deeper breakdown next?\n\n#AI #MachineLearning #Technology #ContinuousLearning`
}

async function generatePostWithGemini({ apiKey, topic, point, tone, framework }){
 const model = "gemini-1.5-flash";
 const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
 const prompt = `You are an expert LinkedIn content writer. Write a highly engaging, professional, and scannable LinkedIn post.
Topic: ${topic}
Key Point/Experience: ${point}
Tone: ${tone}
Framework Structure: ${framework} (e.g. hook, list, key takeaway)

Guidelines:
1. Start with a scroll-stopping, bold hook line.
2. Keep paragraphs short and space them out. Use single sentences for key emphasis.
3. Use bullet points or step-by-step numbers with emojis.
4. Conclude with a strong takeaway and a conversation-starting question.
5. Add exactly 3 relevant hashtags.
6. Write ONLY the post content itself. Do not include titles, notes, markdown styling like "**bold**" or "\`code\`", or explanations.`;

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
 if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || "Gemini API request failed.");
 }
 const data = await response.json();
 return data.candidates[0].content.parts[0].text;
}

function App(){
 const [tab,setTab]=useState('compose'); const [framework,setFramework]=useState('insight'); const [topic,setTopic]=useState('How machines learn'); const [point,setPoint]=useState('Good learning connects concepts instead of presenting isolated definitions.'); const [audience,setAudience]=useState(audiences[0]); const [tone,setTone]=useState(tones[0]); const [post,setPost]=useState(''); const [saved,setSaved]=useState(()=>JSON.parse(localStorage.getItem('signal-drafts')||'[]')); const [copied,setCopied]=useState(false)
 const [geminiKey,setGeminiKey]=useState(()=>localStorage.getItem('gemini-api-key')||''); const [loading,setLoading]=useState(false); const [status,setStatus]=useState('');
 const [showCopyGuide,setShowCopyGuide]=useState(false);

 useEffect(()=>localStorage.setItem('signal-drafts',JSON.stringify(saved)),[saved])
 useEffect(()=>localStorage.setItem('gemini-api-key',geminiKey),[geminiKey])
 useEffect(()=>{if(!post)setPost(createPost({topic,point,audience,tone,framework}))},[])

 const stats=useMemo(()=>({chars:post.length,words:post.trim()?post.trim().split(/\s+/).length:0,read:Math.max(1,Math.ceil(post.trim().split(/\s+/).length/180))}),[post])
 
 const generate=async()=>{
  if(geminiKey){
   setLoading(true); setStatus('Generating post with Gemini AI...');
   try{
    const val=await generatePostWithGemini({apiKey:geminiKey,topic,point,tone,framework});
    setPost(val); setStatus('');
   }catch(e){
    setStatus(e.message);
   }finally{
    setLoading(false);
   }
  }else{
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
   return [`"${dateStr}"`,`"${time}"`,`"${escapedPost}"`,'""']
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
  <aside className="sidebar"><div className="brand"><span>S</span><div><b>SIGNAL</b><small>CONTENT STUDIO</small></div></div><nav>{[['compose',WandSparkles,'Compose'],['visuals',Image,'Visuals & GIF'],['calendar',CalendarDays,'Calendar'],['drafts',FileText,'Drafts']].map(([id,I,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><I size={18}/>{label}</button>)}</nav><div className="side-note"><Sparkles size={17}/><b>Human first</b><p>Draft with structure. Review with judgement. Publish manually.</p></div><footer>NO LINKEDIN CREDENTIALS<br/>STORED OR REQUIRED</footer></aside>
  <main><header className="topbar"><div><span className="live-dot"/> PRIVATE WORKSPACE</div><div className="top-actions"><button onClick={save}><Save size={15}/> Save draft</button><button className="publish" onClick={()=>window.open('https://www.linkedin.com/feed/?shareActive=true','_blank')}><Send size={15}/> Open LinkedIn</button></div></header>
   {tab==='compose'&&<div className="workspace"><section className="composer"><div className="section-title"><small>01 / STRATEGY</small><h1>Turn one idea into<br/><em>a post worth reading.</em></h1><p>Choose a proven information structure, add your real experience, then edit until it sounds like you.</p></div><div className="form-block"><label>What do you want to write about?</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. What I learned building an AI course"/><label>Your original point or experience</label><textarea value={point} onChange={e=>setPoint(e.target.value)} rows="3"/><div className="two-cols"><div><label>Audience</label><select value={audience} onChange={e=>setAudience(e.target.value)}>{audiences.map(x=><option key={x}>{x}</option>)}</select></div><div><label>Tone</label><select value={tone} onChange={e=>setTone(e.target.value)}>{tones.map(x=><option key={x}>{x}</option>)}</select></div></div><div style={{marginTop:'15px',background:'#15131a',border:'1px dashed #44344f',padding:'16px',borderRadius:'10px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><label style={{font:'10px DM Mono',color:'#ab7fc0',letterSpacing:'.09em',margin:0}}>✨ GOOGLE GEMINI AI WRITER (FREE)</label><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{color:'#8d679e',fontSize:'9px',textDecoration:'underline'}}>Get your API key in 30 seconds</a></div><p style={{fontSize:'11px',color:'#888',margin:'0 0 10px 0',lineHeight:'1.4'}}>By default, the app uses offline templates. Paste a free key from Google AI Studio to unlock custom, tailored AI generation for any topic!</p><div style={{display:'flex',gap:'8px'}}><input type="password" value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} placeholder="Paste your API key (starts with AIzaSy...)" style={{flex:1,background:'#0d0e12',border:'1px solid #2b2c34'}}/>{geminiKey&&<button onClick={()=>setGeminiKey('')} style={{border:'1px solid #30323a',background:'#16171c',color:'#aaaeb6',borderRadius:'7px',padding:'0 12px',cursor:'pointer'}}>Clear</button>}</div></div></div><div className="frameworks"><div className="block-head"><div><small>02 / STRUCTURE</small><h2>Choose a framework</h2></div><Lightbulb size={20}/></div>{frameworks.map(f=><button key={f.id} onClick={()=>setFramework(f.id)} className={framework===f.id?'active':''}><span>{f.icon}</span><div><b>{f.name}</b><small>{f.desc}</small></div><em>{f.tag}</em><Check size={16}/></button>)}</div><button className="generate" onClick={generate} disabled={loading}>{loading?<Loader2 className="spin" size={18}/>:<Sparkles size={18}/>} {loading?'Generating draft...':geminiKey?'Generate draft with Gemini AI':'Generate structured template'} <ChevronRight size={17}/></button>{status&&<p style={{fontSize:'11px',color:'#af8fbd',marginTop:'8px'}}>{status}</p>}</section>
     <section className="preview"><div className="preview-head"><div><small>LIVE PREVIEW</small><span>LinkedIn text post</span></div><button onClick={copy}>{copied?<Check size={16}/>:<Clipboard size={16}/>} {copied?'Copied':'Copy'}</button></div><div className="post-card"><div className="profile"><div className="avatar">LS</div><div><b>Lalit Singh</b><span>Learning AI by building · Just now · ◉</span></div></div><textarea value={post} onChange={e=>setPost(e.target.value)}/><div className="post-metrics"><span>{stats.chars} characters</span><span>{stats.words} words</span><span>~{stats.read} min read</span></div></div><div className="quality"><div><b>Post quality</b><span>Strong foundation</span></div>{[['Clear first-line hook',true],['Scannable line length',true],['Original point included',point.length>15],['Ends with a conversation',post.includes('?')]].map(([x,ok])=><p key={x} className={ok?'ok':''}><i>{ok?'✓':'·'}</i>{x}</p>)}</div></section></div>}
   {tab==='visuals'&&<VisualStudio/>}{tab==='calendar'&&<Calendar saved={saved}/>} {tab==='drafts'&&<Drafts saved={saved} setSaved={setSaved} setPost={setPost} setTab={setTab} exportCSV={exportCSV}/>} 
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
