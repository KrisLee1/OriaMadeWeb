import {CodeXml, FolderSync, Monitor, Network, ShieldCheck, Terminal} from 'lucide-react'
import type {Locale} from '@/i18n/config'
import {localize} from '@/i18n/localize'
import {tunnelContent} from './content'
import {vncUpdateCopy} from './vnc-update-copy'

const capabilityIcons = [Network, FolderSync, Terminal, CodeXml]

export function getTunnelFeatures(locale: Locale) {
  const {capabilities, principles} = tunnelContent[locale]
  return [
    {icon: Monitor, kicker: 'VNC', title: vncUpdateCopy[locale].title,
      description: localize(locale, 'Open the desktop from a listening VNC forward. Use the keyboard and mouse, zoom in or work full screen.', '从正在监听的 VNC 转发打开桌面，用键盘和鼠标操作，按需缩放或切换全屏。')},
    ...capabilities.cards.map((card, index) => ({...card, icon: capabilityIcons[index]})),
    {icon: ShieldCheck, kicker: principles.eyebrow, title: principles.title, description: principles.description},
  ]
}
