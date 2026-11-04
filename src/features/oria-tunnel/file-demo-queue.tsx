// OriaTunnel TransferQueue/TransferItem presentation, GPL-3.0-only.
import {useState} from 'react'
import {motion} from 'motion/react'
import {ArrowRight,ArrowRightLeft,BrushCleaning,Check,ChevronRight,ClockArrowDown,ClockArrowUp,Download,HardDriveDownload,HardDriveUpload,Layers,Pause,Play,Trash2,Upload,X} from 'lucide-react'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select'
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {FileArtwork} from './native-file-artwork'
import {FileDemoButton} from './file-demo-controls'
import type {FileDemoCopy} from './file-demo-copy'
import type {DemoTransfer} from './file-demo-state'

const sizes=(bytes:number)=>bytes<1024?`${bytes} B`:`${(bytes/1024**Math.floor(Math.log(bytes)/Math.log(1024))).toFixed(1)} ${['B','KiB','MiB','GiB'][Math.floor(Math.log(bytes)/Math.log(1024))]}`
function FileTransferItem({task,copy,onAction,onClear}:{task:DemoTransfer;copy:FileDemoCopy;onAction:(task:DemoTransfer,action:'pause'|'resume'|'cancel')=>void;onClear:()=>void}) {
 const [expanded,setExpanded]=useState(false),moving=task.phase==='transferring',active=moving||task.phase==='paused',Icon=task.direction==='upload'?Upload:task.direction==='download'?Download:ArrowRightLeft
 const total=task.size??2458,metrics=`${copy.transferredSize}: ${sizes(total*task.percent/100)} · ${copy.totalSize}: ${sizes(total)} · ${copy.progress}: ${task.percent}%`,endpoint=(value:string)=>value.replace('This computer',copy.local)
 return <motion.article className="files-transfer-row" data-phase={task.phase} initial="rest" animate="rest" whileHover="artwork-hover" whileFocus="artwork-hover">
  {task.batch?<button type="button" className="file-demo-icon-button files-transfer-artwork files-batch-trigger" aria-label={expanded?copy.collapseBatch:copy.expandBatch} aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><FileArtwork name="" kind="batch"/><ChevronRight className="files-batch-chevron" style={{transform:expanded?'rotate(90deg)':undefined}}/></button>:<FileArtwork name={task.name} kind={task.folder?'directory':'file'} className="files-transfer-artwork"/>}
  <div className="files-transfer-heading"><div className="files-transfer-name"><strong title={task.name}>{task.batch?copy.batchSummary.replace('{{count}}',String(task.batch.length)):task.name}</strong><span className="files-transfer-direction" title={copy[task.direction]}><Icon/></span></div>
   {task.direction==='remoteTransfer'&&<span className="files-transfer-mode">{copy[task.transport??'viaLocal']}</span>}
   <span tabIndex={0} className="files-transfer-size" title={metrics} aria-label={metrics}><span className="files-transfer-size-full">{active?`${sizes(total*task.percent/100)} / `:''}{sizes(total)}</span><span className="files-transfer-size-compact" aria-hidden="true">{sizes(total)}</span></span>
   <time className="files-transfer-time" dateTime="2026-11-04T08:30:00+08:00">11/04 08:30</time><span className={`files-transfer-state files-state-${task.phase}`}>{copy[task.phase]}</span>
   <div className="files-transfer-actions">{active?<><FileDemoButton label={`${moving?copy.pause:copy.resume} · ${task.name}`} onClick={()=>onAction(task,moving?'pause':'resume')}>{moving?<Pause/>:<Play/>}</FileDemoButton><FileDemoButton label={`${copy.cancel} · ${task.name}`} onClick={()=>onAction(task,'cancel')}><X/></FileDemoButton></>:<FileDemoButton label={`${copy.clear} · ${task.name}`} onClick={onClear}><Trash2/></FileDemoButton>}</div>
  </div>
  <div className="files-transfer-subline"><div className="files-transfer-paths"><span className="files-transfer-endpoint"><code title={endpoint(task.source)}>{endpoint(task.source)}</code></span><ArrowRight/><span className="files-transfer-endpoint"><code title={endpoint(task.target)}>{endpoint(task.target)}</code></span></div>{active&&<div className="files-transfer-progress" data-slot="progress" role="progressbar" aria-label={`${copy.progress} · ${task.name}`} aria-valuenow={task.percent} aria-valuemin={0} aria-valuemax={100}><div data-slot="progress-track"><i style={{width:`${task.percent}%`}}/></div></div>}</div>
  {expanded&&task.batch&&<div className="files-batch-content">{task.batch.map(file=><div className="files-batch-item" key={file.name}><FileArtwork name={file.name} kind={file.folder?'directory':'file'}/><div className="files-batch-item-info"><div className="files-batch-item-heading"><strong>{file.name}</strong><span className="files-batch-state">{copy[task.phase]}</span></div><code>{endpoint(task.source)} → {endpoint(task.target)}</code></div></div>)}</div>}
 </motion.article>
}

export function FileDemoQueue({copy,tasks,onAction,onClear}:{copy:FileDemoCopy;tasks:DemoTransfer[];onAction:(task:DemoTransfer,action:'pause'|'resume'|'cancel')=>void;onClear:(id?:number)=>void}) {
 const [expanded,setExpanded]=useState(true),[filter,setFilter]=useState('all'),[newest,setNewest]=useState(true),[grouping,setGrouping]=useState('type')
 const filtered=tasks.filter(task=>filter==='all'||filter==='active'&&task.phase==='transferring'||filter==='finished'&&['completed','cancelled'].includes(task.phase)||filter==='attention'&&task.phase==='paused').toSorted((a,b)=>newest?b.id-a.id:a.id-b.id)
 const groupKey=(task:DemoTransfer)=>grouping==='type'?task.direction:grouping==='source'?task.source.split(' · ')[0]:grouping==='target'?task.target.split(' · ')[0]:''
 const grouped:Record<string,DemoTransfer[]>={}
 for(const task of filtered)(grouped[groupKey(task)]??=[]).push(task)
 const groups=Object.entries(grouped),GroupIcon=grouping==='type'?ArrowRightLeft:grouping==='source'?HardDriveUpload:grouping==='target'?HardDriveDownload:Layers
 return <section className={`files-queue themed-surface${expanded?'':' collapsed'}`}>
  <div className="files-toolbar"><button type="button" className="file-demo-text-button" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{copy.transfers} · {tasks.length}</button>{expanded&&<div className="files-transfer-filters"><Select value={filter} onValueChange={value=>value&&setFilter(value)}><SelectTrigger aria-label={copy.transferStatusFilter} size="sm"><SelectValue>{copy[filter as 'all'|'active'|'attention'|'finished']}</SelectValue></SelectTrigger><SelectContent>{(['all','active','attention','finished'] as const).map(value=><SelectItem key={value} value={value}>{copy[value]}</SelectItem>)}</SelectContent></Select></div>}
   <div className="files-queue-tools">{expanded&&<><DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.timeOrder} title={copy.timeOrder}>{newest?<ClockArrowDown/>:<ClockArrowUp/>}</DropdownMenuTrigger><DropdownMenuContent className="file-demo-layout-menu" align="end">{[true,false].map(value=><DropdownMenuItem key={String(value)} onClick={()=>setNewest(value)}>{value?<ClockArrowDown/>:<ClockArrowUp/>}{value?copy.newestFirst:copy.oldestFirst}{newest===value&&<Check/>}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.groupTransfers} title={copy.groupTransfers}><GroupIcon/></DropdownMenuTrigger><DropdownMenuContent className="file-demo-layout-menu" align="end">{(['type','source','target','none'] as const).map(group=>{const Icon=group==='type'?ArrowRightLeft:group==='source'?HardDriveUpload:group==='target'?HardDriveDownload:Layers;return <DropdownMenuItem key={group} onClick={()=>setGrouping(group)}><Icon/>{copy[({type:'groupTransferType',source:'groupSourceHost',target:'groupTargetHost',none:'noGrouping'} as const)[group]]}{group===grouping&&<Check/>}</DropdownMenuItem>})}</DropdownMenuContent></DropdownMenu></>}
    <FileDemoButton label={copy.clearHistory} disabled={!tasks.some(task=>['completed','cancelled'].includes(task.phase))} onClick={()=>onClear()}><BrushCleaning/></FileDemoButton></div>
  </div>
  {expanded&&<div className="files-task-list">{groups.map(([group,items])=><section key={group} className="files-transfer-group">{grouping!=='none'&&<h3 className="files-transfer-group-heading"><GroupIcon/><span>{grouping==='type'?copy[group as DemoTransfer['direction']]:group.replace('This computer',copy.local)}</span><small>{items!.length}</small></h3>}{items!.map(task=><FileTransferItem key={task.id} task={task} copy={copy} onAction={onAction} onClear={()=>onClear(task.id)}/>)}</section>)}{!filtered.length&&<p className="files-empty">{copy.noTransfers}</p>}</div>}
 </section>
}
