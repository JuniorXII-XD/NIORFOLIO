'use client';
import {useEffect,useRef,useState} from 'react';
const KEY='nior-intro-seen-v1';
export default function Intro(){
 const [visible,setVisible]=useState(false);
 const finish=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let seen=false;try{seen=sessionStorage.getItem(KEY)==='1';}catch{}
  if(seen||motion.matches||document.hidden)return;
  const startFrame=requestAnimationFrame(()=>setVisible(true));
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  document.documentElement.classList.add('intro-playing');
  let done=false;
  const stop=()=>{if(done)return;done=true;setVisible(false);document.body.style.overflow=previous;document.documentElement.classList.remove('intro-playing');try{sessionStorage.setItem(KEY,'1');}catch{}};
  finish.current=stop;
  const timer=setTimeout(stop,2350);
  const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'||event.key==='Tab')stop();};
  const visibility=()=>{if(document.hidden)stop();};
  const preference=()=>{if(motion.matches)stop();};
  document.addEventListener('keydown',keyboard);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',preference);
  return()=>{cancelAnimationFrame(startFrame);clearTimeout(timer);document.removeEventListener('keydown',keyboard);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);document.body.style.overflow=previous;document.documentElement.classList.remove('intro-playing');};
 },[]);
 if(!visible)return null;
 return <div className="opening-intro"><div className="intro-art" aria-hidden="true"><div className="intro-orbit orbit-one"/><div className="intro-orbit orbit-two"/><div className="intro-hairline"/><div className="intro-brand"><span>N</span><span>I</span><span>O</span><span>R</span></div><div className="intro-caption">PORTFOLIO</div><div className="intro-rule"/></div><button type="button" className="intro-skip" onClick={()=>finish.current()}>ข้ามอินโทร <span aria-hidden="true">ESC</span></button></div>;
}
