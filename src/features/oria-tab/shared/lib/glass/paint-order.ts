/** Stacking contexts relevant to registered app fragments, including portals. */
export type ReadStyle=(node:Element)=>CSSStyleDeclaration
export function createsPaintContext(node:HTMLElement,style:ReadStyle) {
  const s=style(node),z=s.zIndex!=='auto'&&(['absolute','relative','fixed','sticky'].includes(s.position)||/flex|grid/.test(style(node.parentElement??node).display))
  return z||s.position==='fixed'||s.position==='sticky'||Number(s.opacity)<1||s.transform!=='none'||s.translate!=='none'||s.scale!=='none'||s.rotate!=='none'||s.filter!=='none'||s.backdropFilter!=='none'||s.perspective!=='none'||s.clipPath!=='none'||s.isolation==='isolate'||s.mixBlendMode!=='normal'||/paint|layout|strict|content/.test(s.contain)||/transform|opacity|filter/.test(s.willChange)
}
export function paintPath(node:HTMLElement,root:HTMLElement,style:ReadStyle=getComputedStyle,isContext:(node:HTMLElement)=>boolean=node=>createsPaintContext(node,style)) {
  const path:HTMLElement[]=[]
  for(let el:HTMLElement|null=node;el&&el!==root;el=el.parentElement)if(el===node||isContext(el))path.unshift(el)
  return path
}
export function comparePaintPaths(a:HTMLElement[],b:HTMLElement[],style:ReadStyle=getComputedStyle) {
  let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++
  if(i===a.length||i===b.length)return a.length-b.length
  const x=a[i],y=b[i],zx=Number(style(x).zIndex)||0,zy=Number(style(y).zIndex)||0
  if(zx!==zy)return zx-zy
  return x.compareDocumentPosition(y)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1
}
