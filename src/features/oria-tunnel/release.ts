import release from './release-assets.json'

export const tunnelRelease = release
export const installers = [
  {id:'mac-arm64',os:'macos',label:'macOS · Apple Silicon',architecture:'Apple Silicon',file:'OriaTunnel_0.1.0_aarch64.dmg',zip:'OriaTunnel_0.1.0_aarch64.zip'},
  {id:'mac-x64',os:'macos',label:'macOS · Intel',architecture:'Intel',file:'OriaTunnel_0.1.0_x64.dmg',zip:'OriaTunnel_0.1.0_x64.zip'},
  {id:'windows-x64',os:'windows',label:'Windows · x64',architecture:'x64',file:'OriaTunnel_0.1.0_x64-setup.exe'},
  {id:'windows-arm64',os:'windows',label:'Windows · ARM64',architecture:'ARM64',file:'OriaTunnel_0.1.0_arm64-setup.exe'},
] as const
export type Installer = typeof installers[number]
export type PlatformInfo = {
  userAgent?:string; platform?:string; architecture?:string; bitness?:string
  mobile?:boolean; maxTouchPoints?:number
}
export type DownloadPlatform = {os:'macos'|'windows'|null;installer:Installer|null}

/** Do not infer Mac chip architecture from “Intel” in the reduced user agent. */
export function detectDownloadPlatform(info:PlatformInfo):DownloadPlatform {
  const ua=info.userAgent??'',platform=info.platform??'',arch=info.architecture??''
  if(info.mobile||/Android|iPhone|iPad|iPod/i.test(ua)||(/Mac/i.test(platform)&&(info.maxTouchPoints??0)>1))return {os:null,installer:null}
  const os=/mac/i.test(platform)||/Macintosh/i.test(ua)?'macos':/win/i.test(platform)||/Windows/i.test(ua)?'windows':null
  if(!os)return {os:null,installer:null}
  const arm=/arm|aarch64/i.test(arch)||/ARM64|aarch64/i.test(ua)
  const x64=(/x64|amd64/i.test(arch)||(/x86/i.test(arch)&&info.bitness==='64'))||(/Win64|WOW64|x64/i.test(ua)&&!arch)
  const id=arm?(os==='macos'?'mac-arm64':'windows-arm64'):x64?(os==='macos'?'mac-x64':'windows-x64'):null
  return {os,installer:installers.find(item=>item.id===id)??null}
}

export function installerAsset(installer:Installer) {return release.assets[installer.file]}
export function fileSize(bytes:number) {return `${(bytes/1024/1024).toFixed(1)} MB`}
