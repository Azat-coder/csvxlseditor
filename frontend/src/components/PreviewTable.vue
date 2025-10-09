<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
  headers: string[];
  previewRows: any[];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full border-collapse border border-gray-300">
      <thead class="bg-gray-700">
        <tr>
          <th v-for="header in headers" :key="header" class="border p-2 text-left">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in previewRows"
          :key="i"
          class="hover:bg-gray-500"
        >
          <td
            v-for="header in headers"
            :key="header"
            class="border p-2 align-top"
            :class="{
              'bg-yellow-50 text-yellow-800': row._changes?.[header],
            }"
          >
            <template v-if="row._changes?.[header]">
              <div class="text-sm line-through text-gray-500">
                {{ row._changes[header].old }}
              </div>
              <div class="text-sm font-semibold">
                {{ row._changes[header].new }}
              </div>
            </template>
            <template v-else>
              {{ row[header] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>
