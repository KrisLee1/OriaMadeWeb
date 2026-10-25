# Oria 官网实施方案

状态：已获用户授权实施，2026-10-25。

## 产品与范围

一个 Next.js 官网服务 Oria 系列：品牌首页 `/`，产品入口 `/oria-theme`、`/oria-tab`、`/oria-tunnel`，后续通过产品注册表扩展。使用 TypeScript、shadcn/ui（Base UI）、Lucide、OriaTheme、Motion、Tailwind CSS、i18next。

主域建议为 oriamade.com；oriamade.cn 作为中文入口。英文无前缀，简体中文 `/zh-CN`。2026-10-26 用户追加授权提交、推送和 Cloudflare 线上部署，主域名为 oriamade.com，oriamade.cn 永久跳转至主域名。

用户追加要求：迁移 OriaTheme 仓库 apps/website 的既有官网，以及本机 OriaTab/website；保留现有产品内容和交互，不用简化展示替代。统一切换组件直接来自 OriaTunnel。

## 页面与设计

品牌首页包含品牌首屏、三个产品入口、系列理念和页脚。产品各自拥有顶栏与页脚；三个外观设置组件复用，顶栏和页脚添加 Oria 系列关联入口，不使用跨产品统一顶栏。保留各产品的展示形式。OriaTheme 保留文档、预设与编辑器；OriaTab 保留九幕滚动故事、安装入口、更新日志和隐私页面；OriaTunnel 先提供真实功能介绍和项目入口。

样式使用 OriaTheme 语义 Token，简单状态用 CSS，复杂交互使用 Motion。支持键盘、移动布局、浅色/深色/系统和减少动态效果。

## 分阶段结果

1. 文档、可运行 Next.js、统一主题和语言、品牌首页及产品路由。
2. 迁移 OriaTheme 官网与 OriaTab 官网及所需依赖/资源，记录来源和改动。
3. 验证类型、生产构建、关键路由、资源、语言切换、主题持久化、编辑器和滚动演示。
4. 后续另行完善正式品牌素材、OriaTunnel 下载发布信息、域名和部署。

## 风险与处理

- 原主题官网使用 Radix，迁移时统一适配 Base UI，保留编辑器功能。
- 原 Tab 官网依赖扩展共享代码；仅复制官网需要的依赖闭包，隔离演示状态，禁止接入扩展存储、真实搜索或 AI 服务。
- 浏览器专属演示须在客户端挂载，页面正文和导航仍提供服务端内容。
- 所有迁移源保持只读。新项目尚无线上消费者，替换错误实现时直接清理。

## 验收

通过 typecheck、生产 build；检查英中路由、未知地址 404、canonical/hreflang、切换后的 URL 和存储、刷新与跨产品导航、移动溢出、资源缺失、浏览器异常、减少动态效果。只记录实际执行结果。
