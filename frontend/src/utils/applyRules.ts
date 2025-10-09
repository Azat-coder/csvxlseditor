// src/utils/applyRules.ts
import type { CorrectionProfile, CorrectionRule } from "@/types";

/**
 * Применяет правила к строкам данных с учётом порядка правил в каждой колонке.
 */
export function applyRulesToRows(
  rows: Record<string, any>[],
  profile: CorrectionProfile,
  allRules: CorrectionRule[]
): Record<string, any>[] {
  return rows.map((row, rowIndex) => {
    const newRow = { ...row };

    for (const column of profile.columns) {
      const columnRules = (column.rules ?? [])
        .map(r => {
          const rule = allRules.find(a => a.id === r.ruleId);
          if (!rule) return null;
          return { ...rule, order: r.order };
        })
        .filter((r): r is CorrectionRule & { order: number } => !!r)
        .sort((a, b) => a.order - b.order);

      let value = newRow[column.key];

      for (const rule of columnRules) {
        const shouldApply = rule.condition ? rule.condition(newRow) : true;

        if (!shouldApply) continue;

        const newValue = rule.transform(value, newRow);
        value = newValue;
      }

      newRow[column.key] = value;
    }

    return newRow;
  });
}

/**
 * Генерирует превью изменений по всем колонкам с указанием старых и новых значений.
 */
export function applyRulesPreview(
  rows: Record<string, any>[],
  profile: CorrectionProfile,
  allRules: CorrectionRule[]
): Record<string, any>[] {
  return rows.map((row, rowIndex) => {
    const previewRow = { ...row, _changes: {} as Record<string, { old: any; new: any }> };

    for (const column of profile.columns) {
      const columnRules = (column.rules ?? [])
        .map(r => {
          const rule = allRules.find(a => a.id === r.ruleId);
          if (!rule) return null;
          return { ...rule, order: r.order };
        })
        .filter((r): r is CorrectionRule & { order: number } => !!r)
        .sort((a, b) => a.order - b.order);

      let value = previewRow[column.key];

      for (const rule of columnRules) {
        const shouldApply = rule.condition ? rule.condition(previewRow) : true;
        if (!shouldApply) continue;

        const oldValue = value;
        const newValue = rule.transform(oldValue, previewRow);

        if (newValue !== oldValue) {
          previewRow[column.key] = newValue;
          previewRow._changes[column.key] = {
            old: previewRow._changes[column.key]?.old ?? oldValue,
            new: newValue,
          };
          value = newValue;
        }
      }
    }

    return previewRow;
  });
}
