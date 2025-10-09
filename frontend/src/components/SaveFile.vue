<script setup lang="ts">
import { ref, onMounted } from "vue";
import { saveXlsxToOPFS, listOPFSFiles, readFromOPFS, deleteFromOPFS } from "@/utils/opfsUtils";
import { useFileCorrectionStore } from "@/stores/useFileCorrectionStore";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";

const store = useFileCorrectionStore();
const files = ref<{ name: string; size: number }[]>([]);
const dialogVisible = ref(false);
const filename = ref("");

const refreshFiles = async () => {
  files.value = await listOPFSFiles();
};

const openDialog = () => {
  const originalFilename = store.profile?.name ?? "file";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  filename.value = `${originalFilename}_${timestamp}.xlsx`;
  dialogVisible.value = true;
};

const confirmSave = async () => {
  if (!filename.value.trim() || !store.processedRows.length) return;
  const cleanRows = store.processedRows.map(({ _changes, ...rest }) => rest);
  await saveXlsxToOPFS(filename.value, cleanRows);
  dialogVisible.value = false;
  await refreshFiles();
};

const onDownload = async (name: string) => {
  const blob = await readFromOPFS(name);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const onDelete = async (name: string) => {
  await deleteFromOPFS(name);
  await refreshFiles();
};

onMounted(refreshFiles);
</script>

<template>
  <Card class="p-4 shadow-md bg-white rounded flex flex-col gap-4">
    <template #title>
      <span class="text-lg font-semibold">Сохранение файла</span>
    </template>

    <template #content>
      <!-- Кнопка сохранения -->
      <div class="flex justify-start">
        <Button
          label="💾 Сохранить в OPFS"
          icon="pi pi-save"
          class="p-button-sm"
          severity="success"
          @click="openDialog"
          :disabled="!store.processedRows.length"
        />
      </div>

      <!-- Список файлов -->
      <div v-if="files.length" class="mt-4 flex flex-col gap-2">
        <h3 class="font-medium">Файлы в OPFS:</h3>
        <div
          v-for="f in files"
          :key="f.name"
          class="flex items-center justify-between gap-2 p-2 border rounded"
        >
          <span class="truncate max-w-xs">{{ f.name }} ({{ (f.size / 1024).toFixed(1) }} KB)</span>
          <div class="flex gap-2">
            <Button
              icon="pi pi-download"
              class="p-button-sm p-button-outlined"
              @click="onDownload(f.name)"
              tooltip="Скачать"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-outlined p-button-danger"
              @click="onDelete(f.name)"
              tooltip="Удалить"
            />
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-gray-500 mt-2">Файлы ещё не сохранены</p>
    </template>
  </Card>

  <!-- 🧩 Диалог ввода имени -->
  <Dialog
    v-model:visible="dialogVisible"
    header="Сохранить файл"
    modal
    :style="{ width: '600px' }"
  >
    <div class="flex flex-col gap-3">
      <label for="filename" class="font-medium text-sm">Имя файла:</label>
      <InputText
        id="filename"
        v-model="filename"
        placeholder="Введите имя файла"
        class="w-full"
      />
      <small class="text-gray-500">Файл будет сохранён в OPFS в формате XLSX</small>
    </div>

    <template #footer>
      <Button label="Отмена" text @click="dialogVisible = false" />
      <Button label="Сохранить" icon="pi pi-check" @click="confirmSave" />
    </template>
  </Dialog>
</template>
