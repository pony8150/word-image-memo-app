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

## 单台 ECS 部署

适合先把公网版本跑起来的第一版：一台 Linux 云服务器同时跑 `Nginx + 前端静态文件 + NestJS + MySQL`。

### 仓库里新增的部署文件

- `backend/Dockerfile`：后端生产镜像
- `backend/.dockerignore`：减少镜像构建上下文
- `deploy/ecs/docker-compose.yml`：单机编排
- `deploy/ecs/nginx.conf`：前端静态托管和 `/api` 反代
- `deploy/ecs/backend.env.example`：后端生产环境变量模板
- `deploy/ecs/deploy.env.example`：数据库密码模板

### 部署前提

- 一台 Linux ECS，建议 Ubuntu 22.04
- 已安装 Docker 和 Docker Compose 插件
- 安全组至少放行 `80`，如果要远程登录还需放行 `22`

### 服务器操作

```bash
git clone <your-repo-url>
cd word-image-memo-app
cp deploy/ecs/backend.env.example deploy/ecs/backend.env
cp deploy/ecs/deploy.env.example deploy/ecs/deploy.env
```

编辑 `deploy/ecs/backend.env`：

- 把 `PUBLIC_BASE_URL` 改成你的公网域名，例如 `https://words.example.com`
- 如果要启用邮箱注册验证码，填好 `SMTP_*`
- 如果用到了 AI 功能，填好 `OPENAI_*`

编辑 `deploy/ecs/deploy.env`：

- 修改 `MYSQL_ROOT_PASSWORD`
- 修改 `MYSQL_APP_PASSWORD`

### 启动

```bash
docker compose --env-file deploy/ecs/deploy.env -f deploy/ecs/docker-compose.yml up -d --build
```

查看状态：

```bash
docker compose --env-file deploy/ecs/deploy.env -f deploy/ecs/docker-compose.yml ps
docker compose --env-file deploy/ecs/deploy.env -f deploy/ecs/docker-compose.yml logs -f backend
```

### 访问方式

- 首页：`http://你的服务器公网IP/`
- API：`http://你的服务器公网IP/api/...`
- 上传图片：`http://你的服务器公网IP/uploads/...`

前端现在的默认行为是：

- 本地开发时继续请求 `http://localhost:3000/api`
- 公网部署时默认请求同域名下的 `/api`

如果你后面想把 API 单独拆到别的域名，也可以继续通过全局变量 `TUGE_DANCI_API_BASE` 覆盖。
