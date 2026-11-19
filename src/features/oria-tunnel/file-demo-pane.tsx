// Original FilePane/endpoint/path/search composition, adapted for sample data only.
// OriaTunnel, GPL-3.0-only. Source fingerprints: docs/migration-sources.json.
import {DemoEmpty} from "./demo-empty"
import {Button} from "@/components/ui/button"
import {groupByTime, sampleDay, sampleTime, timeGroupLabel} from "./file-time-groups"
import {useRef,useState} from 'react'
import {createPortal,flushSync} from 'react-dom'
import {motion} from 'motion/react'
import {Popover} from '@base-ui/react/popover'
import {ContextMenu} from '@base-ui/react/context-menu'
import {ArrowLeft,ArrowRight,ArrowUp,ArrowRightLeft,Download,Eye,HardDrive,LayoutGrid,List,MoreHorizontal,RefreshCw,Search,SearchX,FolderOpen,FolderPlus,EyeOff,Server,Unplug,Upload} from 'lucide-react'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select'
import {DropdownMenu,DropdownMenuContent,DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {FileOptionsMenu} from './native-file-options'
import {FileArtwork,FileDragArtwork} from './native-file-artwork'
import {FileDemoButton} from './file-demo-controls'
import {FilePathNavigation} from './native-file-path'
import type {Locale} from '@/i18n/config'
import {sampleFiles,type DemoFile} from './file-demo-state'
import type {FileDemoCopy} from './file-demo-copy'

export type FileDrag = {
 begin: (side: 'source'|'target', files: DemoFile[], path: string) => void
 accepts: (side: 'source'|'target') => boolean
 drop: (path: string) => void
 end: () => void
}
type Location={trail:DemoFile[];computer?:boolean}
export function FileDemoPane({locale,copy,target,onTarget,onTransfer,onPreview,side,remoteTransfer,drag,dateScene=false}: {dateScene?:boolean;drag:FileDrag;locale:Locale;copy:FileDemoCopy;target:string;onTarget:(value:string)=>void;onTransfer:(files:DemoFile[],path:string)=>void;onPreview:(file:DemoFile,key:string)=>void;side:'source'|'target';remoteTransfer:boolean}) {
 const dragImage = useRef<HTMLSpanElement>(null)
 const [preview,setPreview] = useState<{file:DemoFile;count:number;x:number;y:number}|null>(null)
 const [history,setHistory]=useState<Location[]>([{trail:[]}]),[cursor,setCursor]=useState(0),[query,setQuery]=useState(''),[grid,setGrid]=useState(false),[selected,setSelected]=useState<string[]>(['README.md']),[hidden,setHidden]=useState(false),[descending,setDescending]=useState(false),[sort,setSort]=useState(dateScene?'created':'name'),[extras,setExtras]=useState<Record<string,DemoFile[]>>({}),[searchOpen,setSearchOpen]=useState(false),[connected,setConnected]=useState(true)
 const [grouped,setGrouped]=useState(dateScene)
 const location=history[cursor],trail=location.trail,local=target==='local',base=local?'/Projects/demo':'/srv/demo',path=base+trail.map(file=>'/'+file.name).join(''),input=useRef<HTMLInputElement>(null),focusSearch=useRef(false)
 const entries:DemoFile[]=location.computer?[{name:'Macintosh HD',folder:true,size:'—',children:sampleFiles},{name:'Workspace',folder:true,size:'—',children:sampleFiles}]:[...(trail.at(-1)?.children??sampleFiles),...(extras[path]??[])]
 const dateOf=(file:DemoFile)=>sort==='created'?(local?file.created:undefined):file.modified
 const visible=entries.filter(file=>(hidden||!file.name.startsWith('.'))&&file.name.toLowerCase().includes(query.trim().toLowerCase())).toSorted((a,b)=>{
  const folders=Number(!!b.folder)-Number(!!a.folder)
  if(folders)return folders
  const order=descending?-1:1
  if(sort==='created'||sort==='modified'){
   const left=dateOf(a),right=dateOf(b)
   if(left==null||right==null)return Number(left==null)-Number(right==null)
   return order*(left-right)
  }
  if(sort==='size')return order*((parseFloat(a.size)||0)-(parseFloat(b.size)||0))
  if(sort==='type')return order*(a.name.split('.').at(-1)??'').localeCompare(b.name.split('.').at(-1)??'')
  return order*a.name.localeCompare(b.name,locale)
 })
 const sections=grouped&&!location.computer?groupByTime(visible,dateOf,sampleDay,descending||(sort!=='created'&&sort!=='modified')).map(group=>({
  key:group.time.key,label:timeGroupLabel(group.time,copy,locale,sampleDay),items:group.items
 })):[{key:'all',label:'',items:visible}]
 const createFolder=()=>setExtras(current=>({...current,[path]:[...(current[path]??[]),{
  name:copy.mkdir+' '+((current[path]?.length??0)+1),folder:true,size:'—',children:[],created:sampleTime(0),modified:sampleTime(0)
 }]}))
 const selection=visible.filter(file=>selected.includes(file.name)),selectLabel=side==='source'?copy.local:copy.remote,transferLabel=remoteTransfer?copy.remoteTransfer:side==='source'?copy.upload:copy.download,TransferIcon=remoteTransfer?ArrowRightLeft:side==='source'?Upload:Download
 const navigate=(next:Location)=>{setHistory(current=>[...current.slice(0,cursor+1),next]);setCursor(cursor+1);setSelected([]);setQuery('')}
 const open=(file:DemoFile)=>{if(file.folder)navigate({trail:[...trail,file]});else onPreview(file,`${target}:${path}/${file.name}`)}
 const up=()=>navigate(trail.length?{trail:trail.slice(0,-1)}:{trail:[],computer:local})
 const toggle=(name:string,multiple:boolean)=>setSelected(current=>multiple?(current.includes(name)?current.filter(value=>value!==name):[...current,name]):[name])
 const rowMenu=(file:DemoFile)=><ContextMenu.Portal><ContextMenu.Positioner className="site-popup-positioner"><ContextMenu.Popup className="file-demo-context-menu floating-surface"><ContextMenu.Item onClick={()=>open(file)}><Eye/>{copy.preview}</ContextMenu.Item><ContextMenu.Item onClick={()=>onTransfer([file],path)}><TransferIcon/>{transferLabel}</ContextMenu.Item></ContextMenu.Popup></ContextMenu.Positioner></ContextMenu.Portal>
 return <section data-side={side} className="files-pane themed-surface"
  onDragOver={event=>{
    if(!drag.accepts(side)||!connected||location.computer)return
    event.preventDefault()
    event.dataTransfer.dropEffect='copy'
    const pane=event.currentTarget, folder=(event.target as Element).closest<HTMLElement>('[data-folder]')
    pane.querySelector('[data-drop-hover]')?.removeAttribute('data-drop-hover')
    pane.toggleAttribute('data-drop-hover',!folder)
    folder?.setAttribute('data-drop-hover','')
  }}
  onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null)){
    event.currentTarget.removeAttribute('data-drop-hover')
    event.currentTarget.querySelector('[data-drop-hover]')?.removeAttribute('data-drop-hover')
  }}}
  onDrop={event=>{
    if(!drag.accepts(side)||!connected||location.computer)return
    event.preventDefault()
    const folder=(event.target as Element).closest<HTMLElement>('[data-folder]')
    drag.drop(folder ? path+'/'+folder.dataset.folder : path)
  }} aria-label={`${copy.title} · ${selectLabel}`}>
  <div className="files-pane-title"><div className="files-pane-heading"><Select value={target} onValueChange={value=>{if(value){onTarget(value);setHistory([{trail:[]}]);setCursor(0);setSelected([]);setConnected(true)}}}><SelectTrigger className="files-host-select" aria-label={selectLabel}><SelectValue>{local?copy.local:target}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}>{(side==='source'?['local','home-lab']:['dev-workspace','cloud-services']).map(host=><SelectItem key={host} value={host}>{host==='local'?<HardDrive/>:<Server/>}{host==='local'?copy.local:host}</SelectItem>)}</SelectContent></Select>{!local&&(connected?<FileDemoButton label={copy.disconnect} onClick={()=>setConnected(false)}><Unplug/></FileDemoButton>:<button type="button" className="file-demo-text-button" onClick={()=>setConnected(true)}>{copy.connect}</button>)}</div><div className="files-pane-actions"><span>{selected.length} / {visible.length}</span><button type="button" className="file-demo-text-button" disabled={!selection.length||!connected||location.computer} onClick={()=>onTransfer(selection,path)}><TransferIcon/>{transferLabel}</button></div></div>
  <div className="files-toolbar"><FileDemoButton label={copy.back} disabled={cursor===0} onClick={()=>{setCursor(value=>value-1);setSelected([])}}><ArrowLeft/></FileDemoButton><FileDemoButton label={copy.forward} disabled={cursor===history.length-1} onClick={()=>{setCursor(value=>value+1);setSelected([])}}><ArrowRight/></FileDemoButton><FileDemoButton label={copy.up} disabled={location.computer} onClick={up}><ArrowUp/></FileDemoButton><FileDemoButton label={copy.refresh} disabled={!connected} onClick={()=>{setSelected([])}}><RefreshCw/></FileDemoButton>
   <FilePathNavigation locale={locale} path={location.computer?':computer:':path} remote={!local} disabled={!connected} loading={false} onNavigate={async destination=>{if(destination===':computer:'){navigate({trail:[],computer:true});return true}const relative=destination.startsWith(base)?destination.slice(base.length):'';let entries=sampleFiles;const next:DemoFile[]=[];for(const part of relative.split('/').filter(Boolean)){const folder=entries.find(file=>file.name===part&&file.folder);if(!folder)return false;next.push(folder);entries=folder.children??[]}navigate({trail:next});return true}}/>
   <Popover.Root open={searchOpen} onOpenChange={(open,details)=>{focusSearch.current=details.reason!=='trigger-hover';setSearchOpen(open)}}><Popover.Trigger className="file-demo-icon-button" data-filtered={!!query} disabled={!connected} openOnHover delay={150} closeDelay={150} aria-label={`${copy.search} · ${selectLabel}`} title={query?copy.search+': '+query:copy.search} onClick={()=>input.current?.focus()}><Search/></Popover.Trigger><Popover.Portal><Popover.Positioner align="end" sideOffset={4} className="site-popup-positioner"><Popover.Popup className="file-demo-search-popup floating-surface" initialFocus={()=>focusSearch.current?input.current:false}><label><Search/><input ref={input} aria-label={copy.search} placeholder={copy.search} value={query} onChange={event=>setQuery(event.target.value)}/></label></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>
   <FileDemoButton label={copy.view} pressed={grid} onClick={()=>setGrid(value=>!value)}>{grid?<LayoutGrid/>:<List/>}</FileDemoButton>
   <DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.more} title={copy.more}><MoreHorizontal/></DropdownMenuTrigger><DropdownMenuContent align="end" className="file-demo-layout-menu"><FileOptionsMenu locale={locale} remote={!local} hidden={hidden} sort={sort} descending={descending} grouped={grouped} onGroupChange={setGrouped} canCreate={connected&&!location.computer} canUpload={connected} onHiddenChange={setHidden} onSortChange={setSort} onDescendingChange={setDescending} onCreate={createFolder} onCreateText={()=>setExtras(current=>({...current,[path]:[...(current[path]??[]),{name:((current[path]?.length??0)+1)+' '+copy.newTextName,size:'0 B',content:'',created:sampleTime(0),modified:sampleTime(0)}]}))} onUpload={folder=>onTransfer([sampleFiles.find(file=>!!file.folder===folder)!],path)}/>
</DropdownMenuContent></DropdownMenu>
  </div>
  {!connected?<p className="files-empty">{copy.notConnected}</p>:<div className="files-viewport" role="grid" aria-label={local?copy.local:target} aria-multiselectable="true" tabIndex={0} onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.key==='a'){event.preventDefault();setSelected(visible.map(file=>file.name))}}}>
   {sections.map(section=><div role="rowgroup" key={section.key} aria-label={section.label||undefined}>
    {section.label&&<div role="row" className="files-time-heading"><span role="gridcell">{section.label}<small>{section.items.length}</small></span></div>}
    <div className={grid?'file-demo-native-grid':'file-demo-native-list'}>{section.items.map(file=><ContextMenu.Root key={file.name}><ContextMenu.Trigger render={<motion.div data-entry={file.name} data-folder={file.folder ? file.name : undefined} draggable={!location.computer && connected}
    onDragStartCapture={event=>{
      const picked=selected.includes(file.name)?selection:[file]
      setSelected(picked.map(f=>f.name))
      event.dataTransfer.effectAllowed='copy'
      event.dataTransfer.setData('application/x-oria-sample','files')
      drag.begin(side,picked,path)
      // The browser snapshots the element during dragstart, before React's usual commit.
      flushSync(()=>setPreview({file,count:picked.length,x:event.clientX,y:event.clientY}))
      const image=dragImage.current
      if(image)event.dataTransfer.setDragImage(image,image.offsetWidth/2,image.offsetHeight/2)
      requestAnimationFrame(()=>setPreview(null))
    }} onDragEndCapture={drag.end} role="row" tabIndex={0} aria-selected={selected.includes(file.name)} initial="rest" animate="rest" whileHover="artwork-hover" whileFocus="artwork-hover" className={`files-entry${grid?' files-icon-entry':''}${selected.includes(file.name)?' selected':''}`} onClick={event=>toggle(file.name,event.metaKey||event.ctrlKey)} onDoubleClick={()=>open(file)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();open(file)}}}/> }><span role="gridcell" className="files-entry-name"><FileArtwork name={file.name} kind={location.computer?'drive':file.folder?'directory':'file'} large={grid}/><span>{file.name}</span></span>{!grid&&<><span role="gridcell" className="files-size">{file.size}</span><span role="gridcell" className="files-date">{dateOf(file)!=null?new Date(dateOf(file)!).toLocaleDateString(locale):'—'}</span></>}</ContextMenu.Trigger>{rowMenu(file)}</ContextMenu.Root>)}</div></div>)}
   {!visible.length&&<DemoEmpty icon={query?<SearchX/>:entries.length?<EyeOff/>:<FolderOpen/>}
    title={query?copy.noResults:entries.length?copy.hiddenOnly:copy.empty}
    action={<Button size="sm" variant="outline" onClick={query?()=>setQuery(''):entries.length?()=>setHidden(true):createFolder}>
     {!query&&!entries.length&&<FolderPlus/>}{query?copy.clearSearch:entries.length?copy.showHidden:copy.mkdir}</Button>}/>}
  </div>}
  {preview && createPortal(<span ref={dragImage} className="file-drag-snapshot" aria-hidden="true"
    style={{left:preview.x,top:preview.y}}><FileDragArtwork name={preview.file.name} folder={preview.file.folder} count={preview.count}/></span>,document.body)}
 </section>
}