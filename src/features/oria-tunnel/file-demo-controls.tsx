import {useRef,type ReactNode} from 'react'

export function FileDemoButton({label,children,onClick,disabled=false,pressed}:{label:string;children:ReactNode;onClick:()=>void;disabled?:boolean;pressed?:boolean}) {
 return <button type="button" className="file-demo-icon-button" title={label} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>{children}</button>
}
// Original SplitLayoutIcon geometry from file-panel-layout.tsx, GPL-3.0-only.
export function FileSplitIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x={3} y={3} width={18} height={18} rx={2}/><path d="M3 14h18M12 3v11"/></svg>}

export function FileDemoSeparator({label,vertical,value,onChange,minimum=20}:{label:string;vertical:boolean;value:number;minimum?:number;onChange:(value:number)=>void}) {
 const start = useRef<{id: number; position: number; value: number; size: number} | null>(null)
 const clamp = (next: number) => Math.min(100 - minimum, Math.max(minimum, next))
 return <div className="files-resize-handle" role="separator" tabIndex={0} aria-label={label}
  aria-orientation={vertical ? 'vertical' : 'horizontal'} aria-valuemin={minimum} aria-valuemax={100-minimum} aria-valuenow={value}
  onPointerDown={event => {
    if (event.button !== 0 || !event.isPrimary || start.current) return
    const handle = event.currentTarget
    const before = handle.previousElementSibling?.getBoundingClientRect()
    const after = handle.nextElementSibling?.getBoundingClientRect()
    if (!before || !after) return
    const size = vertical ? before.width + after.width : before.height + after.height
    if (size <= 0) return
    start.current = {id: event.pointerId, position: vertical ? event.clientX : event.clientY, value, size}
    handle.setPointerCapture(event.pointerId)
    event.preventDefault()
  }}
  onPointerMove={event => {
    const origin = start.current
    if (!origin || origin.id !== event.pointerId) return
    const delta = (vertical ? event.clientX : event.clientY) - origin.position
    onChange(clamp(origin.value + delta / origin.size * 100))
  }}
  onLostPointerCapture={event => { if (start.current?.id === event.pointerId) start.current = null }}
  onKeyDown={event => {
    if (!(vertical ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']).includes(event.key)) return
    event.preventDefault()
    onChange(clamp(value + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -5 : 5)))
  }}/>
}
