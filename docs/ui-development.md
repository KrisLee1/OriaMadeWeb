# UI 开发入口

先阅读 [架构](architecture.md) 和 [状态](PROJECT_STATUS.md)，再查阅 [组件目录](ui/components/index.md)。

技术：Next.js、React、TypeScript、Tailwind CSS、OriaTheme、shadcn/ui（Base UI）、Lucide、Motion、react-i18next。版本以 package-lock.json 为准。

公共 UI 放 src/components/ui；产品私有 UI 留在 features。颜色/圆角/阴影使用 OriaTheme Token。使用现有组件优先于新增组件，不引入第二套主题状态。迁移源的专属展示保持作用域隔离。

必须覆盖：键盘焦点、图标控件可访问名称、320px 布局、浅深色、系统模式、减少动态效果。浏览器专属初始化不得在服务器模块求值期间访问 DOM。

验证入口：npm run typecheck、npm run build；关键跨产品流程追加浏览器验证。仅在能力或约束变化时维护文档。

产品头尾归各自布局管理，根布局不添加统一顶栏。关联入口使用 FamilyMenu 和产品页脚。OriaTab 顶栏 Logo 使用透明的 assets/logo.svg；带底框的 favicon.svg 仅用于浏览器图标场景。
