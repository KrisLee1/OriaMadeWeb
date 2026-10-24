// Dual-surface and normal-directed chromatic sampling adapted from LiquidGlass:
// https://github.com/ybouane/liquidglass/commit/59af227103795f06421a96e2c7d3dceb081decd2
// MIT attribution: public/licenses/liquidglass.txt. Geometry/limits are shared
// CSS-pixel functions rather than the reference's fixed 30px/36px gains.
export const vertexShader = `#version 300 es
precision highp float;
out vec2 uv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  uv = vec2((p.x + 1.0) * .5, (1.0 - p.y) * .5);
  gl_Position = vec4(p, 0., 1.);
}`
export const blurShader = `#version 300 es
precision highp float;
uniform sampler2D source;
uniform vec2 stepUV;
uniform float sigma;
uniform float sourceLod;
in vec2 uv;
out vec4 color;
void main() {
  color = vec4(0.);
  float weightSum = 0.;
  for(int i=-6;i<=6;i++) {
    float x=float(i);
    float weight=exp(-.5*x*x/max(sigma*sigma,.0001));
    color += textureLod(source,uv+stepUV*x,sourceLod)*weight;
    weightSum += weight;
  }
  color /= weightSum;
}`
export const glassShader = `#version 300 es
precision highp float;
uniform sampler2D sharpTexture;
uniform sampler2D blurredTexture;
uniform vec2 size;
uniform vec2 cornerRadii[4];
uniform vec2 sourceSize;
uniform float padding;
uniform float bevel;
uniform float thickness;
uniform float maxDisplacement;
uniform float spectralSpread;
uniform float ior;
uniform float dispersion;
uniform float roughness;
uniform float edgeHighlight;
uniform float brightness;
uniform float tintOpacity;
uniform vec3 tint;
in vec2 uv;
out vec4 color;
float sdf(vec2 p) {
  vec2 radii=p.y<0.?(p.x<0.?cornerRadii[0]:cornerRadii[1]):(p.x<0.?cornerRadii[3]:cornerRadii[2]);
  vec2 a = abs(p), halfSize = size * .5;
  if (radii.x < .01 || radii.y < .01) return max(a.x-halfSize.x, a.y-halfSize.y);
  vec2 q = a - halfSize + radii;
  if (q.x > 0. && q.y > 0.) {
    // Ellipse implicit-distance approximation is exact for circular corners.
    vec2 e = q / radii;
    float k = length(e);
    return (k-1.) * k / max(length(q/(radii*radii)), .0001);
  }
  return max(a.x-halfSize.x, a.y-halfSize.y);
}
float heightAt(vec2 p) {
  float t = clamp(-sdf(p)/bevel, 0., 1.);
  float f = (sqrt(t*(2.-t)+.0025)-.05)/(sqrt(1.0025)-.05);
  vec2 g = max(vec2(0.), vec2(1.) - pow(p/(size*.5), vec2(2.)));
  return thickness * f * (.92 + .08*g.x*g.y);
}
vec2 boundedOffset(vec2 raw) {
  float magnitude = length(raw);
  return raw / sqrt(1.+pow(magnitude/maxDisplacement,2.));
}
vec3 linearColor(vec3 c) { return mix(c/12.92, pow((c+.055)/1.055, vec3(2.4)), step(vec3(.04045),c)); }
vec3 srgbColor(vec3 c) { c=max(c,vec3(0.)); return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-.055, step(vec3(.0031308),c)); }
void main() {
  vec2 p = (uv-.5)*size;
  float distance = sdf(p);
  float mask = 1.-smoothstep(-fwidth(distance)*.5, fwidth(distance)*.5, distance);
  if(mask <= 0.) { color=vec4(0.); return; }
  float e = .5;
  vec2 gradient = vec2(heightAt(p+vec2(e,0.))-heightAt(p-vec2(e,0.)), heightAt(p+vec2(0.,e))-heightAt(p-vec2(0.,e)))/(2.*e);
  vec3 normal = normalize(vec3(-gradient,1.));
  float slope = 1.-normal.z;
  float strength=clamp((ior-1.)/.65,0.,1.);
  float profile=clamp(heightAt(p)/thickness,0.,1.);
  float depth=smoothstep(0.,bevel,max(-distance,0.));
  float edge=1.-smoothstep(0.,bevel,max(-distance,0.));
  // Entry + exit bending, with an interior lens term. Optical scale follows B.
  vec2 bend=gradient*(1.-1./ior)*(2.+.5*profile)*(2.*bevel);
  vec2 body=-p/max(size*.5,vec2(1.))*(.3*bevel)*depth;
  vec2 refracted=boundedOffset((bend+body)*strength);
  // Independent CSS-pixel spectral separation survives the refraction limiter.
  vec2 chroma=normal.xy*spectralSpread*(dispersion/.012)*strength*(.3+.7*edge);
  vec2 origin = uv*size + padding;
  vec2 ruv=(origin+refracted+chroma)/sourceSize;
  vec2 guv=(origin+refracted)/sourceSize;
  vec2 buv=(origin+refracted-chroma)/sourceSize;
  vec3 sharp=vec3(texture(sharpTexture,ruv).r, texture(sharpTexture,guv).g, texture(sharpTexture,buv).b);
  vec3 soft=vec3(texture(blurredTexture,ruv).r, texture(blurredTexture,guv).g, texture(blurredTexture,buv).b);
  // Rough glass also blurs the refracted/chromatic edge image. Keeping a fixed
  // sharp contribution at grazing angles left those bands crisp at full blur.
  float clearFraction=(1.-roughness)*(1.-roughness);
  vec3 transmission=linearColor(mix(soft,sharp,.85*smoothstep(.05,.6,slope)*clearFraction)) * brightness;
  // A crisp one-CSS-pixel coating, independent of transmitted blur and tint.
  float rimWidth=1.;
  float rimAA=max(fwidth(distance),.35);
  float rim=1.-smoothstep(rimWidth-rimAA*.5,rimWidth+rimAA*.5,max(-distance,0.));
  float vertical=normal.y*normal.y/max(dot(normal.xy,normal.xy),.0001);
  // Coverage is an sRGB alpha layer, matching the CSS material fallback.
  // Light transport above remains linear; linear-space white coverage looks milky.
  vec3 coated=mix(srgbColor(transmission),tint,tintOpacity);
  float rimShade=clamp(edgeHighlight*rim*(1.-vertical)*.5,0.,.8);
  coated=mix(coated,vec3(10.,26.,31.)/255.,rimShade);
  float rimLight=clamp(edgeHighlight*rim*vertical*mix(1.,.85,smoothstep(-.1,.1,normal.y)),0.,.95);
  coated=mix(coated,vec3(1.),rimLight);
  color=vec4(coated,mask);
}`
