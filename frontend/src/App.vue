<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import { ref } from "vue";
import SpeedDial from "primevue/speeddial";

const router = useRouter();

const items = ref([
  {
    label: "Главная",
    icon: "pi pi-home",
    command: () => router.push("/"),
  },
  {
    label: "Редактор",
    icon: "pi pi-file-excel",
    command: () => router.push("/about"),
  },
]);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 p-6">
      <transition name="fade" mode="out-in">
        <RouterView />
      </transition>
    </main>

    <div class="fixed bottom-6 right-6 z-50">
      <SpeedDial
        :model="items"
        direction="up"
        showIcon="pi pi-bars"
        hideIcon="pi pi-times"
        buttonClass="p-button-rounded p-button-lg p-button-primary shadow-lg"
      />
    </div>
  </div>
</template>

<style scoped>
/* Можно немного подправить визуал */
.p-speeddial {
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
