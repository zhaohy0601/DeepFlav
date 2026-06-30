import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

console.log('Starting app initialization...')

const app = createApp(App)

app.use(createPinia())
app.use(router)

console.log('Mounting app...')
app.mount('#app')
console.log('App mounted')
