import { glassGeometry, type GlassGeometry, type LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'
import type { ReadStyle } from '@/features/oria-tab/shared/lib/glass/paint-order'

/** CSS normalizes all eight radii by one factor when adjacent corners overlap. */
export function normalizeCorners(width:number,height:number,corners:readonly (readonly[number,number])[]) {
  if(corners.length!==4||corners.flat().some(v=>!Number.isFinite(v)||v<0))throw new Error('Invalid glass corners')
  const factor=Math.min(1,width/Math.max(.0001,corners[0][0]+corners[1][0]),width/Math.max(.0001,corners[3][0]+corners[2][0]),height/Math.max(.0001,corners[0][1]+corners[3][1]),height/Math.max(.0001,corners[1][1]+corners[2][1]))
  return corners.map(([x,y])=>[x*factor,y*factor] as [number,number])
}
export function elementGlassGeometry(node:HTMLElement,rect:DOMRect,material:Readonly<LiquidMaterial>,readStyle:ReadStyle=getComputedStyle,cache?:{validated:Set<HTMLElement>;width:number;height:number}):GlassGeometry {
  // Screen-space sampling supports translation and independent axis scaling.
  // A rotated/perspective website preview keeps native CSS until it is flat.
  const visited:HTMLElement[]=[]
  for(let el:HTMLElement|null=node;el;el=el.parentElement){
    if(cache?.validated.has(el))break
    const css=readStyle(el)
    if(css.perspective!=='none'||(css.rotate!=='none'&&Math.abs(parseFloat(css.rotate.split(' ').at(-1)!))>.001))throw new Error('Unsupported glass perspective')
    if(css.transform!=='none'){
      const matrix=new DOMMatrixReadOnly(css.transform)
      if(!matrix.is2D||Math.abs(matrix.b)>.0001||Math.abs(matrix.c)>.0001||matrix.a<=0||matrix.d<=0)throw new Error('Unsupported glass transform')
    }
    visited.push(el)
  }
  if(cache)for(const el of visited)cache.validated.add(el)
  const style=readStyle(node),width=cache?.width??(node.offsetWidth||rect.width),height=cache?.height??(node.offsetHeight||rect.height)
  const radius=(v:string,size:number)=>parseFloat(v)*(v.endsWith('%')?size/100:1)
  const corners=normalizeCorners(rect.width,rect.height,[style.borderTopLeftRadius,style.borderTopRightRadius,style.borderBottomRightRadius,style.borderBottomLeftRadius].map(v=>{const [x,y=x]=v.split(' ');return [radius(x,width)*rect.width/width,radius(y,height)*rect.height/height]}))
  // Quadrant SDF supports the contours used by the application. More exotic
  // asymmetric CSS corners crossing the centre keep the native material.
  if(corners.some(([x,y])=>x>rect.width/2+.01||y>rect.height/2+.01))throw new Error('Unsupported glass contour')
  const rx=Math.min(...corners.map(c=>c[0])),ry=Math.min(...corners.map(c=>c[1]))
  return {...glassGeometry(rect.width,rect.height,rx,ry,material),corners}
}
