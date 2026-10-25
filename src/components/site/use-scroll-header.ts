'use client'

import {useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'

/** Navigation stays visible; scrolling only changes its theme material. */
export function useScrollHeader() {
 const pathname=usePathname()
 const [floating,setFloating]=useState(false)
 useEffect(()=>{
  let frame=0
  const update=()=>{frame=0;setFloating(window.scrollY>16)}
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)}
  update()
  window.addEventListener('scroll',onScroll,{passive:true})
  return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame)}
 },[pathname])
 return {floating}
}
