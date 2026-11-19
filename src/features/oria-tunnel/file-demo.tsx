'use client'

// Native OriaTunnel file panel composition, adapted for isolated website sample state.
// GPL-3.0-only; all source fingerprints are recorded in docs/migration-sources.json.
import {useEffect,useRef,useState,type CSSProperties} from 'react'
import {PanelWalkthrough} from './panel-walkthrough'
import {Popover} from '@base-ui/react/popover'
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
import {controlDemoTransfer,sampleTransfers,sampleFiles,type DemoFile,type DemoTransfer} from './file-demo-state'

function FilePreview({copy,notice,file,onClose,onSave,inline=false}:{inline?:boolean;copy:FileDemoCopy;notice:string;file:DemoFile&{key:string};onClose:()=>void;onSave:(value:string)=>void}) {
 const [text,setText]=useState(file.content??''),[saved,setSaved]=useState(file.content??''),[editing,setEditing]=useState(false),[discard,setDiscard]=useState(false),[savedNotice,setSavedNotice]=useState(false)
 const dirty=text!==saved
 const close = () => dirty ? setDiscard(true) : onClose()
 const content = <>
   <header><FileArtwork name={file.name} large/>{inline ? <h3>{file.name}</h3> : <Dialog.Title>{file.name}</Dialog.Title>}<button type="button" className="file-demo-icon-button" aria-label={copy.close} onClick={close}><X size={18}/></button></header>
   {!inline && <Dialog.Description className="file-preview-description">{notice}</Dialog.Description>}
   {discard?<div className="file-preview-discard" role="alert"><h3>{copy.editDiscardTitle}</h3><p>{copy.editDiscardDescription}</p><div><button type="button" onClick={()=>setDiscard(false)}>{copy.editContinue}</button><button type="button" onClick={onClose}>{copy.editDiscard}</button></div></div>:<>
    <div className="file-preview-toolbar"><code>{file.key}</code><button type="button" onClick={()=>setEditing(value=>!value)} aria-pressed={editing}><Pencil size={14}/>{copy.editFile}</button><button type="button" disabled={!dirty} onClick={()=>{onSave(text);setSaved(text);setSavedNotice(true)}}><Save size={14}/>{copy.editSave}</button></div>
    {editing?<textarea className="file-preview-editor" aria-label={copy.fileContent} value={text} spellCheck={false} onChange={event=>{setText(event.target.value);setSavedNotice(false)}}/>:<pre className="file-preview-code"><code>{text}</code></pre>}
    <p className="file-preview-status" role="status">{dirty?copy.editUnsaved:savedNotice?copy.editSaved:copy.preview}</p>
   </>}
 </>
 if (inline) return <section aria-label={file.name} className="file-preview-inline">{content}</section>
 return <Dialog.Root open onOpenChange={open=>{if(!open)close()}}>
  <Dialog.Portal><Dialog.Backdrop className="file-preview-backdrop"/><Dialog.Popup className="file-preview-popup floating-surface">{content}</Dialog.Popup></Dialog.Portal>
 </Dialog.Root>
}

const layoutOptions = [
 {value:'auto',Icon:Columns3Cog,label:'layoutAuto'}, {value:'columns',Icon:Columns3,label:'layoutColumns'},
 {value:'rows',Icon:Rows3,label:'layoutRows'}, {value:'split',Icon:FileSplitIcon,label:'layoutSplit'},
] as const
export const fileScenes = ['browse', 'queue', 'preview', 'layout', 'drop', 'dates'] as const
type FileScene = typeof fileScenes[number]
const previewFile = sampleFiles.find(file => file.name === 'README.md')!
const previewPath = 'local:/Projects/demo/README.md'

export function FileWorkspaceDemo({locale,onClose,scene,showNotice=true,initialLayout='auto'}:{locale:Locale;showNotice?:boolean;initialLayout?:'auto'|'split';onClose?:()=>void;scene?:FileScene}) {
 const copy=getFileDemoCopy(locale),notice=fileUpdateCopy[locale].demoNotice
 const [source,setSource]=useState('local'),[target,setTarget]=useState('dev-workspace'),[layout,setLayout]=useState<string>(initialLayout),[tasks,setTasks]=useState(sampleTransfers),[preview,setPreview]=useState<(DemoFile&{key:string})|null>(null),[documents,setDocuments]=useState<Record<string,string>>({}),[announcement,setAnnouncement]=useState(''),[dock,setDock]=useState('bottom'),[maximized,setMaximized]=useState(false),[collapsed,setCollapsed]=useState(false),[ratio,setRatio]=useState(2),[browserRatio,setBrowserRatio]=useState(70),[paneRatio,setPaneRatio]=useState(50)
 const [layoutMenu,setLayoutMenu]=useState(false)
 const automaticMenu=useRef(false)
 const [previousScene,setPreviousScene]=useState<FileScene>()
 const [inlinePreview,setInlinePreview]=useState(false)
 if (scene !== previousScene) {
  setPreviousScene(scene)
  setLayoutMenu(false)
  if (scene === 'drop') { setSource('local'); setTarget('dev-workspace') }
  setCollapsed(false)
  setMaximized(false)
  setLayout(scene === 'layout' ? 'rows' : scene === 'drop' ? 'split' : 'auto')
  setBrowserRatio(scene === 'queue' ? 42 : 70)
  setInlinePreview(scene === 'preview')
  setPreview(null)
 }
 const panel=useRef<HTMLDivElement>(null)
 useEffect(()=>{const element=panel.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setRatio(entry.contentRect.width/entry.contentRect.height));observer.observe(element);return()=>observer.disconnect()},[])
 const resolved=layout==='auto'?(ratio>=1.8?'columns':ratio<=.8?'rows':'split'):layout
 const outerVertical=resolved!=='columns',innerVertical=resolved==='rows',DockIcon=dock==='left'?PanelLeft:dock==='right'?PanelRight:PanelBottom,ExpandIcon=(dock==='left'?!maximized:maximized)?ChevronLast:ChevronFirst
 const LayoutIcon=layout==='auto'?Columns3Cog:layout==='columns'?Columns3:layout==='rows'?Rows3:FileSplitIcon
 const split=(value:number)=>`minmax(0,${value}fr) 8px minmax(0,${100-value}fr)`
 const label=(host:string)=>host==='local'?copy.local:host
 const nextTaskId=useRef(Math.max(...sampleTransfers.map(task=>task.id))+1)
 const playbackTask=useRef<number|null>(null)
 const transfer=(files:DemoFile[],path:string,reverse=false,destination?:string,sampleDrop=false)=>{
  const from=reverse?target:source,to=reverse?source:target,direction=source==='local'?(reverse?'download':'upload'):'remoteTransfer'
  const id=nextTaskId.current++
  if(sampleDrop)playbackTask.current=id
  setTasks(current=>[{id,name:files[0].name,folder:files[0].folder,source:`${label(from)} · ${path}/${files[0].name}`,target:`${label(to)} · ${destination??(to==='local'?'/Projects/demo':'/srv/demo')}`,direction,phase:'transferring',percent:36,size:files.length>1?14680064:2458,...(files.length>1?{batch:files.map(file=>({name:file.name,folder:file.folder}))}:{}),...(direction==='remoteTransfer'?{transport:'viaLocal' as const}:{})},...current])
  setAnnouncement(`${copy.transfers} · ${files[0].name} · ${copy.transferring}`)
 }
 const dragged=useRef<{side:'source'|'target';files:DemoFile[];path:string}|null>(null)
 const endDrag=()=>{
  dragged.current=null
  panel.current?.querySelectorAll('[data-drop-hover]').forEach(el=>el.removeAttribute('data-drop-hover'))
 }
 const drag={
  begin(side:'source'|'target',files:DemoFile[],path:string){dragged.current={side,files,path}},
  accepts(side:'source'|'target'){return !!dragged.current && dragged.current.side!==side},
  drop(destination:string){
   const picked=dragged.current
   if(picked)transfer(picked.files,picked.path,picked.side==='target',destination)
   endDrag()
  },
  end:endDrag,
 }
 const action=(task:DemoTransfer,value:'pause'|'resume'|'cancel')=>{setTasks(current=>current.map(item=>item.id===task.id?controlDemoTransfer(item,value):item));setAnnouncement(`${task.name} · ${copy[value==='pause'?'paused':value==='cancel'?'cancelled':'transferring']}`)}
 return <div className="file-demo" data-layout={resolved} data-layout-mode={layout} data-dock={dock} data-maximized={maximized} data-collapsed={collapsed}>
  <div ref={panel} className="file-demo-panel">
   <span className="file-demo-panel-grip" aria-hidden="true"/>
   <header className="workspace-panel-header"><strong>{copy.title}</strong>
    {scene === 'drop' && !collapsed && <PanelWalkthrough host={panel} locale={locale} scene="drop"
      resetDrop={()=>{const previous=playbackTask.current;setTasks(current=>current.filter(task=>task.id!==previous))}}
      submitDrop={()=>transfer([sampleFiles.find(file=>file.name==='README.md')!],'/Projects/demo',false,'/srv/demo/assets',true)}/>}
    {scene === 'layout' && !collapsed && <PanelWalkthrough host={panel} locale={locale} scene="layout"
      layout={value=>{setLayout(value);setLayoutMenu(false)}} panes={setPaneRatio} queue={setBrowserRatio}/>}
    <div className="workspace-panel-actions">
    <IconButton label={maximized?copy.restore:copy.maximize} onClick={()=>{setCollapsed(false);setMaximized(value=>!value)}}><ExpandIcon style={{transform:dock==='bottom'?'rotate(90deg)':undefined}}/></IconButton>
    <DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.position} title={copy.position}><DockIcon/></DropdownMenuTrigger><DropdownMenuContent align="end" className="file-demo-layout-menu"><DropdownMenuRadioGroup value={dock} onValueChange={setDock}>{(['bottom','left','right'] as const).map(value=>{const Icon=value==='left'?PanelLeft:value==='right'?PanelRight:PanelBottom;return <DropdownMenuRadioItem key={value} value={value} closeOnClick><Icon/>{copy.dock[value]}</DropdownMenuRadioItem>})}</DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>
    {scene === 'layout' ? <Popover.Root open={layoutMenu} onOpenChange={(open, details) => {
      if (open) automaticMenu.current = !details.event.isTrusted
      setLayoutMenu(open)
    }}>
      <Popover.Trigger data-layout-picker="" className="file-demo-icon-button" aria-label={copy.panelLayout} title={copy.panelLayout}><LayoutIcon/></Popover.Trigger>
      <Popover.Portal container={panel}><Popover.Positioner align="end" sideOffset={4} className="site-popup-positioner">
        <Popover.Popup aria-label={copy.panelLayout} className="file-layout-choices floating-surface"
          initialFocus={()=>automaticMenu.current ? false : true} finalFocus={()=>!automaticMenu.current}>
          {layoutOptions.map(({value,Icon,label})=><button key={value} type="button" data-layout-choice={value}
            aria-pressed={layout===value} onClick={()=>{setLayout(value);setLayoutMenu(false)}}><Icon/>{copy[label]}</button>)}
        </Popover.Popup>
      </Popover.Positioner></Popover.Portal>
    </Popover.Root> : <DropdownMenu><DropdownMenuTrigger className="file-demo-icon-button" aria-label={copy.panelLayout} title={copy.panelLayout}><LayoutIcon/></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="file-demo-layout-menu"><DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
        {layoutOptions.map(({value,Icon,label})=><DropdownMenuRadioItem key={value} value={value} closeOnClick><Icon/>{copy[label]}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>}

    <IconButton label={copy.collapse} onClick={()=>onClose?onClose():setCollapsed(true)}><X/></IconButton>
   </div></header>
   {!collapsed && inlinePreview && <FilePreview inline copy={copy} notice={notice}
    file={{...previewFile,key:previewPath,content:documents[previewPath]??previewFile.content}}
    onClose={()=>setInlinePreview(false)} onSave={value=>setDocuments(current=>({...current,[previewPath]:value}))}/>}
   {!collapsed&&!inlinePreview&&<div className="files-body" style={{[outerVertical?'gridTemplateRows':'gridTemplateColumns']:split(browserRatio)} as CSSProperties}>
    <div className="file-demo-browser" style={{[innerVertical?'gridTemplateRows':'gridTemplateColumns']:split(paneRatio)} as CSSProperties}>
     <FileDemoPane dateScene={scene==='dates'} key={scene} drag={drag} locale={locale} side="source" copy={copy} target={source} onTarget={setSource} remoteTransfer={source!=='local'} onTransfer={(files,path)=>transfer(files,path)} onPreview={(file,key)=>setPreview({...file,key,content:documents[key]??file.content})}/>
     <FileDemoSeparator label={copy.resize} vertical={!innerVertical} value={paneRatio} onChange={setPaneRatio}/>
     <FileDemoPane dateScene={scene==='dates'} drag={drag} key={(scene??'')+'-target'} locale={locale} side="target" copy={copy} target={target} onTarget={setTarget} remoteTransfer={source!=='local'} onTransfer={(files,path)=>transfer(files,path,true)} onPreview={(file,key)=>setPreview({...file,key,content:documents[key]??file.content})}/>
    </div>
    <FileDemoSeparator label={copy.resizeQueue} vertical={!outerVertical} value={browserRatio} onChange={setBrowserRatio}/>
    <FileDemoQueue locale={locale} dateScene={scene==='dates'} key={scene} showBatch={scene === 'queue'} copy={copy} tasks={tasks} onAction={action} onClear={id=>setTasks(current=>current.filter(task=>id?task.id!==id:!['completed','cancelled'].includes(task.phase)))}/>
   </div>}
  </div>
  {showNotice && <p className="file-demo-disclosure">{notice}</p>}<span className="sr-only" role="status">{announcement}</span>
  {preview&&<FilePreview key={preview.key} copy={copy} notice={notice} file={preview} onClose={()=>setPreview(null)} onSave={value=>setDocuments(current=>({...current,[preview.key]:value}))}/>}
 </div>
}
