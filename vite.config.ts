import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

import Unocss from "unocss/vite"
import presetUno from "@unocss/preset-uno"

import { join } from "node:path"
import process from "node:process"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Unocss({ presets: [presetUno()] })],

  resolve: {
    alias: {
      "@": join(process.cwd(), "src"),
    },
  },
})
