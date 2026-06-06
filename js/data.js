/*
 * PATTERN DATABASE
 * ──────────────────────────────────────────
 * TAG REFERENCE (copy-paste tag IDs from here):
 *
 *   Logic:   listing, contrast, causeEffect, conditional, concession,
 *            emphasis, progression, transition, summary, exemplify
 *   Function: definition, explanation, evaluation, suggestion,
 *             description, comparison, qualification
 *   Register: formal, colloquial, academic, business
 *   Structure: sentenceFrame, connector, inversion, cleftSentence,
 *              prepPhrase, participlePhrase
 *
 * FIELD REFERENCE:
 *   id          - number (unique, sequential)
 *   pattern     - string: the English expression
 *   nativeFeel  - string: Chinese "feel" of the pattern
 *   formula     - string: skeleton with [placeholders]
 *   sceneTags   - string[]: tag IDs from the reference above
 *   examples    - { en: string, zh: string }[]
 *   usageNote   - string (optional): when/how to use
 *   source      - string (optional): where it was found
 *   difficulty  - "basic" | "intermediate" | "advanced" (optional)
 * ──────────────────────────────────────────
 */

const PATTERNS = [
  {
    id: 1,
    pattern: "but also (独立补充用法)",
    nativeFeel: "先说最突出的那个例子，然后用 but also 补充 B、C、D，带一点递进和转折的语气。",
    formula: "..., most notably A, but also B, C or D.",
    sceneTags: ["listing", "progression", "connector", "formal"],
    examples: [
      {
        en: "The unique shape of the structure is claimed to have been inspired by various sources, most notably a Celtic double-headed axe, but also the vast turning propeller of a ship, the ribcage of a whale or the spine of a fish.",
        zh: "该建筑独特的造型据说受到了多种来源的启发，最著名的是凯尔特双头斧，此外还有巨轮旋转的螺旋桨、鲸鱼的胸腔或鱼类的脊骨。"
      },
      {
        en: "Her talent lies in many areas, most notably mathematics, but also music and literature.",
        zh: "她的才华体现在很多方面，最突出的是数学，但音乐和文学也同样出色。"
      }
    ],
    usageNote: "适用于列举多个灵感/原因/例子时，most notably 先举最突出的，but also 补充次要的。写作和演讲中都很实用。",
    source: "IELTS Reading passage",
    difficulty: "intermediate"
  },
  {
    id: 2,
    pattern: "Not only ... but also ... (倒装强调)",
    nativeFeel: "\"不但...而且...\"的升级版，Not only 放句首时用倒装，语气比简单并列强烈得多。",
    formula: "Not only [did/does/has + subject + verb], but [subject] also [verb] ...",
    sceneTags: ["progression", "emphasis", "inversion", "formal"],
    examples: [
      {
        en: "Not only did she finish the project ahead of schedule, but she also came in under budget.",
        zh: "她不仅提前完成了项目，而且还低于预算。"
      },
      {
        en: "Not only does regular exercise improve physical health, but it also boosts mental well-being.",
        zh: "经常锻炼不仅改善身体健康，而且提升心理幸福感。"
      }
    ],
    usageNote: "Not only 放句首时必须倒装（助动词提前）；but also 中的 also 可省略。口语中较少倒装，直接用 \"She not only finished...\" 更自然。",
    source: "Academic writing patterns",
    difficulty: "advanced"
  },
  {
    id: 3,
    pattern: "It is [adj] that [clause] (主语从句强调)",
    nativeFeel: "\"很[adj]的是...\"——强调某个特征或判断，比直接说 \"X is Y\" 更正式、更有力。",
    formula: "It is [adjective] that [subject + verb + ...]",
    sceneTags: ["emphasis", "evaluation", "sentenceFrame", "formal", "academic"],
    examples: [
      {
        en: "It is essential that we address this issue immediately.",
        zh: "很关键的是，我们必须立即处理这个问题。"
      },
      {
        en: "It is surprising that no one noticed the error before the release.",
        zh: "令人惊讶的是，发布前居然没人注意到这个错误。"
      }
    ],
    usageNote: "适用于学术写作和正式场合。口语中用 \"It's [adj] that...\" 的缩略形式也很自然。常见形容词：essential, important, surprising, inevitable, clear, likely。",
    source: "Cambridge Grammar in Use",
    difficulty: "intermediate"
  },
  {
    id: 4,
    pattern: "The more ..., the more ... (双比较级)",
    nativeFeel: "\"越...就越...\"——表达两个事物同步变化的因果关系，简洁有力。",
    formula: "The more [noun/subject + verb], the more [noun/subject + verb].",
    sceneTags: ["causeEffect", "comparison", "sentenceFrame", "colloquial"],
    examples: [
      {
        en: "The more you practice, the more confident you become.",
        zh: "你练得越多，就会变得越自信。"
      },
      {
        en: "The more I learn about the topic, the more I realize how little I know.",
        zh: "对这个话题了解得越多，我越意识到自己知道得太少。"
      }
    ],
    usageNote: "口语和写作皆可。结构灵活：可以用形容词比较级 (the harder, the better) 也可以用名词 (the more money, the more problems)。前后主语可以不同。",
    source: "Common English patterns",
    difficulty: "basic"
  },
  {
    id: 5,
    pattern: "What [clause] is ... (主语从句前置)",
    nativeFeel: "\"...的是...\"——把想强调的信息放到句末，制造悬念和重点。比 \"X is Y\" 更有节奏感。",
    formula: "What [subject + verb] is [noun/adjective/clause].",
    sceneTags: ["emphasis", "cleftSentence", "sentenceFrame"],
    examples: [
      {
        en: "What surprised me most was his complete lack of preparation.",
        zh: "最让我吃惊的是，他完全没有准备。"
      },
      {
        en: "What the company needs right now is a clear vision, not another restructure.",
        zh: "公司现在需要的是一个清晰的愿景，而不是又一次重组。"
      }
    ],
    usageNote: "和 It is ... that ... 一样是强调结构（分裂句），但 What 开头更口语化、更灵活。写作中可以用来打破主语开头的单调节奏。",
    source: "BBC News articles",
    difficulty: "intermediate"
  },
  {
    id: 6,
    pattern: "..., which means (that) ... (非限定性定语从句补充)",
    nativeFeel: "\"...，这意味着...\"——前面说一个事实或判断，后面用 which 引导的从句自然地补充推论或后果。非常地道的英文思维连接方式。",
    formula: "[Complete sentence], which means (that) [consequence or explanation].",
    sceneTags: ["causeEffect", "explanation", "connector", "colloquial"],
    examples: [
      {
        en: "The test requires a score of 7.0, which means most applicants need at least six months of preparation.",
        zh: "这个考试要求 7.0 分，这意味着大多数考生至少需要准备六个月。"
      },
      {
        en: "He never replies to messages after 8pm, which means if there's an emergency, you need to call.",
        zh: "他晚上八点之后从不回消息，这意味着如果有急事，你得打电话。"
      }
    ],
    usageNote: "口语中极常用。which 指代前面整个句子的内容。可以用来补充解释、推测后果、或归纳结论。比用 So... 或 Therefore... 更自然流畅。",
    source: "Native speaker conversation patterns",
    difficulty: "basic"
  },
  {
    id: 7,
    pattern: "Given [noun/that clause], ... (前提条件)",
    nativeFeel: "\"考虑到.../鉴于...\"——先承认一个事实或条件，再基于此提出观点。比 because 更正式，比 considering 更简洁。",
    formula: "Given [noun phrase / that + clause], [main clause].",
    sceneTags: ["causeEffect", "conditional", "formal", "academic", "prepPhrase"],
    examples: [
      {
        en: "Given the complexity of the issue, a quick solution is unlikely.",
        zh: "考虑到问题的复杂性，快速解决不太可能。"
      },
      {
        en: "Given that most participants had no prior experience, the results are quite impressive.",
        zh: "鉴于大多数参与者此前毫无经验，这个结果相当令人印象深刻。"
      }
    ],
    usageNote: "学术和商务写作必备。Given 后面可以接名词短语 (Given the situation) 或 that 从句 (Given that we are behind schedule)。放句首或句尾都可以。",
    source: "Academic writing templates",
    difficulty: "intermediate"
  },
  {
    id: 8,
    pattern: "As [adj] as [subject] is, ... (让步倒装)",
    nativeFeel: "\"虽然...很...但是...\"——先承认对方观点或事实，然后用转折引出自己的观点。比 Although 更有文采。",
    formula: "As [adjective] as [subject + verb], [main clause].",
    sceneTags: ["concession", "transition", "inversion", "formal", "academic"],
    examples: [
      {
        en: "As impressive as the design is, it fails to address the core user need.",
        zh: "这个设计虽然令人印象深刻，但未能解决核心用户需求。"
      },
      {
        en: "As tempting as the offer may be, we should consider the long-term implications.",
        zh: "这个提议虽然诱人，但我们应该考虑长期影响。"
      }
    ],
    usageNote: "适用于议论文和批判性分析。这种倒装比 Although 更有张力和文采。结构：As + adj + as + 主语 + 动词, 主句。也可以用 Much as... 的简化变体。",
    source: "The Economist opinion pieces",
    difficulty: "advanced"
  }
];

/*
 * LOCAL STORAGE MERGE HELPERS
 * ──────────────────────────────────────────
 * User-added patterns are stored in localStorage and merged with
 * the built-in PATTERNS at runtime. This keeps the static site
 * working without a backend while allowing users to add patterns.
 */

function loadUserPatterns() {
  try {
    return JSON.parse(localStorage.getItem("userPatterns") || "[]");
  } catch (e) {
    return [];
  }
}

function getAllPatterns() {
  var userPatterns = loadUserPatterns();
  return PATTERNS.concat(userPatterns);
}

function getNextUserPatternId() {
  var userPatterns = loadUserPatterns();
  if (userPatterns.length === 0) return 9000;
  var maxId = 9000;
  for (var i = 0; i < userPatterns.length; i++) {
    if (userPatterns[i].id > maxId) maxId = userPatterns[i].id;
  }
  return maxId + 1;
}

/*
 * COPY-PASTE TEMPLATE for adding a new pattern:
 *
 * {
 *   id: NEXT_ID,
 *   pattern: "",
 *   nativeFeel: "",
 *   formula: "",
 *   sceneTags: [],
 *   examples: [
 *     { en: "", zh: "" },
 *     { en: "", zh: "" },
 *   ],
 *   usageNote: "",
 *   source: "",
 *   difficulty: "intermediate",
 * },
 */
