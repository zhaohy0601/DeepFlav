# DeepFlav GitHub Release

## 项目定位

DeepFlav: An Integrated Platform for Prediction and Analysis of Flavonoid Biosynthetic Genes — 前端代码整理并发布至 GitHub 公开仓库。

## 目录结构

```text
project_11_deepflav_github_release
├── AGENTS.md                # 本文件
├── README.md                # GitHub 仓库主 README
├── frontend                 # Vue 3 前端完整代码（从 1kpgf_vue 迁移）
│   ├── src
│   │   ├── assets           # 静态资源（图片、SVG 通路图、JSON 等）
│   │   ├── components       # 公共组件（Header、Footer、CytoscapePathway 等）
│   │   ├── router           # Vue Router 配置
│   │   ├── stores           # Pinia 状态管理
│   │   └── views            # 页面组件（HomeView、MLprediction、BlastView 等）
│   ├── public               # 公共静态资源（数据文件、索引等）
│   ├── package.json
│   └── vite.config.ts
├── docs                     # 文档（部署说明、API 设计等）
├── data                     # 示例数据或数据说明
└── scripts                  # 运维脚本
```

## 技术栈

| 项目 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| 构建 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 可视化 | ECharts、Cytoscape.js、Mol*/NGL |
| HTTP | Axios |
| 数据表格 | XLSX |

## 功能模块

1. **首页（HomeView）**：平台介绍、物种/基因统计图表（ECharts）、模式植物展示、类黄酮通路 SVG 可视化
2. **ML 预测（MLprediction）**：ESM-2 蛋白质语言模型的 GT/AT/MT 三分类预测
3. **BLAST 比对（BlastView）**：实时序列比对
4. **基因搜索（gene-search）**：跨物种基因检索
5. **通路浏览（pathway / flavonoid-map）**：类黄酮代谢通路可视化
6. **引物设计（PrimerDesigner）**：Primer3 引物设计工具
7. **物种基因组（species-genome / species-table）**：千余种植物基因组数据

## 开发约定

- Vue 组件统一使用 `<script setup>` 语法
- API 调用在 `src/api/` 下定义
- 禁止在组件内写 `console.log`（除调试需要）
- 构建前确保 `npm run type-check` 通过
- 组件命名 PascalCase，路由命名 kebab-case

## 验证命令

```bash
cd frontend
npm install
npm run type-check    # TypeScript 类型检查
npm run build         # 生产构建
npm run dev           # 开发服务器
```

## 禁止事项

- 不在代码中硬编码密钥、token、密码
- 不在项目根目录堆放 node_modules、dist 等构建产物
- 不注释掉报错来绕过问题
- 涉及文件删除必须先问用户
- 不修改 `.env` 或 CI/CD 配置而不告知

## 数据来源

线上地址：https://cbi.gxu.edu.cn/KPGF/html/#/
