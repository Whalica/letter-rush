# wordbanks 词库目录

本目录用于独立存放 Letter Rush 的主题词库文件，方便后续扩展和更新词库，而不需要修改游戏主逻辑。

## 当前词库文件

- `programming.js`：程序设计术语
- `cet4.js`：CET4 高频词
- `campus.js`：校园生活
- `games.js`：游戏与动漫

## 词库文件格式

每个词库文件都是一个普通 JavaScript 数据文件，格式如下：

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

## 新增词库步骤

1. 在 `wordbanks/` 下新建一个词库文件，例如 `animals.js`。
2. 按上述格式填写 `window.LETTER_RUSH_WORDBANKS.animals`。
3. 在 `index.html` 底部、`main.js` 之前增加一行：

```html
<script src="wordbanks/animals.js"></script>
```

4. 刷新页面后，该词库会自动出现在主题词库下拉框中。

## 注意事项

- 每个词库建议至少提供 10 个词或短语，否则无法抽取完整一局。
- 单词不区分大小写。
- 英文字母会隐藏为星号，数字、空格、连字符等符号会直接显示。
- 使用 `.js` 数据文件是为了兼容直接双击打开 `index.html` 的本地试玩场景；如果改用 `.json` 或 `.txt`，浏览器在 `file://` 环境下可能会阻止读取。
