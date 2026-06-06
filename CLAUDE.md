# CLAUDE.md — English Sentence Pattern Arsenal

## Project Purpose

A personal "句式军火库" (Sentence Pattern Arsenal) for a Chinese speaker learning English. The core philosophy: **knowing what a sentence means ≠ being able to use it**. The bridge from passive understanding to active use is **conscious imitative output**.

## Learning Methodology (3-Step Framework)

For each pattern, the user follows:

1. **Extract a migratable template** — distill the original sentence into a skeleton formula with placeholders
2. **Verify by creating sentences** — apply the formula to familiar, everyday topics to test if it "feels right"
3. **Polish via back-translation** — find a Chinese passage with similar logic, translate it into English while forcing the use of the target pattern

## Data Model

Each sentence pattern entry in `js/data.js`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | yes | Unique sequential number |
| `pattern` | string | yes | The English expression (e.g., `"but also (independent supplement)"`) |
| `nativeFeel` | string | yes | How it "feels" in Chinese — the closest native equivalent and emotional/rhetorical weight |
| `formula` | string | yes | Skeleton with `[placeholders]` (e.g., `"..., most notably A, but also B, C or D."`) |
| `sceneTags` | string[] | yes | Tag IDs from the tag taxonomy in `js/tags.js` |
| `examples` | {en, zh}[] | yes | At least 1 example pair (English + Chinese translation) |
| `usageNote` | string | no | When to use, common mistakes, register notes (in Chinese) |
| `source` | string | no | Where the pattern was extracted from |
| `difficulty` | string | no | `"basic"` / `"intermediate"` / `"advanced"` |

## Tag Taxonomy (4 Categories)

- **逻辑关系 (Logic)**: listing, contrast, causeEffect, conditional, concession, emphasis, progression, transition, summary, exemplify
- **功能目的 (Function)**: definition, explanation, evaluation, suggestion, description, comparison, qualification
- **语域风格 (Register)**: formal, colloquial, academic, business
- **句式结构 (Structure)**: sentenceFrame, connector, inversion, cleftSentence, prepPhrase, participlePhrase

Tags within a selection use OR logic. Search + tags use AND logic.

## Tech Stack

- **Pure static site** — HTML + CSS + vanilla JS, zero dependencies, zero build step
- **No framework, no npm, no bundler**
- Deployed via **GitHub Pages** (`.github/workflows/deploy.yml`)
- Data stored as plain JS objects in `js/data.js` — edit directly to add patterns

## Project Structure

```
/
├── index.html              # Single-page shell
├── css/style.css           # All styles (custom properties + responsive)
├── js/
│   ├── tags.js             # Tag taxonomy definitions
│   ├── data.js             # Pattern database (USER EDITS THIS)
│   └── app.js              # Filter, search, sort, render logic
├── .github/workflows/deploy.yml
└── README.md
```

## How to Add a New Pattern

Edit `js/data.js` — append a new object to the `PATTERNS` array:

```js
{
  id: NEXT_ID,
  pattern: "",
  nativeFeel: "",
  formula: "",
  sceneTags: [],
  examples: [
    { en: "", zh: "" },
  ],
  usageNote: "",
  source: "",
  difficulty: "intermediate",
},
```

The top of `js/data.js` has a tag reference cheat sheet for copy-pasting tag IDs.

## Deployment

Push to `main` → GitHub Actions auto-deploys to `https://vec3j.github.io/english_learning/`
