/*
 * TAG TAXONOMY
 * Each tag has: zh (Chinese label), en (English label), color (hex)
 * Grouped by category for the filter UI.
 */

const TAG_CATEGORIES = {
  logic: {
    label: "Logic & Flow",
    tags: {
      listing:       { zh: "列举",   en: "Listing",            color: "#4A90D9" },
      contrast:      { zh: "对比",   en: "Contrast",           color: "#E67E22" },
      causeEffect:   { zh: "因果",   en: "Cause & Effect",     color: "#E74C3C" },
      conditional:   { zh: "假设",   en: "Conditional",        color: "#9B59B6" },
      concession:    { zh: "让步",   en: "Concession",         color: "#1ABC9C" },
      emphasis:      { zh: "强调",   en: "Emphasis",           color: "#D4A017" },
      progression:   { zh: "递进",   en: "Progression",        color: "#2ECC71" },
      transition:    { zh: "转折",   en: "Transition",         color: "#E91E63" },
      summary:       { zh: "总结",   en: "Summary",            color: "#795548" },
      exemplify:     { zh: "举例",   en: "Exemplification",    color: "#607D8B" },
    }
  },
  function: {
    label: "Function",
    tags: {
      definition:    { zh: "下定义", en: "Definition",         color: "#3F51B5" },
      explanation:   { zh: "解释",   en: "Explanation",        color: "#009688" },
      evaluation:    { zh: "评价",   en: "Evaluation",         color: "#FF5722" },
      suggestion:    { zh: "建议",   en: "Suggestion",         color: "#8BC34A" },
      description:   { zh: "描述",   en: "Description",        color: "#00BCD4" },
      comparison:    { zh: "类比",   en: "Analogy",            color: "#FF9800" },
      qualification: { zh: "限定",   en: "Qualification",      color: "#9E9E9E" },
    }
  },
  register: {
    label: "Register",
    tags: {
      formal:        { zh: "正式",   en: "Formal",             color: "#5C6BC0" },
      colloquial:    { zh: "口语",   en: "Colloquial",         color: "#4CAF50" },
      academic:      { zh: "学术",   en: "Academic",           color: "#3F51B5" },
      business:      { zh: "商务",   en: "Business",           color: "#795548" },
    }
  },
  structure: {
    label: "Structure",
    tags: {
      sentenceFrame:     { zh: "句型框架",     en: "Sentence Frame",      color: "#5C6BC0" },
      connector:         { zh: "连接词",       en: "Connector",           color: "#26A69A" },
      inversion:         { zh: "倒装",         en: "Inversion",           color: "#EF5350" },
      cleftSentence:     { zh: "分裂句",       en: "Cleft Sentence",      color: "#AB47BC" },
      prepPhrase:        { zh: "介词短语",     en: "Prepositional Phrase", color: "#FF7043" },
      participlePhrase:  { zh: "分词短语",     en: "Participle Phrase",   color: "#42A5F5" },
    }
  }
};

/*
 * Flat lookup: ALL_TAGS[tagId] => { zh, en, color, category }
 * Built automatically from TAG_CATEGORIES.
 */
const ALL_TAGS = {};
for (const [catKey, cat] of Object.entries(TAG_CATEGORIES)) {
  for (const [tagId, tag] of Object.entries(cat.tags)) {
    ALL_TAGS[tagId] = { ...tag, category: catKey, categoryLabel: cat.label };
  }
}
