<script setup lang="ts">
import { ref } from "vue";
import { readXlsxFile, splitIntoChunks } from "@/utils/xlsxUtils";
import { useFileCorrectionStore } from "@/stores/useFileCorrectionStore";
import { storeToRefs } from "pinia";

import Card from "primevue/card";
import ProgressBar from "primevue/progressbar";
import Button from "primevue/button";

const store = useFileCorrectionStore();
const { loading, progress, headers } = storeToRefs(store);

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref<string>("");

const onFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  fileName.value = file.name; // сохраняем имя файла
  store.loading = true;

  try {
    const data = await readXlsxFile(file);
    const chunks = splitIntoChunks(data, 2000);

    store.originalRows = chunks.flat();
    store.headers = Object.keys(store.originalRows[0] || {});

    store.createProfileFromFile(store.originalRows, fileName.value);
  } finally {
    store.loading = false;
  }
};

const resetFile = () => {
  fileName.value = "";
  if (fileInput.value) fileInput.value.value = "";
  store.reset();
};
</script>

<template>
  <Card class="p-4">
    <template #title>
      <span class="text-lg font-semibold">Загрузка XLSX файла</span>
    </template>

    <template #content>
      <div class="flex gap-8">
        <!-- Левая часть: загрузка -->
        <div class="flex flex-col gap-4 flex-1">
          <!-- Кнопка выбора файла -->
          <label
            class="p-button p-component w-full cursor-pointer flex justify-center items-center border rounded h-12 bg-blue-50 hover:bg-blue-100"
          >
            Выбрать файл
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="onFileChange"
              class="hidden"
            />
          </label>

          <!-- Показ выбранного файла -->
          <div
            v-if="fileName"
            class="text-sm text-gray-700 flex justify-between items-center"
          >
            <span>Файл: {{ fileName }}</span>
            <Button label="Сбросить" icon="pi pi-times" text @click="resetFile" />
          </div>

          <!-- ProgressBar -->
          <div v-if="loading">
            <ProgressBar :value="progress" :showValue="true" />
            <p class="mt-1 text-sm text-gray-600">Обработка файла...</p>
          </div>
        </div>

        <!-- Правая часть: список колонок -->
        <div v-if="headers.length" class="flex-1 max-w-sm bg-gray-600 rounded-lg p-4 shadow-sm overflow-auto">
          <h3 class="text-sm font-medium mb-2">Обнаруженные колонки:</h3>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li v-for="header in headers" :key="header">{{ header }}</li>
          </ul>
        </div>
      </div>
    </template>
  </Card>
</template>

