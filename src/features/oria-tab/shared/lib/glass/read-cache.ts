type Mark={parent:Element|null;style:string|null;className:string|null;hidden:boolean}
const paintProperties=new Set(['opacity','transform','translate','rotate','scale','clipPath','filter','backdropFilter','color','backgroundColor','backgroundPosition','boxShadow','borderColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','scrollbarColor','outlineColor','outlineWidth','outlineOffset','offset','computedOffset','easing','composite'])
export function placementOnly(a:string|null,b:string|null){const clean=(v:string|null)=>(v??'').split(';').filter(s=>!/^\s*(transform|translate|rotate|scale|opacity|clip-path|left|top|right|bottom|will-change|--genie-[xy])\s*:/.test(s)).join(';');return clean(a)===clean(b)}
/** Persist only reads whose DOM/CSS inputs remain unchanged. Each scope owns
 * its cache; source bitmap versions and material uniforms stay independent. */
export class GlassReadCache {
  readonly styles=new Map<Element,CSSStyleDeclaration>()
  readonly rects=new Map<Element,DOMRect>()
  readonly paths=new Map<HTMLElement,HTMLElement[]>()
  private marks=new Map<Element,Mark>()
  private animated=new Set<Element>()
  remember(node:Element){if(!this.marks.has(node))this.marks.set(node,{parent:node.parentElement,style:node.getAttribute('style'),className:node.getAttribute('class'),hidden:node.hasAttribute('hidden')})}
  clear(){this.styles.clear();this.rects.clear();this.paths.clear();this.marks.clear()}
  forget(root:Element){for(const node of this.marks.keys())if(node===root||root.contains(node)){this.styles.delete(node);this.rects.delete(node);this.paths.delete(node as HTMLElement);this.marks.delete(node)}}
  begin(animations:Animation[]){
    // Include last frame's targets once more: cancelled/finished WAAPI effects
    // disappear from getAnimations() without necessarily emitting a CSS event.
    const dirty=new Set(this.animated)
    this.animated.clear()
    // Direct fingerprints also see Motion writes made in the current rendering
    // batch, before its MutationObserver delivery, and styles above this scope.
    for(const [node,mark]of this.marks){
      if(!node.isConnected||node.parentElement!==mark.parent||node.getAttribute('class')!==mark.className||node.hasAttribute('hidden')!==mark.hidden){this.clear();break}
      const style=node.getAttribute('style')
      if(style!==mark.style){if(!placementOnly(mark.style,style)){this.clear();break}dirty.add(node)}
    }
    for(const animation of animations){
      if(animation.playState==='idle'||!(animation.effect instanceof KeyframeEffect)||!(animation.effect.target instanceof Element))continue
      this.animated.add(animation.effect.target)
      // A CSS transition already names its sole property. Avoid materializing
      // keyframe arrays for every control on every frame (inherited scrollbar
      // colors can transition on dozens of controls when a dialog mounts).
      const property=typeof CSSTransition!=='undefined'&&animation instanceof CSSTransition
        ?animation.transitionProperty.replace(/-([a-z])/g,(_,letter:string)=>letter.toUpperCase()):null
      const layout=property?!paintProperties.has(property):animation.effect.getKeyframes().some(key=>Object.keys(key).some(name=>!paintProperties.has(name)))
      // Layout animations can reposition siblings, so retain no geometry or
      // resolved percentage transforms while one is active.
      if(layout){this.clear();break}
      dirty.add(animation.effect.target)
    }
    for(const node of dirty)if(![...dirty].some(parent=>parent!==node&&parent.contains(node)))this.forget(node)
  }
}
