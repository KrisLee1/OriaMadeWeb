import { blurShader, glassShader, vertexShader } from '@/features/oria-tab/shared/lib/glass/shaders'
import type { GlassGeometry, LiquidMaterial } from '@/features/oria-tab/shared/lib/glass/model'

type BufferSet = { width: number; height: number; blurWidth:number; blurHeight:number; sharp: WebGLTexture; blurA: WebGLTexture; blurB: WebGLTexture; a: WebGLFramebuffer; b: WebGLFramebuffer; bytes: number }
export type RenderTiming = { upload: number; submission: number; copy: number; total: number }
/** One GL context, reusable local buffers, DOM presentation via 2D canvases. */
export class GlassRenderer {
  readonly canvas: HTMLCanvasElement
  readonly gl: WebGL2RenderingContext
  private glass!: WebGLProgram
  private blur!: WebGLProgram
  private uniforms=new Map<WebGLProgram,Map<string,WebGLUniformLocation|null>>()
  private radii=new Float32Array(8)
  private buffers = new Map<string, BufferSet>()
  private listeners = new Set<() => void>()
  private lost = false
  private disposed = false
  private draws = 0
  private capacity = { width: 1, height: 1 }
  private upload: HTMLCanvasElement
  constructor(document: Document) {
    this.canvas = document.createElement('canvas')
    this.upload = document.createElement('canvas')
    const gl = this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'low-power' })
    if (!gl) throw new Error('WebGL 2 unavailable')
    this.gl = gl
    this.canvas.addEventListener('webglcontextlost', this.onLost)
    this.canvas.addEventListener('webglcontextrestored', this.onRestored)
    this.initialize()
  }
  private onLost = (event: Event) => { event.preventDefault(); this.lost = true; this.listeners.forEach(fn => fn()) }
  private onRestored = () => {
    if (this.disposed) return
    this.buffers.clear(); this.initialize(); this.lost = false; this.listeners.forEach(fn => fn())
  }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  get available() { return !this.lost && !this.disposed }
  get stats() { return { draws: this.draws, contexts: this.disposed ? 0 : 1, buffers: this.buffers.size, estimatedBytes: this.disposed?0:(this.capacity.width * this.capacity.height + this.upload.width * this.upload.height) * 4 + [...this.buffers.values()].reduce((sum,b) => sum+b.bytes,0) } }
  private program(fragment: string) {
    const gl = this.gl, program = gl.createProgram()!
    for (const [type, source] of [[gl.VERTEX_SHADER,vertexShader],[gl.FRAGMENT_SHADER,fragment]] as const) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source); gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const error=gl.getShaderInfoLog(shader); gl.deleteShader(shader); gl.deleteProgram(program); throw new Error(`Glass shader: ${error}`) }
      gl.attachShader(program, shader); gl.deleteShader(shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { const error=gl.getProgramInfoLog(program); gl.deleteProgram(program); throw new Error(`Glass program: ${error}`) }
    return program
  }
  private location(program:WebGLProgram,name:string){
    let locations=this.uniforms.get(program)
    if(!locations){locations=new Map();this.uniforms.set(program,locations)}
    let value=locations.get(name)
    if(value===undefined){value=this.gl.getUniformLocation(program,name);locations.set(name,value)}
    return value
  }
  private initialize() { this.uniforms.clear();this.glass=this.program(glassShader); this.blur=this.program(blurShader); this.gl.disable(this.gl.BLEND) }
  private release(buffer: BufferSet) {
    for (const texture of [buffer.sharp,buffer.blurA,buffer.blurB]) this.gl.deleteTexture(texture)
    this.gl.deleteFramebuffer(buffer.a); this.gl.deleteFramebuffer(buffer.b)
  }
  trimBuffers(){
    for(const buffer of this.buffers.values())this.release(buffer)
    this.buffers.clear()
    // A viewport can shrink after a large monitor/window was used. Release its
    // presentation/upload capacity too, otherwise the smaller scene may never
    // fit its budget even after every texture has been evicted.
    this.capacity={width:1,height:1};this.canvas.width=this.canvas.height=1
    this.upload.width=this.upload.height=1
  }
  /** Total owned bytes after a render, reusing existing buffers and accounting
   * for the LRU entries that buffer() will evict before it allocates. */
  estimateRenderBytes(sourceWidth:number,sourceHeight:number,geometry:GlassGeometry,dpr:number,reserve:{width:number;height:number}) {
    const scale=1/2**Math.max(0,Math.ceil(Math.log2(Math.max(.01,geometry.sigma*dpr)/2)))
    const stride=Math.max(1/scale,32),w=Math.ceil(Math.max(sourceWidth,reserve.width)/stride)*stride,h=Math.ceil(Math.max(sourceHeight,reserve.height)/stride)*stride
    const bw=Math.max(1,Math.floor(w*scale)),bh=Math.max(1,Math.floor(h*scale)),key=`${w}:${h}:${bw}:${bh}`
    const cached=[...this.buffers.values()]
    let bytes=cached.reduce((sum,b)=>sum+b.bytes,0)
    if(!this.buffers.has(key)){
      const added=Math.ceil(w*h*4*(scale<1?4/3:1))+bw*bh*8
      while(cached.length&&(cached.length>=8||bytes+added>32*1024*1024))bytes-=cached.shift()!.bytes
      bytes+=added
    }
    const capacityWidth=Math.max(this.capacity.width,Math.ceil(reserve.width/64)*64),capacityHeight=Math.max(this.capacity.height,Math.ceil(reserve.height/64)*64)
    const upload=w!==sourceWidth||h!==sourceHeight?w*h:this.upload.width*this.upload.height
    return bytes+(capacityWidth*capacityHeight+upload)*4
  }
  private buffer(width: number, height: number, scale:number) {
    const blurWidth=Math.max(1,Math.floor(width*scale)),blurHeight=Math.max(1,Math.floor(height*scale))
    const gl=this.gl, key=`${width}:${height}:${blurWidth}:${blurHeight}`, found=this.buffers.get(key)
    if (found) { this.buffers.delete(key); this.buffers.set(key,found); return found }
    const bytes=Math.ceil(width*height*4*(scale<1?4/3:1))+blurWidth*blurHeight*8
    if (bytes > 32*1024*1024 || Math.max(width,height)>gl.getParameter(gl.MAX_TEXTURE_SIZE)) throw new Error('Glass local texture budget exceeded')
    while (this.buffers.size && (this.buffers.size>=8 || [...this.buffers.values()].reduce((sum,b)=>sum+b.bytes,bytes)>32*1024*1024)) {
      const key=this.buffers.keys().next().value!, old=this.buffers.get(key)!; this.release(old); this.buffers.delete(key)
    }
    const texture=(w:number,h:number) => {
      const texture=gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D,texture)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null); return texture
    }
    const framebuffer=(texture: WebGLTexture) => {
      const f=gl.createFramebuffer()!; gl.bindFramebuffer(gl.FRAMEBUFFER,f); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0)
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete glass framebuffer')
      return f
    }
    const sharp=texture(width,height), blurA=texture(blurWidth,blurHeight), blurB=texture(blurWidth,blurHeight), a=framebuffer(blurA), b=framebuffer(blurB)
    const buffer={width,height,blurWidth,blurHeight,sharp,blurA,blurB,a,b,bytes}; this.buffers.set(key,buffer); return buffer
  }
  render(source: HTMLCanvasElement, target: HTMLCanvasElement, geometry: GlassGeometry, material: Readonly<LiquidMaterial>, tint: [number,number,number], dpr: number, stableSize:boolean|{width:number;height:number}=false): RenderTiming {
    if (!this.available) throw new Error('Glass context unavailable')
    const start=performance.now(), gl=this.gl, blurScale=1/2**Math.max(0,Math.ceil(Math.log2(Math.max(.01,geometry.sigma*dpr)/2)))
    // Align every mip reduction to exact 2×2 blocks. Odd-sized mip levels can
    // alias a one-pixel line into twice its energy (or lose it altogether).
    // Live Dock/popup scaling reuses buckets instead of allocating an FBO for
    // every fractional CSS size. Lab captures retain exact-size pixel evidence.
    const stride=Math.max(1/blurScale,stableSize?32:1), widthAligned=Math.ceil(Math.max(source.width,typeof stableSize==='object'?stableSize.width:0)/stride)*stride, heightAligned=Math.ceil(Math.max(source.height,typeof stableSize==='object'?stableSize.height:0)/stride)*stride
    let input=source
    if(widthAligned!==source.width||heightAligned!==source.height) {
      if(this.upload.width!==widthAligned)this.upload.width=widthAligned
      if(this.upload.height!==heightAligned)this.upload.height=heightAligned
      const ctx=this.upload.getContext('2d')!;ctx.clearRect(0,0,widthAligned,heightAligned);ctx.drawImage(source,0,0)
      input=this.upload
    }
    const buffer=this.buffer(input.width,input.height,blurScale)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,buffer.sharp)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false)
    gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,input)
    if(blurScale<1){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}
    const uploaded=performance.now()
    let blurred=buffer.sharp
    if(geometry.sigma>.01) {
      gl.useProgram(this.blur); gl.uniform1i(this.location(this.blur,'source'),0)
      gl.viewport(0,0,buffer.blurWidth,buffer.blurHeight)
      gl.bindFramebuffer(gl.FRAMEBUFFER,buffer.a)
      // FBO textures have bottom-up coordinates; the full-screen triangle flips Y.
      gl.uniform2f(this.location(this.blur,'stepUV'),1/buffer.blurWidth,0)
      gl.uniform1f(this.location(this.blur,'sigma'),geometry.sigma*dpr*blurScale)
      gl.uniform1f(this.location(this.blur,'sourceLod'),-Math.log2(blurScale))
      gl.drawArrays(gl.TRIANGLES,0,3)
      gl.bindFramebuffer(gl.FRAMEBUFFER,buffer.b); gl.bindTexture(gl.TEXTURE_2D,buffer.blurA)
      gl.uniform2f(this.location(this.blur,'stepUV'),0,1/buffer.blurHeight)
      gl.uniform1f(this.location(this.blur,'sigma'),geometry.sigma*dpr*blurScale)
      gl.uniform1f(this.location(this.blur,'sourceLod'),0)
      gl.drawArrays(gl.TRIANGLES,0,3); blurred=buffer.blurB
    }
    const width=Math.max(1,Math.round(geometry.width*dpr)), height=Math.max(1,Math.round(geometry.height*dpr))
    const reserveWidth=Math.max(width,typeof stableSize==='object'?stableSize.width:0),reserveHeight=Math.max(height,typeof stableSize==='object'?stableSize.height:0)
    if(reserveWidth>this.capacity.width||reserveHeight>this.capacity.height) {
      const bucket=stableSize?64:1
      this.capacity={width:Math.max(Math.ceil(reserveWidth/bucket)*bucket,this.capacity.width),height:Math.max(Math.ceil(reserveHeight/bucket)*bucket,this.capacity.height)}
      this.canvas.width=this.capacity.width; this.canvas.height=this.capacity.height
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,width,height); gl.useProgram(this.glass)
    const one=(name:string,value:number)=>gl.uniform1f(this.location(this.glass,name),value)
    const two=(name:string,x:number,y:number)=>gl.uniform2f(this.location(this.glass,name),x,y)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,buffer.sharp); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.uniform1i(this.location(this.glass,'sharpTexture'),0)
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,blurred); gl.uniform1i(this.location(this.glass,'blurredTexture'),1)
    two('size',geometry.width,geometry.height)
    for(let i=0;i<4;i++){this.radii[i*2]=geometry.corners?.[i][0]??geometry.radiusX;this.radii[i*2+1]=geometry.corners?.[i][1]??geometry.radiusY}
    gl.uniform2fv(this.location(this.glass,'cornerRadii[0]'),this.radii)
    two('sourceSize',input.width/dpr,input.height/dpr)
    for(const name of ['padding','bevel','thickness'] as const) one(name,geometry[name])
    one('maxDisplacement',geometry.displacement)
    one('spectralSpread',geometry.spectralSpread)
    for(const name of ['ior','dispersion','roughness','edgeHighlight','brightness','tintOpacity'] as const) one(name,material[name])
    gl.uniform3f(this.location(this.glass,'tint'),...tint)
    gl.drawArrays(gl.TRIANGLES,0,3)
    const submitted=performance.now()
    const displayWidth=typeof stableSize==='object'?stableSize.width:width,displayHeight=typeof stableSize==='object'?stableSize.height:height
    if(target.width!==displayWidth) target.width=displayWidth
    if(target.height!==displayHeight) target.height=displayHeight
    const ctx=target.getContext('2d')!
    ctx.clearRect(0,0,displayWidth,displayHeight)
    ctx.drawImage(this.canvas,0,this.canvas.height-height,width,height,0,0,displayWidth,displayHeight)
    const copied=performance.now(); this.draws++
    return {upload:uploaded-start,submission:submitted-uploaded,copy:copied-submitted,total:copied-start}
  }
  dispose() {
    if(this.disposed)return
    for(const buffer of this.buffers.values()) this.release(buffer)
    this.buffers.clear(); this.gl.deleteProgram(this.glass); this.gl.deleteProgram(this.blur)
    this.canvas.removeEventListener('webglcontextlost',this.onLost); this.canvas.removeEventListener('webglcontextrestored',this.onRestored)
    this.uniforms.clear();this.listeners.clear(); this.gl.getExtension('WEBGL_lose_context')?.loseContext(); this.disposed=true
    this.canvas.width=this.canvas.height=1
    this.upload.width=this.upload.height=1
  }
}
