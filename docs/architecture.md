# 项目架构

## 边界与依赖

`app → features → components → lib / Token`。单仓库、单 Next.js App Router 应用。站点公共组件统一使用 Base UI；产品特有编辑器和演示保留在各自模块。主正文优先服务端渲染，编辑器、玻璃与滚动演示按需加载。

## 路由

内部 `app/[locale]`，英文公开地址无前缀，其余语言使用对应的 `/zh-CN`、`/zh-TW`、`/ja`、`/ko`、`/de`、`/fr`、`/ru` 前缀。Proxy 只重写语言路径，跳过资源和 Next 内部路由。语言切换保留产品子路径、query 与 hash。URL 是语言唯一事实源。

`oria-theme` 的 docs/editor 子路由保留原功能；`oria-tab` 的 changelog/privacy 子路由迁移到产品下。元数据统一由公共函数生成。内部 `/en` 可访问但 canonical 始终指向无前缀英文地址，避免重写后再次重定向形成循环。

根布局只管理 Provider 和跳转正文，不包含站点顶栏/页脚。品牌首页、Theme、Tab、Tunnel 各自渲染一套头尾；共用的是 SiteControls、产品注册表和页脚关联链接；顶栏不再提供系列菜单。产品采用显式路由目录，便于保留 docs/editor/changelog/privacy 子路由。

## 主题

OriaTheme 是全站唯一持久主题状态源。44 个 OriaTheme 预设与迁移的 Liquid glass 预设、当前主题、system/light/dark、DOM Token 和主题过渡在公共 Provider 管理。存储前缀使用 `oria-made-theme`，实际键为 `oria-made-theme:state:v1` 与 `oria-made-theme:active:v1`。首屏 bootstrap 与 Provider 使用相同契约、默认值和存储键；存储异常回退默认主题。OriaTab 演示可使用局部主题预览，但不覆写全站偏好。

## 国际化

共享控件沿用 react-i18next；服务端按 locale 读取内容，客户端 Provider 使用隔离实例。全站提供 en、zh-CN、zh-TW、ja、ko、de、fr、ru。`preference.ts` 的 head bootstrap 在 React 启动前处理无前缀入口：优先读取 `oria-made-language`，其次匹配浏览器 `navigator.languages` 的有序偏好（含繁简中文脚本及地区），不支持时回退英语；显式语言前缀始终优先，跳转保留子路径、query、hash，使用 replace 避免返回循环。语言菜单保存手动选择，沿用原存储键。页面与元数据继续静态生成，URL 仍是渲染语言的事实源。公共控件使用隔离的 i18next 实例；Theme 文档与编辑器、品牌和 Tunnel 介绍使用静态文案字典，不在访问时请求翻译服务。代码、Token 路径、URL 与用户主题名称不翻译。Tunnel 演示 UI 直接提取原应用八语言文案。

## 官网场景与布局

根布局中的 `SiteBackground` 按路由加载不同的 React Bits 效果：品牌页 Waves 流线、Theme 的 Aurora 光场、Tab 的 Particles 粒子、Tunnel 的 RippleGrid 点阵。场景绝对定位在文档顶部，独立于正文最大宽度，横向覆盖浏览器两侧；场景随页面滚动，并向下淡出，不固定在视口。阅读子页降低强度，离屏/隐藏时停止绘制。主题色、实时减少动态效果、各自静态回退及高对比度分支共用约定；装饰场景限为 30fps，不展示右上角暂停控件。四种源码按需分包，无新增包依赖。

`components/site/marketing.css` 是四站导航的统一几何入口：顶部 12px、最大宽度 1280px、内层高度 56px、桌面内边距 12px；1100px 及以下统一切换紧凑导航，左右外距 16px、内边距 10px。保留页顶透明/滚动材质。只有产品官网以纯文字 `HomeLink` 和 14px 分隔线区分品牌首页；GitHub 仅保留图标，在其右侧用 14px 分隔线隔开页面控件。

品牌首页的产品卡片只使用 `oria-product-card` 与 `data-product`，不使用产品页面根类，避免 `.oria-theme` 外壳样式污染卡片。三产品图标区、内容起点、底色与高度一致。Theme 的 `website.css` 管理官网布局与真实主题预览，原迁移样式仍由 source/showcase 生成。Tab 功能卡片区分宽窄层次，Tunnel 工作流使用交替图文布局，均复用原演示。

公共 `components/site/theme-materials.css` 使用 OriaTheme 的纹理、渐变、字体、字重、圆角、边框宽度与阴影 Token 定义官网表面，避免主题仅更换颜色。卡片不普遍叠加额外 backdrop-filter，以保留各主题材质并控制绘制成本。

公共 `components/ui/reveal.tsx` 从 Theme 的原入口迁出，管理入场与滚动揭示；减少动态效果时静态显示，不叠加另一套卡片滚动动画。Tunnel 原先使用前景文字色的外阴影改为 OriaTheme 阴影 Token，深色下保持暗部层次。

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

`/oria-tunnel/download` 使用静态清单，当前固定为 GitHub v0.3.0，不在访问时请求 latest。包含 Windows x64/ARM64、macOS Apple Silicon/Intel 安装包和 DMG ZIP 备选。系统和架构识别仅在浏览器本地选择链接，不上传设备信息；信息不足时进入平台选择区，不猜测 Mac 芯片。首页、顶栏和页脚均提供八语言下载入口。

## 浏览器标签

`pageMetadata` 按路由确定产品身份。首页和产品首页以品牌名为标题，子页采用“本地化页面名称 · 产品名”，不重复追加 Oria。Open Graph 使用同一标题。首页使用 Oria 圆环图标，三个产品及其子页使用各自纯图标；根目录提供 SVG 与 32px ICO。404 标题统一为 404 · Oria。

Tunnel 官网同步 v0.1.1 的主机关联服务、独立服务端口与 D 代理浏览器说明。演示服务按主机分组，共享服务选择同步；D 在模拟监听时可选择 Chrome、Edge、Firefox，仅显示模拟提示。单条规则按钮与同一份状态同步启停，图谱、列表、计数、批量和场景选择共用工作区内存状态。下载页的历史版本区使用 v0.2.0 文件工作区说明，更早版本由官方 GitHub 发布归档提供。

## OriaTab 演示与阅读页面

OriaTab 首页提供服务端产品分区与六场景客户端预览，继续复用原产品组件、Aide、SVG 壁纸与玻璃实现。预览使用无存储、脱离 document 的局部 Runtime，跟随全站预设、自定义主题和明暗；演示内的临时主题/强调色不覆盖站点偏好。只有 Liquid glass 的可见主预览启用 WebGL，静态功能近景使用 CSS 材质；近景接近视口才挂载，离开后释放，主演示离屏或隐藏时停止播放和玻璃场景。玻璃事件、动画读缓存限定在自身作用域，避免页面其他控件触发重复捕获。场景在父级 ref 挂载完成后初始化，传入作用域时不回退整页，嵌套场景继承父级启停。演示数据与扩展 API 及真实服务保持隔离。

`subpage.tsx` 提供 Tab 私有阅读页标题与前后导航，日志和政策各自服务端渲染。政策正文按原语言资源保留，网站访问事实单独维护在 `privacy-copy.ts`；其他产品不依赖这一阅读布局。

## OriaTunnel 文件工作区预览

官网对照 `/Volumes/T7/Projects/OriaTunnel` 的正式标签 v0.2.0（源提交 `f8ccbe7`）同步文件工作区演示。`file-update-copy.ts` 管理八语言正式发布与功能说明，首页和下载页复用 `file-update.tsx`，下载页的历史版本入口指向该版五项更新，当前发布说明指向 v0.3.0 的 VNC 更新。

`file-demo.tsx` 在新功能区与原生窗口的文件按钮中复用。`native-file-artwork` 保留原文件/文件夹/磁盘/批次图标的完整几何、类型颜色、主题圆角和减少动态效果分支；`native-file-path`、`native-file-breadcrumb` 与 `native-file-options` 仅适配语言与纯路径数据。`native-files.css` 来自原样式，限定在 `.file-demo`，不加载原生桥接。浏览、筛选、多选、队列操作、文本草稿与保存均只处理页面内示例状态，不读取本机文件、不连接 SSH、不执行命令、不持久保存演示内容。来源版本、工作区状态与逐文件摘要见 `migration-sources.json`。
