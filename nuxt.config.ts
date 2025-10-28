// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  ui: {
    colorMode: false,
  },
  runtimeConfig: {
    public: {
      // Configure your backend base URL at build/runtime via env var
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://api.example.com",
    },
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },

  postcss: {},

  css: ["~/assets/css/main.css"],

  // App configuration
  app: {
    head: {
      title: "WatchStore - Premium Watches",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Discover our premium collection of watches from top brands.",
        },
      ],
    },
  },
});
