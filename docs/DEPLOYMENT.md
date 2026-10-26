# GitHub → Cloudflare 自动部署

部署目标为 Cloudflare Workers，Worker 名称为 `oriamade`，GitHub 仓库为 `KrisLee1/OriaMadeWeb`。使用 OpenNext 适配现有 Next.js 构建，保留八语言路由、Proxy、文档和产品交互。GitHub Actions 负责检查，Cloudflare Workers Builds 负责推送部署，避免同时配置两套部署流程。

## 首次连接

将当前准备好的源码提交并推送到该 GitHub 仓库后，在 Cloudflare 的 Workers & Pages 中创建 Worker，选择导入 GitHub 仓库。授权时只选择 `OriaMadeWeb` 仓库。

| 设置 | 值 |
| --- | --- |
| Worker 名称 | `oriamade`，必须与 wrangler.jsonc 一致 |
| 代码仓库 | `KrisLee1/OriaMadeWeb` |
| 生产分支 | `main` |
| 根目录 | 仓库根目录 |
| 构建命令 | `npm run cf:build` |
| 部署命令 | `npm run cf:deploy` |
| 非生产分支预览命令 | `npm run cf:upload` |
| Node.js | `.node-version` 中的版本；如平台要求环境变量，设置相同的 NODE_VERSION |

项目已提交 Wrangler 配置，不使用平台的自动框架迁移。无需填写 Pages 的 `out` 目录，也不使用 `next-on-pages`。

连接后，推送到 `main` 会触发生产构建和部署。按需开启非生产分支构建，将其上传为预览版本。GitHub Actions 的 `Website checks` 在推送和 PR 上运行测试、Workers 构建、类型检查、路由检查及部署包检查。建议在 GitHub 中把该检查设为 main 合并条件。

账号已完成仓库授权与连接，并验证 main 推送自动部署成功。主站为 [oriamade.com](https://oriamade.com)。每次部署的实际状态记录在 Cloudflare Deployments，发布验收记录见 [项目状态](PROJECT_STATUS.md)。

## 本地验证

使用 `.node-version` 对应的 Node.js，在仓库根目录运行：

```sh
npm ci
npm test
npm run cf:build
npm run typecheck
npm run cf:verify
npm run cf:check
```

`cf:verify` 临时启动本地 Workers 运行时并检查八语言 sitemap 页面、标题/图标、内部目标、资源及 404，结束后关闭临时运行时。默认端口 8787，可用 CF_VERIFY_PORT 调整。`cf:check` 仅生成部署包，不发布。不要同时启动生产预览并重写它正在使用的构建目录。

需要手动预览时，先构建再运行：

```sh
npm run cf:preview
```

已登录 Cloudflare 且需要手动发布时，`npm run deploy` 会重新构建并部署。日常开发继续使用 README 中的 `npm run dev`。

## 域名与环境

Wrangler 启用 `workers.dev` 和版本预览 URL，并将 `oriamade.com` 绑定为主站自定义域名。SEO 使用构建时的 SITE_URL，默认 `https://oriamade.com`，当前生产构建使用此默认值；更换主域名时再设置该变量。预览环境保留生产 canonical，避免重复索引。

三个别名入口均使用 Cloudflare 代理 A 记录指向 `192.0.2.1`，该地址仅为边缘跳转占位，不提供源站服务。

| 域名 | 代理 DNS | 已启用的单一重定向 |
| --- | --- | --- |
| `www.oriamade.com` | `.com` 区域 `www → 192.0.2.1` | `OriaMade WWW to COM`：`(http.host eq "www.oriamade.com")` |
| `oriamade.cn`、`www.oriamade.cn` | `.cn` 区域 `@` 和 `www → 192.0.2.1` | `OriaMade CN to COM`：`(http.host in {"oriamade.cn" "www.oriamade.cn"})` |

两条规则均使用动态目标 `concat("https://oriamade.com", http.request.uri.path)`、状态码 301，并启用“保留查询字符串”。HTTP 和 HTTPS 均直接跳转至主站，保留路径和参数，不部署第二份站点。这些规则与 DNS 位于 Cloudflare 域名配置，不由 Wrangler 覆盖；操作依据见 [Cloudflare 域名跳转说明](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/)。

站点不需要数据库、R2、KV 或应用 API 密钥。页面预渲染缓存使用 Workers Static Assets；内容更新通过重新构建发布。若未来需要 ISR、数据写入或服务端实时请求，再调整缓存和资源绑定。

`.work/`、`.next/`、`.open-next/`、`.wrangler/`、本地环境文件及账号凭据不纳入 Git。不要把令牌写入 Wrangler 配置、GitHub 工作流或文档。

## 回退与排错

- 构建失败：查看 Cloudflare Build 日志；先确认 Node 版本、根目录及两个命令。保持 Worker 名称与配置一致。
- 本地通过、线上失败：优先运行 cf:verify 复现 Workers 运行时，而非仅依赖 next start。
- 部署错误版本：在 Cloudflare Worker 的 Deployments 中回退到已验证版本；再通过 Git 修复并推送。
- 自定义域名暂未生效：先检查 workers.dev，确认部署成功后再处理 DNS 与域名设置。
- `www` 无法访问：同时检查代理 DNS 与已启用的跳转规则。仅有规则而没有 DNS，请求无法进入 Cloudflare；仅有占位 A 记录而没有生效的规则，可能返回 522。用包含子路径和查询参数的 HTTP、HTTPS 地址检查实际 301 和 Location，不能只看控制台保存提示。

参考：[Cloudflare OpenNext 指南](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)、[Workers Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[OpenNext 静态缓存](https://opennext.js.org/cloudflare/caching)。
