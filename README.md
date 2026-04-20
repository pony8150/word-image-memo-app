# Word Image Memo App

一个面向初高中生的背单词前端原型。核心思路不是让学生反复死记英文文本，而是先通过图片建立直观联想，再配合中文、例句和记忆提示强化记忆。

## 目标用户

- 初中、高中阶段需要持续积累英语词汇的学生
- 对纯文本背词容易走神、记不牢的学生
- 更适合视觉化、情境化学习方式的学生

## 核心问题

- 传统背单词软件往往以“英文 + 中文释义”为主，记忆入口单一
- 学生容易形成短时记忆，隔一会儿就忘
- 单词与真实场景、图像、使用语境之间缺少连接
- 复习反馈往往只有“会/不会”，不够细，难以形成针对性复习

## 核心功能

1. 欢迎页
   展示产品定位、今日学习卡片和学习入口
2. 单词学习卡片
   每张卡片包含英文、中文、图片、例句、记忆提示
3. 复习模式
   提供“认识 / 模糊 / 不认识”三档反馈
4. 图片联想模式
   先看图猜词，再揭晓正确答案和提示
5. 学习统计概览
   展示词卡总量、学习进度、复习反馈和图片猜词表现

## 差异化

- 以图片联想作为第一记忆入口，而不是只靠文字
- 每个单词同时提供例句和记忆提示，帮助学生建立多重线索
- 复习反馈采用三档，便于后续做更细粒度的复习调度
- 原型采用本地静态页面，门槛低，适合快速验证产品方向

## MVP

最小可行版本聚焦一个“今天的 10 个词”学习闭环：

- 10 个适合初高中生的 mock 单词
- 首页引导 + 单词学习 + 复习模式 + 图片联想 + 统计页
- 本地 SVG 占位图，支持直接打开 `index.html` 预览
- 不接入账号、后端、词库系统，先验证交互和产品表达

## 后续路线图

- 艾宾浩斯复习
  根据遗忘曲线自动安排下一次复习时间
- AI 出图 / 配图
  为抽象词或教材词自动生成更贴合语义的助记图
- 教材词库导入
  支持按年级、教材版本、单元导入词汇
- 错题本
  自动聚合“不认识”和“模糊”的词，形成专项复习
- 游戏化
  加入连胜、积分、勋章、闯关任务，提升持续学习动力

## 项目结构

```text
word-image-memo-app/
├─ README.md
├─ index.html
├─ styles.css
├─ app.js
└─ assets/
   └─ images/
      ├─ apple.svg
      ├─ bicycle.svg
      ├─ bridge.svg
      ├─ courage.svg
      ├─ forest.svg
      ├─ harvest.svg
      ├─ journey.svg
      ├─ library.svg
      ├─ puzzle.svg
      └─ whisper.svg
```

## 如何打开运行

这个原型没有构建工具，也没有额外依赖。

### 方式一：直接打开

1. 进入项目目录
2. 双击 `index.html`
3. 或者在浏览器中手动打开 `index.html`

### 方式二：本地静态服务

如果你希望用本地服务打开，也可以在当前目录执行任一命令：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 批量获取初高中词表

仓库里新增了一个独立脚本：

```powershell
node scripts/fetch-school-words.mjs
```

默认做的事情：

- 下载公开的初中、高中英语词表文本
- 自动清洗、转小写、去重
- 默认过滤掉多词短语，只保留单词
- 把原始下载文件和清洗后的结果一起保存到本地

输出文件：

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

脚本当前默认用的是方便程序化抓取的公开词表源。如果你后面要切到更严格的官方口径，直接改 `scripts/fetch-school-words.mjs` 里的 `SOURCES`，替换成你确认过的课标导出文件或你自己的词表地址即可。

## 当前说明

- 页面为低门槛静态原型，重点验证产品结构和交互流程
- 数据为 mock 数据，图片为本地占位插画
- 后续如果要继续演进，可以在此基础上拆成组件化前端项目，再接入真实词库和复习算法
