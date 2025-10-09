<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFileCorrectionStore } from "@/stores/useFileCorrectionStore";
import RuleSelector from "@/components/RuleSelector.vue";
import FileUpload from "@/components/FileUpload.vue";
import SaveFile from "@/components/SaveFile.vue";
import PreviewTable from "@/components/PreviewTable.vue";
import Button from "primevue/button";

const store = useFileCorrectionStore();
const { previewRows, processedRows, headers, profile } = storeToRefs(store);
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <Transition name="fade-slide">
      <FileUpload v-if="true" />
    </Transition>

    <Transition name="fade-slide">
      <RuleSelector v-if="profile" />
    </Transition>

    <Transition name="fade-slide">
      <span
        v-if="previewRows.length"
        class="text-lg font-semibold"
      >
        Превью изменений
      </span>
    </Transition>

    <Transition name="fade-slide">
      <div
        v-if="previewRows.length"
        class="overflow-auto max-h-96 border rounded"
      >
        <PreviewTable :headers="headers" :previewRows="previewRows" />
      </div>
    </Transition>

    <Transition name="fade-slide">
      <div
        v-if="previewRows.length"
        class="flex gap-2 justify-end items-center mt-4"
      >
        <Button
          label="Применить ко всему файлу"
          icon="pi pi-check"
          class="p-button-sm"
          @click="store.applyChanges"
          severity="success"
        />
      </div>
    </Transition>

    <Transition name="fade-slide">
      <SaveFile v-if="processedRows.length" />
    </Transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
