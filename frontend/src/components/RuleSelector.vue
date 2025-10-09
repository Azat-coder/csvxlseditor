<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useFileCorrectionStore } from "@/stores/useFileCorrectionStore";
import type { CorrectionRule } from "@/types";

import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Draggable from "vuedraggable";

const store = useFileCorrectionStore();
const { profile, availableRules } = storeToRefs(store);

const selectedColumnKey = ref<string | null>(null);
const selectedRule = ref<CorrectionRule | null>(null);
const reactiveRules = ref<{ ruleId: number; order: number }[]>([]);

const columns = computed(() => profile.value?.columns ?? []);

watch(
  selectedColumnKey,
  (key) => {
    const column = profile.value?.columns.find(c => c.key === key);
    reactiveRules.value = column ? [...column.rules] : [];
  },
  { immediate: true }
);

const addRuleToColumn = () => {
  if (!selectedColumnKey.value || !selectedRule.value) return;

  const column = profile.value?.columns.find(c => c.key === selectedColumnKey.value);
  if (!column) return;

  const newRule = { ruleId: selectedRule.value.id, order: column.rules.length + 1 };
  column.rules.push(newRule);
  reactiveRules.value.push({ ...newRule });

  selectedRule.value = null;
};

const removeRuleFromColumn = (ruleId: number) => {
  if (!selectedColumnKey.value) return;

  const column = profile.value?.columns.find(c => c.key === selectedColumnKey.value);
  if (!column) return;

  column.rules = column.rules.filter(r => r.ruleId !== ruleId);
  reactiveRules.value = reactiveRules.value.filter(r => r.ruleId !== ruleId);
};

const onDragEnd = () => {
  const column = profile.value?.columns.find(c => c.key === selectedColumnKey.value);
  if (!column) return;

  column.rules = reactiveRules.value.map((r, index) => ({ ...r, order: index + 1 }));
};

const getRuleDescription = (ruleId: number) =>
  availableRules.value.find(r => r.id === ruleId)?.description ?? "Неизвестное правило";
</script>

<template>
  <Card class="p-4">
    <template #title>
      <span>Настройка правил по колонкам</span>
    </template>

    <template #content>
      <div class="flex flex-col gap-3 mb-4">
        <Dropdown
          v-model="selectedColumnKey"
          :options="columns"
          optionLabel="key"
          optionValue="key"
          placeholder="Выберите колонку"
        />

        <div class="flex gap-2 items-center">
          <Dropdown
            v-model="selectedRule"
            :options="availableRules"
            optionLabel="description"
            placeholder="Выберите правило"
            class="flex-1 min-w-0"
          />
          <Button
            label="Добавить"
            icon="pi pi-plus"
            @click="addRuleToColumn"
            :disabled="!selectedColumnKey || !selectedRule"
          />
        </div>
      </div>

      <Divider />

      <div v-if="reactiveRules.length">
        <Draggable
          v-model="reactiveRules"
          item-key="ruleId"
          @end="onDragEnd"
          animation="200"
        >
          <template #item="{ element }">
            <div class="flex justify-between items-center p-3 border rounded mb-2">
              <span>{{ getRuleDescription(element.ruleId) }}</span>
              <Button
                icon="pi pi-trash"
                text
                @click="removeRuleFromColumn(element.ruleId)"
              />
            </div>
          </template>
        </Draggable>
      </div>

      <p v-else>Нет добавленных правил для выбранной колонки.</p>
    </template>
  </Card>
</template>
