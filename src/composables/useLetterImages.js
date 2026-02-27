import { ref, watch } from 'vue'

/** Mapa de imágenes ya cargadas para evitar re-fetch */
const imageCache = new Map()

/**
 * Carga una imagen y la guarda en caché.
 * Resuelve con null si la imagen no existe (letra no disponible).
 */
function loadImage(src) {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src))

  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => resolve(null) // letra no disponible → ignorar
    img.src = src
  })
}

/**
 * Devuelve la URL pública de la imagen para un carácter dado.
 *
 * Mayúsculas → /letters/{font}/A.png
 * Minúsculas → /letters/{font}/_a.png
 * Dígitos    → /letters/{font}/0.png
 * Guión      → /letters/{font}/-.png
 * Espacio    → null (se traduce a gap)
 */
function getLetterUrl(font, char) {
  if (char === ' ' || char === '') return null
  if (char === '-') return `/letters/${font}/-.png`
  if (/[0-9]/.test(char)) return `/letters/${font}/${char}.png`
  if (/[A-Z]/.test(char)) return `/letters/${font}/${char}.png`
  if (/[a-z]/.test(char)) return `/letters/${font}/_${char}.png`
  return null
}

/**
 * Composable que convierte texto en un array de objetos { img, x, y, width, height, key }
 * listos para renderizar como v-image en Konva.
 *
 * Usa un contador de versión para cancelar builds obsoletos cuando el
 * texto cambia rápido (anti-race-condition).
 *
 * @param {Ref<string>} text
 * @param {Ref<string>} font
 * @param {Ref<number>} fontSize
 * @param {Ref<number>} spacing
 */
export function useLetterImages(text, font, fontSize, spacing) {
  const letterImages = ref([])
  const isLoading = ref(false)
  let buildVersion = 0

  async function rebuild() {
    const version = ++buildVersion

    if (!text.value || !font.value) {
      letterImages.value = []
      return
    }

    isLoading.value = true
    const chars = [...text.value]
    const urls = chars.map((c) => getLetterUrl(font.value, c))

    const loaded = await Promise.all(urls.map((url) => (url ? loadImage(url) : Promise.resolve(null))))

    // Descartamos si llegó un build más reciente mientras esperábamos
    if (version !== buildVersion) return

    const results = []
    let x = 0
    const h = fontSize.value

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]
      const img = loaded[i]

      if (char === ' ') {
        x += h * 0.4 // espacio como fracción de la altura
        continue
      }
      if (!img) continue // letra no disponible → saltar

      const w = h * (img.naturalWidth / img.naturalHeight)
      results.push({ img, x, y: 0, width: w, height: h, key: `${i}-${char}` })
      x += w + spacing.value
    }

    letterImages.value = results
    isLoading.value = false
  }

  watch([text, font, fontSize, spacing], rebuild, { immediate: true })

  return { letterImages, isLoading }
}
