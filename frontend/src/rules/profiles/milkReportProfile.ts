// src/rules/profiles/milkReportProfile.ts
import type { CorrectionProfile } from "@/types";

export const milkReportProfile: CorrectionProfile = {
  name: "milk_report",
  description: "Отчет по надоям",
  columns: [
    { key: "Средний номер лактации", type: "number" },
    { key: "Надой за вчера", type: "string" },
    { key: "Средний надой за 14 дней", type: "number" },
  ],
  rules: [
    {
      id: 1,
      column: "Средний номер лактации",
      order: 1,
      description: "Привести значение к числу",
      transform: (value) => {
        if (value == null || value === "") return value;

        // убираем кавычки и пробелы
        let normalized = String(value).trim();
        if (normalized.startsWith('"') && normalized.endsWith('"')) {
          normalized = normalized.slice(1, -1);
        }

        // заменяем запятую на точку
        normalized = normalized.replace(",", ".");

        const num = parseFloat(normalized);
        return isNaN(num) ? value : num;
      },
    },
    {
      id: 2,
      column: "Средний номер лактации",
      order: 2,
      description: "Округлить до целого",
      transform: (value) => {
        if (value === "" || isNaN(value)) return value;
        return Math.round(value);
      },
    },
    {
      id: 3,
      column: "Надой за вчера",
      order: 1,
      description: "Если пусто, но есть 'Средний надой за 14 дней' — записать 'Да'",
      condition: (row) =>
        (!row["Надой за вчера"] || row["Надой за вчера"].toString().trim() === "") &&
        !!row["Средний надой за 14 дней"],
      transform: () => "Да",
    },
    {
      id: 4,
      column: "Надой за вчера",
      order: 2,
      description: "Убрать пробелы по краям",
      transform: (value) => (typeof value === "string" ? value.trim() : value),
    },
  ],
};

