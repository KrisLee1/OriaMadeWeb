# 公共组件目录

已迁移组件。产品布局只复用控件，不共享跨站顶栏。

| 能力 | 路径 | 来源/职责 |
| --- | --- | --- |
| 主题预设 | src/components/theme/theme-select.tsx | OriaTunnel，预设/自定义主题与色板 |
| 外观模式 | src/components/theme/theme-mode-toggle.tsx | OriaTunnel，系统/浅色/深色 |
| 语言选择 | src/components/language/language-select.tsx | OriaTunnel UI，官网语言路由 |
| 基础控件 | src/components/ui | Base UI，Button/Select/Menu/Tabs |
| 设置控件组 | src/components/site/controls.tsx | 三个控件的布局，不含导航壳 |
| 系列菜单 | src/components/site/family-menu.tsx | Oria 首页及其他产品入口 |
| 产品页脚 | src/components/site/product-footer.tsx | 当前产品支持链接与系列入口 |
| 产品顶栏 | features/oria-theme/navigation.tsx、features/oria-tab/shell.tsx、app/[locale]/oria-tunnel/layout.tsx | 各产品自己的导航和风格 |
