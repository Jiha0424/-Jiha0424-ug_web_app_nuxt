// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-08-28',
  devtools: { enabled: true },
  modules: [
    '@samk-dev/nuxt-vcalendar',
    '@primevue/nuxt-module',
    ['@pinia/nuxt', { autoImport: ['defineStore'] }],
  ],
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/tailwind.css',
    '~/assets/styles/styles.scss',
  ],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  primevue: {
    usePrimeVue: true,
    autoImport: false,
    options: {
      theme: {
        preset: Aura,
      },
      ripple: true,
    },
    components: {
      include: '*',
    },
  },
  build: { transpile: ['@fawmi/vue-google-maps'] },
  runtimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL,
    apiBasePort: process.env.API_BASE_PORT,
    public: { GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY },
  },
});
