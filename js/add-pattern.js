/*
 * ADD PATTERN — Modal form, auto-analysis, localStorage CRUD
 * Depends on: TAG_CATEGORIES, ALL_TAGS (from tags.js), PatternAnalyzer (from pattern-analyzer.js)
 * Exports to global: AddPattern
 */

var AddPattern = (function () {
  "use strict";

  var USER_PATTERNS_KEY = "userPatterns";
  var USER_ID_START = 9000;

  /* ===== DOM refs (lazy init) ===== */
  var modalOverlay, modalPanel, modalCloseBtn, cancelBtn;
  var sentenceInput, analyzeBtn;
  var patternInput, nativeFeelInput, formulaInput;
  var tagSelector, examplesContainer, addExampleBtn;
  var usageNoteInput, sourceInput, difficultySelect;
  var previewCard;
  var saveBtn, exportBtn;
  var deleteBtn; // only shown when editing existing user pattern

  var state = {
    editingId: null, // null = new pattern, number = editing existing
  };

  /* ===== LocalStorage Helpers ===== */
  function loadUserPatterns() {
    try {
      return JSON.parse(localStorage.getItem(USER_PATTERNS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveUserPatterns(patterns) {
    localStorage.setItem(USER_PATTERNS_KEY, JSON.stringify(patterns));
  }

  function getNextUserPatternId() {
    var userPatterns = loadUserPatterns();
    if (userPatterns.length === 0) return USER_ID_START;
    var maxId = USER_ID_START;
    for (var i = 0; i < userPatterns.length; i++) {
      if (userPatterns[i].id > maxId) maxId = userPatterns[i].id;
    }
    return maxId + 1;
  }

  /* ===== Form State ===== */
  function getFormData() {
    var selectedTags = [];
    var tagChips = tagSelector.querySelectorAll(".tag-chip.active");
    for (var i = 0; i < tagChips.length; i++) {
      selectedTags.push(tagChips[i].dataset.tagId);
    }

    var examples = [];
    var exampleRows = examplesContainer.querySelectorAll(".ap-example-row");
    for (var j = 0; j < exampleRows.length; j++) {
      var enInput = exampleRows[j].querySelector(".ap-example-en");
      var zhInput = exampleRows[j].querySelector(".ap-example-zh");
      var en = enInput ? enInput.value.trim() : "";
      var zh = zhInput ? zhInput.value.trim() : "";
      if (en) {
        examples.push({ en: en, zh: zh });
      }
    }

    return {
      pattern: patternInput.value.trim(),
      nativeFeel: nativeFeelInput.value.trim(),
      formula: formulaInput.value.trim(),
      sceneTags: selectedTags,
      examples: examples,
      usageNote: usageNoteInput.value.trim(),
      source: sourceInput.value.trim(),
      difficulty: difficultySelect.value,
    };
  }

  function setFormData(data) {
    patternInput.value = data.pattern || "";
    nativeFeelInput.value = data.nativeFeel || "";
    formulaInput.value = data.formula || "";
    usageNoteInput.value = data.usageNote || "";
    sourceInput.value = data.source || "";
    difficultySelect.value = data.difficulty || "intermediate";

    // Set tags
    var chips = tagSelector.querySelectorAll(".tag-chip");
    var tags = data.sceneTags || [];
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      if (tags.indexOf(chip.dataset.tagId) !== -1) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    }

    // Set examples
    examplesContainer.innerHTML = "";
    var examples = data.examples || [];
    if (examples.length === 0) {
      addExampleRow();
    } else {
      for (var j = 0; j < examples.length; j++) {
        addExampleRow(examples[j].en, examples[j].zh);
      }
    }
  }

  function resetForm() {
    state.editingId = null;
    patternInput.value = "";
    nativeFeelInput.value = "";
    formulaInput.value = "";
    usageNoteInput.value = "";
    sourceInput.value = "";
    difficultySelect.value = "intermediate";
    sentenceInput.value = "";

    // Reset tags
    var chips = tagSelector.querySelectorAll(".tag-chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.remove("active");
    }

    // Reset examples
    examplesContainer.innerHTML = "";
    addExampleRow();

    // Reset preview
    updatePreview();

    // Hide delete button
    if (deleteBtn) deleteBtn.style.display = "none";
  }

  /* ===== Example Row Management ===== */
  function addExampleRow(enVal, zhVal) {
    var row = document.createElement("div");
    row.className = "ap-example-row";

    var enInput = document.createElement("input");
    enInput.type = "text";
    enInput.className = "ap-example-en";
    enInput.placeholder = "English example sentence...";
    enInput.value = enVal || "";
    enInput.addEventListener("input", updatePreview);
    row.appendChild(enInput);

    var zhInput = document.createElement("input");
    zhInput.type = "text";
    zhInput.className = "ap-example-zh";
    zhInput.placeholder = "Chinese translation...";
    zhInput.value = zhVal || "";
    zhInput.addEventListener("input", updatePreview);
    row.appendChild(zhInput);

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "ap-example-remove";
    removeBtn.innerHTML = "&#x2715;";
    removeBtn.title = "Remove this example";
    removeBtn.addEventListener("click", function () {
      var rows = examplesContainer.querySelectorAll(".ap-example-row");
      if (rows.length <= 1) {
        // Clear instead of remove last row
        var en = rows[0].querySelector(".ap-example-en");
        var zh = rows[0].querySelector(".ap-example-zh");
        if (en) en.value = "";
        if (zh) zh.value = "";
        updatePreview();
        return;
      }
      row.remove();
      updatePreview();
    });
    row.appendChild(removeBtn);

    examplesContainer.appendChild(row);
  }

  /* ===== Tag Selector ===== */
  function buildTagSelector() {
    tagSelector.innerHTML = "";

    for (var catKey in TAG_CATEGORIES) {
      if (!TAG_CATEGORIES.hasOwnProperty(catKey)) continue;
      var cat = TAG_CATEGORIES[catKey];

      var catDiv = document.createElement("div");
      catDiv.className = "tag-category";

      var label = document.createElement("div");
      label.className = "tag-category-label";
      label.textContent = cat.label;
      catDiv.appendChild(label);

      var chipsRow = document.createElement("div");
      chipsRow.className = "tag-chips-row";

      for (var tagId in cat.tags) {
        if (!cat.tags.hasOwnProperty(tagId)) continue;
        var tag = cat.tags[tagId];

        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "tag-chip";
        chip.dataset.tagId = tagId;
        chip.style.setProperty("--chip-color", tag.color);

        var dot = document.createElement("span");
        dot.className = "tag-chip-dot";
        chip.appendChild(dot);

        var text = document.createElement("span");
        text.textContent = tag.en;
        chip.appendChild(text);

        chip.addEventListener("click", function (e) {
          e.preventDefault();
          this.classList.toggle("active");
          updatePreview();
        });

        chipsRow.appendChild(chip);
      }

      catDiv.appendChild(chipsRow);
      tagSelector.appendChild(catDiv);
    }
  }

  /* ===== Live Preview ===== */
  function updatePreview() {
    var data = getFormData();
    if (!data.pattern && !data.formula && data.examples.every(function (e) { return !e.en; })) {
      previewCard.innerHTML =
        '<div class="ap-preview-placeholder">Fill in the fields above to see a live preview</div>';
      return;
    }

    // Build a temporary pattern object
    var tempPattern = {
      id: state.editingId || 999,
      pattern: data.pattern || "(Pattern name)",
      nativeFeel: data.nativeFeel || "",
      formula: data.formula || "",
      sceneTags: data.sceneTags,
      examples: data.examples.length > 0 ? data.examples : [],
      usageNote: data.usageNote || "",
      source: data.source || "",
      difficulty: data.difficulty || "intermediate",
    };

    // Use the exposed createPatternCard if available, otherwise build simple preview
    if (typeof window.buildPatternCard === "function") {
      previewCard.innerHTML = "";
      var card = window.buildPatternCard(tempPattern);
      card.style.opacity = "0.85";
      card.style.transform = "none";
      card.style.boxShadow = "none";
      card.style.border = "2px dashed var(--color-border)";
      previewCard.appendChild(card);
    } else {
      previewCard.innerHTML = buildSimplePreview(tempPattern);
    }
  }

  function buildSimplePreview(p) {
    var html = '<div class="pattern-card" style="opacity:0.85;border:2px dashed var(--color-border);">';
    html += '<div class="card-header">';
    html += '<span class="card-id">#PREVIEW</span>';
    html += '<span class="card-pattern">' + escapeHtml(p.pattern) + "</span>";
    html += "</div>";

    if (p.formula) {
      html += '<div class="card-section">';
      html += '<span class="card-label">Formula</span>';
      html += '<div class="card-formula">' + escapeHtml(p.formula) + "</div>";
      html += "</div>";
    }

    if (p.examples && p.examples.length > 0) {
      html += '<div class="card-section">';
      html += '<span class="card-label">Examples</span>';
      html += '<div class="card-examples">';
      for (var i = 0; i < p.examples.length; i++) {
        html += '<div class="card-example">';
        html +=
          '<div class="card-example-en">' +
          escapeHtml(p.examples[i].en) +
          "</div>";
        if (p.examples[i].zh) {
          html +=
            '<div class="card-example-zh">' +
            escapeHtml(p.examples[i].zh) +
            "</div>";
        }
        html += "</div>";
      }
      html += "</div></div>";
    }

    if (p.difficulty) {
      html +=
        '<span class="card-difficulty difficulty-' +
        p.difficulty +
        '">' +
        p.difficulty +
        "</span>";
    }

    html += "</div>";
    return html;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===== Auto-Analyze ===== */
  function onAnalyze() {
    var sentence = sentenceInput.value.trim();
    if (!sentence) {
      alert("Please paste an English sentence first.");
      return;
    }

    var result = PatternAnalyzer.analyzeSentence(sentence);
    if (!result) {
      alert("Could not analyze the sentence. Please fill in the form manually.");
      return;
    }

    // Auto-fill form
    patternInput.value = result.pattern || "";
    nativeFeelInput.value = result.nativeFeelHint || "";
    formulaInput.value = result.formula || "";

    // Set suggested tags
    var chips = tagSelector.querySelectorAll(".tag-chip");
    var suggestedTags = result.sceneTags || [];
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      if (suggestedTags.indexOf(chip.dataset.tagId) !== -1) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    }

    // Set the sentence as the first example
    examplesContainer.innerHTML = "";
    addExampleRow(sentence, "");

    // Update preview
    updatePreview();

    // Flash the preview to draw attention
    previewCard.scrollIntoView({ behavior: "smooth", block: "center" });
    previewCard.style.transition = "none";
    previewCard.style.boxShadow = "0 0 0 3px var(--color-primary-light)";
    setTimeout(function () {
      previewCard.style.transition = "box-shadow 0.5s ease";
      previewCard.style.boxShadow = "";
    }, 100);
  }

  /* ===== Save ===== */
  function onSave() {
    var data = getFormData();

    // Validate
    if (!data.pattern) {
      alert("Please enter a pattern name.");
      patternInput.focus();
      return;
    }
    if (!data.formula) {
      alert("Please enter a formula.");
      formulaInput.focus();
      return;
    }
    if (data.examples.length === 0 || !data.examples[0].en) {
      alert("Please add at least one English example.");
      return;
    }

    var userPatterns = loadUserPatterns();

    if (state.editingId !== null) {
      // Update existing
      for (var i = 0; i < userPatterns.length; i++) {
        if (userPatterns[i].id === state.editingId) {
          userPatterns[i] = Object.assign({}, userPatterns[i], data, {
            id: state.editingId,
            _userAdded: true,
          });
          break;
        }
      }
    } else {
      // Create new
      var newPattern = Object.assign({}, data, {
        id: getNextUserPatternId(),
        _userAdded: true,
      });
      userPatterns.push(newPattern);
    }

    saveUserPatterns(userPatterns);

    // Refresh the main grid
    if (typeof window.refreshPatternGrid === "function") {
      window.refreshPatternGrid();
    }

    // Update stats bar to reflect new count
    updateStatsBar();

    closeModal();
  }

  /* ===== Export as JS ===== */
  function onExport() {
    var data = getFormData();

    if (!data.pattern) {
      alert("Please at least enter a pattern name before exporting.");
      return;
    }

    var js = "{\n" +
      "  id: NEXT_ID,\n" +
      '  pattern: ' + JSON.stringify(data.pattern) + ',\n' +
      '  nativeFeel: ' + JSON.stringify(data.nativeFeel || "") + ',\n' +
      '  formula: ' + JSON.stringify(data.formula || "") + ',\n' +
      '  sceneTags: ' + JSON.stringify(data.sceneTags) + ',\n' +
      '  examples: ' + JSON.stringify(data.examples.length > 0 ? data.examples : [{ en: "", zh: "" }]) + ',\n' +
      '  usageNote: ' + JSON.stringify(data.usageNote || "") + ',\n' +
      '  source: ' + JSON.stringify(data.source || "") + ',\n' +
      '  difficulty: ' + JSON.stringify(data.difficulty || "intermediate") + ',\n' +
      "},";

    copyToClipboard(js);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Copied to clipboard! Paste into js/data.js");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast("Copied to clipboard! Paste into js/data.js");
    } catch (e) {
      alert("Copy failed. Here's the code:\n\n" + text);
    }
    document.body.removeChild(textarea);
  }

  /* ===== Delete User Pattern ===== */
  function onDelete() {
    if (state.editingId === null) return;

    if (!confirm("Delete this custom pattern? This cannot be undone.")) return;

    var userPatterns = loadUserPatterns();
    userPatterns = userPatterns.filter(function (p) {
      return p.id !== state.editingId;
    });
    saveUserPatterns(userPatterns);

    if (typeof window.refreshPatternGrid === "function") {
      window.refreshPatternGrid();
    }
    updateStatsBar();
    closeModal();
  }

  /* ===== Toast ===== */
  function showToast(message) {
    var toast = document.getElementById("ap-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ap-toast";
      toast.className = "ap-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
      toast.classList.remove("visible");
    }, 2500);
  }

  /* ===== Modal Management ===== */
  function openModal(patternToEdit) {
    if (!modalOverlay) initDomRefs();

    resetForm();

    if (patternToEdit) {
      // Editing existing user pattern
      state.editingId = patternToEdit.id;
      setFormData(patternToEdit);
      if (deleteBtn) deleteBtn.style.display = "";
    } else {
      state.editingId = null;
      if (deleteBtn) deleteBtn.style.display = "none";
    }

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    sentenceInput.focus();

    updatePreview();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function initDomRefs() {
    modalOverlay = document.getElementById("add-pattern-modal");
    modalPanel = modalOverlay.querySelector(".ap-modal-panel");
    modalCloseBtn = modalOverlay.querySelector(".ap-modal-close");
    cancelBtn = document.getElementById("ap-cancel-btn");

    sentenceInput = document.getElementById("ap-sentence-input");
    analyzeBtn = document.getElementById("ap-analyze-btn");

    patternInput = document.getElementById("ap-pattern-input");
    nativeFeelInput = document.getElementById("ap-nativefeel-input");
    formulaInput = document.getElementById("ap-formula-input");

    tagSelector = document.getElementById("ap-tag-selector");
    examplesContainer = document.getElementById("ap-examples-container");
    addExampleBtn = document.getElementById("ap-add-example-btn");

    usageNoteInput = document.getElementById("ap-usage-input");
    sourceInput = document.getElementById("ap-source-input");
    difficultySelect = document.getElementById("ap-difficulty-select");

    previewCard = document.getElementById("ap-preview-card");

    saveBtn = document.getElementById("ap-save-btn");
    exportBtn = document.getElementById("ap-export-btn");
    deleteBtn = document.getElementById("ap-delete-btn");

    // Build tag selector
    buildTagSelector();

    // Event listeners
    modalCloseBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    analyzeBtn.addEventListener("click", onAnalyze);
    addExampleBtn.addEventListener("click", function () {
      addExampleRow();
    });
    saveBtn.addEventListener("click", onSave);
    exportBtn.addEventListener("click", onExport);
    if (deleteBtn) deleteBtn.addEventListener("click", onDelete);

    // Live preview on input changes
    var inputsToWatch = [
      patternInput,
      nativeFeelInput,
      formulaInput,
      usageNoteInput,
      sourceInput,
      difficultySelect,
    ];
    for (var i = 0; i < inputsToWatch.length; i++) {
      inputsToWatch[i].addEventListener("input", updatePreview);
      inputsToWatch[i].addEventListener("change", updatePreview);
    }

    // Keyboard shortcut: Escape to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        closeModal();
      }
    });
  }

  /* ===== Stats Bar Update ===== */
  function updateStatsBar() {
    var userPatterns = loadUserPatterns();
    var total = (typeof PATTERNS !== "undefined" ? PATTERNS.length : 0) + userPatterns.length;
    var builtin = typeof PATTERNS !== "undefined" ? PATTERNS.length : 0;

    var statsBar = document.getElementById("stats-bar");
    if (statsBar) {
      var parts = "Showing " + total + " patterns";
      if (userPatterns.length > 0) {
        parts += " (" + builtin + " built-in + " + userPatterns.length + " custom)";
      }
      statsBar.textContent = parts;
    }
  }

  /* ===== Public API ===== */
  function init() {
    // Lazy init on first use
    updateStatsBar();
  }

  return {
    open: openModal,
    close: closeModal,
    loadUserPatterns: loadUserPatterns,
    saveUserPatterns: saveUserPatterns,
    init: init,
  };
})();
