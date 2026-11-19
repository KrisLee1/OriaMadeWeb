// Independent website fixtures. Never populated from native storage or real hosts.
import {sampleTime} from "./file-time-groups"

export type DemoFile={name:string;created?:number;modified?:number;folder?:boolean;size:string;content?:string;children?:DemoFile[]}
export const sampleFiles:DemoFile[]=[
 {name:'src',created:sampleTime(5),modified:sampleTime(0),folder:true,size:'—',children:[
  {name:'app.ts',created:sampleTime(5),modified:sampleTime(0),size:'1.2 KB',content:'export const workspace = {\n  name: "OriaTunnel",\n  transport: "SSH",\n  environment: "demo"\n}\n'},
  {name:'styles.css',created:sampleTime(4),modified:sampleTime(1),size:'0.8 KB',content:':root {\n  color-scheme: light dark;\n  font-family: system-ui, sans-serif;\n}\n'},
 ]},
 {name:'assets',created:sampleTime(30),modified:sampleTime(1),folder:true,size:'—',children:[{name:'colors.json',created:sampleTime(30),modified:sampleTime(4),size:'0.3 KB',content:'{\n  "accent": "#4399ff",\n  "surface": "theme"\n}\n'}]},
 {name:'README.md',created:sampleTime(1),modified:sampleTime(0),size:'2.4 KB',content:'# Remote workspace\n\nA small project, ready to explore.\n\n- Browse local and SSH files\n- Upload, download or copy between hosts\n- Preview and edit text in one workspace\n\nAll content here is isolated sample data.\n'},
 {name:'config.json',created:sampleTime(45),modified:sampleTime(4),size:'0.5 KB',content:'{\n  "name": "demo-workspace",\n  "port": 3000,\n  "environment": "sample"\n}\n'},
 {name:'.env.example',created:sampleTime(9),modified:sampleTime(9),size:'0.1 KB',content:'APP_ENV=demo\nAPP_PORT=3000\n'},
]
export type DemoTransfer={id:number;name:string;source:string;target:string;direction:'upload'|'download'|'remoteTransfer';submitted?:number;elapsedSeconds?:number;scan?:{items:number;bytes:number;path:string};phase:'preparing'|'transferring'|'paused'|'completed'|'cancelled';percent:number;size?:number;folder?:boolean;batch?:{name:string;folder?:boolean}[];transport?:'directTransfer'|'viaLocal'}
export const sampleTransfers:DemoTransfer[]=[
 {id:1,submitted:sampleTime(0),elapsedSeconds:18,name:'src',source:'This computer · /Projects/demo',target:'dev-workspace · /srv/demo',direction:'upload',phase:'transferring',percent:64,size:14680064,batch:[{name:'src',folder:true},{name:'README.md'}]},
 {id:2,submitted:sampleTime(1),elapsedSeconds:2,name:'README.md',source:'dev-workspace · /srv/demo/README.md',target:'This computer · /Projects/demo/README.md',direction:'download',phase:'completed',percent:100,size:2458},
 {id:3,submitted:sampleTime(5),elapsedSeconds:8,name:'assets',source:'home-lab · /srv/demo/assets',target:'cloud-services · /srv/demo/assets',direction:'remoteTransfer',phase:'paused',percent:32,size:8388608,folder:true,transport:'directTransfer'},
 {id:4,submitted:sampleTime(0),elapsedSeconds:4,name:'archive',source:'dev-workspace · /srv/archive',target:'This computer · /Projects/archive',direction:'download',folder:true,phase:'preparing',percent:0,scan:{items:1025,bytes:33554432,path:'/srv/archive/2026/11'}},
]
export function controlDemoTransfer(task:DemoTransfer,action:'pause'|'resume'|'cancel'):DemoTransfer {
 if(task.phase==='completed'||task.phase==='cancelled')return task
 if(action==='pause'&&(task.phase==='transferring'||task.phase==='preparing'))return {...task,phase:'paused'}
 if(action==='resume'&&task.phase==='paused')return {...task,phase:task.scan?'preparing':'transferring'}
 return action==='cancel'?{...task,phase:'cancelled'}:task
}
