'use client'

import {useEffect,useId,useRef,useState,type CSSProperties} from 'react'
import {Tabs} from '@base-ui/react/tabs'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select'
import {ArrowRight,ChevronDown,CopyPlus,ExternalLink,Folder,GitPullRequestCreateArrow,Info,KeyRound,ListChecks,ListFilter,Maximize,Monitor,Pause,Play,Plus,Search,Server,ServerPlus,Settings2,ShieldOff,Square,SquareTerminal,Terminal,Trash2,X,ZoomIn,ZoomOut} from 'lucide-react'
import type {Locale} from '@/i18n/config'
import {getDemoCopy,type DemoCopy} from './demo-copy'
import {NativeAboutIcon,NativeConnectionIcon,NativeGraphStarIcon,NativeTerminalIcon} from './native-icons'
import {ConnectionStroke} from './connection-stroke'
import {activeDemoCount,demoScenarios,scenarioStatuses,demoConnectionVisual,getSimulationCopy,type DemoScenario,type DemoStatus} from './simulation'
import {tunnelContent} from './content'

export type DemoView='map'|'forwards'|'services'|'hosts'|'logs'
const views:DemoView[]=['map','forwards','services','hosts','logs']
const hosts=[
 {name:'dev-workspace',address:'developer@dev.example.com:22',tag:'Development',rules:[0,1]},
 {name:'home-lab',address:'demo@lab.example.com:22',tag:'Lab',rules:[2,3]},
 {name:'cloud-services',address:'ubuntu@cloud.example.com:22',tag:'Cloud',rules:[4,5]},
]
const rules=[
 {name:'Web preview',kind:'L',from:'127.0.0.1:13000',to:'127.0.0.1:3000',color:'#4399ff',icon:'code'},
 {name:'PostgreSQL',kind:'L',from:'127.0.0.1:15432',to:'127.0.0.1:5432',color:'#9b72ff',icon:'database'},
 {name:'Webhook',kind:'R',from:'127.0.0.1:19000',to:'127.0.0.1:9000',color:'#ef63a4',icon:'braces'},
 {name:'Preview share',kind:'R',from:'127.0.0.1:18080',to:'127.0.0.1:5173',color:'#ed923e',icon:'globe'},
 {name:'Grafana',kind:'L',from:'127.0.0.1:13001',to:'127.0.0.1:3000',color:'#2cb6c5',icon:'globe'},
 {name:'SOCKS5',kind:'D',from:'127.0.0.1:1080',to:'SOCKS5 · SSH 22',color:'#4ab976',icon:'network'},
]
const recipes=[{name:'Nginx',command:'nginx',icon:'nginx',count:5},{name:'JupyterLab',command:'jupyter',icon:'jupyter',count:4},{name:'PostgreSQL',command:'postgresql',icon:'postgresql',count:5},{name:'Tomcat',command:'tomcat',icon:'apachetomcat',count:5},{name:'Gitea',command:'gitea',icon:'gitea',count:5}]

const style=(color:string)=>({'--route-color':color}) as CSSProperties
function ToolIcons({host=false,service=false,copy}:{host?:boolean;service?:boolean;copy?:DemoCopy}){return <span className="demo-row-tools" aria-hidden="true"><Info/><Settings2/><CopyPlus/>{host&&<SquareTerminal/>}<Trash2 className="demo-danger"/>{service&&<ShieldOff/>}{host&&<span className="demo-host-test"><Play/>{copy?.testConnection}</span>}</span>}
function Stopped({copy,status='stopped'}:{copy:DemoCopy;status?:DemoStatus}){const tone=status==='listening'?'success':['connecting','authenticating','verifying-host','reconnecting','authenticationError','hostKeyError'].includes(status)?'warning':status==='stopped'?'neutral':'danger';return <span className="demo-status" data-tone={tone}><i/>{copy[status]}</span>}
function RuleContent({index,copy,status}:{index:number;copy:DemoCopy;status:DemoStatus}){
 const rule=rules[index]
 return <div className="demo-map-rule" style={style(rule.color)}>
  <div className="demo-rule-title"><NativeConnectionIcon name={rule.icon} color={rule.color}/><strong>{rule.name}</strong><Stopped copy={copy} status={status}/></div>
  <div className="demo-rule-kind"><span>{copy[`type${rule.kind}` as 'typeL'|'typeR'|'typeD']}</span><span>↑ 0 B&nbsp; ↓ 0 B</span></div>
  <div className="demo-route"><code>{rule.from}</code><ArrowRight/><code>{rule.to}</code><span className="demo-port-actions" aria-hidden="true"><ListChecks/>{index!==1&&<ExternalLink/>}</span></div>
  <div className="demo-rule-actions"><ToolIcons/><span className="demo-start" aria-hidden="true"><Play/>{copy.start}</span></div>
 </div>
}
function HostCard({index,copy,statuses}:{index:number;copy:DemoCopy;statuses:DemoStatus[]}){
 const host=hosts[index]
 return <div className={`demo-host-card demo-host-${index}`}>
  <div className="demo-host-heading"><span className="demo-host-card-icon"><Server size={21}/></span><div className="demo-host-heading-content"><div className="demo-host-heading-row"><span>{copy.host}</span><code>{host.address}</code></div><div className="demo-host-heading-row"><strong>{host.name}</strong><small>{copy.forwardCount.replace('{{count}}','2')}</small><NativeTerminalIcon workspace={false} size={16}/></div></div></div>
  {host.rules.map(rule=><RuleContent key={rule} index={rule} copy={copy} status={statuses[rule]}/>)}
 </div>
}
function MapView({copy,statuses,paused}:{copy:DemoCopy;statuses:DemoStatus[];paused:boolean}){
 const markerId=useId().replaceAll(':','')
 const area=useRef<HTMLDivElement>(null),[scale,setScale]=useState(.75),[zoom,setZoom]=useState(1)
 useEffect(()=>{const el=area.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setScale(Math.min(entry.contentRect.width/1570,entry.contentRect.height/984)));observer.observe(el);return()=>observer.disconnect()},[])
 return <div ref={area} className="demo-map">
  <div className="demo-map-world" style={{transform:`translate(-50%,-50%) scale(${scale*zoom})`}}>
   <svg className="demo-map-lines" viewBox="0 0 1570 984" aria-hidden="true">
    <defs>{rules.map((rule,index)=><marker key={index} id={`${markerId}-${index}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={demoConnectionVisual(statuses[index],rule.color).color}/></marker>)}</defs>
    {[
     [2,'M 504 152 C 570 152 610 180 684 180'],[3,'M 504 292 C 560 292 610 234 684 234'],[0,'M 884 180 C 970 180 1020 152 1110 152'],[1,'M 884 234 C 970 234 1030 292 1110 292'],[4,'M 753 289 C 753 405 730 440 730 515'],[5,'M 821 289 C 821 400 850 442 850 515'],
    ].map(([index,path])=>{const i=Number(index),visual=demoConnectionVisual(statuses[i],rules[i].color);return <ConnectionStroke key={i} d={String(path)} state={visual.state} color={visual.color} marker={`${markerId}-${i}`} paused={paused}/>})}
   </svg>
   <HostCard index={1} copy={copy} statuses={statuses}/><HostCard index={0} copy={copy} statuses={statuses}/><HostCard index={2} copy={copy} statuses={statuses}/>
   <div className="demo-local"><div className="demo-local-computer"><Monitor/><strong>6</strong></div><span className="demo-local-title">{copy.thisComputer}</span>{[
    [2,'left',33.333,'9000'],[3,'left',66.667,'5173'],[0,'right',33.333,'13000'],[1,'right',66.667,'15432'],[4,'bottom',33.333,'13001'],[5,'bottom',66.667,'1080'],
   ].map(([index,side,offset,label])=><span key={String(index)} className={`demo-local-port demo-port-${side}`} style={{...style(rules[Number(index)].color),[side==='bottom'?'left':'top']:`${offset}%`}}><i/><code>{label}</code></span>)}</div>

  </div>
  <div className="demo-map-controls"><button aria-label={copy.zoomOut} onClick={()=>setZoom(value=>Math.max(.6,value-.15))}><ZoomOut/></button><button aria-label={copy.resetView} onClick={()=>setZoom(1)}><Maximize/></button><button aria-label={copy.zoomIn} onClick={()=>setZoom(value=>Math.min(1.6,value+.15))}><ZoomIn/></button></div>
 </div>
}
function RowsView({view,copy,statuses}:{view:DemoView;copy:DemoCopy;statuses:DemoStatus[]}){
 const [query,setQuery]=useState(''),[grouped,setGrouped]=useState(view!=='hosts')
 const match=(text:string)=>text.toLowerCase().includes(query.trim().toLowerCase())
 const selectedHosts=hosts.filter(host=>match(host.name+' '+host.address+' '+host.tag))
 const selectedRules=(host:typeof hosts[number])=>host.rules.filter(index=>match(rules[index].name+' '+rules[index].from+' '+rules[index].to+' '+host.name))
 const selectedRecipes=recipes.filter(recipe=>match(recipe.name+' '+recipe.command))
 const count=view==='hosts'?selectedHosts.length:view==='services'?selectedRecipes.length:hosts.reduce((sum,host)=>sum+selectedRules(host).length,0)
 const searchLabel=view==='logs'?copy.searchLogs:view==='services'?copy.searchServices:copy.searchHosts
 const groupLabel=view==='logs'?copy.groupLogs:view==='services'?copy.byCategory:copy.groupHosts
 return <div className="demo-list-page">
  <header className="demo-page-heading"><h4>{copy[view]}</h4><small>{view==='logs'?copy.logCount.replace('{{count}}',String(count)):count}</small></header>
  <div className="demo-list-toolbar"><label><Search size={15}/><input aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={event=>setQuery(event.target.value)}/></label><div className="demo-group-select"><ListFilter size={13}/><Select value={grouped?'grouped':'none'} onValueChange={value=>setGrouped(value==='grouped')}><SelectTrigger aria-label={groupLabel} className="demo-group-trigger"><SelectValue>{grouped?(view==='hosts'?copy.byTags:groupLabel):copy.groupNone}</SelectValue></SelectTrigger><SelectContent align="end" alignItemWithTrigger={false}><SelectItem value="none">{copy.groupNone}</SelectItem><SelectItem value="grouped">{view==='hosts'?copy.byTags:groupLabel}</SelectItem></SelectContent></Select></div></div>
  <div className="demo-list-scroll">
   {view==='hosts'&&selectedHosts.map(host=><section className="demo-list-group" key={host.name}>{grouped&&<div className="demo-group-label"><ChevronDown size={13}/>{host.tag}<small>1</small></div>}<div className="demo-native-row"><span className="demo-native-icon"><Server/></span><div><strong>{host.name}<span className="demo-status"><i/>{copy.untested}</span></strong><div className="demo-host-meta"><code>{host.address}</code><span><KeyRound size={12}/>SSH Agent</span></div></div><ToolIcons host copy={copy}/></div></section>)}
   {view==='forwards'&&hosts.map(host=>{const selected=selectedRules(host);return selected.length>0&&<section className="demo-list-group" key={host.name}>{grouped&&<div className="demo-group-label"><ChevronDown size={13}/>{host.name}<small>{selected.length}</small></div>}{selected.map(index=><div className="demo-native-row demo-forward-row" key={index} style={style(rules[index].color)}><input className="demo-row-checkbox" type="checkbox" aria-label={`${copy.forwards} ${rules[index].name}`}/><div><strong><NativeConnectionIcon name={rules[index].icon} color={rules[index].color}/>{rules[index].name}<Stopped copy={copy} status={statuses[index]}/></strong><code>{rules[index].from} → {rules[index].to}</code></div><div className="demo-native-actions"><ToolIcons/><span className="demo-start" aria-hidden="true"><Play/>{copy.start}</span></div></div>)}</section>})}
   {view==='services'&&selectedRecipes.map((recipe,index)=><section className="demo-list-group" key={recipe.name}>{grouped&&(index===0||index===3)&&<div className="demo-group-label"><ChevronDown size={13}/><Folder size={13}/>{index===0?'Development':'Operations'}</div>}<div className="demo-native-row"><input className="demo-row-checkbox" type="checkbox" aria-label={`${copy.services} ${recipe.name}`}/><div><strong><NativeConnectionIcon name={recipe.icon}/>{recipe.name}</strong><div className="demo-service-summary"><small>{copy.commandCount.replace('{{count}}',String(recipe.count))}</small>{[copy.start,copy.stop,copy.restart,copy.status,copy.logs].slice(0,recipe.count).map(label=><span key={label}>{label}</span>)}</div></div><ToolIcons service/></div></section>)}
   {view==='logs'&&hosts.map(host=>{const selected=selectedRules(host);return selected.length>0&&<section className="demo-list-group" key={host.name}>{grouped&&<div className="demo-group-label"><ChevronDown size={13}/>{host.name}<small>{selected.length}</small></div>}{selected.map(index=><div className="demo-log-row" key={index}><div><Stopped copy={copy} status={statuses[index]}/><time>2026/10/25 13:22:35</time></div><div><span>{host.name} · {rules[index].name}</span><code>{copy.retryCount+' 2'} · b437aa15</code></div></div>)}</section>})}
   {count===0&&<div className="demo-empty" role="status"><Search size={20}/><span>{view==='hosts'?copy.emptyResult:copy[view]+': 0'}</span></div>}
  </div>
 </div>
}
function TerminalDock({copy,onClose}:{copy:DemoCopy;onClose:()=>void}){
 return <aside className="demo-terminal"><div><span><Terminal size={13}/>{copy.terminal}</span><span>dev-workspace</span><button aria-label={copy.terminal} onClick={onClose}><X size={15}/></button></div><pre>{copy.terminalEmpty}{'\n\n'}<span>{copy.terminalHint}</span>{'\n\n'}<b>developer@dev.example.com</b> <span>│ SSH · 22</span></pre></aside>
}
export function WorkspaceDemo({locale,initialView='map',compact=false}:{locale:Locale;initialView?:DemoView;compact?:boolean}){
 const copy=getDemoCopy(locale),sim=getSimulationCopy(locale),[scenario,setScenario]=useState<DemoScenario>(compact?'stopped':'mixed'),[paused,setPaused]=useState(false),statuses=scenarioStatuses(scenario),[view,setView]=useState<DemoView>(initialView),[terminal,setTerminal]=useState(false)
 const viewport=useRef<HTMLDivElement>(null),[windowScale,setWindowScale]=useState(1)
 useEffect(()=>{const element=viewport.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setWindowScale(entry.contentRect.width/1178));observer.observe(element);return()=>observer.disconnect()},[])
 return <div className="tunnel-demo-composition">{!compact&&<div className="demo-simulation-controls"><div className="demo-state-field"><span>{sim.label}</span><Select value={scenario} onValueChange={value=>{if(value)setScenario(value as DemoScenario)}}><SelectTrigger aria-label={sim.label} className="demo-state-trigger"><SelectValue>{scenario==='mixed'?sim.mixed:copy[scenario]}</SelectValue></SelectTrigger><SelectContent align="start" alignItemWithTrigger={false} sideOffset={8} className="demo-state-options">{demoScenarios.map(value=><SelectItem key={value} value={value}>{value==='mixed'?sim.mixed:copy[value]}</SelectItem>)}</SelectContent></Select></div><small>{sim.note}</small><button type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?sim.resume:sim.pause}</span></button></div>}<div ref={viewport} className={'tunnel-demo-window'+(compact?' demo-compact':'')} data-motion-paused={paused} data-scenario={scenario} style={{'--native-preview-scale':windowScale} as CSSProperties}>
  <div className="demo-native-surface" style={{transform:`scale(${windowScale})`}}>
  <Tabs.Root value={view} onValueChange={value=>{setView(value as DemoView);setTerminal(false)}}>
   <div className="demo-native-header">
    <div className="demo-header-side"><span className="demo-traffic demo-native-capsule" aria-hidden="true"><i/><i/><i/></span>
     {view!=='logs'&&<span className="demo-add-tools demo-native-capsule" aria-hidden="true">{view==='services'?<span><Plus/></span>:<>{view!=='forwards'&&<span><ServerPlus/></span>}{view!=='hosts'&&<span><GitPullRequestCreateArrow/></span>}</>}</span>}
    </div>
    <div className="demo-header-center"><Tabs.List className="demo-native-tabs demo-native-capsule" aria-label={tunnelContent[locale].hero.demo}>{views.map(id=><Tabs.Tab key={id} value={id} aria-label={copy[id]} title={copy[id]}>{copy[id]}</Tabs.Tab>)}</Tabs.List></div>
    <div className="demo-header-side">
     <span className="demo-batch-tools demo-native-capsule"><button type="button" className="demo-batch-start" aria-label={copy.startAll} onClick={()=>setScenario('listening')}><Play/></button><button type="button" className="demo-batch-stop" aria-label={copy.stopAll} onClick={()=>setScenario('stopped')}><Square/></button></span>
     <div className="demo-window-tools demo-native-capsule"><button type="button" aria-label={copy.terminalOpen} aria-pressed={terminal} onClick={()=>setTerminal(value=>!value)}><NativeTerminalIcon/></button><span aria-hidden="true"><Settings2/></span><span aria-hidden="true"><NativeAboutIcon/></span></div>
    </div>
   </div>
   <div className="demo-native-body">{views.map(id=><Tabs.Panel key={id} value={id} className="demo-native-panel">{id==='map'?<MapView copy={copy} statuses={statuses} paused={paused}/>:<RowsView key={id} view={id} copy={copy} statuses={statuses}/>}</Tabs.Panel>)}{terminal&&<TerminalDock copy={copy} onClose={()=>setTerminal(false)}/>}</div>
   <div className="demo-canvas-status"><NativeGraphStarIcon/><span>{copy.activeCount.replace('{{count}}',String(activeDemoCount(statuses)))}</span><i/>OriaTunnel</div>
  </Tabs.Root>
  </div>
 </div></div>
}
