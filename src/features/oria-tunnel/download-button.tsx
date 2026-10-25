'use client'

import {useEffect,useState} from 'react'
import {Download} from 'lucide-react'
import {localizedPath,type Locale} from '@/i18n/config'
import {downloadCopy} from './download-copy'
import {detectDownloadPlatform,installerAsset,type DownloadPlatform,type PlatformInfo} from './release'

type ClientHints = PlatformInfo & {getHighEntropyValues?:(hints:string[])=>Promise<PlatformInfo>}

export function TunnelDownloadButton({locale}:{locale:Locale}) {
  const [platform,setPlatform]=useState<DownloadPlatform>({os:null,installer:null})
  useEffect(()=>{
    let active=true
    const hints=(navigator as Navigator & {userAgentData?:ClientHints}).userAgentData
    const base={userAgent:navigator.userAgent,platform:hints?.platform??navigator.platform,mobile:hints?.mobile,maxTouchPoints:navigator.maxTouchPoints}
    setPlatform(detectDownloadPlatform(base))
    hints?.getHighEntropyValues?.(['architecture','bitness']).then(values=>{
      if(active)setPlatform(detectDownloadPlatform({...base,...values}))
    }).catch(()=>{/* The system-specific choices remain available when hints are blocked. */})
    return()=>{active=false}
  },[])
  const c=downloadCopy[locale]
  const system=platform.installer?.label??(platform.os==='macos'?'macOS':platform.os==='windows'?'Windows':null)
  const href=platform.installer?installerAsset(platform.installer).url:localizedPath(locale,'/oria-tunnel/download')+(platform.os?'#'+platform.os:'#platforms')
  return <a className="tunnel-button tunnel-button-primary tunnel-download-button" href={href} data-download-platform={platform.installer?.id??platform.os??'choose'}><Download size={17}/>{system?c.downloadFor.replace('{platform}',system):c.download}</a>
}
