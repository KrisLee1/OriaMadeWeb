# 迁移说明

## 来源

- OriaTheme：`KrisLee1/OriaTheme` 的 `apps/website`，固定提交 `2916b7a4422d3d4de2ce6a0ea1c4c03ba46d03b1`。保留首页、文档、预设展示、完整主题编辑器和编辑器翻译。原 Apache-2.0 许可保留在 [主项目许可](licenses/OriaTheme-APACHE-2.0.txt) 与 [编辑器许可](licenses/OriaTheme-editor-APACHE-2.0.txt)。
- OriaTab：用户指定的本机项目 `website` 及官网实际依赖的共享组件，迁移时源站版本为 0.2.0。保留九幕编排、Aide 演示、主题预览、安装入口、更新日志和隐私页面。素材出处保留在 [NOTICE](../public/products/oria-tab/licenses/NOTICE.txt)。
- OriaTunnel：用户指定的本机项目中的 ThemeSelect、ThemeModeToggle、LanguageSelect，以及它们依赖的 Base UI 控件与样式。未发现单独根许可证，不推定新的授权条款。

逐文件来源与原文件 SHA-256 记录在 [来源清单](migration-sources.json)。哈希用于标识迁移输入；目标文件已按下述规则适配，不要求与原文件逐字一致。所有迁移源保持只读。

## 适配

1. 单一 Next.js App Router 应用。英文无前缀，中文 `/zh-CN`。原 Theme `zh/en` 内容代码保留在模块内，通过路由适配到站点语言。
2. 根布局只提供主题、语言与无障碍跳转。品牌首页和三个产品分别拥有自己的顶栏、页脚。公共控件与系列菜单复用；不渲染双层站点顶栏。
3. 公共预设来自 OriaTheme，额外保留 Tab 的 Liquid glass 预设。三个控件统一使用根 OriaTheme Runtime；编辑器注册主题切换守卫，存在草稿时先提供丢弃确认。编辑器自身保存、导入、导出逻辑保留。
4. Tab 演示状态隔离。允许本地强调色预览；不调用浏览器扩展、真实搜索、聊天、壁纸接口或远程图标服务。Liquid glass 及自动主题轮播保留在演示范围内。语言入口只开放站点实际支持的 en/zh-CN，原八种翻译资源仍保留。
5. Tab 动效在客户端按需挂载；正文提供服务端渲染的完整介绍。系统减少动态效果时使用原有静态分幕分支。SVG 壁纸改为构建时内容，去除浏览器模块初始化对 DOMParser 的依赖。
6. 两个产品 CSS 分别限定在 `.oria-theme` 和 `.oria-tab-runtime`，由 `scripts/scope-styles.mjs` 生成。页头、页脚使用产品专属类。内嵌预览拥有局部 CSS Token，不覆盖全站偏好。
7. Theme 旧 Radix 顶栏被三个 Base UI 迁移控件替代。Tab 原静态页面容器改为 React 布局；章节导航不再依赖旧 HTML 中的 Portal 目标。
8. 下载目标沿用源网站实际商店与发布仓库地址。隐私页面保留扩展行为描述，新网站访问部分调整为当前实现，未沿用未经确认的 Cloudflare 托管声明。

## 内容维护

- 产品入口：`src/content/products.ts`。
- Theme 文档和文案：`src/features/oria-theme/components/docs`、`public/locales`。
- Tab 故事、版本与下载：`src/features/oria-tab/website/content.mjs`、`site-config.mjs`。
- 原文件与迁移后的 CSS 修改后运行 `npm run styles`。
- 所有测试和命令统一以 [README](../README.md) 为入口。
