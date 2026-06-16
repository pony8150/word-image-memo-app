# 图个单词

一个以“先看图，再记词”为核心的英语单词学习项目。当前仓库已经不是单纯静态 demo，而是一个可本地运行的前后端一体原型：

- 前端：原生 `index.html` + `styles.css` + `app.js`
- 后端：NestJS
- 数据库：MySQL（默认通过 Docker 启动）
- 认证：当前前端默认开放名字注册 / 名字登录
- 图片：默认图、私有图、搜索导入图、本地上传图
- 社区：发帖、评论、点赞、收藏、转发

## 当前状态

这版代码已经具备完整主链路：

- 登录后按词书加载 `learning-deck`
- 学习卡片、复习模式、看图猜词
- 图片搜索导入、本地上传、隐藏默认图、软删除私有图
- 社区 feed、帖子详情、评论与互动
- 后端启动时自动执行 `sql/*.sql`，保证 schema 尽量和代码同步

同时也保留了一些明显的工程现实：

- 前端仍是单文件应用，`app.js` 体量较大
- 图片搜索仍依赖 Bing 页面解析，不是官方 API
- 本地文件仍是主要存储方式，尚未切到正式 OSS / S3 / R2

## 本地运行

### 1. 准备后端环境变量

```powershell
cd backend
Copy-Item .env.example .env
```

核心配置如下：

```env
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=mysql://root:8150@localhost:3307/word_image_memo
UPLOADS_DIR=uploads
IMAGE_PURGE_RETENTION_HOURS=24
AUTH_SESSION_TTL_DAYS=30
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@qq.com
SMTP_PASS=your-smtp-app-password
SMTP_FROM_EMAIL=your-email@qq.com
SMTP_FROM_NAME=图个单词
```

说明：

- 当前默认数据库名仍是 `word_image_memo`，这是为了兼容已有库和脚本
- 若不配置 SMTP，开发模式下邮箱注册接口仍会返回 `devCode`
- 当前前端默认隐藏邮箱注册 / 登录入口，只开放“名字 + 密码”注册登录；名字需全局唯一

### 2. 启动 MySQL

```powershell
cd backend
docker compose up -d
docker compose ps
```

默认连接信息：

- Host：`localhost`
- Port：`3307`
- User：`root`
- Password：见 `backend/.env`
- Database：`word_image_memo`

### 3. 安装依赖并初始化数据库

```powershell
cd backend
npm.cmd install
npm.cmd run db:init
npm.cmd run download:demo-images
npm.cmd run seed:demo
```

说明：

- `db:init` 会执行全部 `backend/sql/*.sql`
- 后端启动时也会自动跑 schema 检查；首次初始化仍建议手动跑一次
- `download:demo-images` 会把示例图片下载到 `backend/uploads/`
- `seed:demo` 会跳过缺失图片，不会因为单张失败中断整批

### 4. 启动后端

```powershell
cd backend
npm.cmd run start:dev
```

可直接检查：

```text
http://localhost:3000/api/auth/me
http://localhost:3000/api/learning-deck
```

注意：

- `http://localhost:3000/` 返回 `Cannot GET /` 是正常现象
- `GET /api/auth/me` 在未登录时返回 `401`，这也说明 API 本身已启动

### 5. 启动前端

在仓库根目录：

```powershell
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

端口说明：

- `8000`：前端页面
- `3000`：后端 API / 本地图片访问
- `3307`：Docker MySQL 映射端口

## 常用脚本

`backend/package.json` 当前保留的常用命令：

- `npm.cmd run build`：构建后端
- `npm.cmd run start:dev`：开发模式启动后端
- `npm.cmd run db:init`：执行全部 SQL 初始化 / 迁移脚本
- `npm.cmd run import:wordlists`：导入词书数据
- `npm.cmd run fill:missing-examples -- all`：为词书补全例句
- `npm.cmd run audit:missing-examples`：检查还有哪些单词缺例句
- `npm.cmd run sync:bing-url:junior-high`：同步初中词书单词主图 URL
- `npm.cmd run sync:bing-url:senior-high`：同步高中词书单词主图 URL
- `npm.cmd run sync:bing-url:postgraduate-redbook`：同步考研词书单词主图 URL
- `npm.cmd run seed:demo`：写入示例词卡数据
- `npm.cmd run download:demo-images`：下载示例图片到本地
- `npm.cmd run purge:images`：清理到期私有图片

此外，根目录还保留了两个数据清洗脚本：

- `scripts/fetch-school-words.mjs`
- `scripts/clean-school-words.mjs`

## 目录结构

```text
repo-root/
├─ README.md
├─ index.html
├─ styles.css
├─ app.js
├─ assets/
│  └─ speaker.svg
├─ data/
│  ├─ raw/
│  └─ wordlists/
├─ scripts/
│  ├─ fetch-school-words.mjs
│  └─ clean-school-words.mjs
└─ backend/
   ├─ .env.example
   ├─ docker-compose.yml
   ├─ package.json
   ├─ seeds/
   ├─ sql/
   ├─ src/
   │  ├─ auth/
   │  ├─ common/
   │  ├─ community/
   │  ├─ config/
   │  ├─ database/
   │  ├─ images/
   │  ├─ scripts/
   │  ├─ storage/
   │  └─ words/
   └─ uploads/
```

目录约定：

- `backend/src/scripts/` 放可执行脚本
- `backend/src/images/` 放图片业务逻辑与图片相关工具
- `backend/uploads/` 是运行时文件目录，不应作为业务源码来编辑
- `data/` 是词书原始资料与整理结果，不是运行时输出目录

## 数据与图片模型

### 词书

- `words`：全局单词
- `books`：词书列表
- `book_words`：单词与词书关系

当前内置词书：

- `junior-high`
- `senior-high`
- `college`

### 图片归属

- `word_images.scope = 'default'`：共享默认图
- `word_images.scope = 'private'`：用户私有图
- `user_hidden_word_images`：用户隐藏了哪些默认图

### 存储

- 二进制资源统一进入 `image_assets`
- 本地文件按哈希去重，避免同文件重复落盘
- 默认图和私有图都通过 `image_assets` 关联

## 当前限制

- Bing 搜索结果依赖页面解析，稳定性不如官方 API
- 第三方图片源可能拒绝下载或返回防盗链
- 当前没有权限分级与正式后台
- 前端仍集中在一个 `app.js` 中，继续迭代时最好按功能拆分

## 后续建议

- 拆分前端大文件，优先按 `auth / learn / community / api` 分块
- 为图片搜索与导入补测试或至少增加更明确的失败兜底
- 给 `backend/uploads/` 建立更清晰的运行时与发布策略
- 如果继续做产品化，优先补权限模型、对象存储和后台管理
