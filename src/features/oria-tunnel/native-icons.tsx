// Pure presentation extracted from OriaTunnel (GPL-3.0-only).
// See docs/licenses/OriaTunnel-GPL-3.0.txt and docs/migration-sources.json.
// Brand SVG paths retain their source and license metadata in native-assets/service-icons.json.
import type {CSSProperties} from 'react'
import {BracesIcon,CodeIcon,DatabaseIcon,GlobeIcon,GraphStarIcon,NetworkIcon,SquareTerminalIcon,TerminalIcon,type LucideProps} from 'lucide-react'
import serviceIcons from './native-assets/service-icons.json'

const builtinIcons={code:CodeIcon,braces:BracesIcon,database:DatabaseIcon,globe:GlobeIcon,network:NetworkIcon}
const glyphStyle:CSSProperties={width:18,height:18}
const iconStyle:CSSProperties={display:'inline-flex',flex:'0 0 20px',width:20,height:20,alignItems:'center',justifyContent:'center',fontFamily:'"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',fontSize:18,fontWeight:'normal',lineHeight:1}

/** The original ConnectionIcon renderer, without its editor, picker or native state. */
export function NativeConnectionIcon({name,color}:{name?:string|null;color?:string|null}) {
  const Glyph=name&&Object.hasOwn(builtinIcons,name)?builtinIcons[name as keyof typeof builtinIcons]:undefined
  const brand=name&&Object.hasOwn(serviceIcons.icons,name)?serviceIcons.icons[name as keyof typeof serviceIcons.icons]:undefined
  if(!Glyph&&!brand)return <span className="connection-color-dot" aria-hidden="true" style={{display:'inline-block',flex:'0 0 8px',width:8,height:8,borderRadius:'50%',boxShadow:'0 0 0 1px color-mix(in srgb, var(--oria-color-fg) 10%, transparent)',backgroundColor:color||'var(--oria-color-accent)'}}/>
  return <span className="connection-icon" style={{...iconStyle,color:color||'var(--oria-color-primary)'}} aria-hidden="true">
    {Glyph?<Glyph size={18} style={glyphStyle}/>:brand?<svg viewBox={brand.viewBox} width={18} height={18} style={glyphStyle} fill="currentColor" aria-hidden="true" focusable="false">{brand.paths.map((path,index)=><path key={index} d={path}/>)}</svg>:null}
  </span>
}

/** The app's bottom-status icon, using its exact Lucide icon and 13px size. */
export function NativeGraphStarIcon(props:LucideProps){return <GraphStarIcon size={13} {...props}/>}

/** AboutButton's original transparent logo in the original 24px Avatar footprint. */
export function NativeAboutIcon(){return <img src="/products/oria-tunnel/logo.svg" alt="" width={24} height={24} style={{display:'block',width:24,height:24,objectFit:'contain',borderRadius:'50%'}}/>}

/** Header workspace entry uses Terminal; host entries use SquareTerminal. */
export function NativeTerminalIcon({workspace=true,...props}:LucideProps&{workspace?:boolean}){const Icon=workspace?TerminalIcon:SquareTerminalIcon;return <Icon {...props}/>}
