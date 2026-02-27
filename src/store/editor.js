import { reactive } from 'vue'

export const state = reactive({
  // Texto principal
  text: 'WoW',
  fontSize: 120,
  spacing: 4,
  selectedFont: 'freebooter-purple',

  // Subtexto
  subText: '',
  subFontSize: 60,
  subSpacing: 2,
  subSelectedFont: 'freebooter-purple',

  // Canvas
  frameSelected: 'bfa.png',
  bgColor: 'transparent',

  // ── Extras ───────────────────────────────────────────────────────────────────
  // Cada entrada: { id: string, src: string, img: HTMLImageElement|null, positioned: boolean }
  extras: [],

  // Orden de renderizado bottom→top. Siempre contiene 'mainText' y 'subText'.
  zOrder: ['mainText', 'subText'],

  // ID del item seleccionado (para adjuntar el transformer y resaltar en panel Capas)
  selectedItemId: null,
})

// ── Acciones extras ───────────────────────────────────────────────────────────

let _extraCounter = 0

export function addExtra(filename) {
  const id = `extra-${++_extraCounter}`
  const entry = { id, src: `/extras/${filename}`, img: null, positioned: false }
  state.extras.push(entry)
  state.zOrder.push(id) // nuevos extras encima de todo
  state.selectedItemId = id

  const image = new window.Image()
  image.onload = () => {
    // Acceder a la entrada VÍA el proxy reactivo de state, no por la variable local 'entry'.
    // Si se usa 'entry' directamente se modifica el objeto plano sin que Vue intercepte el SET,
    // los watchers no disparan y el canvas no se actualiza.
    const reactiveEntry = state.extras.find((e) => e.id === id)
    if (reactiveEntry) reactiveEntry.img = image
  }
  image.src = entry.src
}

export function removeExtra(id) {
  const idx = state.extras.findIndex((e) => e.id === id)
  if (idx !== -1) state.extras.splice(idx, 1)
  const zIdx = state.zOrder.indexOf(id)
  if (zIdx !== -1) state.zOrder.splice(zIdx, 1)
  if (state.selectedItemId === id) state.selectedItemId = null
}

export function moveItemUp(id) {
  const i = state.zOrder.indexOf(id)
  if (i < state.zOrder.length - 1) {
    ;[state.zOrder[i], state.zOrder[i + 1]] = [state.zOrder[i + 1], state.zOrder[i]]
  }
}

export function moveItemDown(id) {
  const i = state.zOrder.indexOf(id)
  if (i > 0) {
    ;[state.zOrder[i], state.zOrder[i - 1]] = [state.zOrder[i - 1], state.zOrder[i]]
  }
}
