import { getFontEmbedCSS, toSvg } from 'html-to-image'
import { captureWait } from '@/features/oria-tab/shared/lib/glass/capture-abort'
import { snapshotGlassContent } from '@/features/oria-tab/shared/lib/glass/snapshot'

let captureId = 0
const fontCaches = new WeakMap<Document, Promise<string>>()
/** Capture only an explicitly registered foreground; never recurse into GL output. */
export async function captureGlassContent(node: HTMLElement, dpr: number, options:{foreground?:boolean;signal?:AbortSignal}={}) {
  const {signal}=options
  signal?.throwIfAborted()
  const document=node.ownerDocument
  if(node.offsetWidth*node.offsetHeight*dpr*dpr*4>12*1024*1024)throw new Error('Glass content exceeds local capture budget')
  await captureWait(document.fonts.ready,signal)
  let fonts=fontCaches.get(document)
  if(!fonts) { fonts=getFontEmbedCSS(node,{preferredFontFormat:'woff2',fetchRequestInit:{credentials:'omit'}}).catch(error=>{fontCaches.delete(document);throw error}); fontCaches.set(document,fonts)
    // A cancelled snapshot may never await this shared resource. Keep failures
    // handled while preserving rejection for other active captures.
    void fonts.catch(()=>{})
  }
  const scrollers=[node,...node.querySelectorAll<HTMLElement>('*')].filter(el=>el.scrollTop||el.scrollLeft)
  const scrolls=scrollers.map(el=>({el,id:`capture-${++captureId}`,left:el.scrollLeft,top:el.scrollTop}))
  for(const scroll of scrolls) scroll.el.setAttribute('data-glass-capture-scroll',scroll.id)
  let svg:string
  try {
    const snapshot=await snapshotGlassContent(node,el=>{
        if(!(el instanceof Element))return true
        if(el.hasAttribute?.('data-glass-output')||(el instanceof HTMLImageElement&&!el.getAttribute('src')&&!el.currentSrc))return false
        if(options.foreground&&el!==node&&(el.hasAttribute?.('data-glass-owner')||el.hasAttribute?.('data-glass-content')||el.classList?.contains('glass-surface')||el.classList?.contains('glass-definitions')))return false
        // Retained inactive panels and form registries do not paint. Skipping
        // their complete subtree avoids cloning hundreds of invisible controls
        // during the first visible Aide popup frame.
        return el===node||!(el instanceof Element)||(!el.hasAttribute('hidden')&&getComputedStyle(el).display!=='none')
      },signal)
    signal?.throwIfAborted()
    // Computed CSS, including SVG custom properties, is already inline. The
    // library only needs to embed resources and serialize this detached clone.
    svg=await captureWait(toSvg(snapshot,{
      width:node.offsetWidth,height:node.offsetHeight,includeStyleProperties:[],
      pixelRatio:dpr, fontEmbedCSS:await captureWait(fonts,signal), includeQueryParams:true, fetchRequestInit:{credentials:'omit'},
      // Computed styles contain logical offsets as well as top/left. Reset both
      // so detached sources start at the bitmap origin in Chromium too.
      style:{transform:'none',translate:'none',rotate:'none',scale:'none',position:'relative',inset:'0',insetBlock:'0',insetInline:'0',margin:'0',marginBlock:'0',marginInline:'0',opacity:'1',...(options.foreground?{...(node.hasAttribute('data-glass-owner')?{background:'transparent',boxShadow:'none'}:{}),backdropFilter:'none',filter:'none',clipPath:'none'}:{})},
      onImageErrorHandler:()=>{throw new Error('Glass content image could not be embedded')},
    }),signal)
  } finally { for(const scroll of scrolls) scroll.el.removeAttribute('data-glass-capture-scroll') }
  signal?.throwIfAborted()
  if(scrolls.length) {
    const xml=new DOMParser().parseFromString(decodeURIComponent(svg.slice(svg.indexOf(',')+1)),'image/svg+xml')
    for(const scroll of scrolls) {
      const clone=xml.querySelector<HTMLElement>(`[data-glass-capture-scroll="${scroll.id}"]`)
      if(!clone) continue
      // html-to-image does not retain scroll offsets. Preserve child layout while
      // translating the painted contents inside the existing overflow clip.
      for(const child of Array.from(clone.children) as HTMLElement[]) {
        if(!child.style) continue
        if(child.style.position==='sticky'||child.style.position==='fixed') throw new Error('Unsupported positioned scroll content')
        child.style.transform=`translate(${-scroll.left}px,${-scroll.top}px) ${child.style.transform==='none'?'':child.style.transform}`
      }
      clone.removeAttribute('data-glass-capture-scroll')
    }
    svg=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(xml))}`
  }
  const image=new Image(); image.src=svg
  try {
    await captureWait(image.decode(),signal)
    signal?.throwIfAborted()
    const canvas=document.createElement('canvas')
    canvas.width=Math.max(1,Math.round(node.offsetWidth*dpr)); canvas.height=Math.max(1,Math.round(node.offsetHeight*dpr))
    // Probe the decoded source at 1×1 before allocating its full raster. Reading
    // back the full canvas can synchronously stall on a large GPU upload.
    const probe=document.createElement('canvas');probe.width=1;probe.height=1
    const check=probe.getContext('2d',{willReadFrequently:true})!
    check.drawImage(image,0,0,1,1);check.getImageData(0,0,1,1)
    canvas.getContext('2d')!.drawImage(image,0,0,canvas.width,canvas.height)
    return canvas
  } finally {
    // Cancel only unfinished decoding. Removing src after a successful capture
    // creates Chromium's broken-image UA subtree, which the document can retain.
    // A valid tiny replacement also avoids that fallback when aborting.
    if(signal?.aborted)image.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'
  }
}
