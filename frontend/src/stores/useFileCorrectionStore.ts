// src/stores/useFileCorrectionStore.ts
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { applyRulesPreview, applyRulesToRows } from "@/utils/applyRules";
import type { CorrectionProfile, CorrectionRule } from "@/types";
import { allRules } from "@/rules/rules";

export const useFileCorrectionStore = defineStore("fileCorrection", () => {
  // 📦 Основные состояния
  const loading = ref(false);
  const progress = ref(0);
  const headers = ref<string[]>([]);
  const originalRows = ref<Record<string, any>[]>([]);
  const previewRows = ref<Record<string, any>[]>([]);
  const processedRows = ref<Record<string, any>[]>([]);
  const availableRules = ref<CorrectionRule[]>(allRules);

  // 🔧 Текущий активный профиль (создаётся после загрузки файла)
  const profile = ref<CorrectionProfile | null>(null);

  // 🧩 Реактивное обновление превью при изменении профиля или данных
  watch(
    [originalRows, profile],
    ([rows, currentProfile]) => {
      if (
        rows.length &&
        currentProfile &&
        currentProfile.columns.some(c => c.rules?.length)
      ) {
        previewRows.value = applyRulesPreview(rows, currentProfile, availableRules.value);
      } else {
        previewRows.value = [];
      }
    },
    { deep: true }
  );

  // ===============================
  // Методы управления профилем
  // ===============================

  /** Установить новый профиль */
  function setProfile(newProfile: CorrectionProfile) {
    profile.value = newProfile;
  }

  function createProfileFromFile(rows: Record<string, any>[], name?: string) {
  const keys = Object.keys(rows[0] || {});
  const profile: CorrectionProfile = {
    name: name || `profile_${Date.now()}`,
    description: "Автогенерированный профиль по файлу",
    columns: keys.map((key) => ({
      key,
      type: "string",
      rules: [],
    })),
  };
  setProfile(profile);
}

  /** Добавить правило к конкретной колонке */
  function addRuleToColumn(columnKey: string, ruleId: number) {
    if (!profile.value) return;
    const column = profile.value.columns.find(c => c.key === columnKey);
    if (!column) return;

    if (column.rules.some(r => r.ruleId === ruleId)) return;

    const order = column.rules.length
      ? Math.max(...column.rules.map(r => r.order)) + 1
      : 1;
    column.rules.push({ ruleId, order });
  }

  /** Удалить правило из конкретной колонки */
  function removeRuleFromColumn(columnKey: string, ruleId: number) {
    if (!profile.value) return;
    const column = profile.value.columns.find(c => c.key === columnKey);
    if (!column) return;

    column.rules = column.rules.filter(r => r.ruleId !== ruleId);
  }

  /** Задать исходные строки (после загрузки файла) */
  function setOriginalRows(rows: Record<string, any>[]) {
    originalRows.value = rows;
  }

  /** Применить все правила окончательно */
  function applyChanges() {
    if (!profile.value) return;
    processedRows.value = applyRulesToRows(
      originalRows.value,
      profile.value,
      availableRules.value
    );
    previewRows.value = processedRows.value.map(r => ({ ...r, _changes: {} }));
  }

  /** Полный сброс состояния */
  function reset() {
    loading.value = false;
    progress.value = 0;
    headers.value = [];
    originalRows.value = [];
    previewRows.value = [];
    processedRows.value = [];
    profile.value = null;
  }

  return {
    // state
    loading,
    progress,
    headers,
    originalRows,
    previewRows,
    processedRows,
    availableRules,
    profile,

    // actions
    setProfile,
    createProfileFromFile,
    setOriginalRows,
    addRuleToColumn,
    removeRuleFromColumn,
    applyChanges,
    reset,
  };
});
