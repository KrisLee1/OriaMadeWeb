# UI 开发入口

先阅读 [架构](architecture.md) 和 [状态](PROJECT_STATUS.md)，再查阅 [组件目录](ui/components/index.md)。

技术：Next.js、React、TypeScript、Tailwind CSS、OriaTheme、shadcn/ui（Base UI）、Lucide、Motion、react-i18next。版本以 package-lock.json 为准。

公共 UI 放 src/components/ui；产品私有 UI 留在 features。颜色/圆角/阴影使用 OriaTheme Token。使用现有组件优先于新增组件，不引入第二套主题状态。迁移源的专属展示保持作用域隔离。

必须覆盖：键盘焦点、图标控件可访问名称、320px 布局、浅深色、系统模式、减少动态效果。浏览器专属初始化不得在服务器模块求值期间访问 DOM。

验证入口：npm run typecheck、npm run build；关键跨产品流程追加浏览器验证。仅在能力或约束变化时维护文档。

产品头尾归各自布局管理，根布局不添加统一顶栏。关联入口只放在产品页脚，不在顶栏增加系列按钮。OriaTab 顶栏 Logo 使用透明的 assets/logo.svg；带底框的 favicon.svg 仅用于浏览器图标场景。

## 产品导航与语言

无前缀入口通过 `src/i18n/preference.ts` 的 head bootstrap 恢复手动语言偏好，首次按浏览器语言顺序匹配；显式前缀不被重定向。调整语言初始化须验证保存优先级、繁简地区、存储禁用、深链接和无循环。

## 官网布局、导航与场景

公共导航几何统一：顶部 12px、最大宽度 1280px、内层 56px、桌面水平内边距 12px；1100px 及以下左右外距 16px、内边距 10px。保留固定透明/滚动材质形态。只有三个产品官网将 `HomeLink` 文本与产品导航用 14px 垂直分隔线隔开；不加返回图标，品牌首页不增加独立返回入口。移动菜单单独分组；GitHub 仅图标，右侧用 14px 短线隔开页面控件，不显示文字、箭头或 star 数。

根布局的 `@/components/backgrounds/site-background` 按站点选择 Waves / Aurora / Particles / Tunnel DotGrid 点阵。场景随页面滚动、向下淡出，横向独立于正文容器覆盖浏览器两侧；不得改为固定视口，也不能被 hero 的 max-width 或 overflow 裁切。文档子页降低背景强度，Tunnel 首页与下载页使用相同点阵强度。装饰背景以 30fps 绘制，不展示右上角暂停控件；实时 reduced-motion、离屏/隐藏停止、WebGL 静态回退和高对比度共用生命周期。来源与许可见 [迁移说明](MIGRATION.md#react-bits-交互背景2026-11-05)。

品牌卡片使用 `data-product` 区分产品，不可使用 `.oria-theme` 等页面根类。品牌私有样式在 `features/brand/home.css`；Theme 新官网布局在 `features/oria-theme/website.css`，不直接编辑生成的 migrated.css。共享入场使用 `@/components/ui/reveal`，避免同时在同一张卡片叠加 CSS 滚动揭示。Theme 首屏的预览按钮通过原有主题草稿守卫切换真实站点主题。

## 公共导航规则

全站八语言由 `src/i18n/config.ts` 注册。新增或调整文案须同步 `src/i18n/messages/`，插值名必须保持不变。原代码示例与 Token 标识保持原文。公共图标设置按钮不叠加方形边框和下拉箭头。Theme 宽屏导航保持一行，1100px 及以下统一使用紧凑导航，菜单锚定整个顶栏，宽度与左右边缘一致。

## OriaTunnel 产品页

入口为 `/{locale}/oria-tunnel`；产品顶栏位于 `src/features/oria-tunnel/header.tsx`，始终固定可见，带 GitHub 品牌图标，依次提供连接图、智能终端、文件传输、VNC 与下载导航，并标记当前章节。

`demo.tsx`、`native-demo.css` 重建原生窗口的五个页面与独立停靠终端。Mac 窗口使用 OriaTheme 的 radius-lg 圆角，胶囊、原始 Lucide 图标、服务 SVG 和 GraphStar 状态图标均按迁移源维护。窗口整体缩放与连接图内部 viewport 分开计算；不为缩略窗口换用另一套图标顶栏。原图对照仅在本地 `public/products/oria-tunnel/screenshots/` 保留，不纳入本轮提交与部署；官网演示本身不使用截图。

列表滚动容器以 16px 内边距与负外边距给阴影留出绘制空间，同时保持卡片与工具栏对齐；不可用取消滚动或去掉主题阴影规避裁切。

`simulation.ts` 定义独立的演示场景；`connection-stroke.tsx` 沿用原应用的虚线与 2800ms 光带。场景、暂停和批量演示启停必须明确为模拟，不可接入 Tauri、真实主机、凭据或 SSH。状态文案直接来自 `locales/` 的八语言资源，版权与原路径见 [迁移说明](MIGRATION.md)。

## 共享顶栏与下载

首页、Theme、Tab、Tunnel 共用 `useScrollHeader`，页顶透明融入背景，滚动后显示悬浮材质，不再按方向隐藏。透明度、模糊、饱和度、圆角、边框和阴影使用 OriaTheme Token。品牌文字使用 `BrandName`，统一字重与字距，产品后缀采用主题色；Theme 使用纯图标 `color-swatch-fan.svg`。

弹层由 Positioner 管理：顶栏 60、移动导航 90、Select/Menu 120。公共弹层通过 `.floating-surface` 使用当前主题的浮层色、透明度、模糊与饱和度；减少透明度时使用实色。公共选择弹层必须使用 `site-popup-positioner`，不能低于顶栏。主题与语言菜单在按钮下方展开。菜单、首屏和滚动入场支持减少动态效果；滚动动画同时检查 animation-timeline 与 animation-range。

下载页 `/oria-tunnel/download` 提供完整八语言。`release-assets.json` 保存 v0.4.0 的发布文件信息。下载页从清单中展示四个 DMG / EXE 安装包及大小；维护时须使用该版本真实值，不沿用旧版元数据。主按钮使用浏览器系统及可用架构信息；不足时定位相应平台选择区。不能把 macOS UA 中的 Intel 当作实际芯片。仅在用户点击时下载，不在页面加载时自动下载文件。

Tunnel 的「状态演示」及列表分组统一使用公共 Base UI Select，不使用 HTML 原生 select。窗口外框与原生 surface 共同使用 radius-lg，按预览比例缩放，避免外框与内容的圆角不一致。

首页、Theme 与 Tunnel 导航靠左排列，首项为保持当前语言的 Oria 首页；窄屏菜单沿用相同入口顺序。

Tab 的内联 Dawn 壁纸使用 SVG xMidYMid slice 铺满预览，避免宽高比变化产生黑边。新标签场景不展示 Ctrl+T 应用快捷键；Aide 的快捷键提示保持原行为。

Tunnel v0.1.1 演示：服务默认按 SSH 主机分组，列表图标使用各服务的示例颜色，不在列表项显示端口，共享服务的复选框保持同步。D 的独立浏览器菜单复用 Base UI DropdownMenu，只有模拟监听状态可用；选择后仅显示服务端点与演示提示。Chrome/Edge/Firefox 标识本地加载，出处与许可证见 `public/products/oria-tunnel/licenses/NOTICE.txt`。单条启停按钮根据活动状态显示「停止」或「启动」，与连接图、转发列表及底部运行数量共享状态。


下载页按 macOS 和 Windows 并列展示架构选项与安装说明，窄屏使用单列。`#release-notes` 链接安装包对应的正式发布、完整发布归档、快速上手和首页的智能终端演示。

D 卡片地址行仅保留 Globe 浏览器入口，移除旧列表管理图标与 D 外链图标，底部不重复放置浏览器入口。更新区只展示原生 D 卡片与浏览器弹层，不显示画布背景、窗口边框、底部计数或附加说明；卡片最大宽度为 340px，高度随内容与缩放自动测量。

## OriaTab 产品页与演示

`src/features/oria-tab/page.tsx` 提供常规滚动的产品首页；`shell.tsx` 复用固定滚动材质、公共 GitHub 入口、Base UI 移动菜单与站点设置。原九幕内容保留为服务端功能、外观、隐私、系列与安装介绍；首屏改为六个 Base UI Tabs 演示场景，支持重播、暂停、键盘切换和减少动态效果。旧章节锚点对应各自内容区。

演示继续复用 `website/story/stage.tsx` 的产品组件、原生 Aide 窗口与 `shared/lib/glass` 的 WebGL 渲染，不接入扩展 API、搜索或 AI 请求。对照只读 OriaTab `src/App.tsx`、`src/styles.css`、`src/features/bookmarks.tsx` 和 `src/features/aide.css` 校准页眉、居中搜索、Dock、920×560 书签窗与 760×720 Aide 窗。功能近景复用同一批组件，按接近视口时加载。

每个演示使用 storage:false、脱离 document 的 Runtime，跟随全站预设/自定义主题与明暗；局部预览不保存至站点偏好。仅可见的 Liquid glass 主演示启用原 WebGL；静态近景用同一产品组件和 CSS 材质，离屏卸载。主故事离屏/隐藏暂停，恢复后继续原播放位置。玻璃采集和文档事件必须限定自身作用域；场景初始化等待父级 ref 挂载完成，传入作用域时不能回退 document.body，嵌套设备场景继承父级启停。全站材质由 `components/site/theme-materials.css` 管理，圆角、边框、字体、渐变、纹理、阴影不能用固定值覆盖主题定义。

更新日志与隐私政策使用 `subpage.tsx` 的产品私有阅读布局。更新日志保留版本锚点、时间、原更新内容和完整历史入口；隐私页提供章节目录、原有正文及独立横向滚动表格。网站访问说明位于 `privacy-copy.ts`，与扩展行为分开维护；当前 Cloudflare Workers 说明链接官方隐私政策。

## OriaTunnel 远程桌面与文件界面

首页依次展示 `#workspace` 连接图、`#terminal` 智能终端、`#files` 文件传输和 `#vnc` 远程桌面。连接图内的标签可切换主机、转发、服务和日志视图。`file-update.tsx` 展示 SFTP 工作区，`vnc-update.tsx` 展示可操作的查看器。VNC 窗口的地址、窗口按钮、缩放及工作区按钮按原版 VncHeader 布局，文件和终端复用 `FileWorkspaceDemo`、`TerminalDock` 及既有 SVG 图标。官网查看器的胶囊顶栏常驻。VNC 的四张功能卡依次展示桌面、双向文本剪贴板、上二下一布局的 SFTP 工作区、右侧 SSH 终端。两处工作区共用面板开合过渡，并遵循系统减少动态效果设置。远端区域使用静态壁纸与页面内存示例窗口。首页导航、连接图和转发列表中已监听的 5900 端口示例规则指向 `#vnc`。`file-demo.tsx` 同时用于独立文件近景与 `WorkspaceDemo` 的停靠面板。Tunnel 顶栏在 1100px 及以下切换为紧凑 GitHub 入口与移动菜单，避免新增导航后长语言控件越界。原始的分层文件图标、路径折叠导航与更多菜单分别位于 `native-file-artwork`、`native-file-path`/`native-file-breadcrumb`、`native-file-options`，保留来源与 GPL-3.0-only 声明。

还原文件区时优先复用上述原版纯展示代码，不用普通 Lucide 文件夹/文件图标替代分层图形。标题行放端点选择、选中数量和传输按钮；路径行保留前进/后退/上级/刷新、折叠面包屑、路径输入、搜索弹层、当前视图与更多菜单；不增加原应用没有的列表表头或底部操作栏。列表行保留大小与修改日期，图标视图使用原版 56px 图形；传输区保留文件/批次图标、方向、大小、状态、分组/排序与批次展开。Base UI 管理弹层，主题值来自 OriaTheme。

第五张卡演示跨主机拖放。可以把示例文件拖到另一侧目录，释放后由相同的传输队列展示源、目标与方向。手动拖放和播放模式共用原版 FileArtwork：光标中心显示 32px 的被拖条目图标，多选时在右上角显示数量。播放模式使用 README.md，目标为远端 assets 目录。

所有演示数据独立在 `file-demo-state.ts`，原版八语言界面词按需提取到 `locales/files/`。搜索、多选、目录、编辑和队列操作仅改变浏览器内存。进度是明确标注的静态示例值，不模拟真实传输成功，不接入文件系统/SSH/原生 API。

首页首屏由产品介绍与一个工作区组成。`workspace-tour.tsx` 将五个场景入口、原生窗口标签和操作说明同步至同一个选中项。连接图、转发、服务、主机和日志均有可暂停、重播或接管的操作。首页与下载页首屏复用 `tunnel-dot-grid.tsx` 并跟随当前主题。Tunnel 顶栏、首页、下载页和页脚共用 1180px 版心，桌面左右至少留 40px，760px 及以下留 20px。演示章节、下载平台与页脚使用 Reveal 一次入场，减少动态效果时直接显示。演示选择卡、安全说明、安装包、下载资源和页脚卡片共用 `.tunnel-card` 的边框、表面色与圆角。

智能终端与 VNC 在左侧放置功能卡，文件传输在右侧放置功能卡。桌面演示与卡片列等高，窄屏将所选卡片对齐到演示下方。功能卡使用上图下标题的双列网格，奇数张的第一张横跨两列。实景窗口与卡片网格的上下边缘对齐，控件与说明独立排在下方。可见演示区使用原生滚动容器，滚动推进所选项，到首尾后继续滚动页面。窄屏使用横向卡片列表。悬停、键盘聚焦和触屏点选也可选择功能。四组演示均按当前卡片与面板两侧的边缘投射主题色。滚动容器内的 sticky 层为窗口阴影预留绘制空间，外侧负边距抵消这部分空间。减少动态效果时直接更新位置。

## OriaTunnel 智能终端

`terminal-update.tsx` 在首页的 `#terminal` 展示独立面板。`terminal-preview.tsx` 与 `native-terminal/` 复用原应用的工作区、标签、命令编辑器、目录选择和命令库。主工作区终端默认靠下，VNC 终端默认靠右。面板尺寸按所在演示窗口计算，示例命令、目录和关键词仅保存在该面板的内存中。下载按钮和平台文件以 `release-assets.json` 的正式发布清单为准。

智能终端的六段操作动画由 `native-terminal/walkthrough-steps.ts` 驱动编辑器、目录和保存控件。演示在视区内播放，显示鼠标落点、逐字移动的插入光标和光标附近的按键提示。用户可暂停、重播或直接接管。启用减少动态效果时由用户决定播放。固定命令头按原应用的滚动裁剪方式处理。「复制内容」将三种复制结果分别粘贴到独立文本窗口。VNC 剪贴板按本机平台演示两个方向的复制与粘贴快捷键。
