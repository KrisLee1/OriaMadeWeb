import { defaultLiquidMaterial, validateLiquidMaterial, type LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'

type Legacy = Partial<Record<'opacity'|'colorConcentration'|'refraction'|'bevel'|'blur'|'dispersion'|'rim',number>>
const oldDefaults={opacity:50,colorConcentration:32,refraction:10,bevel:8,blur:4,dispersion:30,rim:30}
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v))
const curve=(v:number,pivot:number,max:number,target:number,end:number)=>v<=pivot?v/pivot*target:target+(v-pivot)/(max-pivot)*(end-target)
export function readLiquidMaterial(value:unknown,legacy?:Legacy):LiquidMaterial {
  if(value&&typeof value==='object')try {
    validateLiquidMaterial(value as LiquidMaterial)
    return Object.fromEntries(Object.keys(defaultLiquidMaterial).map(key=>[key,(value as LiquidMaterial)[key as keyof LiquidMaterial]])) as LiquidMaterial
  }catch { /* Invalid imports cannot enter the shader. */ }
  if(!legacy||!Object.keys(oldDefaults).some(key=>key in legacy))return {...defaultLiquidMaterial}
  const old=Object.fromEntries(Object.entries(oldDefaults).map(([key,fallback])=>[key,Number.isFinite(legacy[key as keyof Legacy])?legacy[key as keyof Legacy]:fallback])) as typeof oldDefaults
  return {
    thickness:clamp(old.bevel<=8?.5+(old.bevel-2)/12:1+(old.bevel-8)/8,.5,1.5),
    ior:1+curve(clamp(old.refraction,0,40),10,40,.5,.65),
    roughness:curve(clamp(old.blur,0,16),4,16,.06,1),
    dispersion:curve(clamp(old.dispersion,0,50),30,50,.006,.012),
    edgeHighlight:curve(clamp(old.rim,0,100),30,100,.8,1.5),
    brightness:1,tintOpacity:clamp(old.opacity/100,0,1),colorConcentration:clamp(old.colorConcentration/100,0,1),
  }
}
