# 公共组件目录

已迁移组件。产品布局只复用控件，不共享跨站顶栏。

| 能力 | 路径 | 来源/职责 |
| --- | --- | --- |
| 主题预设 | src/components/theme/theme-select.tsx | OriaTunnel，预设/自定义主题与色板 |
| 外观模式 | src/components/theme/theme-mode-toggle.tsx | OriaTunnel，系统/浅色/深色 |
| 语言选择 | src/components/language/language-select.tsx | OriaTunnel UI，官网语言路由 |
| 基础控件 | src/components/ui | Base UI，Button/Select/Menu/Tabs |
| 设置控件组 | src/components/site/controls.tsx | 三个圆形图标控件的布局，不含导航壳 |
| 产品页脚 | src/components/site/product-footer.tsx | 当前产品支持链接与系列入口 |
| 产品顶栏 | features/oria-theme/navigation.tsx、features/oria-tab/shell.tsx、features/oria-tunnel/header.tsx | 各产品自己的导航和风格 |
| 品牌文字 | src/components/site/brand-name.tsx | 统一字重与字距，产品后缀使用主题色 |
| 滚动顶栏材质 | src/components/site/use-scroll-header.ts | 首页、Theme、Tab、Tunnel 固定可见，页顶透明、滚动后应用主题材质 |
| Tunnel 下载按钮 | src/features/oria-tunnel/download-button.tsx | 首页及下载页识别平台，选择对应安装包或架构选择区 |
| GitHub 入口 | src/components/site/github-link.tsx | Theme/Tab/Tunnel 共用品牌图标、外链箭头与桌面/紧凑布局 |
