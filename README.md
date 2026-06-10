# Letter Rush：星号词阵

## 项目简介

Letter Rush 是一个网页端词汇竞猜游戏原型，面向英语学习、课堂互动、社群破冰和轻量派对游戏场景。玩家进入本地模拟房间后，系统会从主题词库或自定义词库中随机抽取 10 个单词，并将字母隐藏为星号。玩家通过全局开字母获得线索，并随时抢答完整单词，越早猜中得分越高。

当前版本为 **v0.2.1 fixed 本地试玩版**，支持本地模拟多人、机器人玩家、独立词库、自定义词库、操作日志和结算复盘。主题词库已从主逻辑中拆出，统一存放在根目录下的 `wordbanks/` 文件夹中，便于后续独立维护与扩展。

> GitHub About 推荐简介：  
> A local multiplayer word-guessing web game for BOKE VIBE JAM, vibe-coded with ChatGPT 5.5 Plus Thinking.

## 核心玩法

1. 选择主题词库或输入自定义词库。
2. 创建本地模拟房间，或直接开始试玩。
3. 每局随机抽取 10 个单词或短语，字母初始显示为 `*`。
4. 点击 A-Z 字母后，所有单词中的对应字母位置会被揭示。
5. 玩家选择单词编号并提交答案进行抢答。
6. 答对得分为 `max(1, 26 - 已开字母数量)`；答错扣 1 分。
7. 全部单词被猜出、倒计时结束或手动结束后进入结算页。

## 功能列表

- 首页与快速开始流程
- 本地模拟房间号
- 本地多人玩家添加
- 机器人玩家模拟抢答
- 多主题独立词库文件
- 算法竞赛术语词库
- 自定义词库输入
- 10 词随机抽取
- 星号隐藏与全局开字母
- 抢答判定与计分
- 实时排行榜
- 操作日志
- 倒计时与手动结束
- 结算页与完整答案展示
- 玩法说明弹窗
- 移动端基础适配

## 运行方式

本项目是纯静态网页，不需要安装依赖。

### 方式一：直接打开

双击打开：

```text
index.html
```

当前词库采用 `.js` 数据文件，因此直接双击打开也可以正常读取主题词库。

### 方式二：本地静态服务

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## GitHub Pages 部署说明

推荐将以下文件直接放在仓库根目录，确保根目录存在 `index.html`。如果外层多套了一层目录，GitHub Pages 可能无法直接打开游戏页面。

部署后如果词库无法读取，优先检查三点：

1. `index.html` 中所有 `wordbanks/*.js` 是否位于 `main.js` 之前引入；
2. GitHub Pages 路径大小写是否与实际文件名完全一致；
3. 仓库中是否已经提交 `wordbanks/competitive_programming.js` 等词库文件。

## 文件结构

```text
LetterRush_v0.2/
├─ index.html                         # 页面结构
├─ style.css                          # 页面样式
├─ main.js                            # 游戏逻辑
├─ wordbanks/                         # 独立词库目录
│  ├─ programming.js                   # 程序设计术语词库
│  ├─ cet4.js                          # CET4 高频词库
│  ├─ campus.js                        # 校园生活词库
│  ├─ games.js                         # 游戏与动漫词库
│  ├─ competitive_programming.js       # 算法竞赛术语词库
│  └─ README.md                        # 词库维护说明
├─ screenshots/                       # 页面截图目录
│  └─ README.md                        # 截图补充说明
├─ README.md                          # 项目说明
├─ work-description.md                # 500 字以内作品说明
├─ prompt-logv0.1.md                  # Prompt 对话日志：v0.1 阶段
├─ prompt-logv0.2.md                  # Prompt 对话日志：v0.2 / 词库修复阶段
├─ CHANGELOG.md                       # 版本更新日志，记录从 v0.1 到当前版本的主要迭代内容。
└─ version.txt                        # 版本说明
```

## 当前词库

| 文件 | 页面显示名称 | 说明 |
|---|---|---|
| `programming.js` | 程序设计术语 | 基础编程、工程与 Web 开发相关词汇 |
| `cet4.js` | CET4 高频词 | 大学英语四级常见词汇 |
| `campus.js` | 校园生活 | 校园场景常用词汇 |
| `games.js` | 游戏与动漫 | 游戏、动漫与轻量娱乐词汇 |
| `competitive_programming.js` | 算法竞赛术语 | 算法、数据结构、图论、字符串、数论等竞赛术语 |

## 词库维护方式

主题词库统一存放在 `wordbanks/` 目录中。每个词库文件的格式如下：

```js
window.LETTER_RUSH_WORDBANKS = window.LETTER_RUSH_WORDBANKS || {};
window.LETTER_RUSH_WORDBANKS.demo = {
  label: '示例词库',
  description: '这里写词库说明。',
  words: [
    'algorithm',
    'binary search',
    'segment tree'
  ]
};
```

新增词库时：

1. 在 `wordbanks/` 下新建文件，例如 `animals.js`；
2. 按上述格式填写词库数据；
3. 在 `index.html` 底部、`main.js` 之前加入：

```html
<script src="wordbanks/animals.js"></script>
```

刷新页面后，新词库会自动出现在主题词库下拉框中。

## 当前版本说明

v0.2.1 fixed 是提交友好版本地试玩原型，重点展示完整玩法闭环、可运行性和词库可维护性。当前房间号仅用于展示完整交互流程，不连接真实服务器，不支持不同设备之间实时同步。

## 后续计划

- 接入 Firebase Realtime Database 或 WebSocket，实现真实在线房间；
- 使用事务/原子更新处理多人同时抢答同一单词的并发问题；
- 支持在线导入 `.txt` / `.json` 词库；
- 增加更智能的机器人猜测逻辑；
- 增加二维码邀请加入房间；
- 增加历史战绩和分享战报图。
