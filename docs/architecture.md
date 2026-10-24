# 项目架构

## 边界与依赖

`app → features → components → lib / Token`。单仓库、单 Next.js App Router 应用。站点公共组件统一使用 Base UI；产品特有编辑器和演示保留在各自模块。主正文优先服务端渲染，编辑器、玻璃与滚动演示按需加载。

## 路由

内部 `app/[locale]`，英文公开地址无前缀，中文使用 `/zh-CN`。Proxy 只重写语言路径，跳过资源和 Next 内部路由。语言切换保留产品子路径、query 与 hash。URL 是语言唯一事实源。

`oria-theme` 的 docs/editor 子路由保留原功能；`oria-tab` 的 changelog/privacy 子路由迁移到产品下。元数据统一由公共函数生成。内部 `/en` 可访问但 canonical 始终指向无前缀英文地址，避免重写后再次重定向形成循环。

根布局只管理 Provider 和跳转正文，不包含站点顶栏/页脚。品牌首页、Theme、Tab、Tunnel 各自渲染一套头尾；共用的是 SiteControls、FamilyMenu、产品注册表和页脚关联链接。产品采用显式路由目录，便于保留 docs/editor/changelog/privacy 子路由。

## 主题

OriaTheme 是全站唯一持久主题状态源。44 个 OriaTheme 预设与迁移的 Liquid glass 预设、当前主题、system/light/dark、DOM Token 和主题过渡在公共 Provider 管理。存储键使用 `oria-made-theme`。首屏 bootstrap 与 Provider 使用相同契约、默认值和存储键；存储异常回退默认主题。OriaTab 演示可使用局部主题预览，但不覆写全站偏好。

## 国际化

共享控件沿用 react-i18next；服务端按 locale 读取内容，客户端 Provider 使用隔离实例。首发站点提供 en、zh-CN；保留原官网其他翻译资源，未完整支持的站点语言不开放。

## 目录

- `src/app`：路由、布局、SEO。
- `src/components`：公共 UI、站点框架、迁移的三个切换组件。
- `src/features/oria-theme`：迁移的主题官网、文档和编辑器。
- `src/features/oria-tab`：迁移的 Tab 官网及仅用于演示的共享代码。
- `src/content`：产品注册表和翻译。
- `src/i18n`：语言配置、地址生成、Provider。
- `src/lib`：主题初始化、SEO、公共工具。
- `public/products`：按产品隔离的静态资源及许可证。
- `scripts`：来源记录、构建辅助和验证。

## 部署

目标为支持 Next.js 的运行环境与 CDN，保留静态预渲染。首版不需要数据库、账号或 CMS。域名跳转、正式下载源和部署凭据在上线时配置；本次只运行本地预览。
