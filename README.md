# 英语句式库 — English Sentence Pattern Arsenal

> Build your personal arsenal of English sentence patterns.
> 把"看懂"变成"会用"——建立你自己的句式军火库。

## Why

看懂一个句子和能自己写出来，中间隔着一座桥：**有意识的模仿输出**。

这个工具帮助你：
1. **提炼句式模板** — 从阅读中提取可迁移的骨架公式
2. **按场景分类** — 用标签体系组织，写作/口语时按需检索
3. **强制调用** — 每次写作前打开，选 1-2 个句式刻意使用

## How to use

### 浏览和筛选

直接在浏览器打开 `index.html`，或部署到 GitHub Pages。

- **点击标签 chip**：筛选包含该标签的句式（多选 = OR 逻辑）
- **搜索框**：在表达名、公式、母语感受、例句中模糊搜索
- **排序**：按 ID 或难度排序
- **点击卡片上的标签**：快速添加到当前筛选条件

### 添加新句式

编辑 `js/data.js`，在数组末尾追加一个新对象：

```js
{
  id: 9,                        // 上一个 ID + 1
  pattern: "你的英文表达",
  nativeFeel: "母语感受（中文）",
  formula: "骨架公式用 [placeholder]",
  sceneTags: ["listing", "contrast"],  // 从 data.js 顶部标签表选取
  examples: [
    { en: "Example sentence.", zh: "例句中文翻译" },
  ],
  usageNote: "使用说明 (可选)",
  source: "出处 (可选)",
  difficulty: "intermediate",   // basic | intermediate | advanced (可选)
},
```

文件头部有完整的标签速查表和复制粘贴模板。

## Tags

句式按四个维度分类：

| 维度 | 标签 |
|------|------|
| **Logic & Flow** | Listing, Contrast, Cause & Effect, Conditional, Concession, Emphasis, Progression, Transition, Summary, Exemplification |
| **Function** | Definition, Explanation, Evaluation, Suggestion, Description, Analogy, Qualification |
| **Register** | Formal, Colloquial, Academic, Business |
| **Structure** | Sentence Frame, Connector, Inversion, Cleft Sentence, Prepositional Phrase, Participle Phrase |

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Settings → Pages → Source: "Deploy from a branch"
3. Branch: `main`, folder: `/ (root)` → Save
4. Visit `https://<username>.github.io/<repo>/`

## Tech

Zero dependencies. Pure HTML + CSS + vanilla JS. Works by opening `index.html` directly.
