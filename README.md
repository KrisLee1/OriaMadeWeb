# OriaMadeWeb

Oria 系列官网：品牌首页、OriaTheme 文档与主题编辑器、OriaTab 产品演示、更新日志与隐私政策、OriaTunnel 产品页。各产品保留自己的顶栏与页脚，通过页脚的 Oria 系列入口互相连接。

## 本地运行

需要 Node.js 20.9+ 与 npm。当前已在 macOS / Node.js 24.18.0 上验证。在仓库根目录执行：

```sh
npm ci
npm run dev -- --port 3100
```

打开 [中文首页](http://127.0.0.1:3100/zh-CN) 或 [英文首页](http://127.0.0.1:3100)。无需数据库、账号或环境密钥。

| 产品 | 英文路径 | 中文路径 |
| --- | --- | --- |
| OriaTheme | `/oria-theme` | `/zh-CN/oria-theme` |
| 主题编辑器 | `/oria-theme/editor` | `/zh-CN/oria-theme/editor` |
| 文档 | `/oria-theme/docs` | `/zh-CN/oria-theme/docs` |
| OriaTab | `/oria-tab` | `/zh-CN/oria-tab` |
| OriaTunnel | `/oria-tunnel` | `/zh-CN/oria-tunnel` |

OriaTab 另有 `changelog` 和 `privacy` 子页面。三个切换组件来自 OriaTunnel：主题预设、系统/浅色/深色、语言。语言切换保留当前路径、参数和章节；主题与自定义主题保存在当前浏览器的 `oria-made-theme` 存储项。Tab 的强调色属于当前演示会话。首页、Theme、Tab 和 Tunnel 顶栏始终固定可见，页顶透明融合、滚动后应用主题悬浮材质，窄屏导航收进菜单。Tunnel 产品窗口由网页组件展示，状态选择、批量演示启停与连线动效只改变示例，不连接服务器。

OriaTunnel 的 `/oria-tunnel/download` 提供 v0.1.0 的 Windows x64/ARM64、macOS Apple Silicon/Intel 安装包、macOS ZIP 备选、安装步骤与功能说明。主下载按钮识别系统及可用架构信息；不足时进入平台选择区。文件直接来自官方 GitHub Release。

## 开发与验证

技术栈：Next.js App Router、TypeScript、shadcn/ui（Base UI）、Lucide、OriaTheme、Motion、Tailwind CSS、i18next。精确版本由 `package-lock.json` 锁定。

```sh
npm test
npm run build
npm run typecheck
npm run start -- --port 3101
```

生产服务启动后，在另一终端执行：

```sh
VERIFY_ORIGIN=http://127.0.0.1:3101 npm run verify
```

`test` 验证八语言路由、翻译插值、样式作用域、故事章节定位和 Tunnel 连线状态语义；`verify` 请求 sitemap 中的页面、内部链接、静态资源，并检查元数据与 404。浏览器交互检查记录见 [项目状态](docs/PROJECT_STATUS.md)。新增路由后若开发与生产的类型缓存不同步，先重新 `build` 再执行 `typecheck`。

修改迁移的产品样式源文件后运行 `npm run styles`，重新生成作用域隔离的 `migrated.css`。源码、生成后的 CSS、锁文件和来源清单一并维护；`.next`、`node_modules`、`outputs` 不纳入版本管理。

新增系列：在 `src/content/products.ts` 注册产品，添加对应路由及自身布局，在顶栏复用切换组件，在页脚提供关联入口。不要在根布局添加跨产品顶栏。具体边界见 [架构](docs/architecture.md) 与 [UI 开发入口](docs/ui-development.md)。

站点提供英语、简体中文、繁体中文、日语、韩语、德语、法语、俄语。英文地址不加前缀，其他语言使用 `/zh-CN`、`/zh-TW`、`/ja`、`/ko`、`/de`、`/fr`、`/ru`，支持所有产品与文档子页。Tab 中的搜索、Aide、书签和浏览器画面为产品演示，不调用扩展 API 或真实 AI 服务。部署采用 Cloudflare Workers 与 OpenNext；主域名为 `oriamade.com`，`oriamade.cn` 永久跳转到主域名。SEO 目标通过 SITE_URL 配置，默认 `https://oriamade.com`。实际线上连接和验证状态见项目状态。

## 自动部署

Cloudflare Workers Builds 关联 `KrisLee1/OriaMadeWeb` 的 `main` 分支。构建命令为 `npm run cf:build`，部署命令为 `npm run cf:deploy`。GitHub Actions 运行测试、构建和 Workers 运行时检查。完整接入、预览、域名与回退步骤见 [部署指南](docs/DEPLOYMENT.md)。

## 项目资料

- [实施方案](docs/PLAN.md)
- [架构](docs/architecture.md)
- [迁移说明与来源](docs/MIGRATION.md)
- [项目状态与验收](docs/PROJECT_STATUS.md)

迁移代码与素材的来源和原有许可见 [迁移说明](docs/MIGRATION.md)。本项目未新增整体开源许可证。
