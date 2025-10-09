import * as XLSX from "xlsx";

export interface WorkerMessage {
  chunk: any[];
  rules?: any[];
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { chunk, rules = [] } = e.data;
  const processed = chunk.map((row) => applyRules(row, rules));
  self.postMessage(processed);
};

function applyRules(row: any, rules: any[]) {
  const newRow: Record<string, any> = {};
  for (const key in row) {
    let value = row[key];
    if (typeof value === "string") value = value.trim();
    newRow[key] = value;
  }
  return newRow;
}
