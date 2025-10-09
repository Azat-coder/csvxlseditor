//xlsxUtils.ts
import * as XLSX from "xlsx";

export async function readXlsxFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

export function splitIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function processInWorker(chunks: any[][], rules: any[] = []) {
  const worker = new Worker(new URL("../workers/xlsxWorker.ts", import.meta.url), { type: "module" });
  const results: any[] = [];

  for (const chunk of chunks) {
    const processedChunk = await new Promise<any[]>((resolve) => {
      worker.onmessage = (e) => resolve(e.data);
      worker.postMessage({ chunk, rules });
    });
    results.push(...processedChunk);
  }

  worker.terminate();
  return results;
}

export function exportToXlsx(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Result");
  XLSX.writeFile(workbook, fileName);
}
