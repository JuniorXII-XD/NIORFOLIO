'use client';
import {useEffect,useRef} from 'react';
const points=[[8,12],[82,14],[16,78],[88,81],[3,45],[92,44],[34,6],[64,91],[21,26],[73,30],[25,92],[70,70],[5,65],[91,61],[48,9],[47,86],[36,23],[61,18],[12,91],[85,6],[34,70],[63,79],[9,31],[83,93]];
export default function Background(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const layers=Array.from(el.querySelectorAll<HTMLElement>('.shape-react'));
  const glow=el.querySelector<HTMLElement>('.cursor-light')!;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let width=innerWidth,height=innerHeight,mx=width/2,my=height/2,active=false,frame=0,last=0;
  let px=0,py=0,gx=mx,gy=my,opacity=0;
  const values=layers.map(()=>({x:0,y:0,r:0}));
  const reset=()=>{active=false;schedule();};
  function render(time:number){
   if(document.hidden||motion.matches){frame=0;last=0;return;}
   if(last&&time-last<32){frame=requestAnimationFrame(render);return;}
   const dt=last?Math.min(time-last,70):33;last=time;
   const ease=1-Math.exp(-dt/130);
   const tx=active?(mx/width-.5)*-26:0,ty=active?(my/height-.5)*-26:0;
   px+=(tx-px)*ease;py+=(ty-py)*ease;gx+=(mx-gx)*ease;gy+=(my-gy)*ease;opacity+=((active?1:0)-opacity)*ease;
   el!.style.setProperty('--px',px.toFixed(2)+'px');el!.style.setProperty('--py',py.toFixed(2)+'px');
   glow.style.transform=`translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;glow.style.opacity=opacity.toFixed(3);
   let unsettled=Math.abs(tx-px)+Math.abs(ty-py)+Math.abs((active?1:0)-opacity)*100;
   if(active)unsettled+=Math.abs(mx-gx)+Math.abs(my-gy);
   layers.forEach((layer,i)=>{
    if(width<=700&&i>=16)return;
    const depth=-40-i%4*40,scale=1000/(1000-depth),size=[38,52,25,44][i%4];
    const cx=width/2+(points[i][0]/100*width+size/2-width/2)*scale;
    const cy=height/2+(points[i][1]/100*height+size/2-height/2)*scale;
    const dx=cx-mx,dy=cy-my,distance=Math.hypot(dx,dy),falloff=active?Math.max(0,1-distance/240):0;
    const strength=falloff*falloff,denom=Math.max(distance,1),v=values[i];
    const x=dx/denom*strength*65,y=dy/denom*strength*65,r=strength*(i%2?24:-24);
    v.x+=(x-v.x)*ease;v.y+=(y-v.y)*ease;v.r+=(r-v.r)*ease;
    layer.style.transform=`translate3d(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px,0) rotateX(${(-v.y*.3).toFixed(2)}deg) rotateY(${(v.x*.3).toFixed(2)}deg) rotateZ(${v.r.toFixed(2)}deg)`;
    unsettled+=Math.abs(x-v.x)+Math.abs(y-v.y)+Math.abs(r-v.r);
   });
   if(unsettled>.15)frame=requestAnimationFrame(render);else{frame=0;last=0;}
  }
  function schedule(){if(!frame&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(render);}
  const move=(e:PointerEvent)=>{if(motion.matches)return;mx=e.clientX;my=e.clientY;active=true;schedule();};
  const resize=()=>{width=innerWidth;height=innerHeight;reset();};
  const pause=()=>{el.classList.toggle('scene-paused',document.hidden);if(document.hidden||motion.matches){cancelAnimationFrame(frame);frame=0;last=0;active=false;opacity=0;glow.style.opacity='0';el.style.setProperty('--px','0px');el.style.setProperty('--py','0px');layers.forEach(l=>l.style.transform='none');values.forEach(v=>{v.x=v.y=v.r=0;});px=py=0;}else reset();};
  const release=(e:PointerEvent)=>{if(e.pointerType!=='mouse')reset();};
  pause();window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerup',release,{passive:true});window.addEventListener('pointercancel',reset,{passive:true});document.documentElement.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',pause);motion.addEventListener('change',pause);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',reset);document.documentElement.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',pause);motion.removeEventListener('change',pause);};
 },[]);
 return <div className="ambient" aria-hidden="true" ref={ref}><div className="ambient-grid"/><div className="cursor-light"/><div className="geometry">{points.map(([x,y],i)=><div key={i} className={'shape type-'+i%3} style={{'--left':x+'%','--top':y+'%','--size':[38,52,25,44][i%4]+'px','--delay':-i*3.7+'s','--duration':(35+i%7*7)+'s','--depth':(-40-i%4*40)+'px'} as React.CSSProperties}><div className="shape-react"><div className="shape-spin">{Array.from({length:[6,3,2][i%3]},(_,j)=><i key={j}/>)}</div></div></div>)}</div></div>;
}
