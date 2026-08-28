// nuxt.config.ts
export default defineNuxtConfig({
  // Crucial for Nuxt 4 compatibility
  runtimeConfig: {
    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID
    }
  },
  future: {
    compatibilityVersion: 4,
  },
  build: {
    transpile: ['vuetify']
  },
  features: {
    inlineStyles: false
  },
  modules: [

  ],
  css: [
    '@mdi/font/css/materialdesignicons.css'
  ]


})