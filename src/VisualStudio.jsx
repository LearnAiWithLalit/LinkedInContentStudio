import { useRef, useState } from 'react'
import { Download, ExternalLink, Image, KeyRound, LoaderCircle, Sparkles } from 'lucide-react'
import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import './VisualStudio.css'

const palettes=[['#090a0e','#b27ac8','#f1edf4'],['#07141b','#4fb0c6','#ebf8fa'],['#14100b','#d68a4d','#fff1df']]
export default function VisualStudio(){
 const canvasRef=useRef(null); const [title,setTitle]=useState('AI IS NOT ONE TOOL'); const [subtitle,setSubtitle]=useState('It is a connected system of decisions.'); const [theme,setTheme]=useState(0); const [exporting,setExporting]=useState(false); const [engine,setEngine]=useState('free'); const [key,setKey]=useState(''); const [endpoint,setEndpoint]=useState('https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl'); const [prompt,setPrompt]=useState('Editorial technology illustration, dark background, elegant connected AI system, no text'); const [image,setImage]=useState(''); const [status,setStatus]=useState('')
 const wrap=(ctx,text,x,y,max,line)=>{let row='';for(const word of text.split(' ')){if(ctx.measureText(row+word).width>max){ctx.fillText(row,x,y);row=word+' ';y+=line}else row+=word+' '}ctx.fillText(row,x,y)}
 const draw=(ctx,w,h,t,bg)=>{const [dark,accent,light]=palettes[theme];ctx.fillStyle=dark;ctx.fillRect(0,0,w,h);if(bg)ctx.drawImage(bg,0,0,w,h);ctx.fillStyle='rgba(4,5,8,.68)';ctx.fillRect(0,0,w,h);const cx=w*.5,cy=h*.42;for(let r=0;r<5;r++){ctx.beginPath();ctx.strokeStyle=accent;ctx.globalAlpha=.12+r*.06;ctx.lineWidth=3;ctx.ellipse(cx,cy,150+r*58,150+r*58,Math.sin(t+r)*.3,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1;for(let i=0;i<50;i++){const a=i/50*Math.PI*2+t*(i%2?1:-1),rad=165+(i%5)*57;ctx.beginPath();ctx.fillStyle=i%3?light:accent;ctx.arc(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad,3+(i%4),0,Math.PI*2);ctx.fill()}ctx.fillStyle=accent;ctx.font='500 18px monospace';ctx.fillText('SIGNAL / VISUAL BRIEF',55,65);ctx.fillStyle=light;ctx.font='700 58px Arial';wrap(ctx,title.toUpperCase(),55,h-245,w-110,66);ctx.fillStyle='#aaa6ae';ctx.font='400 23px Arial';wrap(ctx,subtitle,55,h-120,w-110,31);ctx.fillStyle=light;ctx.font='500 16px monospace';ctx.fillText('LearnAiWithLalit',55,h-40)}
 
 const exportGif=async()=>{setExporting(true);await new Promise(r=>setTimeout(r,30));const w=720,h=900,c=canvasRef.current;c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});let bg=null;if(image){bg=new window.Image();bg.crossOrigin='anonymous';bg.src=image;await new Promise(res=>{bg.onload=res;bg.onerror=()=>{bg=null;res()}})}const gif=GIFEncoder();for(let f=0;f<36;f++){draw(ctx,w,h,f/36*Math.PI*2,bg);const data=ctx.getImageData(0,0,w,h).data;const palette=quantize(data,128,{format:'rgba4444'});gif.writeFrame(applyPalette(data,palette,'rgba4444'),w,h,{palette,delay:90})}gif.finish();const blob=new Blob([gif.bytes()],{type:'image/gif'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='signal-linkedin-visual.gif';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setExporting(false)}
 
 const exportPng=async()=>{
  setExporting(true);
  await new Promise(r=>setTimeout(r,30));
  const w=720,h=900,c=canvasRef.current;
  c.width=w;
  c.height=h;
  const ctx=c.getContext('2d');
  let bg=null;
  if(image){
   bg=new window.Image();
   bg.crossOrigin='anonymous';
   bg.src=image;
   await new Promise(res=>{
    bg.onload=res;
    bg.onerror=()=>{bg=null;res()}
   })
  }
  draw(ctx,w,h,0,bg);
  const a=document.createElement('a');
  a.href=c.toDataURL('image/png');
  a.download='signal-linkedin-visual.png';
  a.click();
  setExporting(false);
 }

 const generateImage=async()=>{
  if (engine === 'free') {
   setStatus('Generating free image with Pollinations.ai...');
   try {
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=720&height=900&nologo=true&seed=${seed}&model=flux`;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    await new Promise((res, rej) => {
     img.onload = res;
     img.onerror = () => rej(new Error('Failed to load image from Pollinations.ai'));
    });
    setImage(url);
    setStatus('Free Pollinations image ready. It will be used behind your animation.')
   } catch (e) {
    setStatus(e.message)
   }
   return;
  }
  if(!key||!endpoint){setStatus('Add your NVIDIA API key and model endpoint.');return}setStatus('Generating with NVIDIA NIM…');try{const res=await fetch(endpoint,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({text_prompts:[{text:prompt,weight:1},{text:'text, words, watermark, logo, low quality',weight:-1}],cfg_scale:5,samples:1,seed:0,steps:30})}),json=await res.json();if(!res.ok)throw new Error(json.detail||json.error?.message||'NVIDIA generation failed');const item=json.artifacts?.[0]||json.data?.[0]||json;const b64=item.base64||item.b64_json||item.image;setImage(item.url||(b64?`data:image/png;base64,${b64}`:''));setStatus('NVIDIA image ready. It will be used behind your animation.')}catch(e){setStatus(e.message)}}

 return <div className="visual-page"><section className="visual-controls"><div className="page-heading"><small>LOCAL ANIMATION LAB</small><h1>Create movement,<br/><em>not decoration.</em></h1><p>Generate a polished looping visual locally. No account, server, API, watermark, or payment required.</p></div><label>Visual headline</label><input value={title} onChange={e=>setTitle(e.target.value)}/><label>Supporting idea</label><textarea value={subtitle} onChange={e=>setSubtitle(e.target.value)} rows="3"/><label>Colour system</label><div className="palette-row">{palettes.map((p,i)=><button className={i===theme?'active':''} onClick={()=>setTheme(i)} key={p[0]}>{p.map(x=><i style={{background:x}} key={x}/>)}</button>)}</div><div style={{display:'flex',gap:'10px',marginTop:'10px'}}><button className="gif-export" onClick={exportGif} disabled={exporting} style={{flex:1}}>{exporting?<LoaderCircle className="spin"/>:<Download/>}{exporting?'Rendering 36 frames…':'Export animated GIF'}</button><button className="gif-export" onClick={exportPng} disabled={exporting} style={{flex:1,background:'#1c1e24',border:'1px solid #2d3037',color:'#aaa'}}><Download/> Export static PNG</button></div><div className="free-note"><Sparkles/><p><b>Always free local mode</b><span>Everything above runs on your device. The exported file contains no watermark.</span></p></div></section><section className="visual-preview"><div className="animated-poster" style={{'--dark':palettes[theme][0],'--accent':palettes[theme][1],'--light':palettes[theme][2],backgroundImage:image?`linear-gradient(rgba(4,5,8,.68),rgba(4,5,8,.68)),url(${image})`:''}}><div className="poster-label">SIGNAL / VISUAL BRIEF</div><div className="poster-orbits">{Array.from({length:30},(_,i)=><i style={{'--i':i}} key={i}/>)}</div><h2>{title}</h2><p>{subtitle}</p><b>LearnAiWithLalit</b></div><div className="api-panel"><div className="api-title"><KeyRound/><div><b>AI Background Image Generator</b><span>Choose a free model or use NVIDIA NIM</span></div><a href="https://build.nvidia.com/models?filters=usecase%3Ausecase_image_gen%2Cusecase%3Ausecase_text_to_image" target="_blank">NVIDIA image models <ExternalLink/></a></div><div style={{display:'flex',gap:'10px',marginBottom:'8px'}}><button className={engine==='free'?'active':''} onClick={()=>setEngine('free')} style={{flex:1,padding:'8px',border:'1px solid '+(engine==='free'?'#a675ba':'#2b2d34'),borderRadius:'6px',background:engine==='free'?'#1c1820':'#121318',color:'#eee',cursor:'pointer',fontSize:'11px'}}>Free (Pollinations AI)</button><button className={engine==='nvidia'?'active':''} onClick={()=>setEngine('nvidia')} style={{flex:1,padding:'8px',border:'1px solid '+(engine==='nvidia'?'#a675ba':'#2b2d34'),borderRadius:'6px',background:engine==='nvidia'?'#1c1820':'#121318',color:'#eee',cursor:'pointer',fontSize:'11px'}}>NVIDIA NIM API</button></div>{engine==='nvidia'&&(<><input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="nvapi-… (kept only in this open tab)"/><input value={endpoint} onChange={e=>setEndpoint(e.target.value)} placeholder="NVIDIA model endpoint from Copy Code"/></>)}<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows="3"/><button onClick={generateImage} style={{cursor:'pointer'}}><Sparkles/> Generate Background Image</button>{status&&<p className="api-status">{status}</p>}<small>{engine==='free'?"Uses Pollinations AI's FLUX image model. Totally free, no signup required.":"The default endpoint is NVIDIA Stable Diffusion XL. Your key is held in memory only."}</small></div></section><canvas ref={canvasRef} hidden/></div>
}
