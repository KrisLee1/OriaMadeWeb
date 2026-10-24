import { captureGlassContent } from '@/features/oria-tab/shared/lib/glass/capture'
import { defaultLiquidMaterial, glassGeometry, validateLiquidMaterial, type LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'
import { GlassRenderer, type RenderTiming } from '@/features/oria-tab/shared/lib/glass/renderer'

type Content = { kind:'content'; order:number; node:HTMLElement; image?:HTMLCanvasElement; dirty:boolean; stop:()=>void }
type Surface = { kind:'surface'; order:number; node:HTMLElement; canvas:HTMLCanvasElement; status:(ready:boolean)=>void; stop:()=>void }
type ImageLayer = { kind:'image'; order:number; node:HTMLImageElement; stop:()=>void }
type Layer = Content|Surface|ImageLayer
export type SceneMetrics = { captures:number; captureMs:number[]; frames:number; renders:RenderTiming[]; error:string|null }
/** Explicit paint layers: portal ancestry never determines compositing order. */
export class GlassScene {
  readonly renderer:GlassRenderer
  readonly metrics:SceneMetrics={captures:0,captureMs:[],frames:0,renders:[],error:null}
  private layers=new Set<Layer>()
  private composite:HTMLCanvasElement
  private crop:HTMLCanvasElement
  private revision=0
  private frame=0
  private busy=false
  private disposed=false
  private pending=false
  private stopContext:()=>void
  material:Readonly<LiquidMaterial>=defaultLiquidMaterial
  tint:[number,number,number]=[.94,.93,.98]
  get estimatedBytes() {
    let bytes=this.renderer.stats.estimatedBytes+this.composite.width*this.composite.height*4+this.crop.width*this.crop.height*4
    for(const layer of this.layers) {
      if(layer.kind==='surface')bytes+=layer.canvas.width*layer.canvas.height*4
      if(layer.kind==='content'&&layer.image)bytes+=layer.image.width*layer.image.height*4
    }
    return bytes
  }
  constructor(readonly root:HTMLElement) {
    this.renderer=new GlassRenderer(root.ownerDocument)
    this.composite=root.ownerDocument.createElement('canvas'); this.crop=root.ownerDocument.createElement('canvas')
    this.stopContext=this.renderer.subscribe(()=>this.invalidate())
    root.ownerDocument.defaultView!.addEventListener('resize',this.invalidate)
    root.ownerDocument.addEventListener('scroll',this.onScroll,true)
  }
  private onScroll=(event:Event)=>{
    if(!(event.target instanceof Node))return
    let relevant=event.target===this.root.ownerDocument
    for(const layer of this.layers) {
      if(event.target.contains(layer.node))relevant=true
      if(layer.kind==='content'&&layer.node.contains(event.target)){layer.dirty=true;relevant=true}
    }
    if(relevant)this.invalidate()
  }
  private observe(node:HTMLElement, content?:Content) {
    const resize=new ResizeObserver(()=>{if(content)content.dirty=true;this.invalidate()})
    resize.observe(node)
    const changes=new MutationObserver(records=>{
      if(records.every(r=>r.attributeName==='data-glass-capture-scroll'||(r.target instanceof Element&&r.target.closest('[data-glass-output]'))))return
      if(content)content.dirty=true
      this.invalidate()
    })
    changes.observe(node,{attributes:true,childList:!!content,subtree:!!content,characterData:!!content})
    const loaded=()=>{if(content)content.dirty=true;this.invalidate()}
    if(content)node.addEventListener('load',loaded,true)
    return ()=>{resize.disconnect();changes.disconnect();node.removeEventListener('load',loaded,true)}
  }
  content(node:HTMLElement,order:number) {
    const layer:Content={kind:'content',order,node,dirty:true,stop:()=>{}}
    layer.stop=this.observe(node,layer); this.layers.add(layer); this.invalidate()
    return ()=>{layer.stop();this.layers.delete(layer);this.invalidate()}
  }
  surface(node:HTMLElement,canvas:HTMLCanvasElement,order:number,status:Surface['status']) {
    const layer:Surface={kind:'surface',order,node,canvas,status,stop:()=>{}}
    layer.stop=this.observe(node); this.layers.add(layer); this.invalidate()
    return ()=>{layer.stop();this.layers.delete(layer);this.invalidate()}
  }
  image(node:HTMLImageElement,order:number) {
    const layer:ImageLayer={kind:'image',order,node,stop:()=>{}}
    const stop=this.observe(node);node.addEventListener('load',this.invalidate)
    layer.stop=()=>{stop();node.removeEventListener('load',this.invalidate)}
    this.layers.add(layer);this.invalidate()
    return ()=>{layer.stop();this.layers.delete(layer);this.invalidate()}
  }
  setMaterial(material:Readonly<LiquidMaterial>,tint=this.tint) {
    validateLiquidMaterial(material)
    if(tint.some(value=>!Number.isFinite(value)||value<0||value>1))throw new Error('Invalid glass tint')
    this.material=Object.freeze({...material});this.tint=[...tint];this.invalidate()
  }
  invalidate=()=>{
    if(this.disposed)return
    this.revision++;this.pending=true
    if(!this.frame&&!this.busy)this.frame=requestAnimationFrame(()=>{this.frame=0;void this.paint()})
  }
  private async paint() {
    if(this.disposed)return
    this.busy=true;this.pending=false
    const revision=this.revision,dpr=Math.min(2,this.root.ownerDocument.defaultView!.devicePixelRatio||1)
    const layers=[...this.layers].sort((a,b)=>a.order-b.order)
    try {
      if(!this.renderer.available)throw new Error('Glass context unavailable')
      for(const layer of layers)if(layer.kind==='content'&&layer.dirty) {
        const start=performance.now(),image=await captureGlassContent(layer.node,dpr)
        if(this.disposed)return
        this.metrics.captures++;this.metrics.captureMs.push(performance.now()-start)
        if(revision!==this.revision)return
        layer.image=image;layer.dirty=false
      }
      if(this.disposed||revision!==this.revision)return
      const bounds=this.root.getBoundingClientRect()
      const width=Math.max(1,Math.round(bounds.width*dpr)),height=Math.max(1,Math.round(bounds.height*dpr))
      if(this.composite.width!==width)this.composite.width=width
      if(this.composite.height!==height)this.composite.height=height
      const ctx=this.composite.getContext('2d')!
      ctx.clearRect(0,0,width,height);ctx.fillStyle=getComputedStyle(this.root).backgroundColor;ctx.fillRect(0,0,width,height)
      const rects=layers.map(layer=>({layer,rect:layer.node.getBoundingClientRect(),style:layer.kind==='surface'?getComputedStyle(layer.node):undefined}))
      for(const {layer,rect,style} of rects) {
        const x=(rect.x-bounds.x)*dpr,y=(rect.y-bounds.y)*dpr
        if(layer.kind==='image') {
          if(!layer.node.complete||!layer.node.naturalWidth)throw new Error('Background image not decoded')
          const iw=layer.node.naturalWidth,ih=layer.node.naturalHeight,cover=Math.max(rect.width/iw,rect.height/ih)
          const sw=rect.width/cover,sh=rect.height/cover
          ctx.drawImage(layer.node,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,rect.width*dpr,rect.height*dpr)
          continue
        }
        if(layer.kind==='content') {
          if(layer.image)ctx.drawImage(layer.image,x,y,rect.width*dpr,rect.height*dpr)
          continue
        }
        if(rect.width<1||rect.height<1||rect.right<=bounds.left||rect.left>=bounds.right||rect.bottom<=bounds.top||rect.top>=bounds.bottom){layer.status(false);continue}
        const scaleX=rect.width/(layer.node.offsetWidth||rect.width),scaleY=rect.height/(layer.node.offsetHeight||rect.height)
        const radii=style!.borderTopLeftRadius.split(' ')
        const radius=(value:string,size:number)=>value.endsWith('%')?parseFloat(value)*size/100:parseFloat(value)
        const geometry=glassGeometry(rect.width,rect.height,radius(radii[0],layer.node.offsetWidth)*scaleX,radius(radii[1]||radii[0],layer.node.offsetHeight)*scaleY,this.material)
        const cropWidth=Math.ceil((rect.width+2*geometry.padding)*dpr),cropHeight=Math.ceil((rect.height+2*geometry.padding)*dpr)
        if(this.crop.width!==cropWidth)this.crop.width=cropWidth
        if(this.crop.height!==cropHeight)this.crop.height=cropHeight
        const crop=this.crop.getContext('2d')!
        crop.clearRect(0,0,cropWidth,cropHeight);crop.drawImage(this.composite,geometry.padding*dpr-x,geometry.padding*dpr-y)
        const timing=this.renderer.render(this.crop,layer.canvas,geometry,this.material,this.tint,dpr)
        this.metrics.renders.push(timing);layer.status(true)
        ctx.drawImage(layer.canvas,x,y,rect.width*dpr,rect.height*dpr)
      }
      this.metrics.frames++;this.metrics.error=null
    } catch(error) {
      this.metrics.error=String(error)
      for(const layer of layers)if(layer.kind==='surface')layer.status(false)
    } finally {
      // Retain bounded diagnostic windows, not a lifetime trace.
      this.metrics.renders=this.metrics.renders.slice(-240);this.metrics.captureMs=this.metrics.captureMs.slice(-120)
      this.busy=false;if(this.pending&&!this.disposed)this.invalidate()
    }
  }
  dispose() {
    this.disposed=true;cancelAnimationFrame(this.frame)
    this.root.ownerDocument.defaultView!.removeEventListener('resize',this.invalidate)
    this.root.ownerDocument.removeEventListener('scroll',this.onScroll,true)
    for(const layer of this.layers){layer.stop();if(layer.kind==='surface')layer.status(false)}
    this.layers.clear();this.stopContext();this.renderer.dispose()
    this.composite.width=this.composite.height=this.crop.width=this.crop.height=1
  }
}
