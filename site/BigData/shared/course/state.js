/* Persisted learner state. This module has no DOM dependency. */
(() => {
  'use strict';
  const site = globalThis.BigDataCourse;
  const storageKey = 'bigdata.learning.v1';
  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

  // Accept only current sections and literal booleans from browser storage.
  function normalizeState(chapters, value) {
    const saved = isRecord(value) ? value : {};
    const completed = {};
    for (const chapter of chapters) {
      for (const [section] of chapter.sections) {
        const key = `${chapter.id}-${section}`;
        if (isRecord(saved.completed) && saved.completed[key] === true) completed[key] = true;
      }
    }
    const last =
      isRecord(saved.last) &&
      chapters.some(
        (chapter) =>
          chapter.id === saved.last.chapter &&
          chapter.sections.some(([id]) => id === saved.last.section),
      )
        ? { chapter: saved.last.chapter, section: saved.last.section }
        : null;
    return { completed, sidebarCollapsed: saved.sidebarCollapsed === true, last };
  }

  function createLearningStore(chapters, getStorage = () => localStorage) {
    const state = normalizeState(chapters, null);
    let available = true;
    function sync(raw) {
      try {
        Object.assign(state, normalizeState(chapters, JSON.parse(raw || 'null')));
        return true;
      } catch {
        // A malformed update from another tab must not erase valid in-memory progress.
        return false;
      }
    }
    try {
      sync(getStorage().getItem(storageKey));
    } catch {
      available = false;
    }
    function save() {
      Object.assign(state, normalizeState(chapters, state));
      try {
        getStorage().setItem(storageKey, JSON.stringify(state));
      } catch {
        available = false;
      }
    }
    return {
      state,
      storageKey,
      sync,
      save,
      get available() {
        return available;
      },
    };
  }

  Object.assign(site, { normalizeState, createLearningStore });
})();
