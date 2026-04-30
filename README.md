# Word Image Memo App

一个以“先看图，再记词”为核心的英语单词学习原型。

当前版本已经不是纯静态 Demo，而是一个可本地运行的前后端项目：

- 前端：`index.html` + `styles.css` + `app.js`
- 后端：NestJS
- 数据库：MySQL
- 认证：邮箱验证码注册 / 邮箱密码登录
- 图片存储：本地文件 + `image_assets` 去重

## 当前版本要点

### 访问规则

- 当前 `GET /api/learning-deck` 需要登录。
- 未登录时，前端应停留在认证页，不再展示学习卡片内容。
- 登录后先选择词书，再查看该词书下的单词与图片。

### 词书模型

- `words` 存全局单词。
- `books` 存词书列表。
- `book_words` 负责把单词映射到不同词书。
- 当前内置词书：
  - `junior-high`
  - `senior-high`
  - `college`

### 图片归属模型

- 冷启动图片是共享默认图。
- 用户上传图、搜索导入图是用户私有图。
- 同一个用户删除自己的私有图，不影响其他用户。
- 用户隐藏默认图，只对自己生效，不会删掉共享图。

### 存储模型

- 二进制文件统一落到 `image_assets`。
- 本地文件和后续 OSS 文件都通过 `image_assets` 管理。
- 本地图片按内容哈希去重，避免同一张二进制文件重复存储。
- `word_images.scope = 'default'` 表示共享默认图。
- `word_images.scope = 'private'` 表示用户私有图关系。
- `user_hidden_word_images` 记录“这个用户隐藏了哪张默认图”。

## 旧库升级说明

如果你之前已经跑过旧版本数据库，不要只看当前代码直接 `seed`。

现在仓库里已经补了兼容旧库的迁移脚本：

- `backend/sql/001_init.sql`：当前主 schema
- `backend/sql/002_upgrade_legacy_schema.sql`：把旧 `word_images` 结构迁到新模型

建议顺序：

```powershell
cd backend
npm.cmd run db:init
npm.cmd run download:demo-images
npm.cmd run seed:demo
```

说明：

- `db:init` 现在会自动执行全部 `sql/*.sql`
- 如果旧库里还保留老版 `word_images`，`002` 会补新列并迁移到 `image_assets`
- `seed:demo` 现在会跳过缺失的本地 demo 图，不再因为单张缺图整批失败

## 本地运行

### 1. 启动数据库

在 `backend/` 目录：

```powershell
docker compose up -d
docker compose ps
```

默认连接：

- Host：`localhost`
- Port：`3307`
- User：`root`
- Password：见 `backend/.env`
- Database：`word_image_memo`

### 2. 配置后端环境变量

建议先复制示例文件：

```powershell
cd backend
Copy-Item .env.example .env
```

核心变量：

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
SMTP_FROM_NAME=Word Image Memo
```

### 3. 初始化后端

```powershell
cd backend
npm.cmd install
npm.cmd run db:init
npm.cmd run download:demo-images
npm.cmd run seed:demo
npm.cmd run start:dev
```

后端接口启动后可检查：

```text
http://localhost:3000/api/auth/me
http://localhost:3000/api/learning-deck
```

注意：

- `http://localhost:3000/` 返回 `Cannot GET /` 属于正常现象，后端只提供 API 和本地上传文件访问。
- 若未配置 SMTP，注册接口仍可在开发模式下工作，后端会返回 `devCode`，前端会自动填入。

### 4. 启动前端静态服务

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

## 当前主流程

### 认证

- 邮箱验证码注册
- 邮箱密码登录
- 本地持久化 Bearer Session
- Session 失效后前端回到认证页

### 学习卡片

- 登录后按词书拉取 `learning-deck`
- 查看当前单词的大图、中文、例句、例句翻译
- 单词朗读和例句朗读
- 点击切换同词多图
- 左侧栏 / 移动端抽屉切换词书与内容

### 图片管理

- Bing 搜图导入
- 本地上传图片
- 隐藏默认图
- 软删除私有图
- 恢复已删除私有图

## 关键目录

```text
word-image-memo-app/
├─ README.md
├─ index.html
├─ styles.css
├─ app.js
├─ assets/
├─ backend/
│  ├─ .env.example
│  ├─ docker-compose.yml
│  ├─ sql/
│  ├─ seeds/
│  ├─ src/
│  └─ uploads/
├─ scripts/
└─ data/
```

重点文件：

- `backend/sql/001_init.sql`
- `backend/sql/002_upgrade_legacy_schema.sql`
- `backend/src/auth/auth.service.ts`
- `backend/src/images/images.service.ts`
- `backend/src/words/words.service.ts`
- `backend/src/scripts/seed-demo.ts`
- `backend/src/scripts/download-demo-images.ts`

## 当前限制

- Bing 搜索依赖页面解析，不是官方 API
- 第三方图片源可能拒绝下载
- 当前还没有权限分级和正式后台
- 目前仍使用本地文件存储，尚未切正式 OSS
- demo 图片如果本地文件缺失，会被 `seed:demo` 跳过；不影响启动，但会减少可用示例图数量

## 后续建议

- 把 demo 图片源信息独立保存，避免本地文件缺失后无法重新拉取
- 增加微信登录或更多登录方式
- 增加权限分级与管理后台
- 把本地文件存储切到正式 OSS / S3 / R2
