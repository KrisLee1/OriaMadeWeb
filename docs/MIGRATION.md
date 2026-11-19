# 迁移说明

## OriaTunnel 首屏与下载页点阵（2026-11-17）

首屏点阵参照 [React Bits 首页 Hero](https://github.com/DavidHDev/react-bits/blob/d01aa914dcbe76da8b2923ebf872b5c8b1066e4c/src/components/landingnew/Hero/Hero.jsx) 与 [DotGrid](https://github.com/DavidHDev/react-bits/blob/d01aa914dcbe76da8b2923ebf872b5c8b1066e4c/src/ts-default/Backgrounds/DotGrid/DotGrid.tsx)。`components/backgrounds/tunnel-dot-grid.tsx` 以 Canvas 2D 实现，采用 2.6px 点径、22px 间距、160px 指针影响半径与 720ms 消退时间，颜色跟随 OriaTheme。绘制在静止、离屏或页面隐藏时停止。初始画布透明，仅光标划过或点按的区域显现。减少动态效果时保持空白。

下载页首屏复用同一点阵组件。上游作者 David Haz，许可见 [MIT + Commons Clause](licenses/ReactBits-MIT-Commons-Clause.txt)。

## React Bits 交互背景（2026-11-05）

- 使用 React Bits 的 [Waves](https://reactbits.dev/backgrounds/waves)、[Aurora](https://reactbits.dev/backgrounds/aurora)、[Particles](https://reactbits.dev/backgrounds/particles) 与 [RippleGrid](https://reactbits.dev/backgrounds/ripple-grid)，上游固定为 [DavidHDev/react-bits @ 4dc7b5b](https://github.com/DavidHDev/react-bits/tree/4dc7b5b7772e1217c8fb8d2a7aa074302180e5b4)。对应 `src/ts-default/Backgrounds/` 下四个同名组件。原始输入 SHA256 见 [清单](migration-sources.json)，[MIT + Commons Clause 原文](licenses/ReactBits-MIT-Commons-Clause.txt) 完整保留。
- 四种源码仅作为对应官网的装饰背景：品牌流线、Theme 光场、Tab 粒子、Tunnel 点阵。沿用上游 WebGL2 shader 和交互，适配隔离类名、OriaTheme 颜色、客户端分包、30fps 绘制预算、隐藏/减少动态效果/上下文丢失生命周期与 CSS 回退；无新增包依赖。
- 背景挂载根布局，横向覆盖浏览器两侧，随文档滚动并向下淡出；原 hero 背景组件、旧静态轨道及雾状背景已删除。产品壳透明，正文保留原有最大宽度与局部表面，阅读子页降低装饰强度。

## 官网布局优化（2026-11-05）

- [React Bits Pro](https://pro.reactbits.dev/) 的公开页面用于内容层次、功能编排与交互节奏参考；[React Bits](https://www.reactbits.dev/) 的公开导航用于紧凑尺寸参考。实现使用本站的 Base UI、OriaTheme 与 Motion。
- 品牌产品卡片统一结构与视觉并移除页面根类冲突；Theme 静态光团替换为真实主题预览，原 Reveal 移至公共 UI；Tab 功能分区与阅读页、Tunnel 工作流和下载页优化布局，保留原生演示及八语言内容。
- 产品导航仅以短分隔线区分 Oria 首页文字入口；四站尺寸、位置、内边距和紧凑断点统一，GitHub 纯图标的右侧以短线区分页面控件；保留原悬浮材质。Tunnel 演示原先从前景色生成的外阴影改为主题阴影 Token，避免深色白色光晕。

## 主题适配与性能（2026-11-05）

- 官网表面采用 OriaTheme 的纹理、渐变、字体、字重、圆角、边框和阴影；Tunnel 的主窗口、主机卡片及此电脑卡片使用主题阴影，保留各主题的硬阴影或高光特征。
- OriaTab 局部 Runtime 跟随全站主题与明暗，仍保持 storage:false 和演示隔离。Liquid glass 只在可见主演示启用 WebGL，静态近景使用原组件的 CSS 材质；近景离屏卸载，主故事及玻璃场景离屏/隐藏停止，玻璃观察和事件限定本地作用域，修正子级布局 effect 早于父级 ref 导致意外采集整页的问题，嵌套设备场景继承父级启停。公共装饰背景限为 30fps，取消浮动暂停按钮，保留系统减少动态效果静态分支。

## 来源

- OriaTheme：`KrisLee1/OriaTheme` 的 `apps/website`，固定提交 `2916b7a4422d3d4de2ce6a0ea1c4c03ba46d03b1`。保留首页、文档、预设展示、完整主题编辑器和编辑器翻译。原 Apache-2.0 许可保留在 [主项目许可](licenses/OriaTheme-APACHE-2.0.txt) 与 [编辑器许可](licenses/OriaTheme-editor-APACHE-2.0.txt)。
- OriaTab：用户指定的本机项目 `website` 及官网实际依赖的共享组件，迁移时源站版本为 0.2.0。保留九幕编排、Aide 演示、主题预览、安装入口、更新日志和隐私页面。素材出处保留在 [NOTICE](../public/products/oria-tab/licenses/NOTICE.txt)。
- OriaTunnel：用户指定的本机项目中的 ThemeSelect、ThemeModeToggle、LanguageSelect，以及它们依赖的 Base UI 控件与样式。原仓库现有 GPL-3.0-only 许可保留在 [原始许可证](licenses/OriaTunnel-GPL-3.0.txt)。Tunnel 产品窗口的结构、图标、状态语义与八语言 UI 文案也按同一来源记录。

逐文件来源与原文件 SHA-256 记录在 [来源清单](migration-sources.json)。哈希用于标识迁移输入；目标文件已按下述规则适配，不要求与原文件逐字一致。所有迁移源保持只读。

## 适配

1. 单一 Next.js App Router 应用。英文无前缀，中文 `/zh-CN`。原 Theme 的英中内容保留，新增语言使用静态文案字典；八种语言统一使用真实站点路由，不再把模块内 `zh` 当成站点语言。
2. 根布局只提供主题、语言与无障碍跳转。品牌首页和三个产品分别拥有自己的顶栏、页脚。公共控件复用，系列关联只在页脚展示；不渲染双层站点顶栏。
3. 公共预设来自 OriaTheme，额外保留 Tab 的 Liquid glass 预设。三个控件统一使用根 OriaTheme Runtime；编辑器注册主题切换守卫，存在草稿时先提供丢弃确认。编辑器自身保存、导入、导出逻辑保留。
4. Tab 演示状态隔离。允许本地强调色预览；不调用浏览器扩展、真实搜索、聊天、壁纸接口或远程图标服务。Liquid glass 及自动主题轮播保留在演示范围内。语言入口恢复八种语言，Tab 原有故事、更新日志和隐私翻译直接复用。
5. Tab 动效在客户端按需挂载；正文提供服务端渲染的完整介绍。系统减少动态效果时使用原有静态分幕分支。SVG 壁纸改为构建时内容，去除浏览器模块初始化对 DOMParser 的依赖。
6. 两个产品 CSS 分别限定在 `.oria-theme` 和 `.oria-tab-runtime`，由 `scripts/scope-styles.mjs` 生成。作用域转换只识别真正的 `html`、`body` 类型选择器，不改写含 body 的类名。页头、页脚使用产品专属类。内嵌预览拥有局部 CSS Token，不覆盖全站偏好。
7. Theme 旧 Radix 顶栏被三个 Base UI 迁移控件替代。Tab 原静态页面容器改为 React 布局；章节导航不再依赖旧 HTML 中的 Portal 目标。
8. 下载目标沿用源网站实际商店与发布仓库地址。隐私页面保留扩展行为描述，新网站访问部分调整为当前实现，未沿用未经确认的 Cloudflare 托管声明。

## 内容维护

- 产品入口：`src/content/products.ts`。
- Theme 文档和文案：`src/features/oria-theme/components/docs`、`public/locales`。
- Tab 故事、版本与下载：`src/features/oria-tab/website/content.mjs`、`site-config.mjs`。
- 原文件与迁移后的 CSS 修改后运行 `npm run styles`。
- 所有测试和命令统一以 [README](../README.md) 为入口。

## 后续适配（2026-10-25）

- 品牌页、Theme 文档／编辑器与 Tunnel 介绍补齐八语言静态文案；新增译文采用机器辅助生成，并复核主要界面术语与插值。尚未逐句完成母语人工审校。访问官网不会调用翻译接口。
- Tunnel 参考 [DeepSeek Harness](https://www.deepseek.com/harness/) 的产品叙事节奏，未复制其文案、素材或页面代码。原应用窗口按源码结构搭建，直接复用精确图标、SVG 品牌路径及原 UI 译文；不导入原生窗口控制、IPC、凭据和 SSH 模块。
- 用户授权演示连线的多种状态。官网场景不代表真实运行结果：颜色、虚实线、箭头方向与光带遵循原 `connection-visual`／`ConnectionEdge`，支持暂停和减少动态效果。旧截图保留为只读对照素材。
- Tunnel 服务品牌 SVG 的原出处和许可元数据随 `src/features/oria-tunnel/native-assets/service-icons.json` 保留。
- Tunnel 下载清单来自用户指定的 [v0.1.0 Release](https://github.com/KrisLee1/OriaTunnel/releases/tag/v0.1.0)，2026-10-25 经 GitHub API 核对四个安装包及两个 DMG ZIP 的名称、大小、URL 和 SHA256。安装步骤及功能说明对照原仓库 README；官网不代理或执行安装包。

## OriaTunnel v0.1.1 内容同步（2026-10-27）

- 产品能力与八语言三项更新日志对照只读源仓库 `30fad2290121b70432e48dd3d2a99ba3ea6c3846` 的 README、`docs/releases/v0.1.1.md`、`docs/USAGE.md` 及代理浏览器组件。同步主机关联服务、独立端口、L/R 单服务与 D 多服务、Chrome/Edge/Firefox 独立代理窗口及不支持 Safari 的边界。
- 服务按主机分组与浏览器菜单均为独立演示数据，不迁入原生桥接、SSH、凭据或系统代理模块。监听状态仅代表模拟隧道监听，不据此推断远端服务已运行；关联服务图标保持中性。
- 浏览器标识原样来自源仓库 `src/assets`，上游修订、品牌归属与 MIT/MPL-2.0 原文保存在 [浏览器资源声明](../public/products/oria-tunnel/licenses/NOTICE.txt) 及同目录；逐文件 SHA256 已加入来源清单。
- 用户指定按 v0.1.1 正式版更新官网，下载版本、Release 地址、四个安装包与两个 ZIP 文件名统一为 v0.1.1。2026-10-27 已核对公开 Latest 与 v0.1.1 正式 Release，实际下载六个安装包/ZIP 并验证大小与 SHA256，补齐全部元数据及公开时间；三条中文更新日志与公开正文一致。

## OriaTab 官网重做（2026-10-27）

- 按用户要求参考现有 OriaTunnel 产品页重组 Tab 官网。九幕文案转为常规内容分区，原阶段组件与编排用于六种可切换、可重播的预览；更新日志与隐私政策保留原内容和八语言路由。
- 只读对照 OriaTab 的 `src/App.tsx`、`src/styles.css`、`src/features/bookmarks.tsx` 与 `src/features/aide.css` 调整实际界面结构及尺寸；原路径与摘要见 [迁移源清单](migration-sources.json)。未修改迁移源，未导入浏览器权限、扩展存储、真实搜索或 AI 请求。
- 沿用已迁移的原 WebGL shader、玻璃捕获与合成管线，原出处与 MIT 声明继续见 `public/products/oria-tab/licenses/liquidglass.txt`。本次迁移曾默认使用独立的 Liquid glass Runtime，并降低厚度、折射与染色；2026-11-05 已改为局部 Runtime 跟随全站主题，仅 Liquid glass 主预览按可见性启用原玻璃渲染。官网展示参数不更改原扩展默认值。
- 本轮替换旧全屏滚动页面控制与章节浮轨；产品介绍保持服务端可读。减少动态效果时不播放预览动画；减少透明度或高对比度继续走原玻璃回退。Fieldnotes 样例网页及原生菜单增加明暗颜色变量。
- 网站访问说明删除“部署时补充”的旧占位，按现有 Cloudflare Workers 架构说明站点偏好、演示临时状态及托管请求处理，并链接 Cloudflare 官方隐私政策。扩展自身权限、数据处理和本地存储描述保留。

## OriaTunnel v0.2.0 发布准备同步（2026-11-04）

- 只读来源为 `/Volumes/T7/Projects/OriaTunnel`：已提交基线 `6b57a72` 加当前未提交的 0.2.0 工作区，以 `docs/releases/v0.2.0.md`、`docs/USAGE.md` 与实际文件模块为准，不把未来方案当作已实现能力。
- 同步文件浏览/传输、后台队列、预览/编辑、共享面板、macOS 文件体验与代理浏览器兼容修正。八语言内容明确“发布准备中”；2026-11-04 公开 API Latest 仍为 v0.1.1，v0.2.0 tag 返回 404，安装包及其已验证元数据继续保留 v0.1.1。
- 直接迁移原版 FileArtwork 与 CSS、Breadcrumb、FilePathNavigation、FileOptionsMenu 及纯路径辅助函数；文件面板与队列沿用原结构和有作用域的原样式。去除所有原生桥接、真实文件访问、认证、SSH、持久化入口，改为独立官网示例状态；GPL-3.0-only 许可沿用 `docs/licenses/OriaTunnel-GPL-3.0.txt`。逐文件源摘要及提取词条记录在 `migration-sources.json`。

## OriaTunnel v0.2.0 正式发布同步（2026-11-04）

- 公开 [v0.2.0 Release](https://github.com/KrisLee1/OriaTunnel/releases/tag/v0.2.0) 与 Latest 一致，源提交 `f8ccbe7701c7b7666ed17eb07d74babbc3866aae`，五项更新与原发布日志一致。八语言移除准备发布措辞，现有文件演示保持原组件与独立数据边界。
- 下载清单更新为四架构安装包及两种 DMG ZIP 的实际大小、SHA256 与发布时间。实际下载六个包和 `latest.json`，七项均匹配公开元数据；更新清单版本、四平台链接与签名字段存在性通过核对，未执行安装或独立密码学验签。
- 当前更新锚点 `#release-notes` 指向 v0.2.0 文件功能区；v0.1.1 卡片独立标为历史版本，使用自己的版本号、Release 链接与 `#release-v0-1-1`，避免旧变更被显示为新版本内容。

## OriaTunnel v0.3.0 VNC（2026-11-16）

八语言更新说明取自只读 OriaTunnel 提交 `d42168586b83817f763c9ad165b36194da883117` 的 `README.md` 和 `docs/readme/README.<locale>.md`，沿用 GPL-3.0-only。官网聚焦内置 VNC 客户端、文本剪贴板与同窗 SSH/SFTP。协议示例以纯文本显示。

VNC 预览参照同一提交的 `src/features/vnc/VncHeader.tsx`、`VncDesktop.tsx`、`desktop.css`、`src/components/window/window-header.tsx`、`window-control.tsx` 及原版八语言按钮文案，沿用 GPL-3.0-only。外层复用官网已迁移的文件和终端面板及 SVG；远端画布用已有的 OriaTab 沙丘、海岸壁纸和示例文本表达。官网窗口不导入原生连接、键盘注入、凭据或系统剪贴板接口。

## OriaTunnel v0.4.0 智能终端预览（2026-11-17）

迁移源为 [OriaTunnel 7c24929](https://github.com/KrisLee1/OriaTunnel/tree/7c24929b765f88dab4983e131d84674c395ae508)。`src/features/oria-tunnel/native-terminal/` 保留来源路径，沿用 [GPL-3.0-only](licenses/OriaTunnel-GPL-3.0.txt)。面板、标签、可折叠命令、面包屑、目录选择、保存弹层与命令库对应上游 `src/components/ui/` 和 `src/features/terminal/`。样式取自该提交的 workspace-panel.css、shell-editor.css、globals.css 与 tunnel.css，界面词取自八种语言的 terminal、files 与 tunnel 命名空间。

官网用页面内示例目录和命令输出替换 PTY，用内存命令库替换 Tauri 持久化。面板可在独立近景、主工作区和 VNC 查看器中操作。Windows 本地 PowerShell 与命令块的三个复制选项对照[上游 123fd36](https://github.com/KrisLee1/OriaTunnel/tree/123fd36677167d6a64c686809dc4c485414eae85)。用户主动点击「复制命令」「复制输出」或「复制全部」可写入浏览器剪贴板。自动演示使用页面内示例文本。

## OriaTunnel v0.5.0 组合面板和文件工作区（2026-11-19）

官网使用发布准备提交 90da190 的终端分组树、四边停靠判断和指针手势。分组标签、会话标题栏、分隔线、拖放预览和关闭确认沿用对应组件的结构、图标和主题变量。网站用稳定的 React portal 容纳各会话的示例编辑器，重排与拆分时保留草稿和输出。文件日期标题、传输指标、扫描提示、空状态和八语言控件取自同一修订。来源路径和摘要见 migration-sources.json。[上游源码](https://github.com/KrisLee1/OriaTunnel/tree/90da190374824fd7dd553702c5849923f85fd0f6) · [GPL-3.0-only](licenses/OriaTunnel-GPL-3.0.txt)
