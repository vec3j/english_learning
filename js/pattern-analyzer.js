/*
 * PATTERN ANALYZER
 * Pure functions that analyze an English sentence and extract:
 *   - pattern name
 *   - formula (with [placeholders])
 *   - suggested sceneTags
 *   - nativeFeel hint (in Chinese)
 *
 * Exports to global: analyzeSentence(), genericAnalyze()
 */

var PatternAnalyzer = (function () {
  "use strict";

  /* ===== Known Pattern Signatures ===== */
  var KNOWN_PATTERNS = [
    {
      name: "..., most notably A, but also B, C or D.",
      test: /most notably .+ but also/i,
      extract: function (s) {
        return {
          pattern: "but also (独立补充用法)",
          formula: "..., most notably [A], but also [B], [C] or [D].",
          sceneTags: ["listing", "progression", "connector", "formal"],
          nativeFeelHint:
            "先说最突出的那个例子，然后用 but also 补充其他项，带一点递进和转折的语气。",
        };
      },
    },
    {
      name: "Not only ..., but also ...",
      test: /not only .+ but( also)? .+/i,
      extract: function (s) {
        return {
          pattern: "Not only ... but also ... (倒装强调)",
          formula:
            "Not only [did/does/has + subject + verb], but [subject] also [verb] ...",
          sceneTags: ["progression", "emphasis", "inversion", "formal"],
          nativeFeelHint:
            '"不但...而且..."的升级版，Not only 放句首时用倒装，语气比简单并列强烈得多。',
        };
      },
    },
    {
      name: "The more ..., the more ...",
      test: /the (more|less|[a-z]+er) .+ the (more|less|[a-z]+er) /i,
      extract: function (s) {
        return {
          pattern: "The more ..., the more ... (双比较级)",
          formula: "The more [subject + verb], the more [subject + verb].",
          sceneTags: ["causeEffect", "comparison", "sentenceFrame", "colloquial"],
          nativeFeelHint: '"越...就越..."——表达两个事物同步变化的因果关系，简洁有力。',
        };
      },
    },
    {
      name: "Given ..., ...",
      test: /^(given|given that) .+/i,
      extract: function (s) {
        return {
          pattern: "Given ... (前提条件)",
          formula: "Given [noun phrase / that + clause], [main clause].",
          sceneTags: ["causeEffect", "conditional", "prepPhrase", "formal", "academic"],
          nativeFeelHint:
            '"考虑到.../鉴于..."——先承认一个事实或条件，再基于此提出观点。比 because 更正式。',
        };
      },
    },
    {
      name: "As [adj] as ..., ...",
      test: /^as \w+ as .+(?:is|was|are|were|may|might|seems|can|could)/i,
      extract: function (s) {
        return {
          pattern: "As [adj] as ... is, ... (让步倒装)",
          formula: "As [adjective] as [subject + verb], [main clause].",
          sceneTags: ["concession", "transition", "inversion", "formal", "academic"],
          nativeFeelHint:
            '"虽然...很...但是..."——先承认对方观点或事实，然后用转折引出自己的观点。比 Although 更有文采。',
        };
      },
    },
    {
      name: "It is [adj] that ...",
      test: /^it is \w+ that /i,
      extract: function (s) {
        return {
          pattern: "It is [adj] that ... (主语从句强调)",
          formula: "It is [adjective] that [subject + verb + ...]",
          sceneTags: [
            "emphasis",
            "evaluation",
            "sentenceFrame",
            "formal",
            "academic",
          ],
          nativeFeelHint:
            '"很[adj]的是..."——强调某个特征或判断，比直接说 "X is Y" 更正式、更有力。',
        };
      },
    },
    {
      name: "What ... is ...",
      test: /^what .+ (?:is|was|are|were) /i,
      extract: function (s) {
        return {
          pattern: "What [clause] is ... (主语从句前置)",
          formula: "What [subject + verb] is [noun/adjective/clause].",
          sceneTags: ["emphasis", "cleftSentence", "sentenceFrame"],
          nativeFeelHint:
            '"...的是..."——把想强调的信息放到句末，制造悬念和重点。比 "X is Y" 更有节奏感。',
        };
      },
    },
    {
      name: "..., which means ...",
      test: /, which means( that)? /i,
      extract: function (s) {
        return {
          pattern: "..., which means (that) ... (非限定性定语从句补充)",
          formula: "[Complete sentence], which means (that) [consequence or explanation].",
          sceneTags: ["causeEffect", "explanation", "connector", "colloquial"],
          nativeFeelHint:
            '"...，这意味着..."——前面说一个事实或判断，后面用 which 引导的从句自然地补充推论或后果。',
        };
      },
    },
    {
      name: "Not only did/has/is ..., but also ...",
      test: /^(not only (?:did|has|is|are|was|were|does|do|can|could|will|would|should|may|might)\s)/i,
      extract: function (s) {
        return {
          pattern: "Not only [aux] ... but also ... (倒装强调)",
          formula:
            "Not only [auxiliary + subject + verb], but [subject] also [verb] ...",
          sceneTags: ["progression", "emphasis", "inversion", "formal"],
          nativeFeelHint:
            "Not only 放句首触发倒装（助动词提前），语气比正常语序强烈得多。写作中很出彩。",
        };
      },
    },
    {
      name: "Were it not for ..., ...",
      test: /^were it not for /i,
      extract: function (s) {
        return {
          pattern: "Were it not for ... (虚拟条件倒装)",
          formula: "Were it not for [noun phrase], [subject + would/might + verb].",
          sceneTags: ["conditional", "inversion", "formal"],
          nativeFeelHint: '"要不是.../如果没有..."——虚拟语气的倒装形式，比 "If it were not for" 更正式、更书面。',
        };
      },
    },
    {
      name: "Had it not been for ..., ...",
      test: /^had it not been for /i,
      extract: function (s) {
        return {
          pattern: "Had it not been for ... (虚拟条件倒装-过去)",
          formula: "Had it not been for [noun phrase], [subject + would have + past participle].",
          sceneTags: ["conditional", "inversion", "formal", "academic"],
          nativeFeelHint: '"要不是当时.../如果没有..."——对过去的虚拟倒装，比 "If it had not been for" 更正式有力。',
        };
      },
    },
    {
      name: "So [adj] ... that ...",
      test: /^so \w+ .+ that /i,
      extract: function (s) {
        return {
          pattern: "So [adj] that ... (结果状语倒装)",
          formula: "So [adjective] [be/verb + subject] that [result clause].",
          sceneTags: ["causeEffect", "emphasis", "inversion", "formal"],
          nativeFeelHint: '"如此...以至于..."——倒装形式强调程度，比正常语序更有冲击力。',
        };
      },
    },
    {
      name: "..., hence ...",
      test: /, hence /i,
      extract: function (s) {
        return {
          pattern: "..., hence ... (简洁因果)",
          formula: "[Statement], hence [noun phrase / clause].",
          sceneTags: ["causeEffect", "summary", "connector", "formal", "academic"],
          nativeFeelHint: '"...因此..."——hence 后面直接接名词或从句，比 therefore 更简洁精炼。学术写作高频词。',
        };
      },
    },
    {
      name: "Not ..., but rather ...",
      test: /not .+ but rather /i,
      extract: function (s) {
        return {
          pattern: "Not ..., but rather ... (否定+纠正)",
          formula: "Not [wrong idea], but rather [correct alternative].",
          sceneTags: ["contrast", "explanation", "connector", "formal"],
          nativeFeelHint: '"不是...而是..."——先否定一个常见误解，再用 but rather 给出正确版本。纠正错误认知时很有力。',
        };
      },
    },
    {
      name: "..., as evidenced by ...",
      test: /, as evidenced by /i,
      extract: function (s) {
        return {
          pattern: "..., as evidenced by ... (引用证据)",
          formula: "[Claim], as evidenced by [supporting fact/data].",
          sceneTags: ["exemplify", "explanation", "formal", "academic"],
          nativeFeelHint: '"...，这一点由...可以证明"——提出观点后引用具体证据。学术写作论证必备。',
        };
      },
    },
    {
      name: "There is no denying that ...",
      test: /there is no denying( that)? /i,
      extract: function (s) {
        return {
          pattern: "There is no denying that ... (强调不可否认)",
          formula: "There is no denying that [undeniable fact].",
          sceneTags: ["emphasis", "evaluation", "sentenceFrame", "formal"],
          nativeFeelHint: '"不可否认的是..."——强调某个事实的无可争议性，引出后文时很有说服力。',
        };
      },
    },
    {
      name: "It is no coincidence that ...",
      test: /it is no (coincidence|accident|surprise|wonder) that /i,
      extract: function (s) {
        return {
          pattern: "It is no [noun] that ... (双重否定强调)",
          formula: "It is no [coincidence/surprise/wonder] that [clause].",
          sceneTags: ["emphasis", "evaluation", "sentenceFrame", "formal"],
          nativeFeelHint: '"...绝非偶然/不足为奇"——用否定形式表达强烈的肯定，比直接说 "It is obvious that" 更有层次。',
        };
      },
    },
    {
      name: "Only by ... can ...",
      test: /^only (by|when|after|through|if) .+ (?:can|could|will|would|do|does|did|is|are|was|were)/i,
      extract: function (s) {
        return {
          pattern: "Only by ... can ... (唯一条件倒装)",
          formula: "Only by [method/condition] can [subject + verb].",
          sceneTags: ["conditional", "emphasis", "inversion", "formal"],
          nativeFeelHint: '"只有通过...才能..."——Only 放句首触发倒装，强调唯一的条件或方式。非常有力量。',
        };
      },
    },
    {
      name: "Just as ..., so too ...",
      test: /^just as .+ so( too)? /i,
      extract: function (s) {
        return {
          pattern: "Just as ..., so too ... (类比并列)",
          formula: "Just as [subject + verb], so too [does/can/will + subject + verb].",
          sceneTags: ["comparison", "progression", "sentenceFrame", "formal"],
          nativeFeelHint: '"正如...一样，...也..."——建立两个事物的类比关系，学术写作中用于推出类比结论。',
        };
      },
    },
    {
      name: "..., let alone ...",
      test: /, let alone /i,
      extract: function (s) {
        return {
          pattern: "..., let alone ... (递进否定)",
          formula: "[Negative statement], let alone [even less likely thing].",
          sceneTags: ["progression", "contrast", "connector", "colloquial"],
          nativeFeelHint: '"...更不用说..."——前面否定一个较容易的事，用 let alone 推出更难的事。口语写作皆可。',
        };
      },
    },
  ];

  /* ===== Generic Structural Analyzer ===== */
  var STRUCTURE_MARKERS = [
    { regex: /^(?:in|on|at|by|with|from|to|for|of|under|over|through|during|despite|given|considering|regarding|concerning|according to|in terms of|in light of|in spite of|with regard to)\s/i,
      tag: "prepPhrase",
      note: "以介词短语开头 → 前置介词结构" },
    { regex: /\b(however|nevertheless|nonetheless|although|though|even though|despite|in spite of)\b/i,
      tag: "concession",
      note: "包含让步/转折连词" },
    { regex: /\b(therefore|thus|hence|consequently|as a result|accordingly|so)\b/i,
      tag: "causeEffect",
      note: "包含因果连词" },
    { regex: /\b(for example|for instance|such as|including|like|namely|e\.g\.|i\.e\.)\b/i,
      tag: "exemplify",
      note: "包含举例标记" },
    { regex: /\b(in conclusion|to sum up|in summary|overall|all in all|in short)\b/i,
      tag: "summary",
      note: "包含总结标记" },
    { regex: /^(?:if|unless|provided that|as long as|on condition that)/i,
      tag: "conditional",
      note: "以条件连词开头" },
    { regex: /\b(not only|moreover|furthermore|in addition|besides|additionally|what is more)\b/i,
      tag: "progression",
      note: "包含递进标记" },
    { regex: /\b(but|yet|however|on the other hand|conversely|whereas|while|in contrast|by contrast|instead)\b/i,
      tag: "contrast",
      note: "包含对比/转折标记" },
    { regex: /\b(first|second|third|finally|lastly|firstly|last but not least|to begin with)\b/i,
      tag: "listing",
      note: "包含列举标记" },
    { regex: /^(?:it is|it was) .+ (?:that|to) /i,
      tag: "sentenceFrame",
      note: "It 引导的句型框架" },
    { regex: /^(?:what|where|why|how|when|who) .+ (?:is|was|are|were) /i,
      tag: "cleftSentence",
      note: "Wh- 分裂句" },
    { regex: /\b(?:it is (?:essential|important|necessary|critical|crucial|vital|imperative|advisable|desirable|preferable) (?:that|to))\b/i,
      tag: "suggestion",
      note: "包含建议/必要性表达" },
    { regex: /\b(?:can be defined as|refers to|is defined as|the term .+ means)\b/i,
      tag: "definition",
      note: "包含定义表达" },
    { regex: /\b(?:in other words|that is to say|i\.e\.|namely|to put it (?:differently|another way|simply))\b/i,
      tag: "explanation",
      note: "包含解释/换说标记" },
    { regex: /^(?:[A-Z][a-z]+ing|Having [a-z]+ed)\s/i,
      tag: "participlePhrase",
      note: "以分词短语开头" },
    { regex: /\b(?:significantly|notably|strikingly|remarkably|interestingly|importantly|surprisingly|curiously)\b/i,
      tag: "evaluation",
      note: "包含评价性副词" },
    { regex: /\b(?:compared to|compared with|in comparison|similarly|likewise|by comparison|analogous|parallel)\b/i,
      tag: "comparison",
      note: "包含比较表达" },
    { regex: /\b(?:tend to|generally|typically|in most cases|for the most part|to some extent|in a sense|broadly speaking|strictly speaking)\b/i,
      tag: "qualification",
      note: "包含限定/弱化表达" },
  ];

  /* ===== Generic Analyzer ===== */
  function genericAnalyze(sentence) {
    var tags = [];
    var notes = [];

    for (var i = 0; i < STRUCTURE_MARKERS.length; i++) {
      var marker = STRUCTURE_MARKERS[i];
      if (marker.regex.test(sentence)) {
        if (tags.indexOf(marker.tag) === -1) {
          tags.push(marker.tag);
        }
        notes.push(marker.note);
      }
    }

    // Default tags if nothing detected
    if (tags.length === 0) {
      tags = ["sentenceFrame"];
    }

    // Try to generate a sensible pattern name from the sentence structure
    var pattern = guessPatternName(sentence, tags);

    // Try to generate a formula by replacing specific words with placeholders
    var formula = generateFormula(sentence);

    var nativeFeelHint = notes.length > 0 ? notes[0] : "通用句式";

    return {
      pattern: pattern,
      formula: formula,
      sceneTags: tags,
      nativeFeelHint: nativeFeelHint,
    };
  }

  /* ===== Guess Pattern Name ===== */
  function guessPatternName(sentence, tags) {
    // Look for key connectors in the sentence
    if (/^if /i.test(sentence)) return "If ..., ... (条件句)";
    if (/^when /i.test(sentence)) return "When ..., ... (时间/条件)";
    if (/^although /i.test(sentence)) return "Although ..., ... (让步句)";
    if (/^while /i.test(sentence)) return "While ..., ... (对比/同时)";
    if (/^whereas /i.test(sentence)) return "Whereas ..., ... (对比句)";
    if (/^since /i.test(sentence)) return "Since ..., ... (原因/自从)";
    if (/^once /i.test(sentence)) return "Once ..., ... (一旦...)";
    if (/^unless /i.test(sentence)) return "Unless ..., ... (除非...)";
    if (/^(in|on|at|by|with|from) /i.test(sentence))
      return "Prep Phrase Fronting (介词前置)";
    if (/^[A-Z][a-z]+ing /i.test(sentence) || /^Having [a-z]+ed /i.test(sentence))
      return "Participle Phrase Opening (分词开头)";

    // Default
    return "Custom Pattern";
  }

  /* ===== Generate Formula ===== */
  function generateFormula(sentence) {
    var formula = sentence;

    // Replace quoted strings
    formula = formula.replace(/"[^"]*"/g, '"[quote]"');
    formula = formula.replace(/'[^']*'/g, "'[word]'");

    // Replace numbers
    formula = formula.replace(/\b\d+(?:\.\d+)?%?\b/g, "[number]");

    // Replace capitalized proper names (sequences of 2+ capitalized words)
    formula = formula.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g, function (match) {
      // Don't replace if it starts the sentence (could be a normal word)
      return "[Name]";
    });

    // Replace percentages
    formula = formula.replace(/\[number\]%/g, "[percentage]");

    // Don't over-replace — keep it recognizable
    // Only replace if we haven't already added placeholders
    var placeholderCount = (formula.match(/\[.+?\]/g) || []).length;
    if (placeholderCount < 2) {
      // Replace long noun phrases (3+ words before a verb) — rough heuristic
      formula = formula.replace(/\b(?:the|a|an)\s+\w+\s+\w+\s+\w+/gi, "[something]");
    }

    return formula;
  }

  /* ===== Main Public API ===== */
  function analyzeSentence(sentence) {
    if (!sentence || !sentence.trim()) {
      return null;
    }

    var trimmed = sentence.trim();

    // Try known patterns first
    for (var i = 0; i < KNOWN_PATTERNS.length; i++) {
      var rule = KNOWN_PATTERNS[i];
      if (rule.test.test(trimmed)) {
        var result = rule.extract(trimmed);
        result.detectedPattern = rule.name;
        return result;
      }
    }

    // Fallback to generic analysis
    var generic = genericAnalyze(trimmed);
    generic.detectedPattern = "generic";
    return generic;
  }

  /* Public API */
  return {
    analyzeSentence: analyzeSentence,
    genericAnalyze: genericAnalyze,
    KNOWN_PATTERNS: KNOWN_PATTERNS,
  };
})();
