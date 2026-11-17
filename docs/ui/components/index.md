# 公共组件目录

已迁移组件。产品布局只复用控件，不共享跨站顶栏。

| 能力 | 路径 | 来源/职责 |
| --- | --- | --- |
| 主题预设 | src/components/theme/theme-select.tsx | OriaTunnel，预设/自定义主题与色板 |
| 外观模式 | src/components/theme/theme-mode-toggle.tsx | OriaTunnel，系统/浅色/深色 |
| 语言选择 | src/components/language/language-select.tsx | OriaTunnel UI，官网语言路由 |
| 产品首页入口 | src/components/site/home-link.tsx | 三个产品官网的文字入口；与产品导航分隔，移动菜单单独分组 |
| 入场与滚动揭示 | src/components/ui/reveal.tsx | 原 Theme Reveal；一次入场、顺序延迟、减少动态效果静态分支 |
| 全站交互背景 | src/components/backgrounds/site-background.tsx | 按站点选择 Waves/Aurora/Particles/Tunnel DotGrid；随文档滚动的满宽场景、主题色、30fps、减少动态效果与静态回退 |
| 基础控件 | src/components/ui | Base UI，Button/Select/Menu/Tabs |
| 设置控件组 | src/components/site/controls.tsx | 三个圆形图标控件的布局，不含导航壳 |
| 产品页脚 | src/components/site/product-footer.tsx、src/features/oria-tunnel/footer.tsx | 产品支持链接与系列入口；Tunnel 页脚使用带平台示意图的下载卡和分组导航卡，卡片材质随主题变化 |
| 产品顶栏 | features/oria-theme/navigation.tsx、features/oria-tab/shell.tsx、features/oria-tunnel/header.tsx | 各产品自己的导航和风格 |
| 品牌文字 | src/components/site/brand-name.tsx | 统一字重与字距，产品后缀使用主题色 |
| 滚动顶栏材质 | src/components/site/use-scroll-header.ts | 首页、Theme、Tab、Tunnel 固定可见，页顶透明、滚动后应用主题材质 |
| Tunnel 下载按钮 | src/features/oria-tunnel/download-button.tsx | 首页及下载页识别平台，选择对应安装包或架构选择区 |
| GitHub 入口 | src/components/site/github-link.tsx | Theme/Tab/Tunnel 共用纯图标；右侧 14px 短分隔线、可访问名称与悬停提示 |
