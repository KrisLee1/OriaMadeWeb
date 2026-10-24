import { captureFrame, captureWait } from '@/features/oria-tab/shared/lib/glass/capture-abort'

/** A detached, fully styled foreground. Bulk style assignment avoids hundreds
 * of CSS parser calls per element; yielding bounds each cloning work slice. */
export async function snapshotGlassContent(root:HTMLElement,filter:(node:Node)=>boolean,signal?:AbortSignal) {
  const document=root.ownerDocument
  let deadline=performance.now()+5
  let pseudoId=0
  const pause=async()=>{
    signal?.throwIfAborted()
    if(performance.now()<deadline)return
    const scheduler=(globalThis as typeof globalThis&{scheduler?:{yield?:()=>Promise<void>}}).scheduler
    if(scheduler?.yield)await captureWait(scheduler.yield(),signal)
    else await captureWait(new Promise<void>(resolve=>setTimeout(resolve,0)),signal)
    // A scheduler continuation can run repeatedly before the next paint.
    // Limit capture to one work slice per display frame as well.
    await captureFrame(signal)
    deadline=performance.now()+5
  }
  type Variables=Record<string,string>
  const css=(style:CSSStyleDeclaration,parentVariables:Variables,source?:Element)=>{
    const declarations:string[]=[],variables=Object.create(parentVariables) as Variables,seen=new Set<string>()
    const text=style.cssText,length=style.length
    let typed:StylePropertyMapReadOnly|undefined
    for(let i=0;i<length;i++){
      const name=style[i]
      let value=style.getPropertyValue(name)
      if(name.startsWith('--')){
        if(value===''&&source&&typeof source.computedStyleMap==='function'){
          typed??=source.computedStyleMap()
          if(!typed.has(name))value='initial'
        }
        seen.add(name)
        // Keep scope overrides, but let equal computed custom properties inherit
        // through the detached tree instead of serializing them on every node.
        if(value!==parentVariables[name]){variables[name]=value;declarations.push(`${name}:${value};`)}
        continue
      }
      // Match html-to-image's font rounding to preserve existing line wrapping.
      if(name==='font-size'&&!text&&value.endsWith('px'))value=`${Math.floor(parseFloat(value))-.1}px`
      declarations.push(`${name}:${value};`)
    }
    // An explicit initial value can disappear from computed enumeration. Reset
    // it in the clone too, otherwise an inherited SVG var() would lose fallback.
    for(const name in parentVariables)if(!seen.has(name)&&parentVariables[name]!=='initial'){
      variables[name]='initial';declarations.push(`${name}:initial;`)
    }
    return {text:text||declarations.join(''),variables}
  }
  const clone=async(source:Node,parentVariables:Variables):Promise<Node|null>=>{
    await pause()
    if(source!==root&&!filter(source))return null
    if(!(source instanceof Element))return source.cloneNode(false)
    // These media cannot be reproduced by a detached DOM snapshot. Keep the
    // existing native-material fallback rather than publishing stale pixels.
    if(source instanceof HTMLVideoElement||source instanceof HTMLIFrameElement)throw new Error('Unsupported glass snapshot media')
    const svg=source.tagName.toLowerCase()==='svg'
    const target=source.cloneNode(svg) as HTMLElement|SVGElement
    const sourceStyle=getComputedStyle(source),captured=css(sourceStyle,parentVariables,source)
    if('style' in target)target.style.cssText=captured.text
    if(source instanceof HTMLCanvasElement){
      const canvas=target as HTMLCanvasElement
      canvas.getContext('2d')!.drawImage(source,0,0)
    }
    if(!svg){
      const children=source instanceof HTMLSlotElement?source.assignedNodes():Array.from((source.shadowRoot??source).childNodes)
      for(const child of children){const result=await clone(child,captured.variables);if(result)target.appendChild(result)}
    }
    await pause()
    for(const pseudo of ['::before','::after']){
      const style=getComputedStyle(source,pseudo)
      if(!style.content||style.content==='none'||style.content==='normal')continue
      const className=`oria-glass-pseudo-${++pseudoId}`
      target.classList.add(className)
      const rule=document.createElement('style')
      rule.textContent=`.${className}${pseudo}{${css(style,captured.variables).text}}`
      target.appendChild(rule)
    }
    if(source instanceof HTMLInputElement)(target as HTMLInputElement).setAttribute('value',source.value)
    if(source instanceof HTMLTextAreaElement)(target as HTMLTextAreaElement).textContent=source.value
    if(source instanceof HTMLSelectElement){
      const select=target as HTMLSelectElement
      for(const option of select.options)option.toggleAttribute('selected',option.value===source.value)
    }
    return target
  }
  return await clone(root,Object.create(null) as Variables) as HTMLElement
}
