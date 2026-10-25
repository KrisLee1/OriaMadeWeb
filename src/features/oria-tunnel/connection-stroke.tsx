'use client'
// Adapted from OriaTunnel ConnectionEdge (GPL-3.0-only), without ReactFlow or IPC.
import {useLayoutEffect,useRef} from 'react'
export function ConnectionStroke({d,color,state,marker,paused}:{d:string;color:string;state:string;marker:string;paused:boolean}){
 const glow=useRef<SVGGElement>(null),curve=useRef<SVGPathElement>(null)
 useLayoutEffect(()=>{
  const group=glow.current,path=curve.current;if(!group||!path)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let animations:Animation[]=[]
  const play=()=>{
   animations.forEach(animation=>animation.cancel());animations=[]
   if(reduced.matches||paused)return
   const length=path.getTotalLength(),band=Math.min(36,Math.max(14,length*.18)),duration=2800
   const phase=(typeof document.timeline.currentTime==='number'?document.timeline.currentTime:performance.now())%duration
   animations=Array.from(group.querySelectorAll('path'),stroke=>{stroke.style.strokeDasharray=`${band} ${length+band}`;const animation=stroke.animate([{strokeDashoffset:`${band}px`},{strokeDashoffset:`${-(length+band)}px`}],{duration,iterations:Infinity,easing:'linear'});animation.currentTime=phase;return animation})
  }
  play();reduced.addEventListener('change',play)
  return()=>{animations.forEach(animation=>animation.cancel());reduced.removeEventListener('change',play)}
 },[d,state,paused])
 return <g className={`demo-connection connection-${state}`} stroke={color}><path className="demo-edge-base" d={d} strokeWidth={1.5} markerEnd={`url(#${marker})`}/>{state==='connected'&&!paused&&<g ref={glow} className="demo-connection-glow"><path d={d} strokeWidth={8} opacity={.14}/><path ref={curve} d={d} strokeWidth={3} opacity={.95}/></g>}</g>
}
