# UI 开发入口

先阅读 [架构](architecture.md) 和 [状态](PROJECT_STATUS.md)，再查阅 [组件目录](ui/components/index.md)。

技术：Next.js、React、TypeScript、Tailwind CSS、OriaTheme、shadcn/ui（Base UI）、Lucide、Motion、react-i18next。版本以 package-lock.json 为准。

公共 UI 放 src/components/ui；产品私有 UI 留在 features。颜色/圆角/阴影使用 OriaTheme Token。使用现有组件优先于新增组件，不引入第二套主题状态。迁移源的专属展示保持作用域隔离。

必须覆盖：键盘焦点、图标控件可访问名称、320px 布局、浅深色、系统模式、减少动态效果。浏览器专属初始化不得在服务器模块求值期间访问 DOM。

验证入口：npm run typecheck、npm run build；关键跨产品流程追加浏览器验证。仅在能力或约束变化时维护文档。

产品头尾归各自布局管理，根布局不添加统一顶栏。关联入口只放在产品页脚，不在顶栏增加系列按钮。OriaTab 顶栏 Logo 使用透明的 assets/logo.svg；带底框的 favicon.svg 仅用于浏览器图标场景。

## 产品导航与语言

全站八语言由 `src/i18n/config.ts` 注册。新增或调整文案须同步 `src/i18n/messages/`，插值名必须保持不变。原代码示例与 Token 标识保持原文。公共图标设置按钮不叠加方形边框和下拉箭头。Theme 宽屏导航保持一行，900px 及以下只显示品牌与菜单，菜单锚定整个顶栏，宽度与左右边缘一致。

## OriaTunnel 产品页

入口为 `/{locale}/oria-tunnel`；产品顶栏位于 `src/features/oria-tunnel/header.tsx`，始终固定可见，带 GitHub 品牌图标，提供工作流、产品功能与下载导航，并标记当前章节。

`demo.tsx`、`native-demo.css` 重建原生窗口的五个页面与独立停靠终端。Mac 窗口使用 OriaTheme 的 radius-lg 圆角，胶囊、原始 Lucide 图标、服务 SVG 和 GraphStar 状态图标均按迁移源维护。窗口整体缩放与连接图内部 viewport 分开计算；不为缩略窗口换用另一套图标顶栏。原图对照仅在本地 `public/products/oria-tunnel/screenshots/` 保留，不纳入本轮提交与部署；官网演示本身不使用截图。

`simulation.ts` 定义独立的演示场景；`connection-stroke.tsx` 沿用原应用的虚线与 2800ms 光带。场景、暂停和批量演示启停必须明确为模拟，不可接入 Tauri、真实主机、凭据或 SSH。状态文案直接来自 `locales/` 的八语言资源，版权与原路径见 [迁移说明](MIGRATION.md)。

## 共享顶栏与下载

首页、Theme、Tunnel 共用 `useScrollHeader`，页顶透明融入背景，滚动后显示悬浮材质，不再按方向隐藏。透明度、模糊、饱和度、圆角、边框和阴影使用 OriaTheme Token。品牌文字使用 `BrandName`，统一字重与字距，产品后缀采用主题色；Theme 使用纯图标 `color-swatch-fan.svg`。

弹层由 Positioner 管理：顶栏 60、移动导航 90、Select/Menu 120。公共选择弹层必须使用 `site-popup-positioner`，不能低于顶栏。主题与语言菜单在按钮下方展开。菜单、首屏和滚动入场支持减少动态效果；滚动动画同时检查 animation-timeline 与 animation-range。

下载页 `/oria-tunnel/download` 提供完整八语言。`release-assets.json` 保存经核对的 v0.1.0 安装包链接、大小和 SHA256。主按钮使用浏览器系统及可用架构信息；不足时定位相应平台选择区。不能把 macOS UA 中的 Intel 当作实际芯片。仅在用户点击时下载，不在页面加载时自动下载文件。

Tunnel 的「状态演示」及列表分组统一使用公共 Base UI Select，不使用 HTML 原生 select。窗口外框与原生 surface 共同使用 radius-lg，按预览比例缩放，避免外框与内容的圆角不一致。

首页、Theme 与 Tunnel 导航靠左排列，首项为保持当前语言的 Oria 首页；窄屏菜单沿用相同入口顺序。

Tab 的内联 Dawn 壁纸使用 SVG xMidYMid slice 铺满预览，避免宽高比变化产生黑边。新标签场景不展示 Ctrl+T 应用快捷键；Aide 的快捷键提示保持原行为。
