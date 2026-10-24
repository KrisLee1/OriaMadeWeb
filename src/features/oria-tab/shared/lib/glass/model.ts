export type LiquidMaterial = {
  thickness: number; ior: number; roughness: number; dispersion: number
  edgeHighlight: number; brightness: number
  tintOpacity: number; colorConcentration: number
}
export const defaultLiquidMaterial: Readonly<LiquidMaterial> = Object.freeze({
  thickness: .7, ior: 1.455, roughness: .3, dispersion: .0084,
  edgeHighlight: .3, brightness: 1, tintOpacity: .1, colorConcentration: .5,
})
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const limits:Record<keyof LiquidMaterial,readonly[number,number]>={thickness:[.5,1.5],ior:[1,1.65],roughness:[0,1],dispersion:[0,.012],edgeHighlight:[0,1.5],brightness:[0,2],tintOpacity:[0,1],colorConcentration:[0,1]}
export function validateLiquidMaterial(material:Readonly<LiquidMaterial>) {
  for(const key of Object.keys(limits) as (keyof LiquidMaterial)[]) {
    if(!Number.isFinite(material[key])||material[key]<limits[key][0]||material[key]>limits[key][1])throw new Error(`Invalid glass material: ${key}`)
  }
}
export function glassGeometry(width: number, height: number, radiusX: number, radiusY = radiusX, material = defaultLiquidMaterial) {
  validateLiquidMaterial(material)
  if (![width, height, radiusX, radiusY, ...Object.values(material)].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error('Invalid glass geometry')
  const s = Math.min(width, height), rx = clamp(radiusX, 0, width / 2), ry = clamp(radiusY, 0, height / 2)
  const r = Math.min(rx, ry), u = clamp(2 * r / s, 0, 1)
  const bevel = Math.min(.45 * s, 40, Math.max(2, .9 * r), 10 * (s / 64) ** .6 * (.85 + .15 * u))
  const sigma = material.roughness * Math.min(.5 * bevel, 12)
  const displacement = Math.min(2.5 * bevel, .35 * s)
  const spectralSpread = Math.min(.6 * bevel, .1 * s)
  return { width, height, radiusX: rx, radiusY: ry, bevel, thickness: .85 * bevel * material.thickness, sigma, displacement, spectralSpread, padding: Math.ceil(displacement + spectralSpread + 3 * sigma + 2) }
}
export type GlassGeometry = ReturnType<typeof glassGeometry>&{corners?:readonly (readonly[number,number])[]}

/** The convex lens bends inward; only chroma/blur can sample outside its box.
 * Full texture padding still reserves the complete refracted displacement. */
export function glassSourceReach(geometry:GlassGeometry,material:Readonly<LiquidMaterial>) {
  return Math.ceil(geometry.spectralSpread*(material.dispersion/.012)*((material.ior-1)/.65)+3*geometry.sigma+2)
}

export function resolveGlassTint(material:Readonly<LiquidMaterial>,dark:boolean,accent:readonly[number,number,number]):[number,number,number] {
  validateLiquidMaterial(material)
  if(accent.some(value=>!Number.isFinite(value)||value<0||value>1))throw new Error('Invalid glass accent')
  const base=dark?[34/255,35/255,36/255]:[247/255,246/255,251/255]
  return base.map((value,i)=>value*(1-material.colorConcentration)+accent[i]*material.colorConcentration) as [number,number,number]
}

/** The same half-circle profile used in the shader, with bounded edge slope. */
export function bevelHeight(t: number) {
  t = clamp(t, 0, 1)
  return (Math.sqrt(t * (2 - t) + .05 ** 2) - .05) / (Math.sqrt(1 + .05 ** 2) - .05)
}
