import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Lara
    }
});

app.use(createPinia())
app.use(router)

app.mount('#app')
