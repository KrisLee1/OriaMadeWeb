import { frame, frameData, cancelFrame } from 'motion'
import { captureGlassContent } from '@/features/oria-tab/shared/lib/glass/capture'
import { defaultLiquidMaterial, glassGeometry, glassSourceReach, validateLiquidMaterial, type LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'
import { elementGlassGeometry } from '@/features/oria-tab/shared/lib/glass/geometry'
import { GlassRenderer } from '@/features/oria-tab/shared/lib/glass/renderer'
import { comparePaintPaths, paintPath } from '@/features/oria-tab/shared/lib/glass/paint-order'
import { copySceneCrop } from '@/features/oria-tab/shared/lib/glass/crop'
import { paintGlassShadow } from '@/features/oria-tab/shared/lib/glass/shadow'
import { GlassFrame } from '@/features/oria-tab/shared/lib/glass/frame'
import { GlassReadCache, placementOnly } from '@/features/oria-tab/shared/lib/glass/read-cache'

type Fragment={node:HTMLElement;kind:'background'|'content';dirty:boolean;version:number;settlingUntil:number;changedAt:number;capturedAt:number;captures:number;captureDpr:number;materialOnly:boolean;capture?:AbortController;settleTimer?:ReturnType<typeof setTimeout>;image?:HTMLCanvasElement;error?:string;stop:()=>void}
type Surface={node:HTMLElement;owner:HTMLElement;canvas:HTMLCanvasElement;padding:number;ready:boolean;pendingSince:number;lastRect?:DOMRect;signature?:string;paintVersion:number;status:(ready:boolean)=>void;stop:()=>void}
type Pool={renderer:GlassRenderer;scenes:Set<ApplicationGlassScene>;animations?:{timestamp:number;values:Animation[]}}
const pools=new WeakMap<Document,Pool>()
export const readGlassDiagnostics=(document:Document)=>[...(pools.get(document)?.scenes??[])].map(s=>s.stats)
const intersects=(a:DOMRect,b:DOMRect,pad=0)=>a.left-pad<b.right&&a.right+pad>b.left&&a.top-pad<b.bottom&&a.bottom+pad>b.top
const transparent=(color:string)=>color==='transparent'||color==='rgba(0, 0, 0, 0)'
/** One registered scene per scope, sharing one GL context across the document. */
export class ApplicationGlassScene {
  readonly renderer:GlassRenderer
  readonly metrics={frames:0,captures:0,captureMs:[] as number[],error:null as string|null,fallbacks:[] as string[],renders:[] as ReturnType<GlassRenderer['render']>[]}
  private reads=new GlassReadCache()
  private geometryPlans=new Map<Surface,{rect:DOMRect;key:string;geometry:ReturnType<typeof elementGlassGeometry>;reach:number;layout:ReturnType<typeof glassGeometry>}>()
  private poses=new WeakMap<DOMRect,unknown[]>()
  private pool:Pool
  private fragments=new Map<HTMLElement,Fragment>()
  private surfaces=new Set<Surface>()
  private composite:HTMLCanvasElement
  private crop:HTMLCanvasElement
  private scheduled=false
  private present=()=>{queueMicrotask(()=>{this.scheduled=false;this.paint()})}
  private schedule(){if(!this.scheduled&&!this.busy&&!this.disposed){this.scheduled=true;frame.postRender(this.present)}}
  private capturing:Fragment|null=null
  private busy=false
  private pending=false
  private disposed=false
  private stopContext:()=>void
  private observer:MutationObserver
  private material:Readonly<LiquidMaterial>=defaultLiquidMaterial
  private tint:[number,number,number]=[.94,.93,.98]
  private activeUntil=0
  private materialChangingUntil=0
  constructor(readonly root:HTMLElement) {
    const doc=root.ownerDocument
    let pool=pools.get(doc)
    if(!pool){pool={renderer:new GlassRenderer(doc),scenes:new Set()};pools.set(doc,pool)}
    this.pool=pool;pool.scenes.add(this);this.renderer=pool.renderer
    if(process.env.NODE_ENV === 'development'){const loss=pool.renderer.gl.getExtension('WEBGL_lose_context');Object.defineProperty(doc.defaultView,'__oriaGlass',{value:{report:()=>[...pool!.scenes].map(s=>s.stats),lose:()=>loss?.loseContext(),restore:()=>loss?.restoreContext()},configurable:true})}
    this.composite=doc.createElement('canvas');this.crop=doc.createElement('canvas')
    this.stopContext=this.renderer.subscribe(()=>{this.fallback();this.invalidate()})
    this.observer=new MutationObserver(records=>{
      const relevant=records.filter(r=>!(r.target instanceof Element&&r.target.closest('.webgl-glass-surface,[data-glass-output]'))&&r.attributeName!=='data-glass-capture-scroll'&&r.attributeName!=='data-glass-owner')
      if(!relevant.length)return
      if(relevant.some(r=>r.attributeName==='data-glass-background-pending'))this.invalidate()
      for(const r of relevant){if(r.type==='childList'||r.attributeName!=='style')this.reads.clear();else if(r.target instanceof Element&&r.oldValue!==r.target.getAttribute('style')){if(placementOnly(r.oldValue,(r.target as Element).getAttribute('style')))this.reads.forget(r.target);else this.reads.clear()}}
      if(relevant.some(r=>r.type==='childList'||r.attributeName==='data-glass-scope'))this.scan()
      if(!relevant.some(r=>r.type==='childList'||(r.target instanceof Element&&[...this.surfaces].some(s=>r.target instanceof Element&&r.target.contains(s.node)))))return
      for(const r of relevant)if(r.type==='attributes'&&r.attributeName==='style')this.activeUntil=performance.now()+100
      this.invalidate()
    })
    this.observer.observe(root,{subtree:true,childList:true,attributes:true,attributeOldValue:true,attributeFilter:['class','style','data-state','data-ending-style','data-starting-style','data-popup-motion','data-background','data-pending','data-revealing','data-glass-scope','data-glass-background-pending']})
    for(const event of ['pointerover','pointerout','pointerdown','pointerup','pointercancel','keydown','keyup','focusin','focusout','input','change'])doc.addEventListener(event,this.onInteraction,true)
    doc.addEventListener('scroll',this.onScroll,true);doc.addEventListener('load',this.onLoad,true)
    doc.addEventListener('transitionrun',this.motion,true);doc.addEventListener('animationstart',this.motion,true)
    doc.addEventListener('transitionend',this.motion,true);doc.addEventListener('animationend',this.motion,true)
    doc.defaultView!.addEventListener('resize',this.onResize)
    void doc.fonts.ready.then(()=>{if(!this.disposed){for(const f of this.fragments.values())this.dirty(f);this.invalidate()}})
    this.scan()
  }
  get estimatedBytes(){let n=this.composite.width*this.composite.height*4+this.crop.width*this.crop.height*4;for(const f of this.fragments.values())if(f.image)n+=f.image.width*f.image.height*4;for(const s of this.surfaces)n+=s.canvas.width*s.canvas.height*4;return n}
  get stats(){return {...this.metrics,fragments:[...this.fragments.values()].map(f=>({node:f.node.className,dirty:f.dirty,version:f.version,captures:f.captures,dependencies:[...this.surfaces].filter(s=>comparePaintPaths(paintPath(f.node,this.root),paintPath(s.owner,this.root))<0&&intersects(f.node.getBoundingClientRect(),s.node.getBoundingClientRect(),s.padding)).map(s=>s.owner.className)})),errors:[...this.fragments.values()].filter(f=>f.error).map(f=>({node:f.node.className,error:f.error})),contexts:this.renderer.stats.contexts,estimatedBytes:this.renderer.stats.estimatedBytes+[...this.pool.scenes].reduce((sum,s)=>sum+s.estimatedBytes,0),surfaces:this.surfaces.size}}
  private owns(node:HTMLElement){return node.closest('[data-glass-scope]')===this.root}
  private bounds(){return this.root===this.root.ownerDocument.body?new DOMRect(0,0,innerWidth,innerHeight):this.root.getBoundingClientRect()}
  private onInteraction=()=>{this.reads.clear();this.invalidate()}
  private onResize=()=>{this.reads.clear();for(const f of this.fragments.values())this.dirty(f);this.invalidate()}
  private onLoad=(event:Event)=>{this.reads.clear();for(const f of this.fragments.values())if(event.target instanceof Node&&f.node.contains(event.target))this.dirty(f);this.invalidate()}
  private onScroll=(event:Event)=>{this.reads.clear();for(const f of this.fragments.values())if(event.target instanceof Node&&f.node.contains(event.target))this.dirty(f);this.invalidate()}
  private motion=(event:Event)=>{
    const target=event.target instanceof Element?event.target:null
    if(!target||target.closest('.webgl-glass-surface'))return
    // Short/reduced-motion transitions can start and finish between scene
    // frames. Their final style must replace any pre-transition cached read.
    this.reads.clear()
    const owner=target.closest('[data-glass-owner],[data-glass-content],[data-glass-background]')
    for(const f of this.fragments.values())if(owner===f.node){
      const placement=target===f.node&&event instanceof TransitionEvent&&/^(transform|translate|scale|rotate|opacity|clip-path)$/.test(event.propertyName)
      if(!placement){
        if(event.type==='transitionrun'){const s=getComputedStyle(target);f.settlingUntil=performance.now()+Math.max(...s.transitionDuration.split(',').map(v=>parseFloat(v)*1000))+Math.max(...s.transitionDelay.split(',').map(v=>parseFloat(v)*1000))}
        else if(event.type==='transitionend')f.settlingUntil=0
        this.dirty(f,performance.now()<this.materialChangingUntil&&event instanceof TransitionEvent&&/color|background|shadow|border|filter/.test(event.propertyName))
      }
    }
    if([...this.surfaces].some(s=>target.contains(s.node))||target.closest('[data-glass-background]')){this.activeUntil=performance.now()+100;this.invalidate()}
  }
  private scan(){
    for(const node of this.root.querySelectorAll<HTMLElement>('[data-glass-background],[data-glass-content],[data-slot="dialog-overlay"]'))if(this.owns(node)&&!this.fragments.has(node))this.addFragment(node,node.hasAttribute('data-glass-background')?'background':'content')
    for(const [node,f]of this.fragments)if(!node.isConnected||!this.root.contains(node)||!this.owns(node)){f.stop();this.fragments.delete(node)}
  }
  private addFragment(node:HTMLElement,kind:Fragment['kind']) {
    const existing=this.fragments.get(node);if(existing)return existing
    const f:Fragment={node,kind,dirty:true,version:0,settlingUntil:0,changedAt:0,capturedAt:0,captures:0,captureDpr:1,materialOnly:false,stop:()=>{}}
    const resize=new ResizeObserver(()=>{this.reads.clear();this.dirty(f)});resize.observe(node)
    const observer=new MutationObserver(records=>{
      const relevant=records.filter(r=>{
        if(r.attributeName==='data-glass-capture-scroll'||r.attributeName==='data-glass-owner')return false
        if(r.target===node&&/^data-popup-(progress|origin|motion)$/.test(r.attributeName??''))return false
        const target=r.target instanceof Element?r.target:r.target.parentElement
        if(target?.closest('.webgl-glass-surface,[data-glass-output]'))return false
        const owner=target?.closest('[data-glass-owner],[data-glass-content]')
        return !owner||owner===node||!node.contains(owner)
      })
      if(!relevant.length)return
      if(relevant.some(r=>r.type==='childList'||r.type==='characterData'||(r.type==='attributes'&&r.target instanceof HTMLElement&&r.attributeName!=='style'&&!/^data-popup-(progress|origin|motion)$/.test(r.attributeName??''))))this.reads.clear()
      // Root placement/opacity is composited from live geometry, not baked in.
      const onlyPlacement=relevant.every(r=>r.target===node&&r.type==='attributes'&&r.attributeName==='style'&&placementOnly(r.oldValue,node.getAttribute('style')))
      if(!onlyPlacement)this.dirty(f)
      else this.invalidate()
    })
    observer.observe(node,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true})
    f.stop=()=>{resize.disconnect();observer.disconnect();clearTimeout(f.settleTimer);f.capture?.abort();f.image=undefined};this.fragments.set(node,f)
    return f
  }
  private dirty(f:Fragment,materialOnly=false){const dirty=f.dirty;f.materialOnly=materialOnly&&(!dirty||f.materialOnly);f.dirty=true;f.version++;if(!dirty)f.changedAt=performance.now();if(f.kind==='content'&&!dirty){clearTimeout(f.settleTimer);f.settleTimer=setTimeout(()=>this.invalidate(),40)}if(dirty){if(this.busy)this.pending=true;return}const path=paintPath(f.node,this.root),rect=f.node.getBoundingClientRect();let needed=f.kind==='background';for(const s of this.surfaces)if(isVisible(s.node)&&(f.kind==='background'||comparePaintPaths(path,paintPath(s.owner,this.root))<0)&&intersects(rect,s.node.getBoundingClientRect(),s.padding)){needed=true}if(needed)this.invalidate()}
  content(node:HTMLElement,_order=0){if(!this.fragments.has(node))this.addFragment(node,'content');this.invalidate();return()=>{this.fragments.get(node)?.stop();this.fragments.delete(node);this.invalidate()}}
  surface(node:HTMLElement,canvas:HTMLCanvasElement,_order:number,status:Surface['status']) {
    const owner=node.parentElement!,surface:Surface={node,owner,canvas,padding:0,ready:false,pendingSince:0,paintVersion:0,status:ready=>{if(surface.ready!==ready){surface.ready=ready;status(ready)}},stop:()=>{}}
    owner.setAttribute('data-glass-owner','')
    const resize=new ResizeObserver(()=>{this.reads.clear();this.invalidate()});resize.observe(owner)
    surface.stop=()=>resize.disconnect();this.surfaces.add(surface)
    this.addFragment(owner,'content');this.invalidate()
    return()=>{surface.stop();this.surfaces.delete(surface);this.geometryPlans.delete(surface);if(![...this.surfaces].some(s=>s.owner===owner)){owner.removeAttribute('data-glass-owner');this.fragments.get(owner)?.stop();this.fragments.delete(owner)}this.invalidate()}
  }
  setMaterial(material:Readonly<LiquidMaterial>,tint:[number,number,number]){this.reads.clear();validateLiquidMaterial(material);const changed=tint.some((v,i)=>v!==this.tint[i])||(['edgeHighlight','tintOpacity'] as const).some(key=>material[key]!==this.material[key]);const previewing=changed||(Object.keys(material) as (keyof LiquidMaterial)[]).some(key=>material[key]!==this.material[key]);this.material={...material};this.tint=[...tint];if(previewing){this.materialChangingUntil=performance.now()+120;this.activeUntil=Math.max(this.activeUntil,this.materialChangingUntil)}if(changed){for(const f of this.fragments.values())if(f.kind==='content')this.dirty(f,true)}this.invalidate()}
  invalidateBackground(){this.reads.clear();for(const f of this.fragments.values())if(f.kind==='background')this.dirty(f);this.invalidate()}
  invalidate=()=>{if(this.disposed)return;this.pending=true;this.schedule()}
  private fallback(){for(const s of this.surfaces)s.status(false)}
  private async capture(f:Fragment,dpr:number){
    this.capturing=f
    const controller=new AbortController();f.capture=controller
    const start=performance.now(),version=f.version
    try{
      const image=await captureGlassContent(f.node,dpr,{foreground:f.kind==='content',signal:controller.signal})
      if(this.disposed||this.fragments.get(f.node)!==f)return
      f.image=image;f.error=undefined;f.dirty=version!==f.version;f.captureDpr=dpr
      if(!f.dirty)f.materialOnly=false
      else f.changedAt=performance.now()
    }catch(error){if(!this.disposed&&!controller.signal.aborted){f.error=String(error);f.dirty=false}}
    finally{
      this.metrics.captures++;f.captures++;f.capturedAt=performance.now();this.metrics.captureMs.push(performance.now()-start)
      f.capture=undefined
      this.capturing=null
      this.invalidate()
    }
  }
  private paint(){
    if(this.disposed)return
    // The initial wallpaper blends over an HTML poster outside this scene.
    // Until that handoff finishes, CSS glass samples the actual backdrop;
    // shading the incomplete capture would turn transparent pixels black.
    // Readiness mutations wake us without polling or delaying usable controls.
    if([...this.fragments.values()].some(f=>f.kind==='background'&&f.node.hasAttribute('data-glass-background-pending'))){this.fallback();return}
    this.busy=true;this.pending=false
    if(this.pool.animations?.timestamp!==frameData.timestamp)this.pool.animations={timestamp:frameData.timestamp,values:this.root.ownerDocument.getAnimations()}
    const animations=this.pool.animations.values
    this.reads.begin(animations)
    const reads=new GlassFrame(this.root,this.reads),geometryKey=[this.material.thickness,this.material.ior,this.material.roughness,this.material.dispersion].join(':')
    const bounds=this.bounds()
    const visible=new DOMRect(Math.max(0,bounds.x),Math.max(0,bounds.y),Math.max(0,Math.min(innerWidth,bounds.right)-Math.max(0,bounds.x)),Math.max(0,Math.min(innerHeight,bounds.bottom)-Math.max(0,bounds.y)))
    // Reserve the local GL pool, crop, displays and foreground snapshots as well.
    const sceneCount=this.pool.scenes.size
    const unsupported:{rect:DOMRect;path:HTMLElement[]}[]=[]
    const surfaces=[...this.surfaces].map(surface=>({surface,rect:reads.rect(surface.node),path:reads.path(surface.owner)})).filter(s=>s.rect.width>=1&&s.rect.height>=1&&intersects(s.rect,visible)&&isVisible(s.surface.node,reads)).map(s=>{
      try{
      const cached=this.geometryPlans.get(s.surface)
      if(cached&&cached.rect===s.rect&&cached.key===geometryKey)return {...s,geometry:cached.geometry,reach:cached.reach,layout:cached.layout}
      const layoutWidth=s.surface.node.offsetWidth||s.rect.width,layoutHeight=s.surface.node.offsetHeight||s.rect.height
      const geometry=elementGlassGeometry(s.surface.node,s.rect,this.material,reads.style,{validated:reads.transforms,width:layoutWidth,height:layoutHeight})
      const reach=glassSourceReach(geometry,this.material)
      s.surface.padding=reach
      const layout=glassGeometry(layoutWidth,layoutHeight,geometry.radiusX*layoutWidth/geometry.width,geometry.radiusY*layoutHeight/geometry.height,{...this.material,roughness:1})
      this.geometryPlans.set(s.surface,{rect:s.rect,key:geometryKey,geometry,reach,layout})
      return {...s,geometry,reach,layout}
      }catch{s.surface.status(false);unsupported.push({rect:s.rect,path:s.path});return null}
    }).filter(s=>s!==null)
    // Reserve against the full roughness range so dragging a material slider
    // does not change DPR, canvas capacity or the input rectangle each frame.
    const areas=surfaces.map(s=>(s.layout.width+2*s.layout.padding)*(s.layout.height+2*s.layout.padding))
    const maxArea=Math.max(1,...areas),totalArea=areas.reduce((a,b)=>a+b,0),viewportArea=Math.max(1,visible.width*visible.height)
    const dpr=Math.max(.5,Math.min(2,devicePixelRatio||1,Math.sqrt(8*1024*1024/(viewportArea*4*sceneCount)),Math.sqrt(48*1024*1024/(sceneCount*(8*viewportArea+24*maxArea+4*totalArea)))))
    for(const f of this.fragments.values())if(f.image&&f.captureDpr>dpr+.02){const image=this.root.ownerDocument.createElement('canvas'),ratio=dpr/f.captureDpr;image.width=Math.max(1,Math.round(f.image.width*ratio));image.height=Math.max(1,Math.round(f.image.height*ratio));image.getContext('2d')!.drawImage(f.image,0,0,image.width,image.height);f.image=image;f.captureDpr=dpr}
    const fragments=[...this.fragments.values()].filter(f=>isVisible(f.node,reads)&&intersects(reads.rect(f.node),visible))
    const entries=[...surfaces.map(s=>({...s,kind:'surface' as const})),...fragments.map(fragment=>({fragment,rect:reads.rect(fragment.node),path:reads.path(fragment.node),kind:fragment.kind}))].sort((a,b)=>(a.kind==='background')!==(b.kind==='background')?(a.kind==='background'?-1:1):reads.compare(a.path,b.path)||(a.kind==='surface'?-1:b.kind==='surface'?1:0))
    // A contribution is only needed where a later surface can sample it.
    // Suffix bounds include optical padding, including displaced source pixels.
    const laterBounds:(DOMRect|undefined)[]=new Array(entries.length)
    let later:DOMRect|undefined
    for(let i=entries.length-1;i>=0;i--){
      laterBounds[i]=later
      const entry=entries[i]
      if(entry.kind!=='surface')continue
      const l=entry.rect.left-entry.reach,t=entry.rect.top-entry.reach,r=entry.rect.right+entry.reach,b=entry.rect.bottom+entry.reach
      later=later?new DOMRect(Math.min(l,later.left),Math.min(t,later.top),Math.max(r,later.right)-Math.min(l,later.left),Math.max(b,later.bottom)-Math.min(t,later.top)):new DOMRect(l,t,r-l,b-t)
    }
    const clipLater=(ctx:CanvasRenderingContext2D,index:number)=>{const bounds=laterBounds[index]!;ctx.beginPath();ctx.rect((bounds.x-visible.x)*dpr,(bounds.y-visible.y)*dpr,bounds.width*dpr,bounds.height*dpr);ctx.clip()}
    // Hidden retained menus must not retain their foreground bitmaps forever.
    for(const f of this.fragments.values())if(f.image&&f.kind==='content'&&!fragments.includes(f)){f.image=undefined;f.dirty=true;f.version++}
    try{
      this.metrics.fallbacks=[]
      if(!this.renderer.available)throw new Error('Glass context unavailable')
      // Capture serially outside presentation. A slow decode must not freeze
      // geometry or material updates; each visible frame still commits all
      // surfaces synchronously using complete, versioned source snapshots.
      for(let i=0;i<entries.length;i++){
        const entry=entries[i]
        if(entry.kind==='surface')continue
        const f=entry.fragment
        const backgroundAnimations=f.kind==='background'?f.node.getAnimations({subtree:true}).filter(a=>a.playState==='running'):[]
        if(backgroundAnimations.length){
          this.activeUntil=performance.now()+100
          // Root opacity/placement is applied live during composition. Child
          // image crossfades need refreshed pixels, sampled at most every 64ms.
          if(backgroundAnimations.some(a=>backgroundPixelsAnimate(a,f.node))&&performance.now()-f.capturedAt>=64)f.dirty=true
        }
        if(f.node.matches('[data-slot="dialog-overlay"]'))continue
        if(f.kind!=='background'&&!entries.slice(i+1).some(next=>next.kind==='surface'&&intersects(entry.rect,next.rect,next.reach)))continue
        // Material preview reuses source pixels; freshly shaded lower glass is
        // still composited below upper glass in this same synchronous frame.
        // Refresh CSS foreground after the gesture, without making shader
        // updates wait behind repeated DOM cloning and image decoding.
        if(f.image&&performance.now()<this.materialChangingUntil)continue
        const waiting=f.kind==='content'&&f.dirty&&performance.now()-f.changedAt<32
        if(waiting||performance.now()<f.settlingUntil)continue
        if(!f.dirty&&(f.image||f.error))continue
        if(!this.capturing)void this.capture(f,dpr)
      }
      const width=Math.max(1,Math.round(visible.width*dpr)),height=Math.max(1,Math.round(visible.height*dpr))
      if(this.composite.width!==width)this.composite.width=width
      if(this.composite.height!==height)this.composite.height=height
      const ctx=this.composite.getContext('2d')!;ctx.clearRect(0,0,this.composite.width,this.composite.height)
      const base=reads.style(this.root).backgroundColor
      if(!transparent(base)){ctx.fillStyle=base;ctx.fillRect(0,0,this.composite.width,this.composite.height)}
      const blocked:{rect:DOMRect;hard:boolean;reason:string}[]=[]
      const contributions:{rect:DOMRect;stamp:unknown;shadow?:boolean}[]=[],materialStamp=JSON.stringify([this.material,this.tint])
      const pose=(node:HTMLElement,rect:DOMRect)=>{let value=this.poses.get(rect);if(!value){value=[rect.x,rect.y,rect.width,rect.height,opacity(node,this.root,reads),clipStamp(node,this.root,reads)];this.poses.set(rect,value)}return value}
      for(let i=0;i<entries.length;i++){
        const entry=entries[i],rect=entry.rect,x=(rect.x-visible.x)*dpr,y=(rect.y-visible.y)*dpr
        if(entry.kind!=='surface'){
          if(!laterBounds[i])continue
          const f=entry.fragment
          // Do not rasterize a foreground that no later glass can sample.
          if(f.kind!=='background'&&!entries.slice(i+1).some(next=>next.kind==='surface'&&intersects(rect,next.rect,next.reach)))continue
          if(f.node.matches('[data-slot="dialog-overlay"]')){ctx.save();ctx.globalAlpha=opacity(f.node,this.root,reads);ctx.fillStyle=reads.style(f.node).backgroundColor;ctx.fillRect(x,y,rect.width*dpr,rect.height*dpr);ctx.restore();contributions.push({rect,stamp:[i,pose(f.node,rect),ctx.fillStyle]});continue}
          const waiting=f.kind==='content'&&f.dirty&&performance.now()-f.changedAt<32
          if(waiting&&!f.image){blocked.push({rect,hard:false,reason:`pending:${f.node.className}`});continue}
          if(performance.now()<f.settlingUntil){this.activeUntil=Math.max(this.activeUntil,f.settlingUntil);if(!f.image){blocked.push({rect,hard:false,reason:`transition:${f.node.className}`});continue}}
          if(f.error||!f.image){blocked.push({rect,hard:!!f.error,reason:`capture:${f.node.className}`});this.metrics.fallbacks.push(`fragment:${f.node.className}`);continue}
          ctx.save();clipLater(ctx,i);clipAncestors(ctx,f.node,this.root,visible,dpr,reads);clipSelf(ctx,f.node,rect,visible,dpr,reads);ctx.globalAlpha=opacity(f.node,this.root,reads);ctx.drawImage(f.image,x,y,rect.width*dpr,rect.height*dpr);ctx.restore()
          contributions.push({rect,stamp:[i,f.captures,pose(f.node,rect)]})
          continue
        }
        const {surface}=entry,g=entry.geometry
        const paintOutput=()=>{if(!laterBounds[i])return;ctx.save();clipLater(ctx,i);clipAncestors(ctx,surface.node,this.root,visible,dpr,reads);paintGlassShadow(ctx,surface.owner,rect,g,x,y,dpr,opacity(surface.owner,this.root,reads),reads.style);clipSelf(ctx,surface.node,rect,visible,dpr,reads);ctx.globalAlpha=opacity(surface.node,this.root,reads);ctx.drawImage(surface.canvas,x,y,rect.width*dpr,rect.height*dpr);ctx.restore();const shadow=reads.style(surface.owner.querySelector(':scope > .popup-shadow')??surface.owner).boxShadow;contributions.push({rect,stamp:[i,surface.paintVersion,pose(surface.node,rect),shadow],shadow:shadow!=='none'})}
        const blocking=blocked.filter(b=>intersects(b.rect,rect,entry.reach)),unsupportedLower=unsupported.some(u=>reads.compare(u.path,entry.path)<0&&intersects(u.rect,rect,entry.reach))
        if(blocking.length||unsupportedLower){
          surface.pendingSince||=performance.now()
          const previous=surface.lastRect,samePose=previous&&Math.max(Math.abs(rect.x-previous.x),Math.abs(rect.y-previous.y),Math.abs(rect.width-previous.width),Math.abs(rect.height-previous.height))<.25
          if(surface.ready&&samePose&&!unsupportedLower&&!blocking.some(b=>b.hard)&&performance.now()-surface.pendingSince<180){paintOutput();this.activeUntil=Math.max(this.activeUntil,surface.pendingSince+180)}
          else{surface.status(false);blocked.push({rect,hard:true,reason:`surface:${surface.owner.className}`})}
          this.metrics.fallbacks.push(`blocked:${surface.owner.className} <= ${blocking.map(b=>b.reason).join(";")}${unsupportedLower?"unsupported-lower":""}`);continue
        }
        surface.pendingSince=0
        // A moving upper popup does not change the source of stationary lower
        // glass. Reuse its pixels instead of synchronously copying GL to 2D again.
        const signature=JSON.stringify([materialStamp,dpr,base,rect.x,rect.y,rect.width,rect.height,g,contributions.filter(c=>c.shadow||intersects(c.rect,rect,entry.reach)).map(c=>c.stamp)])
        if(surface.ready&&signature===surface.signature){paintOutput();continue}
        const w=Math.ceil((rect.width+2*g.padding)*dpr),h=Math.ceil((rect.height+2*g.padding)*dpr)
        const layout=entry.layout,reserve={width:Math.ceil((layout.width+2*layout.padding)*dpr/64)*64,height:Math.ceil((layout.height+2*layout.padding)*dpr/64)*64}
        reserve.width=Math.max(reserve.width,Math.ceil(w/64)*64);reserve.height=Math.max(reserve.height,Math.ceil(h/64)*64)
        const memory=()=>this.renderer.estimateRenderBytes(reserve.width,reserve.height,g,dpr,reserve)+[...this.pool.scenes].reduce((n,s)=>n+s.estimatedBytes,0)-this.crop.width*this.crop.height*4+reserve.width*reserve.height*4-surface.canvas.width*surface.canvas.height*4+reserve.width*reserve.height*4
        if(memory()>64*1024*1024)this.renderer.trimBuffers()
        if(memory()>64*1024*1024){surface.status(false);blocked.push({rect,hard:true,reason:`surface:${surface.owner.className}`});this.metrics.fallbacks.push(`budget:${memory()}`);continue}
        // Keep the source allocation stable throughout the spring too. Clear
        // unused capacity so it is identical to the renderer's padded upload,
        // then upload this canvas directly without a second full-size copy.
        if(this.crop.width!==reserve.width)this.crop.width=reserve.width;if(this.crop.height!==reserve.height)this.crop.height=reserve.height
        const crop=this.crop.getContext('2d')!;crop.clearRect(0,0,this.crop.width,this.crop.height);copySceneCrop(crop,this.composite,x-g.padding*dpr,y-g.padding*dpr,w,h)
        const timing=this.renderer.render(this.crop,surface.canvas,g,this.material,this.tint,dpr,reserve);this.metrics.renders.push(timing);surface.lastRect=rect;surface.signature=signature;surface.paintVersion++;surface.status(true)
        paintOutput()
      }
      this.metrics.frames++;this.metrics.error=null
    }catch(error){this.metrics.error=String(error);this.fallback()}
    finally{
      this.metrics.captureMs=this.metrics.captureMs.slice(-120);this.metrics.renders=this.metrics.renders.slice(-240)
      this.busy=false
      const moving=animations.some(a=>{const target=a.effect instanceof KeyframeEffect?a.effect.target:null;return a.playState==='running'&&target instanceof Element&&((this.root.contains(target)&&!!target.closest('[data-glass-background]'))||[...this.surfaces].some(s=>target.contains(s.node)))})
      // Warm small visible foregrounds once between required captures, so an upper
      // popup can sample search/Dock text immediately. Bound optional sources
      // independently; hidden panels are still released above.
      if(!this.capturing&&performance.now()>=this.materialChangingUntil&&!this.root.querySelector('[data-popup-motion=opening],[data-popup-motion=closing]')){
        const bytes=[...this.fragments.values()].reduce((n,f)=>n+(f.kind==='content'&&f.image?f.image.width*f.image.height*4:0),0)
        const next=fragments.find(f=>f.kind==='content'&&!f.image&&!f.error&&f.node.offsetWidth*f.node.offsetHeight*dpr*dpr*4<=512*1024)
        if(next&&bytes+next.node.offsetWidth*next.node.offsetHeight*dpr*dpr*4<=4*1024*1024)void this.capture(next,dpr)
      }
      if(!this.disposed&&(this.pending||moving||performance.now()<this.activeUntil)){this.pending=false;this.schedule()}
    }
  }
  dispose(){this.disposed=true;cancelFrame(this.present);this.observer.disconnect();this.stopContext();this.fallback();for(const s of this.surfaces){s.stop();s.owner.removeAttribute('data-glass-owner')}for(const f of this.fragments.values())f.stop();this.surfaces.clear();this.fragments.clear();this.reads.clear();this.geometryPlans.clear();const d=this.root.ownerDocument;for(const event of ['pointerover','pointerout','pointerdown','pointerup','pointercancel','keydown','keyup','focusin','focusout','input','change'])d.removeEventListener(event,this.onInteraction,true);d.removeEventListener('scroll',this.onScroll,true);d.removeEventListener('load',this.onLoad,true);for(const event of ['transitionrun','transitionend','animationstart','animationend'])d.removeEventListener(event,this.motion,true);d.defaultView!.removeEventListener('resize',this.onResize);this.pool.scenes.delete(this);if(!this.pool.scenes.size){this.renderer.dispose();pools.delete(d)}this.composite.width=this.composite.height=this.crop.width=this.crop.height=1}
}
function backgroundPixelsAnimate(animation:Animation,node:HTMLElement){const effect=animation.effect;if(!(effect instanceof KeyframeEffect))return true;if(effect.target!==node)return true;return effect.getKeyframes().some(frame=>Object.keys(frame).some(key=>!['opacity','transform','translate','scale','rotate','offset','computedOffset','easing','composite'].includes(key)))}
function isVisible(node:HTMLElement,reads?:GlassFrame){if(reads)return reads.visible(node);for(let el:HTMLElement|null=node;el;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false}return true}
function opacity(node:HTMLElement,root:HTMLElement,reads?:GlassFrame){if(reads)return reads.opacity(node);let value=1;for(let el:HTMLElement|null=node;el;el=el.parentElement){value*=Number(getComputedStyle(el).opacity);if(el===root)break}return value}
function clipStamp(node:HTMLElement,root:HTMLElement,reads?:GlassFrame){const clips:unknown[]=[];for(let el:HTMLElement|null=node;el&&el!==root;el=el.parentElement){const style=reads?reads.style(el):getComputedStyle(el);if(style.clipPath!=='none')clips.push(style.clipPath);if(/hidden|clip|scroll|auto/.test(style.overflowX+' '+style.overflowY)){const rect=reads?reads.rect(el):el.getBoundingClientRect();clips.push([rect.x,rect.y,rect.width,rect.height,style.borderRadius])}}return clips}
function clipAncestors(ctx:CanvasRenderingContext2D,node:HTMLElement,root:HTMLElement,origin:DOMRect,dpr:number,reads?:GlassFrame){for(let el=node.parentElement;el&&el!==root;el=el.parentElement){const style=reads?reads.style(el):getComputedStyle(el);if(/hidden|clip|scroll|auto/.test(style.overflowX+' '+style.overflowY)){const r=reads?reads.rect(el):el.getBoundingClientRect();ctx.beginPath();ctx.roundRect((r.x-origin.x)*dpr,(r.y-origin.y)*dpr,r.width*dpr,r.height*dpr,Math.min(parseFloat(style.borderTopLeftRadius)||0,r.width/2,r.height/2)*dpr);ctx.clip()}clipSelf(ctx,el,undefined,origin,dpr,reads)}}
function clipSelf(ctx:CanvasRenderingContext2D,node:HTMLElement,rect:DOMRect|undefined,origin:DOMRect,dpr:number,reads?:GlassFrame){const clip=(reads?reads.style(node):getComputedStyle(node)).clipPath;if(!clip.startsWith('polygon('))return;const r=rect??(reads?reads.rect(node):node.getBoundingClientRect());const points=clip.slice(8,-1).split(',').map(p=>p.trim().split(/\s+/).map(parseFloat));ctx.beginPath();points.forEach(([x,y],i)=>{const px=(r.x-origin.x+r.width*x/100)*dpr,py=(r.y-origin.y+r.height*y/100)*dpr;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)});ctx.closePath();ctx.clip()}
