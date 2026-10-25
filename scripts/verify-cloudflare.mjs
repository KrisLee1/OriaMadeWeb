import {spawn} from 'node:child_process'
import {setTimeout as delay} from 'node:timers/promises'
import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

if(!existsSync('.open-next/worker.js'))throw Error('Run npm run cf:build first.')
const port=process.env.CF_VERIFY_PORT||'8787'
const origin=`http://127.0.0.1:${port}`
const wrangler=new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url)
const child=spawn(process.execPath,[fileURLToPath(wrangler),'dev','--local','--ip','127.0.0.1','--port',port,'--inspector-port','0','--show-interactive-dev-session=false'],{
 env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:fileURLToPath(new URL('../.wrangler/logs/',import.meta.url))},stdio:['ignore','pipe','pipe'],
})
let log=''
for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{log=(log+chunk).slice(-16000)})
const stop=()=>{if(child.exitCode===null)child.kill('SIGTERM')}
process.on('SIGINT',stop)
process.on('SIGTERM',stop)
try{
 let ready=false
 for(let attempt=0;attempt<120;attempt++){
  if(child.exitCode!==null)throw Error(`Workers preview exited: ${log}`)
  try{const response=await fetch(origin+'/robots.txt',{signal:AbortSignal.timeout(2000)});if(response.ok){ready=true;break}}catch{}
  await delay(500)
 }
 if(!ready)throw Error(`Workers preview did not become ready: ${log}`)
 const check=spawn(process.execPath,[fileURLToPath(new URL('./verify.mjs',import.meta.url))],{env:{...process.env,VERIFY_ORIGIN:origin},stdio:'inherit'})
 const code=await new Promise((resolve,reject)=>{check.once('error',reject);check.once('exit',resolve)})
 if(code!==0){process.stderr.write(log);process.exitCode=code||1}
}finally{
 stop()
 process.removeListener('SIGINT',stop)
 process.removeListener('SIGTERM',stop)
}
