/*
 * APP — Filter, Search, Sort, Render
 * Pure vanilla JS. No dependencies.
 */

(function () {
  "use strict";

  /* ===== State ===== */
  const state = {
    activeTags: new Set(),
    searchQuery: "",
    sortMode: "id-asc",
  };

  /* ===== DOM refs ===== */
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const tagFilterSection = document.getElementById("tag-filter-section");
  const statsBar = document.getElementById("stats-bar");
  const patternGrid = document.getElementById("pattern-grid");
  const emptyState = document.getElementById("empty-state");
  const clearFiltersBtn = document.getElementById("clear-filters-btn");

  /* ===== Helpers ===== */
  const normalize = (s) => (s || "").toLowerCase();

  const DIFFICULTY_ORDER = { basic: 0, intermediate: 1, advanced: 2 };

  /* ===== Tag Filter Rendering ===== */
  function renderTagFilters() {
    tagFilterSection.innerHTML = "";

    for (const [catKey, cat] of Object.entries(TAG_CATEGORIES)) {
      const catDiv = document.createElement("div");
      catDiv.className = "tag-category";

      const label = document.createElement("div");
      label.className = "tag-category-label";
      label.textContent = cat.label;
      catDiv.appendChild(label);

      const chipsRow = document.createElement("div");
      chipsRow.className = "tag-chips-row";

      for (const [tagId, tag] of Object.entries(cat.tags)) {
        const chip = document.createElement("button");
        chip.className = "tag-chip";
        chip.dataset.tagId = tagId;
        chip.style.setProperty("--chip-color", tag.color);
        if (state.activeTags.has(tagId)) {
          chip.classList.add("active");
        }

        const dot = document.createElement("span");
        dot.className = "tag-chip-dot";
        chip.appendChild(dot);

        const text = document.createElement("span");
        text.textContent = tag.en;
        chip.appendChild(text);

        chip.addEventListener("click", () => {
          if (state.activeTags.has(tagId)) {
            state.activeTags.delete(tagId);
          } else {
            state.activeTags.add(tagId);
          }
          renderTagFilters();
          renderPatterns();
        });

        chipsRow.appendChild(chip);
      }

      catDiv.appendChild(chipsRow);
      tagFilterSection.appendChild(catDiv);
    }
  }

  /* ===== Filter & Sort ===== */
  function filterPatterns() {
    let results = getAllPatterns();

    /* Tag filter — OR logic within selected tags, AND with search */
    if (state.activeTags.size > 0) {
      results = results.filter((p) =>
        p.sceneTags.some((t) => state.activeTags.has(t))
      );
    }

    /* Search — case-insensitive substring across multiple fields */
    if (state.searchQuery.trim()) {
      const q = normalize(state.searchQuery.trim());
      results = results.filter((p) => {
        const haystack = [
          p.pattern,
          p.nativeFeel,
          p.formula,
          ...p.examples.map((e) => e.en),
          ...p.examples.map((e) => e.zh),
        ]
          .map(normalize)
          .join(" ");
        return haystack.includes(q);
      });
    }

    /* Sort */
    switch (state.sortMode) {
      case "id-asc":
        results.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        results.sort((a, b) => b.id - a.id);
        break;
      case "difficulty":
        results.sort(
          (a, b) =>
            (DIFFICULTY_ORDER[a.difficulty] || 99) -
            (DIFFICULTY_ORDER[b.difficulty] || 99)
        );
        break;
    }

    return results;
  }

  /* ===== Pattern Card Rendering ===== */
  function createPatternCard(p) {
    const card = document.createElement("div");
    card.className = "pattern-card";

    /* Header: ID + Pattern name */
    const header = document.createElement("div");
    header.className = "card-header";
    const idSpan = document.createElement("span");
    idSpan.className = "card-id";
    idSpan.textContent = "#" + String(p.id).padStart(2, "0");
    const nameSpan = document.createElement("span");
    nameSpan.className = "card-pattern";
    nameSpan.textContent = p.pattern;
    header.appendChild(idSpan);
    header.appendChild(nameSpan);

    /* Custom badge for user-added patterns */
    if (p._userAdded) {
      const badge = document.createElement("span");
      badge.className = "card-badge-custom";
      badge.textContent = "Custom";
      header.appendChild(badge);
    }
    card.appendChild(header);

    /* Native feel */
    if (p.nativeFeel) {
      const sec = document.createElement("div");
      sec.className = "card-section";
      const lbl = document.createElement("span");
      lbl.className = "card-label";
      lbl.textContent = "Feel";
      sec.appendChild(lbl);
      const feel = document.createElement("div");
      feel.className = "card-native-feel";
      feel.textContent = p.nativeFeel;
      sec.appendChild(feel);
      card.appendChild(sec);
    }

    /* Formula */
    if (p.formula) {
      const sec = document.createElement("div");
      sec.className = "card-section";
      const lbl = document.createElement("span");
      lbl.className = "card-label";
      lbl.textContent = "Formula";
      sec.appendChild(lbl);
      const formula = document.createElement("div");
      formula.className = "card-formula";
      formula.textContent = p.formula;
      sec.appendChild(formula);
      card.appendChild(sec);
    }

    /* Examples */
    if (p.examples && p.examples.length > 0) {
      const sec = document.createElement("div");
      sec.className = "card-section";
      const lbl = document.createElement("span");
      lbl.className = "card-label";
      lbl.textContent = "Examples";
      sec.appendChild(lbl);
      const exList = document.createElement("div");
      exList.className = "card-examples";
      for (const ex of p.examples) {
        const exDiv = document.createElement("div");
        exDiv.className = "card-example";
        const en = document.createElement("div");
        en.className = "card-example-en";
        en.textContent = ex.en;
        exDiv.appendChild(en);
        if (ex.zh) {
          const zh = document.createElement("div");
          zh.className = "card-example-zh";
          zh.textContent = ex.zh;
          exDiv.appendChild(zh);
        }
        exList.appendChild(exDiv);
      }
      sec.appendChild(exList);
      card.appendChild(sec);
    }

    /* Usage note */
    if (p.usageNote) {
      const note = document.createElement("div");
      note.className = "card-usage-note";
      note.textContent = p.usageNote;
      card.appendChild(note);
    }

    /* Difficulty badge */
    if (p.difficulty) {
      const badge = document.createElement("span");
      badge.className = "card-difficulty difficulty-" + p.difficulty;
      badge.textContent = p.difficulty;
      card.appendChild(badge);
    }

    /* Tags row */
    if (p.sceneTags && p.sceneTags.length > 0) {
      const tagsRow = document.createElement("div");
      tagsRow.className = "card-tags";
      for (const tagId of p.sceneTags) {
        const t = ALL_TAGS[tagId];
        if (!t) continue;
        const tagEl = document.createElement("button");
        tagEl.className = "card-tag";
        tagEl.style.setProperty("--tag-color", t.color);
        tagEl.textContent = t.en;
        tagEl.title = t.zh + " (" + t.categoryLabel + ")";
        tagEl.addEventListener("click", (e) => {
          e.stopPropagation();
          state.activeTags.add(tagId);
          renderTagFilters();
          renderPatterns();
        });
        tagsRow.appendChild(tagEl);
      }
      card.appendChild(tagsRow);
    }

    /* Edit/Delete actions for user-added patterns */
    if (p._userAdded) {
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "card-action-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof AddPattern !== "undefined" && AddPattern.open) {
          AddPattern.open(p);
        }
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "card-action-btn card-action-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm('Delete pattern "' + p.pattern + '"? This cannot be undone.')) return;
        const userPatterns = JSON.parse(localStorage.getItem("userPatterns") || "[]");
        const filtered = userPatterns.filter(function (up) { return up.id !== p.id; });
        localStorage.setItem("userPatterns", JSON.stringify(filtered));
        renderPatterns();
      });
      actions.appendChild(deleteBtn);

      card.appendChild(actions);
    }

    return card;
  }

  /* ===== Render All Patterns ===== */
  function renderPatterns() {
    const results = filterPatterns();

    /* Stats */
    const allPatterns = getAllPatterns();
    const builtIn = PATTERNS.length;
    const userCount = allPatterns.length - builtIn;
    let statsText = "Showing " + results.length + " of " + allPatterns.length + " patterns";
    if (userCount > 0) {
      statsText += " (" + builtIn + " built-in + " + userCount + " custom)";
    }
    statsBar.textContent = statsText;

    /* Grid */
    patternGrid.innerHTML = "";
    if (results.length === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      for (const p of results) {
        patternGrid.appendChild(createPatternCard(p));
      }
    }
  }

  /* ===== Search handler (debounced) ===== */
  let searchTimer;
  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value;
      renderPatterns();
    }, 200);
  }

  /* ===== Sort handler ===== */
  function onSortChange() {
    state.sortMode = sortSelect.value;
    renderPatterns();
  }

  /* ===== Clear filters ===== */
  function onClearFilters() {
    state.activeTags.clear();
    state.searchQuery = "";
    searchInput.value = "";
    state.sortMode = "id-asc";
    sortSelect.value = "id-asc";
    renderTagFilters();
    renderPatterns();
  }

  /* ===== Initialize ===== */
  function initialize() {
    renderTagFilters();
    renderPatterns();

    searchInput.addEventListener("input", onSearchInput);
    sortSelect.addEventListener("change", onSortChange);
    clearFiltersBtn.addEventListener("click", onClearFilters);

    /* Wire Add Pattern button */
    const addBtn = document.getElementById("btn-add-pattern");
    if (addBtn && typeof AddPattern !== "undefined") {
      addBtn.addEventListener("click", function () {
        AddPattern.open();
      });
    }

    /* Initialize AddPattern module */
    if (typeof AddPattern !== "undefined" && AddPattern.init) {
      AddPattern.init();
    }
  }

  /* Expose renderPatterns for cross-module calls (add-pattern.js) */
  window.refreshPatternGrid = renderPatterns;
  window.buildPatternCard = createPatternCard;

  /* Boot when DOM is ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
