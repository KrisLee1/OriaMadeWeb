import {locales} from '@/i18n/config'
import {localize} from '@/i18n/localize'
const sourceContent = {
  en: {
    metadata: 'Manage SSH tunnels, work in local and remote terminals, transfer files over SFTP and open VNC desktops on Windows or macOS.',
    nav: [
      {id: 'workspace', label: 'Connection map'},
      {id: 'terminal', label: 'Terminal'},
      {id: 'files', label: 'File transfer'},
      {id: 'vnc', label: 'VNC'},
    ],
    hero: {
      title: 'A workspace for SSH tunnels',
      map: 'Connection map',
      demo: 'Interactive workspace',
    },
    principles: {
      eyebrow: 'Local connections and credentials',
      description: 'SSH connections originate on your device. You control host verification, credentials and configuration exports.',
      points: [
        {title: 'Verify the host', description: 'Review SHA256 host fingerprints on first connection, including each ProxyJump hop.'},
        {title: 'Choose what is stored', description: 'Use SSH Agent or private keys. Passwords can be saved to the OS credential store only when you choose.'},
        {title: 'Export without secrets', description: 'Configuration export excludes passwords, private key contents, trust records and runtime output.'},
      ],
    },
  },
  'zh-CN': {
    metadata: '在 Windows 或 macOS 上管理 SSH 隧道，切换本地与远程终端，通过 SFTP 传输文件或打开 VNC 桌面。',
    nav: [
      {id: 'workspace', label: '连接图'},
      {id: 'terminal', label: '智能终端'},
      {id: 'files', label: '文件传输'},
      {id: 'vnc', label: 'VNC'},
    ],
    hero: {
      title: 'SSH 隧道\n工作区',
      map: '连接图',
      demo: '交互工作区',
    },
    principles: {
      eyebrow: '本地连接与凭据',
      description: 'SSH 连接由本机发起。你可以核对主机指纹、选择凭据的保存方式，并导出配置。',
      points: [
        {title: '核对每一跳', description: '首次连接核对 SHA256 主机指纹，ProxyJump 路线中的每一跳也不例外。'},
        {title: '由你决定保存什么', description: '支持 SSH Agent 与私钥；只有你主动选择时，密码才会写入系统凭据库。'},
        {title: '导出配置，不导出秘密', description: '配置导出不包含密码、私钥正文、信任记录与运行输出。'},
      ],
    },
  },
} as const

export type TunnelContent = (typeof tunnelContent)[keyof typeof tunnelContent]
export type TunnelLocale = import('@/i18n/config').Locale
export const tunnelContent = Object.fromEntries(locales.map(locale => [locale, localize(locale, sourceContent.en, sourceContent['zh-CN'])])) as Record<TunnelLocale, typeof sourceContent.en>
