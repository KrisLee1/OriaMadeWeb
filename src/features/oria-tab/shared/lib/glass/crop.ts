/** Extend viewport edge pixels into off-screen padding instead of sampling black. */
export function copySceneCrop(ctx:CanvasRenderingContext2D,source:HTMLCanvasElement,left:number,top:number,width:number,height:number) {
  ctx.clearRect(0,0,width,height)
  const xs=[0,Math.max(0,-left),Math.min(width,source.width-left),width].map(v=>Math.max(0,Math.min(width,v)))
  const ys=[0,Math.max(0,-top),Math.min(height,source.height-top),height].map(v=>Math.max(0,Math.min(height,v)))
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const x=xs[col],y=ys[row],w=xs[col+1]-x,h=ys[row+1]-y
    if(w<=0||h<=0)continue
    const sx=col===0?0:col===2?source.width-1:Math.max(0,left+x),sy=row===0?0:row===2?source.height-1:Math.max(0,top+y)
    const sw=col===1?w:1,sh=row===1?h:1
    ctx.drawImage(source,sx,sy,sw,sh,x,y,w,h)
  }
}
