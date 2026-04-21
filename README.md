# Word Image Memo App

一个以“先看图，再记词”为核心的英语单词记忆应用原型。

这个项目现在已经不是单纯的静态展示页，而是一个可本地联调的前后端 Demo：

- 前端：`index.html` + `styles.css` + `app.js`
- 后端：NestJS
- 数据库：PostgreSQL
- 图片存储：当前先落本地，后续再切 OSS

## 设计原则

- 审美方向：整体风格遵循苹果式克制、清晰、轻量，不添加没有必要的视觉元素。
- 交互方向：尽量做到老人和小孩子都能直接上手，减少解释成本。
- 产品取舍：优先保留真正帮助记忆和学习的内容，避免“为了显得功能多”而堆 UI。
- 图片优先：先让用户看见真实图片，再去理解中文、例句和读音。

## 当前状态

当前仓库里虽然还保留了欢迎页、复习页、图片联想页、统计页的代码，但现在实际对外只保留了“学习卡片”界面，其他页面默认隐藏。

当前学习卡片页已经具备这些能力：

- 展示当前单词的真实图片、中文、例句、例句翻译
- 点击图片时，在同一个单词的多张图片之间切换
- 支持单词朗读和例句朗读
- 支持抽屉式单词列表
- 长按图片弹出管理菜单
- 长按菜单里现在有 3 个入口：
  - `上网搜索`：占位按钮，暂未开发
  - `上传`：已可用
  - `删除`：已可用

## 图片逻辑

### 1. 一个单词可以有多张图片

是的。当前数据模型支持一个单词对应多张图片。

后端表结构里，图片记录放在 `word_images` 表中，一条单词放在 `words` 表中，它们通过 `word_id` 关联。

### 2. 图片来源

当前有两类来源：

- Demo 初始化图片：最早来自 Unsplash、Pexels、Wikimedia Commons
- 用户手动上传图片：来自本地文件

为了保证演示稳定性，Demo 用到的外链图片已经下载到本地：

- `backend/uploads/demo-images/`

用户上传的新图片会保存到：

- `backend/uploads/user-images/<wordId>/`

### 3. 当前展示逻辑

- 前端优先请求后端 `http://localhost:3000/api/learning-deck`
- 如果后端暂时不可用，前端会退回缓存过的 API 数据或本地 Demo 数据
- 同一单词有多张图时，点击图片会在这些图之间轮换

## 图片管理逻辑

### 上传

上传现在已经打通，支持两种方式：

- 把图片直接拖进上传框
- 点击上传框本身，打开文件选择器

上传成功后：

- 图片文件会保存到本地 `backend/uploads/user-images/<wordId>/`
- 后端会在 PostgreSQL 的 `word_images` 表中新建一条记录
- 前端会立刻刷新当前单词，并切到新上传的那张图片

### 删除

删除不是一上来就物理删除文件，而是先走软删除：

1. 点击删除
2. 后端把 `word_images.status` 改成 `deleted`
3. 前端不再展示这张图
4. 写入操作日志
5. 由后续清理任务决定是否真正删掉本地文件或对象存储文件

当前保留窗口是：

- `24 小时`

这意味着：

- 用户点了删除后，界面上会立刻消失
- 但后端不会马上物理删文件
- 这是为了避免误删直接把素材库打穿

## 当前技术栈

- 前端：原生 HTML / CSS / JavaScript
- 后端：NestJS
- 数据库：PostgreSQL
- 图片存储：本地目录
- 未来对象存储方向：OSS / S3 / R2 都可以，当前代码先按本地存储抽象实现

## 数据与资源

- 当前内置 10 个 Demo 单词
- 每个单词包含英文、中文、例句、例句翻译、主题、图片记忆点等字段
- Demo 图片已经本地化，不再依赖线上图片链接才能演示
- 上传的新图片同样会存本地
- 学习进度、复习状态、猜词结果目前仍主要存在前端运行时状态中

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
```

补充说明：

- `index.html`：页面结构
- `styles.css`：视觉样式、布局、弹层、响应式
- `app.js`：词卡状态、图片切换、长按菜单、上传/删除、后端请求
- `backend/src/`：NestJS API、图片上传、图片删除、清理逻辑
- `backend/uploads/`：本地图片目录

## 本地运行

推荐按“前端 8000 + 后端 3000”分开启动。

### 1. 启动后端

先准备好本机 PostgreSQL，并创建数据库：

- `word_image_memo`

然后配置 `backend/.env`，至少确认：

```env
DATABASE_URL=postgres://postgres:你的密码@localhost:5432/word_image_memo
PUBLIC_BASE_URL=http://localhost:3000
UPLOADS_DIR=uploads
IMAGE_PURGE_RETENTION_HOURS=24
```

再运行：

```powershell
cd backend
npm.cmd install
npm.cmd run db:init
npm.cmd run download:demo-images
npm.cmd run seed:demo
npm.cmd run start:dev
```

后端启动后，可以用下面这个地址确认接口正常：

```text
http://localhost:3000/api/learning-deck
```

注意：

- `http://localhost:3000/` 返回 `Cannot GET /` 是正常的，因为后端不是网页首页，只提供 API

### 2. 启动前端静态服务

在项目根目录执行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000/
```

不要把前端页面直接理解成 `3000` 端口：

- `8000`：前端页面
- `3000`：后端 API 和本地图片访问

### 3. 开发时的刷新建议

如果你刚改了前端文件：

- `index.html`
- `styles.css`
- `app.js`

建议在浏览器里使用：

- `Ctrl + F5`

这是强制刷新，比普通 `F5` 更不容易继续吃旧缓存。

## 页面说明

### 学习卡片

当前这是唯一对外显示的主界面。

支持：

- 查看当前单词的大图
- 查看中文和例句
- 播放朗读
- 点击切换同词多图
- 长按图片打开管理菜单
- 上传新图片
- 删除当前图片

### 其他页面

仓库里还保留了这些页面的代码，但目前默认隐藏：

- 欢迎页
- 复习页
- 图片联想页
- 统计页

现在它们属于“代码保留、产品暂时不开放”的状态。

## 当前限制

- `上网搜索` 按钮还只是占位，没有接真实搜索流程
- 还没有登录、权限、正式后台
- 还没有 OSS 接入，当前统一走本地文件
- 前端仍保留本地 fallback 数据，不是完全只靠数据库
- 学习与复习进度还没有完整的持久化体系

## 后续演进方向

- 把 `上网搜索` 做成真实图片补图入口
- 给上传弹层增加上传前预览、裁剪或压缩能力
- 增加图片审核、恢复、误删回滚入口
- 把当前本地存储切换到正式 OSS
- 增加登录、权限、管理后台
- 把隐藏页面逐步打磨成正式产品流程
