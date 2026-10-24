import { comparePaintPaths, createsPaintContext, paintPath } from '@/features/oria-tab/shared/lib/glass/paint-order'
import type { GlassReadCache } from '@/features/oria-tab/shared/lib/glass/read-cache'

/** Read each element once per scene frame. Discard before the next frame so
 * live transforms, inherited opacity and stacking changes cannot go stale. */
export class GlassFrame {
  readonly transforms=new Set<HTMLElement>()
  private styles=new Map<Element,CSSStyleDeclaration>()
  private rects=new Map<Element,DOMRect>()
  private contexts=new Map<HTMLElement,boolean>()
  private visibility=new Map<HTMLElement,boolean>()
  private alphas=new Map<HTMLElement,number>()
  private paths=new Map<HTMLElement,HTMLElement[]>()
  constructor(readonly root:HTMLElement,private cache?:GlassReadCache){
    if(cache){this.styles=cache.styles;this.rects=cache.rects;this.paths=cache.paths}
  }
  style=(node:Element)=>{
    let value=this.styles.get(node)
    if(!value){
      const source=getComputedStyle(node),properties=new Map<PropertyKey,unknown>()
      // CSSStyleDeclaration is live: caching the object alone still repeats
      // native computed-property reads for every ancestor walk. This frame has
      // no async presentation, so each property can be sampled once as well.
      value=new Proxy(source,{get:(target,key)=>{
        const cached=properties.get(key)
        if(cached!==undefined)return cached
        const raw=Reflect.get(target,key,target),result=typeof raw==='function'?raw.bind(target):raw
        properties.set(key,result);return result
      }})
      this.styles.set(node,value);this.cache?.remember(node)
    }
    return value
  }
  rect=(node:Element)=>{
    let value=this.rects.get(node)
    if(!value){value=node.getBoundingClientRect();this.rects.set(node,value);this.cache?.remember(node)}
    return value
  }
  private context=(node:HTMLElement)=>{
    if(!this.contexts.has(node))this.contexts.set(node,createsPaintContext(node,this.style))
    return this.contexts.get(node)!
  }
  visible=(node:HTMLElement):boolean=>{
    if(!this.visibility.has(node)){
      const style=this.style(node)
      this.visibility.set(node,style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)!==0&&(!node.parentElement||this.visible(node.parentElement)))
    }
    return this.visibility.get(node)!
  }
  opacity=(node:HTMLElement):number=>{
    if(!this.alphas.has(node))this.alphas.set(node,Number(this.style(node).opacity)*(node===this.root||!node.parentElement?1:this.opacity(node.parentElement)))
    return this.alphas.get(node)!
  }
  path=(node:HTMLElement)=>{
    let value=this.paths.get(node)
    if(!value){value=paintPath(node,this.root,this.style,this.context);this.paths.set(node,value)}
    return value
  }
  compare=(a:HTMLElement[],b:HTMLElement[])=>comparePaintPaths(a,b,this.style)
}
