// src/types.ts

/**
 * Базовое описание правила корректировки.
 * Хранится отдельно, вне профиля (в rulesLibrary или сторе).
 */
export interface CorrectionRule {
  id: number;
  description: string;
  condition?: (row: Record<string, any>) => boolean;
  transform: (value: any, row: Record<string, any>) => any;
}

/**
 * Описание одной колонки в профиле коррекции.
 * Для каждой колонки можно задать список правил и порядок их применения.
 */
export interface CorrectionColumn {
  key: string;
  type?: string;
  rules: {
    ruleId: number; // ID правила из библиотеки
    order: number;  // Порядок применения в рамках этой колонки
  }[];
}

/**
 * Профиль коррекции для загруженного файла.
 * Определяет структуру колонок и применяемые правила.
 */
export interface CorrectionProfile {
  name: string;
  description?: string;
  columns: CorrectionColumn[];
}
