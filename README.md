# Word Image Memo App

一个面向初高中生的英语背词静态前端原型。核心思路不是先记“英文 + 中文”，而是先用真实图片建立直观联想，再配合中文、例句和朗读去加深记忆。

当前仓库保留了两种使用方式：

- 纯前端原型：直接打开 `index.html` 就可以预览
- 前后端联调：前端静态页面 + `backend/` 里的 NestJS API + PostgreSQL

## 设计原则

- 审美方向：整体风格崇尚苹果式的克制、清晰和轻量，不添加没有必要的视觉元素
- 交互方向：尽量减少学习成本，让用户看到界面就知道怎么用，不依赖复杂说明
- 易用性目标：老人和小孩子都应该可以直接上手，尽量做到按钮明确、层级简单、操作直觉
- 产品取舍：优先保留真正帮助记忆和学习的内容，避免为了“看起来功能很多”而增加干扰

## 当前实现

- 欢迎页：展示产品定位、今日词卡预览和学习入口
- 学习卡片：大图优先展示，支持上一张 / 下一张切换
- 单词列表抽屉：默认收起，需要时再展开整套词卡
- 例句与单词朗读：调用浏览器原生 `speechSynthesis`
- 复习模式：先看图回忆，再用“认识 / 模糊 / 不认识”三档反馈
- 图片联想模式：根据图片在多个英文词中做选择
- 学习统计页：汇总浏览进度、复习结果和猜词命中率
- 后端骨架：新增 PostgreSQL 数据模型、图片软删除、24 小时延迟清理、本地文件存储抽象

## 当前数据与资源

- 当前内置 10 个 mock 词卡，前端仍保留本地 fallback，后端也提供同一套 seed 数据
- 每个词卡包含英文、中文、例句、例句翻译、主题、图片记忆点等字段
- 图片来源最初来自 Unsplash、Pexels 和 Wikimedia Commons，当前 demo 已经下载到本地 `backend/uploads/demo-images/`
- 页面中的学习进度、复习结果、猜词成绩都保存在内存里，刷新页面后会重置
- 后端版本的图片记录存 PostgreSQL，当前 demo 图片文件已经落在本地 `backend/uploads/`，后续再切 OSS

需要注意：

- 目前还没有登录、权限和正式管理后台
- 当前 demo 已切到本地图片，但后续新增图片的上传和 OSS 切换能力还没接完
- 浏览器如果禁用了语音能力，朗读按钮不会生效

## 适合验证的问题

- “先看图，再记词”这条路径是否更容易让学生建立记忆点
- 大图优先和词表抽屉的交互方式是否更适合背词场景
- 三档复习反馈是否比简单的“会 / 不会”更有用
- 图片猜词模式能否作为复习补强，而不是单独的小游戏

## 项目结构

```text
word-image-memo-app/
├─ README.md
├─ index.html
├─ styles.css
├─ app.js
├─ backend/
│  ├─ package.json
│  ├─ sql/
│  ├─ seeds/
│  ├─ src/
│  └─ uploads/
├─ scripts/
│  └─ fetch-school-words.mjs
└─ data/
   ├─ raw/
   └─ wordlists/
```

补充说明：

- `index.html`：页面结构和 5 个主视图
- `styles.css`：整体视觉风格、布局、抽屉、响应式样式
- `app.js`：词卡数据、状态管理、事件绑定、后端 API fallback 逻辑
- `backend/`：NestJS API、PostgreSQL 初始化脚本、seed 数据、本地上传目录
- `scripts/fetch-school-words.mjs`：批量抓取并清洗初高中词表的独立脚本
- `data/`：脚本生成的原始词表和清洗结果输出目录

## 如何打开运行

这个原型没有额外依赖，直接预览即可。

### 方式一：直接打开

1. 进入项目目录
2. 双击 `index.html`
3. 或者在浏览器中手动打开 `index.html`

### 方式二：本地静态服务

如果你希望用本地服务打开，也可以在当前目录执行：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 后端启动

### 1. 准备 PostgreSQL

安装本机 PostgreSQL，并创建数据库 `word_image_memo`。

### 2. 配置环境变量

复制 `backend/.env.example` 为 `backend/.env`，至少确认：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/word_image_memo
PUBLIC_BASE_URL=http://localhost:3000
```

### 3. 安装并初始化后端

```powershell
cd backend
npm.cmd install
npm.cmd run db:init
npm.cmd run download:demo-images
npm.cmd run seed:demo
npm.cmd run start:dev
```

默认 API 地址：

```text
http://localhost:3000/api/learning-deck
```

前端静态页会优先请求这个 API；如果后端没启动，会自动退回本地 demo 数据。

补充说明：

- `npm.cmd run download:demo-images` 会把 demo 外链图片下载到 `backend/uploads/demo-images/`
- `npm.cmd run seed:demo` 会把数据库里的 demo 图片记录重置为本地文件模式

## 页面说明

### 1. 欢迎页

- 展示产品定位和今日词卡预览
- 可以直接跳到学习卡片或图片联想模式

### 2. 学习卡片

- 默认展示当前词的真实图片
- 点击图片可在同一单词的不同图片来源之间切换
- 支持单词朗读、例句朗读
- 支持展开侧边抽屉查看整套单词列表

### 3. 复习模式

- 先看图，再回忆中文意思
- 点击“显示答案”后才能进行打分
- 打分结果会同步进入统计页

### 4. 图片联想模式

- 每题展示一张图片和 4 个英文选项
- 答题后会显示正确答案和该图的记忆点
- 完成一轮后可重新开始

### 5. 学习统计

- 展示词卡总量、已浏览词卡、复习完成数、图片命中率
- 用条形图展示复习反馈分布
- 用列表展示每个词当前的掌握状态

## 批量获取初高中词表

仓库里包含一个独立脚本，用于下载公开词表并做本地清洗：

```powershell
node scripts/fetch-school-words.mjs
```

默认行为：

- 下载公开的初中、高中英语词表文本
- 自动清洗、转小写、去重
- 默认过滤多词短语，只保留单词
- 同时保存原始下载文本和清洗后的结果

输出目录：

```text
data/
├─ raw/
│  ├─ junior-high.txt
│  └─ senior-high.txt
└─ wordlists/
   ├─ school-common-words.json
   ├─ school-common-words.txt
   ├─ junior-high-common-words.txt
   └─ senior-high-common-words.txt
```

常用参数：

```powershell
# 改输出目录
node scripts/fetch-school-words.mjs --out-dir ./data/custom-wordlists

# 保留词组，例如 be good at
node scripts/fetch-school-words.mjs --include-phrases

# 不保存原始下载文本
node scripts/fetch-school-words.mjs --skip-raw
```

如果后面要切换到更严格的官方词表来源，直接修改 `scripts/fetch-school-words.mjs` 里的 `SOURCES` 即可。

## 当前限制

- 词卡数据仍保留在 `app.js` 里作为静态 fallback，还没有完全切到数据库唯一数据源
- 没有 `localStorage` 持久化，刷新后学习状态会丢失
- 没有登录、同步、错题本、间隔复习等正式产品能力
- 当前 demo 图片已经是本地文件，但图片上传、本地新增图片管理和 OSS 切换能力还没接完

## 后续可以继续演进的方向

- 把词卡数据从 `app.js` 中拆出去，改成独立 JSON 或真实接口
- 增加本地持久化，保留学习和复习进度
- 接入基于遗忘曲线的复习调度
- 根据教材、年级、单元筛选词包
- 给图片资源增加本地缓存或备用图，降低外链依赖
