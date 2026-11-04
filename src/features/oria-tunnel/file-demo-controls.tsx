import {useRef,type ReactNode} from 'react'

export function FileDemoButton({label,children,onClick,disabled=false,pressed}:{label:string;children:ReactNode;onClick:()=>void;disabled?:boolean;pressed?:boolean}) {
 return <button type="button" className="file-demo-icon-button" title={label} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>{children}</button>
}
// Original SplitLayoutIcon geometry from file-panel-layout.tsx, GPL-3.0-only.
export function FileSplitIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={2}/><path d="M3 14h18M12 3v11"/></svg>}

export function FileDemoSeparator({label,vertical,value,onChange}:{label:string;vertical:boolean;value:number;onChange:(value:number)=>void}) {
 const start=useRef<{position:number;value:number;size:number}|null>(null)
 return <div className="files-resize-handle" role="separator" tabIndex={0} aria-label={label} aria-orientation={vertical?'vertical':'horizontal'} aria-valuemin={20} aria-valuemax={80} aria-valuenow={value}
  onPointerDown={event=>{if(event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);const rect=event.currentTarget.parentElement!.getBoundingClientRect();start.current={position:vertical?event.clientX:event.clientY,value,size:vertical?rect.width:rect.height};event.preventDefault()}}
  onPointerMove={event=>{if(start.current){const delta=(vertical?event.clientX:event.clientY)-start.current.position;onChange(Math.min(80,Math.max(20,start.current.value+delta/start.current.size*100)))}}}
  onPointerUp={()=>{start.current=null}} onPointerCancel={()=>{start.current=null}}
  onKeyDown={event=>{if((vertical?['ArrowLeft','ArrowRight']:['ArrowUp','ArrowDown']).includes(event.key)){event.preventDefault();onChange(Math.min(80,Math.max(20,value+(['ArrowLeft','ArrowUp'].includes(event.key)?-5:5))))}}}/>
}
