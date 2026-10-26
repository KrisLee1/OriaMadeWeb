# 项目架构

## 边界与依赖

`app → features → components → lib / Token`。单仓库、单 Next.js App Router 应用。站点公共组件统一使用 Base UI；产品特有编辑器和演示保留在各自模块。主正文优先服务端渲染，编辑器、玻璃与滚动演示按需加载。

## 路由

内部 `app/[locale]`，英文公开地址无前缀，其余语言使用对应的 `/zh-CN`、`/zh-TW`、`/ja`、`/ko`、`/de`、`/fr`、`/ru` 前缀。Proxy 只重写语言路径，跳过资源和 Next 内部路由。语言切换保留产品子路径、query 与 hash。URL 是语言唯一事实源。

`oria-theme` 的 docs/editor 子路由保留原功能；`oria-tab` 的 changelog/privacy 子路由迁移到产品下。元数据统一由公共函数生成。内部 `/en` 可访问但 canonical 始终指向无前缀英文地址，避免重写后再次重定向形成循环。

根布局只管理 Provider 和跳转正文，不包含站点顶栏/页脚。品牌首页、Theme、Tab、Tunnel 各自渲染一套头尾；共用的是 SiteControls、产品注册表和页脚关联链接；顶栏不再提供系列菜单。产品采用显式路由目录，便于保留 docs/editor/changelog/privacy 子路由。

## 主题

OriaTheme 是全站唯一持久主题状态源。44 个 OriaTheme 预设与迁移的 Liquid glass 预设、当前主题、system/light/dark、DOM Token 和主题过渡在公共 Provider 管理。存储键使用 `oria-made-theme`。首屏 bootstrap 与 Provider 使用相同契约、默认值和存储键；存储异常回退默认主题。OriaTab 演示可使用局部主题预览，但不覆写全站偏好。

## 国际化

共享控件沿用 react-i18next；服务端按 locale 读取内容，客户端 Provider 使用隔离实例。全站提供 en、zh-CN、zh-TW、ja、ko、de、fr、ru。公共控件使用隔离的 i18next 实例；Theme 文档与编辑器、品牌和 Tunnel 介绍使用静态文案字典，不在访问时请求翻译服务。代码、Token 路径、URL 与用户主题名称不翻译。Tunnel 演示 UI 直接提取原应用八语言文案。

## 目录

- `src/app`：路由、布局、SEO。
- `src/components`：公共 UI、站点框架、迁移的三个切换组件。
- `src/features/oria-theme`：迁移的主题官网、文档和编辑器。
- `src/features/oria-tunnel`：产品叙事、原生窗口的 DOM 演示与独立状态场景；不加载 Tauri、SSH 或凭据模块。
- `src/features/oria-tab`：迁移的 Tab 官网及仅用于演示的共享代码。
- `src/content`：产品注册表和翻译。
- `src/i18n`：语言配置、地址生成、Provider。
- `src/lib`：主题初始化、SEO、公共工具。
- `public/products`：按产品隔离的静态资源及许可证。
- `scripts`：来源记录、构建辅助和验证。

## 部署

使用 Cloudflare Workers 与 OpenNext，保留 Next.js 和静态预渲染。静态缓存使用 Workers Static Assets，不引入 R2、KV、数据库或 CMS。GitHub Actions 负责检查，Cloudflare Workers Builds 关联 main 自动部署。主域名为 oriamade.com；www.oriamade.com、oriamade.cn 与 www.oriamade.cn 均通过 Cloudflare 代理 DNS 和边缘规则执行保留路径与查询参数的 301 跳转。当前实际接入状态见项目状态，操作见部署指南。

## Tunnel 演示边界

官网用独立数据重建原应用的五页工作区与停靠终端。原生窗口以 1178 × 780 排版，图谱内部 viewport 单独缩放，再随官网容器同比展示。主题、模式和语言继续由站点 Provider 管理。状态、分组、搜索、复选框、批量演示启停和暂停动态均为浏览器会话内交互；不会发起连接或执行命令。停止／失败连线为中性虚线；建立过程为规则色流动虚线；监听为规则色实线与 2800ms 光带。减少动态效果时保留静态状态并停用流动。

## 顶栏与下载

首页、Theme 与 Tunnel 共用滚动材质状态，始终固定可见。顶栏页顶透明，滚动后成为主题悬浮层；产品导航内容仍归各模块。Positioner 层级高于顶栏和移动导航。品牌字由 BrandName 统一管理。

`/oria-tunnel/download` 使用静态清单，当前固定为 GitHub v0.1.1，不在访问时请求 latest。包含 Windows x64/ARM64、macOS Apple Silicon/Intel 安装包和 DMG ZIP 备选。系统和架构识别仅在浏览器本地选择链接，不上传设备信息；信息不足时进入平台选择区，不猜测 Mac 芯片。首页、顶栏和页脚均提供八语言下载入口。

## 浏览器标签

`pageMetadata` 按路由确定产品身份。首页和产品首页以品牌名为标题，子页采用“本地化页面名称 · 产品名”，不重复追加 Oria。Open Graph 使用同一标题。首页使用 Oria 圆环图标，三个产品及其子页使用各自纯图标；根目录提供 SVG 与 32px ICO。404 标题统一为 404 · Oria。

Tunnel 官网同步 v0.1.1 的主机关联服务、独立服务端口与 D 代理浏览器说明。演示服务按主机分组，共享服务选择同步；D 在模拟监听时可选择 Chrome、Edge、Firefox，仅显示模拟提示。单条规则按钮与同一份状态同步启停，图谱、列表、计数、批量和场景选择共用工作区内存状态。八语言更新日志由 `updates-copy.ts` 管理，首页与下载页复用。更新区的 D 卡片近景直接复用工作区 `RuleContent` 与原浏览器菜单；原生演示样式由 Tunnel 布局统一加载。

## OriaTab 演示与阅读页面

OriaTab 首页改为服务器渲染的产品分区与六场景客户端预览。原产品组件、Aide 原生窗口、SVG 壁纸、WebGL 液态玻璃及编排用于按需演示；功能近景延迟挂载。`story-runtime.tsx` 为每个预览创建默认 Liquid glass、无存储、ShadowRoot target 的局部 OriaTheme Runtime；网站明暗变化单独同步，局部主题/强调色不覆盖 document 或持久偏好。演示数据仍与浏览器扩展 API 及真实服务隔离。

`subpage.tsx` 提供 Tab 私有阅读页标题与前后导航，日志和政策各自服务端渲染。政策正文按原语言资源保留，网站访问事实单独维护在 `privacy-copy.ts`；其他产品不依赖这一阅读布局。
