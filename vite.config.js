import { fileURLToPath, URL } from 'node:url'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * Plugin que genera módulos virtuales con las listas de fuentes y marcos
 * disponibles en public/. Al agregar una nueva carpeta en public/letters/,
 * aparece automáticamente en la app al recargar el dev server.
 */
function publicAssetsPlugin() {
  const FONTS_ID = 'virtual:fonts'
  const FRAMES_ID = 'virtual:frames'

  return {
    name: 'public-assets-discovery',

    resolveId(id) {
      if (id === FONTS_ID) return '\0' + FONTS_ID
      if (id === FRAMES_ID) return '\0' + FRAMES_ID
    },

    load(id) {
      if (id === '\0' + FONTS_ID) {
        const dir = resolve(process.cwd(), 'public/letters')
        const fonts = readdirSync(dir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort()
        return `export const fonts = ${JSON.stringify(fonts)}`
      }

      if (id === '\0' + FRAMES_ID) {
        const dir = resolve(process.cwd(), 'public/frames')
        const frames = readdirSync(dir)
          .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
          .sort()
        return `export const frames = ${JSON.stringify(frames)}`
      }
    },

    handleHotUpdate({ file, server }) {
      const isLetters = file.replace(/\\/g, '/').includes('/public/letters/')
      const isFrames = file.replace(/\\/g, '/').includes('/public/frames/')
      if (isLetters || isFrames) {
        const fontsId = '\0' + FONTS_ID
        const framesId = '\0' + FRAMES_ID
        const mod1 = server.moduleGraph.getModuleById(fontsId)
        const mod2 = server.moduleGraph.getModuleById(framesId)
        if (mod1) server.moduleGraph.invalidateModule(mod1)
        if (mod2) server.moduleGraph.invalidateModule(mod2)
        server.ws.send({ type: 'full-reload' })
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), vueDevTools(), publicAssetsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
