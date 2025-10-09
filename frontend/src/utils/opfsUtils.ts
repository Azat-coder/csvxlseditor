import * as XLSX from "xlsx";

/**
 * Сохраняет файл в OPFS, если доступен, иначе — предлагает скачать
 */
export async function saveXlsxToOPFS(filename: string, data: any[]): Promise<void> {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Result");

  const arrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  if (await isOPFSSupported()) {
    try {
      await saveToOPFS(filename, blob);
      console.log(`[OPFS] Saved ${filename}`);
      return;
    } catch (e) {
      console.warn("[OPFS] Save failed, fallback to download:", e);
    }
  }

  // fallback: обычное скачивание
  downloadFallback(blob, filename);
}

/**
 * Проверяет, поддерживается ли OPFS в текущем браузере
 */
export async function isOPFSSupported(): Promise<boolean> {
  return "storage" in navigator && "getDirectory" in navigator.storage;
}

/**
 * Сохраняет Blob в OPFS
 */
export async function saveToOPFS(filename: string, blob: Blob): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/**
 * Возвращает список файлов в OPFS
 */
export async function listOPFSFiles(): Promise<{ name: string; size: number }[]> {
  const root = await navigator.storage.getDirectory();
  const files: { name: string; size: number }[] = [];

  for await (const [name, handle] of root.entries()) {
    if (handle.kind === "file") {
      const file = await handle.getFile();
      files.push({ name, size: file.size });
    }
  }

  return files;
}

/**
 * Скачивает файл из OPFS (в виде Blob)
 */
export async function readFromOPFS(filename: string): Promise<Blob | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return file;
  } catch (err) {
    console.warn("[OPFS] File not found:", filename, err);
    return null;
  }
}

/**
 * Удаляет файл из OPFS
 */
export async function deleteFromOPFS(filename: string): Promise<boolean> {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(filename);
    console.log(`[OPFS] Deleted ${filename}`);
    return true;
  } catch (err) {
    console.warn("[OPFS] Delete failed:", err);
    return false;
  }
}

/**
 * Fallback на классическое скачивание
 */
function downloadFallback(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
