/** Release a capture's continuation even when fonts, decoding or a background
 * tab's next frame are still pending. Always remove the abort listener. */
export function captureWait<T>(pending:PromiseLike<T>,signal?:AbortSignal):Promise<T> {
  if(!signal)return Promise.resolve(pending)
  signal.throwIfAborted()
  return new Promise<T>((resolve,reject)=>{
    const abort=()=>reject(signal.reason)
    signal.addEventListener('abort',abort,{once:true})
    Promise.resolve(pending).then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort))
  })
}
export async function captureFrame(signal?:AbortSignal) {
  signal?.throwIfAborted()
  let id=0
  try {await captureWait(new Promise<void>(resolve=>{id=requestAnimationFrame(()=>resolve())}),signal)}
  finally {cancelAnimationFrame(id)}
}
