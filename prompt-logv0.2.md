# Letter Rush / BOKE VIBE JAM 当前对话日志

导出时间：2026-06-10  
项目：Letter Rush  
用途：BOKE VIBE JAM 作品迭代记录 / prompt-log / 开发说明补充

> 说明：本文档整理当前可见对话内容、需求变更、技术判断、生成文件与修复记录。  
> 不包含隐藏推理、系统内部消息或不可见工具调用细节。

---

## 1. 初始背景

用户正在参加 **BOKE VIBE JAM**，项目为一个在线字母竞猜 / 单词猜测类网页游戏，后续命名为 **Letter Rush**。

项目要求大致为：

- 作品可运行；
- 支持在线访问链接或工程压缩包；
- 使用 HTML / JS 等前端技术；
- 需要持续迭代；
- 需要整理开发过程与 prompt 日志；
- 需要拆分词库，方便后续灵活更新。

---

## 2. 新增算法竞赛词库

### 用户需求

用户要求独立拆分词库，在根目录建立词库文件夹，内部存放词库文件，方便灵活更新词库；并增加算法竞赛词库，包含算法竞赛常用算法、数据结构等术语，建立 100+ 词的词库，返回 `.js` 文件。

### 处理结果

生成了算法竞赛词库文件：

```txt
algorithm_competition_words.js
```

词条数量：

```txt
236 个
```

词条类型覆盖：

- 基础算法；
- 动态规划；
- 数据结构；
- 图论；
- 字符串；
- 数论；
- 计算几何；
- 网络流；
- 离线算法；
- 分块 / 莫队；
- 构造 / 交互 / 随机化；
- 常见竞赛术语。

初始导出格式为：

```js
const ACM_ALGORITHM_WORDS = [...];

if (typeof window !== "undefined") {
  window.ACM_ALGORITHM_WORDS = ACM_ALGORITHM_WORDS;
  window.WORD_BANKS = window.WORD_BANKS || {};
  window.WORD_BANKS.algorithmCompetition = {
    id: "algorithmCompetition",
    name: "算法竞赛词库",
    description: "包含常见算法、数据结构、图论、字符串、数论、几何等术语。",
    words: ACM_ALGORITHM_WORDS
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ACM_ALGORITHM_WORDS;
}
```

---

## 3. 下载链接失效问题

### 用户反馈

用户多次反馈下载链接打开失败，浏览器显示：

```txt
无法访问此网站
网址为 https://chatgpt.com/backend-api/estuary/content?... 的网页可能暂时无法连接，或者它已永久性地移动到了新网址。
ERR_INVALID_RESPONSE
```

### 判断

判断该问题不是词库文件过大导致，因为 236 个词条的 `.js` 文件体积很小。

更可能原因：

- 平台下载链接响应不稳定；
- 浏览器对单个 `.js` 文件下载有异常；
- 临时文件链接失效；
- 网络环境或 ChatGPT 文件服务临时错误。

### 处理

先后生成了：

```txt
algorithm_competition_words.js
algorithm_competition_words_backup.txt
algorithm_competition_words_pack.zip
competitive_programming_wordbank.js
competitive_programming_wordbank_pack.zip
```

其中 `.zip` 被建议作为优先下载方案。

---

## 4. 人机玩家原理说明

### 用户问题

用户询问：

```txt
人机玩家原理？
```

### 解释内容

说明了几类可能的人机逻辑。

#### 4.1 随机猜字母

```js
function randomBot(guessedLetters) {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const available = letters.filter(ch => !guessedLetters.includes(ch));
  return available[Math.floor(Math.random() * available.length)];
}
```

特点：简单，但表现较弱。

#### 4.2 按字母频率猜

常见英文频率顺序：

```txt
e t a o i n s h r d l c u m w f g y p b v k j x q z
```

示例逻辑：

```js
function frequencyBot(guessedLetters) {
  const order = "etaoinshrdlcumwfgypbvkjxqz".split("");
  return order.find(ch => !guessedLetters.includes(ch));
}
```

#### 4.3 候选词过滤式智能 Bot

核心思想：

```txt
当前局面 -> 筛候选词 -> 统计最有价值字母 -> 自动猜测
```

筛选依据：

- 长度相同；
- 已知位置匹配；
- 错误字母不能出现在候选词中；
- 已猜但未出现的字母不能出现在未知位置。

说明其更适合作为后续 v0.3 的智能 Bot 方向。

---

## 5. 检查当前项目中的实际人机逻辑

### 用户问题

用户询问：

```txt
目前是什么猜测逻辑
```

### 用户随后上传项目包

上传文件：

```txt
LetterRush_v0.2.1.zip
```

### 检查结论

项目当前的 Bot 不是“智能猜字母”，而是：

```txt
概率抢答 Bot
```

也就是：

```txt
玩家开字母 / 玩家答对后
↓
机器人有概率抢答一个已揭示比例较高的单词
↓
抢答结果按概率直接判定成功或失败
```

### 核心函数

识别到主要逻辑为：

```js
function maybeBotGuess() {
  if (!state || !state.autoBot || state.status !== 'playing') return;
  const bots = state.players.filter(p => p.bot);
  const candidates = state.words.filter(w => !w.guessed && revealRatio(w.answer) >= 0.32);
  if (!bots.length || !candidates.length) return;

  const attempts = Math.random() < 0.48 ? 1 : 0;
  for (let i = 0; i < attempts; i++) {
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    if (!word || word.guessed) continue;
    const ratio = revealRatio(word.answer);
    const probability = Math.min(0.82, 0.12 + ratio * 0.72);
    if (Math.random() < probability) {
      const gain = currentScoreValue();
      word.guessed = true;
      word.guessedBy = bot.id;
      word.revealedAtGuess = state.revealedLetters.length;
      bot.score += gain;
      addLog(`${bot.name} 抢答成功 #${word.id + 1}「${word.answer.toUpperCase()}」，获得 ${gain} 分`, 'good');
    } else {
      bot.score -= 1;
      addLog(`${bot.name} 尝试抢答 #${word.id + 1} 失败，扣 1 分`, 'bad');
    }
  }
  renderGame();
}
```

### 触发时机

Bot 在以下时机触发：

```txt
1. 玩家开字母后
2. 玩家答对一个词后
```

### 机器人候选词条件

```js
!w.guessed && revealRatio(w.answer) >= 0.32
```

含义：

```txt
未被猜中过，且该词已经揭示至少 32% 的字母。
```

### 机器人行动概率

```js
const attempts = Math.random() < 0.48 ? 1 : 0;
```

含义：

```txt
每次触发 maybeBotGuess 时，有 48% 概率尝试抢答一次。
```

### 抢答成功率

```js
const probability = Math.min(0.82, 0.12 + ratio * 0.72);
```

其中 `ratio` 是已揭示字母比例。

| 已揭示比例 | 成功率 |
|---:|---:|
| 32% | 约 35.04% |
| 50% | 48% |
| 70% | 62.4% |
| 90% | 76.8% |
| 100% | 最高 82% |

### 当前版本一句话描述

```txt
机器人玩家采用概率抢答机制。每当玩家开字母或答对单词后，系统会筛选已揭示比例达到 32% 的未猜中单词，并以 48% 概率触发一次机器人抢答。抢答成功率随单词揭示比例线性提高，最高不超过 82%。机器人抢答成功后直接获得该词当前分值，失败则扣 1 分。
```

---

## 6. 词库格式转换

### 用户需求

用户上传了：

```txt
competitive_programming.js
```

并要求：

```txt
转为需求的词库格式，返回为 .js 给我
```

### 原文件格式

上传文件原本为：

```js
const ACM_ALGORITHM_WORDS = [
  "algorithm",
  "complexity",
  ...
];

if (typeof window !== "undefined") {
  window.ACM_ALGORITHM_WORDS = ACM_ALGORITHM_WORDS;
  window.WORD_BANKS = window.WORD_BANKS || {};
  window.WORD_BANKS.algorithmCompetition = {
    id: "algorithmCompetition",
    name: "算法竞赛词库",
    description: "包含常见算法、数据结构、图论、字符串、数论、几何等术语。",
    words: ACM_ALGORITHM_WORDS
  };
}
```

### 项目要求格式

根据项目结构，词库应转换为：

```js
window.LETTER_RUSH_WORDBANKS = window.LETTER_RUSH_WORDBANKS || {};

window.LETTER_RUSH_WORDBANKS.competitiveProgramming = {
  label: '算法竞赛术语',
  description: '包含常见算法、数据结构、图论、字符串、数论、计算几何、动态规划等算法竞赛术语。',
  words: [...]
};
```

### 输出文件

生成：

```txt
competitive_programming_wordbank.js
```

并打包为：

```txt
competitive_programming_wordbank_pack.zip
```

### 转换结果

保留：

```txt
236 个词条
```

建议放置路径：

```txt
wordbanks/competitive_programming.js
```

建议引入方式：

```html
<script src="wordbanks/competitive_programming.js"></script>
```

---

## 7. GitHub Pages 词库无法正确读取问题

### 用户反馈

用户说明：

```txt
文件全部搬上了 GitHub，然后出现无法正确读取词库的问题
```

### 初步判断

可能原因包括：

#### 7.1 词库格式不匹配

旧格式是：

```js
window.WORD_BANKS
```

而项目实际读取：

```js
window.LETTER_RUSH_WORDBANKS
```

因此旧词库不会出现在项目词库选择中。

#### 7.2 script 引入顺序错误

需要确保词库文件在 `main.js` 之前引入：

```html
<script src="wordbanks/programming.js"></script>
<script src="wordbanks/cet4.js"></script>
<script src="wordbanks/campus.js"></script>
<script src="wordbanks/games.js"></script>
<script src="wordbanks/competitive_programming.js"></script>
<script src="main.js"></script>
```

如果 `main.js` 先执行，而词库文件后执行，则初始化时读取不到扩展词库。

#### 7.3 GitHub Pages 路径大小写敏感

例如：

```txt
wordbanks/competitive_programming.js
```

必须和实际文件名完全一致。

错误示例：

```txt
WordBanks/competitive_programming.js
wordbanks/Competitive_Programming.js
wordbanks/competitive-programming.js
```

GitHub Pages 对大小写敏感，本地 Windows 可能不敏感，因此本地能跑不代表线上能跑。

#### 7.4 文件未实际提交

需要确认：

```txt
git add wordbanks/competitive_programming.js
git commit -m "add competitive programming wordbank"
git push
```

GitHub 仓库页面中应能直接看到该文件。

---

## 8. 生成修复版项目包

### 处理结果

生成了修复版项目包：

```txt
LetterRush_v0.2.2_wordbank_fix.zip
```

### 修复内容

记录为：

```txt
1. 新增 wordbanks/competitive_programming.js
2. 在 index.html 中 main.js 前引入该词库
3. 将 main.js 改成动态读取 window.LETTER_RUSH_WORDBANKS，降低脚本顺序问题
4. 更新 README 项目简介
5. 版本号更新为 v0.2.2
```

---

## 9. 项目简介修订

### 用户原简介

```txt
A local multiplayer word guessing web game for BOKE VIBE JAM, vibe coded with ChatGPT 5.5 Plus Thinking
```

### 修订版

```txt
Letter Rush is a local multiplayer word-guessing web game built for BOKE VIBE JAM, vibe-coded with ChatGPT 5.5 Plus Thinking. Players reveal letters, race to guess hidden words, and extend gameplay through standalone wordbanks.
```

### GitHub About 短版

```txt
A local multiplayer word-guessing web game for BOKE VIBE JAM, vibe-coded with ChatGPT 5.5 Plus Thinking.
```

---

## 10. 当前项目推荐目录结构

```txt
LetterRush/
├─ index.html
├─ main.js
├─ style.css
├─ README.md
├─ prompt-log.md
└─ wordbanks/
   ├─ programming.js
   ├─ cet4.js
   ├─ campus.js
   ├─ games.js
   └─ competitive_programming.js
```

---

## 11. 当前词库文件推荐模板

```js
// Letter Rush 词库文件：算法竞赛术语
// 放置位置建议：wordbanks/competitive_programming.js

window.LETTER_RUSH_WORDBANKS = window.LETTER_RUSH_WORDBANKS || {};

window.LETTER_RUSH_WORDBANKS.competitiveProgramming = {
  label: '算法竞赛术语',
  description: '包含常见算法、数据结构、图论、字符串、数论、计算几何、动态规划等算法竞赛术语。',
  words: [
    'algorithm',
    'complexity',
    'recursion',
    'greedy',
    'dynamicprogramming',
    'segmenttree',
    'fenwicktree',
    'dijkstra',
    'tarjan',
    'suffixarray'
  ]
};
```

实际版本包含 236 个词条。

---

## 12. GitHub Pages 词库排查清单

如果线上仍无法读取词库，按以下顺序检查：

### 12.1 打开浏览器控制台

按 F12，查看 Console 是否有：

```txt
404
Uncaught ReferenceError
Cannot read properties of undefined
```

### 12.2 检查 Network

确认以下文件状态码为 200：

```txt
wordbanks/programming.js
wordbanks/cet4.js
wordbanks/campus.js
wordbanks/games.js
wordbanks/competitive_programming.js
main.js
```

### 12.3 检查文件大小写

GitHub 仓库内的文件名必须和 `index.html` 引用完全一致。

### 12.4 检查初始化顺序

`main.js` 应位于所有词库文件之后：

```html
<script src="wordbanks/programming.js"></script>
<script src="wordbanks/cet4.js"></script>
<script src="wordbanks/campus.js"></script>
<script src="wordbanks/games.js"></script>
<script src="wordbanks/competitive_programming.js"></script>
<script src="main.js"></script>
```

### 12.5 检查全局变量

在控制台输入：

```js
window.LETTER_RUSH_WORDBANKS
```

应该能看到多个词库对象。

再输入：

```js
Object.keys(window.LETTER_RUSH_WORDBANKS)
```

应该包含类似：

```txt
programming
cet4
campus
games
competitiveProgramming
```

---

## 13. 版本阶段记录

### v0.2.1

状态：

```txt
已有本地多人单词竞猜玩法；
已有概率抢答 Bot；
已有基础词库；
开始拆分词库；
词库格式尚有兼容问题。
```

### v0.2.2

目标：

```txt
修复 GitHub Pages 词库加载问题；
统一词库格式；
加入算法竞赛词库；
改善 README 简介；
使项目结构更适合提交。
```

---

## 14. 后续建议

### 14.1 保持当前 Bot，不必急着重写

当前概率抢答 Bot 已经能制造“对手存在感”。对 Jam 项目而言，足够形成可玩性。

### 14.2 优先修复词库稳定加载

比起继续加玩法，当前更重要的是：

```txt
线上可运行
词库可切换
页面无报错
README 清楚
提交材料完整
```

### 14.3 智能 Bot 可作为 v0.3

后续可以把 Bot 升级为：

```txt
候选词过滤 + 字母频率统计 + 自动猜词概率
```

但不建议在提交前临时大改核心逻辑。

---

## 15. 当前对话生成/涉及的文件清单

```txt
algorithm_competition_words.js
algorithm_competition_words_backup.txt
algorithm_competition_words_pack.zip
competitive_programming_wordbank.js
competitive_programming_wordbank_pack.zip
LetterRush_v0.2.2_wordbank_fix.zip
prompt-log.md
```

---

## 16. 可直接放入 README 的项目简介

```txt
Letter Rush is a local multiplayer word-guessing web game built for BOKE VIBE JAM, vibe-coded with ChatGPT 5.5 Plus Thinking. Players reveal letters, race to guess hidden words, and extend gameplay through standalone wordbanks.
```

短版：

```txt
A local multiplayer word-guessing web game for BOKE VIBE JAM, vibe-coded with ChatGPT 5.5 Plus Thinking.
```

---

## 17. 当前结论

当前项目最关键的修复点不是玩法，而是：

```txt
词库格式统一为 window.LETTER_RUSH_WORDBANKS
词库脚本必须在 main.js 前加载
GitHub Pages 路径大小写必须完全一致
```

完成这三点后，GitHub Pages 上词库无法读取的问题通常可以解决。
