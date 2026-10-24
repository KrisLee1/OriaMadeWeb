# OriaMadeWeb

Oria 系列官网：品牌首页、OriaTheme 文档与主题编辑器、OriaTab 九幕演示及更新日志、OriaTunnel 产品页。各产品保留自己的顶栏与页脚，通过 Oria 系列入口互相连接。

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

OriaTab 另有 `changelog` 和 `privacy` 子页面。三个切换组件来自 OriaTunnel：主题预设、系统/浅色/深色、语言。语言切换保留当前路径、参数和章节；主题与自定义主题保存在当前浏览器的 `oria-made-theme` 存储项。Tab 的强调色属于当前演示会话。

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

`test` 验证语言重写不会循环、深层语言路径和故事章节定位；`verify` 请求 sitemap 中的页面、内部链接、静态资源，并检查元数据与 404。浏览器交互检查记录见 [项目状态](docs/PROJECT_STATUS.md)。新增路由后若开发与生产的类型缓存不同步，先重新 `build` 再执行 `typecheck`。

修改迁移的产品样式源文件后运行 `npm run styles`，重新生成作用域隔离的 `migrated.css`。源码、生成后的 CSS、锁文件和来源清单一并维护；`.next`、`node_modules`、`outputs` 不纳入版本管理。

新增系列：在 `src/content/products.ts` 注册产品，添加对应路由及自身布局，在顶栏复用切换组件和系列菜单，在页脚提供关联入口。不要在根布局添加跨产品顶栏。具体边界见 [架构](docs/architecture.md) 与 [UI 开发入口](docs/ui-development.md)。

当前提供英中两种站点语言。Tab 中的搜索、Aide、书签和浏览器画面为产品演示，不调用扩展 API 或真实 AI 服务。正式域名、托管与部署尚未配置；SEO 的目标域名当前为 `https://oriamade.com`，定义在 `src/lib/seo.ts`。

## 项目资料

- [实施方案](docs/PLAN.md)
- [架构](docs/architecture.md)
- [迁移说明与来源](docs/MIGRATION.md)
- [项目状态与验收](docs/PROJECT_STATUS.md)

迁移代码与素材的来源和原有许可见 [迁移说明](docs/MIGRATION.md)。本项目未新增整体开源许可证。
