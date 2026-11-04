'use client'

// Native OriaTunnel file panel composition, adapted for isolated website sample state.
// GPL-3.0-only; all source fingerprints are recorded in docs/migration-sources.json.
import {useEffect,useRef,useState,type CSSProperties} from 'react'
import {Dialog} from '@base-ui/react/dialog'
import {ChevronFirst,ChevronLast,Columns3,Columns3Cog,PanelBottom,PanelLeft,PanelRight,Pencil,Rows3,Save,X} from 'lucide-react'
import {DropdownMenu,DropdownMenuContent,DropdownMenuRadioGroup,DropdownMenuRadioItem,DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import type {Locale} from '@/i18n/config'
import {FileArtwork} from './native-file-artwork'
import {FileDemoPane} from './file-demo-pane'
import {FileDemoQueue} from './file-demo-queue'
import {FileDemoButton as IconButton,FileDemoSeparator,FileSplitIcon} from './file-demo-controls'
import {getFileDemoCopy,type FileDemoCopy} from './file-demo-copy'
import {fileUpdateCopy} from './file-update-copy'
import {controlDemoTransfer,sampleTransfers,type DemoFile,type DemoTransfer} from './file-demo-state'

function FilePreview({copy,notice,file,onClose,onSave}:{copy:FileDemoCopy;notice:string;file:DemoFile&{key:string};onClose:()=>void;onSave:(value:string)=>void}) {
 const [text,setText]=useState(file.content??''),[saved,setSaved]=useState(file.content??''),[editing,setEditing]=useState(false),[discard,setDiscard]=useState(false),[savedNotice,setSavedNotice]=useState(false)
 const dirty=text!==saved
 return <Dialog.Root open onOpenChange={open=>{if(!open){if(dirty)setDiscard(true);else onClose()}}}>
  <Dialog.Portal><Dialog.Backdrop className="file-preview-backdrop"/><Dialog.Popup className="file-preview-popup">
   <header><FileArtwork name={file.name} large/><Dialog.Title>{file.name}</Dialog.Title><button type="button" className="file-demo-icon-button" aria-label={copy.close} onClick={()=>dirty?setDiscard(true):onClose()}><X size={18}/></button></header>
   <Dialog.Description className="file-preview-description">{notice}</Dialog.Description>
   {discard?<div className="file-preview-discard" role="alert"><h3>{copy.editDiscardTitle}</h3><p>{copy.editDiscardDescription}</p><div><button type="button" onClick={()=>setDiscard(false)}>{copy.editContinue}</button><button type="button" onClick={onClose}>{copy.editDiscard}</button></div></div>:<>
    <div className="file-preview-toolbar"><code>{file.key}</code><button type="button" onClick={()=>setEditing(value=>!value)} aria-pressed={editing}><Pencil size={14}/>{copy.editFile}</button><button type="button" disabled={!dirty} onClick={()=>{onSave(text);setSaved(text);setSavedNotice(true)}}><Save size={14}/>{copy.editSave}</button></div>
    {editing?<textarea className="file-preview-editor" aria-label={copy.fileContent} value={text} spellCheck={false} onChange={event=>{setText(event.target.value);setSavedNotice(false)}}/>:<pre className="file-preview-code"><code>{text}</code></pre>}
    <p className="file-preview-status" role="status">{dirty?copy.editUnsaved:savedNotice?copy.editSaved:copy.preview}</p>
   </>}
  </Dialog.Popup></Dialog.Portal>
 </Dialog.Root>
}

export function FileWorkspaceDemo({locale,onClose}:{locale:Locale;onClose?:()=>void}) {
 const copy=getFileDemoCopy(locale),notice=fileUpdateCopy[locale].demoNotice
 const [source,setSource]=useState('local'),[target,setTarget]=useState('dev-workspace'),[layout,setLayout]=useState('auto'),[tasks,setTasks]=useState(sampleTransfers),[preview,setPreview]=useState<(DemoFile&{key:string})|null>(null),[documents,setDocuments]=useState<Record<string,string>>({}),[announcement,setAnnouncement]=useState(''),[dock,setDock]=useState('bottom'),[maximized,setMaximized]=useState(false),[collapsed,setCollapsed]=useState(false),[ratio,setRatio]=useState(2),[browserRatio,setBrowserRatio]=useState(70),[paneRatio,setPaneRatio]=useState(50)
 const panel=useRef<HTMLDivElement>(null)
 useEffect(()=>{const element=panel.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setRatio(entry.contentRect.width/entry.contentRect.height));observer.observe(element);return()=>observer.disconnect()},[])
 const resolved=layout==='auto'?(ratio>=1.8?'columns':ratio<=.8?'rows':'split'):layout
 const outerVertical=resolved!=='columns',innerVertical=resolved==='rows',DockIcon=dock==='left'?PanelLeft:dock==='right'?PanelRight:PanelBottom,ExpandIcon=(dock==='left'?!maximized:maximized)?ChevronLast:ChevronFirst
 const LayoutIcon=layout==='auto'?Columns3Cog:layout==='columns'?Columns3:layout==='rows'?Rows3:FileSplitIcon
 const split=(value:number)=>`minmax(0,${value}fr) 8px minmax(0,${100-value}fr)`
 const label=(host:string)=>host==='local'?copy.local:host
 const transfer=(files:DemoFile[],path:string,reverse=false)=>{
  const from=reverse?target:source,to=reverse?source:target,direction=source==='local'?(reverse?'download':'upload'):'remoteTransfer'
  setTasks(current=>[{id:Math.max(0,...current.map(task=>task.id))+1,name:files[0].name,folder:files[0].folder,source:`${label(from)} · ${path}/${files[0].name}`,target:`${label(to)} · ${to==='local'?'/Projects/demo':'/srv/demo'}`,direction,phase:'transferring',percent:36,size:files.length>1?14680064:2458,...(files.length>1?{batch:files.map(file=>({name:file.name,folder:file.folder}))}:{}),...(direction==='remoteTransfer'?{transport:'viaLocal' as const}:{})},...current])
  setAnnouncement(`${copy.transfers} · ${files[0].name} · ${copy.transferring}`)
 }
 const action=(task:DemoTransfer,value:'pause'|'resume'|'cancel')=>{setTasks(current=>current.map(item=>item.id===task.id?controlDemoTransfer(item,value):item));setAnnouncement(`${task.name} · ${copy[value==='pause'?'paused':value==='cancel'?'cancelled':'transferring']}`)}
 return <div className="file-demo" data-layout={resolved} data-layout-mode={layout} data-dock={dock} data-maximized={maximized} data-collapsed={collapsed}>
  <div ref={panel} className="file-demo-panel">
   <span className="file-demo-panel-grip" aria-hidden="true"/>
   <header className="workspace-panel-header"><strong>{copy.title}</strong><div className="workspace-panel-actions">
    <IconButton label={maximized?copy.restore:copy.maximize} onClick={()=>{setCollapsed(false);setMaximized(value=>!value)}}><ExpandIcon style={{transform:dock==='bottom'?'rotate(90deg)':undefined}}/></IconButton>
    <DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.position} title={copy.position}><DockIcon/></DropdownMenuTrigger><DropdownMenuContent align="end" className="file-demo-layout-menu"><DropdownMenuRadioGroup value={dock} onValueChange={setDock}>{(['bottom','left','right'] as const).map(value=>{const Icon=value==='left'?PanelLeft:value==='right'?PanelRight:PanelBottom;return <DropdownMenuRadioItem key={value} value={value} closeOnClick><Icon/>{copy.dock[value]}</DropdownMenuRadioItem>})}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
    <DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.panelLayout} title={copy.panelLayout}><LayoutIcon/></DropdownMenuTrigger><DropdownMenuContent align="end" className="file-demo-layout-menu"><DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>{(['auto','columns','rows','split'] as const).map(mode=>{const Icon=mode==='auto'?Columns3Cog:mode==='columns'?Columns3:mode==='rows'?Rows3:FileSplitIcon;return <DropdownMenuRadioItem key={mode} value={mode} closeOnClick><Icon/>{copy[({auto:'layoutAuto',columns:'layoutColumns',rows:'layoutRows',split:'layoutSplit'} as const)[mode]]}</DropdownMenuRadioItem>})}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
    <IconButton label={copy.collapse} onClick={()=>onClose?onClose():setCollapsed(true)}><X/></IconButton>
   </div></header>
   {!collapsed&&<div className="files-body" style={{[outerVertical?'gridTemplateRows':'gridTemplateColumns']:split(browserRatio)} as CSSProperties}>
    <div className="file-demo-browser" style={{[innerVertical?'gridTemplateRows':'gridTemplateColumns']:split(paneRatio)} as CSSProperties}>
     <FileDemoPane locale={locale} side="source" copy={copy} target={source} onTarget={setSource} remoteTransfer={source!=='local'} onTransfer={(files,path)=>transfer(files,path)} onPreview={(file,key)=>setPreview({...file,key,content:documents[key]??file.content})}/>
     <FileDemoSeparator label={copy.resize} vertical={!innerVertical} value={paneRatio} onChange={setPaneRatio}/>
     <FileDemoPane locale={locale} side="target" copy={copy} target={target} onTarget={setTarget} remoteTransfer={source!=='local'} onTransfer={(files,path)=>transfer(files,path,true)} onPreview={(file,key)=>setPreview({...file,key,content:documents[key]??file.content})}/>
    </div>
    <FileDemoSeparator label={copy.resizeQueue} vertical={!outerVertical} value={browserRatio} onChange={setBrowserRatio}/>
    <FileDemoQueue copy={copy} tasks={tasks} onAction={action} onClear={id=>setTasks(current=>current.filter(task=>id?task.id!==id:!['completed','cancelled'].includes(task.phase)))}/>
   </div>}
  </div>
  <p className="file-demo-disclosure">{notice}</p><span className="sr-only" role="status">{announcement}</span>
  {preview&&<FilePreview key={preview.key} copy={copy} notice={notice} file={preview} onClose={()=>setPreview(null)} onSave={value=>setDocuments(current=>({...current,[preview.key]:value}))}/>}
 </div>
}
