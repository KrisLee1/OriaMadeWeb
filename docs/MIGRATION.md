# 迁移说明

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
