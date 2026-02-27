<script setup>
import { ref, computed, watch } from 'vue'
import { state } from '@/store/editor'
import { useLetterImages } from '@/composables/useLetterImages'

const STAGE_W = 1000
const STAGE_H = 600

// ── Frame ─────────────────────────────────────────────────────────────────────
const frameImg = ref(null)

watch(
  () => state.frameSelected,
  (name) => {
    if (!name) { frameImg.value = null; return }
    const img = new window.Image()
    img.onload = () => { frameImg.value = img }
    img.src = `/frames/${name}`
  },
  { immediate: true },
)

const frameConfig = computed(() => {
  const img = frameImg.value
  if (!img) return null
  const scale = Math.min(STAGE_W / img.naturalWidth, STAGE_H / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  return {
    image: img,
    x: (STAGE_W - w) / 2,
    y: (STAGE_H - h) / 2,
    width: w,
    height: h,
    listening: false,
  }
})

// ── Letras ────────────────────────────────────────────────────────────────────
const { letterImages: mainLetters, isLoading: mainLoading } = useLetterImages(
  computed(() => state.text),
  computed(() => state.selectedFont),
  computed(() => state.fontSize),
  computed(() => state.spacing),
)

const { letterImages: subLetters, isLoading: subLoading } = useLetterImages(
  computed(() => state.subText),
  computed(() => state.subSelectedFont),
  computed(() => state.subFontSize),
  computed(() => state.subSpacing),
)

const isLoading = computed(() => mainLoading.value || subLoading.value)

// ── Refs Konva ────────────────────────────────────────────────────────────────
const stageRef = ref(null)
const mainGroupRef = ref(null)
const subGroupRef = ref(null)
const transformerRef = ref(null)

// Map no reactivo para refs de extras (se lee sólo en handlers de eventos)
const extraNodeRefs = new Map()

// Función-refs para grupos de texto (evita que Vue los convierta en array dentro del v-for)
function setMainRef(el) { if (el) mainGroupRef.value = el }
function setSubRef(el)  { if (el) subGroupRef.value = el }

function setExtraRef(id) {
  return (el) => {
    if (el) extraNodeRefs.set(id, el)
    else extraNodeRefs.delete(id)
  }
}

// ── Lista ordenada para renderizado (bottom→top) ──────────────────────────────
const orderedItems = computed(() => {
  const byId = new Map(state.extras.map((e) => [e.id, e]))
  return state.zOrder.map((id) => ({
    id,
    type: id === 'mainText' ? 'main' : id === 'subText' ? 'sub' : 'extra',
    entry: byId.get(id) ?? null,
  }))
})

// ── Selección ─────────────────────────────────────────────────────────────────
// selectItem solo actualiza el estado; el watcher es quien adjunta/limpia el transformer.
// Así tanto los clics del canvas como los del panel Objetos funcionan igual.
function selectItem(id) {
  state.selectedItemId = id
}

// Fuente única de verdad para el transformer: reacciona a cualquier cambio de selectedItemId
watch(
  () => state.selectedItemId,
  (newId) => {
    const tr = transformerRef.value?.getNode()
    if (!tr) return
    if (newId === null) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    let node = null
    if (newId === 'mainText')     node = mainGroupRef.value?.getNode()
    else if (newId === 'subText') node = subGroupRef.value?.getNode()
    else                          node = extraNodeRefs.get(newId)?.getNode()
    if (node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    }
  },
  { flush: 'post' },  // dispara DESPUÉS del DOM → extraNodeRefs ya tiene el nodo recién montado
)

function onStageClick(e) {
  if (e.target === e.target.getStage()) {
    state.selectedItemId = null
  }
}

// ── Posicionamiento inicial de textos ─────────────────────────────────────────
const mainPositioned = ref(false)
watch(mainLetters, (letters) => {
  if (mainPositioned.value || !letters.length) return
  const totalW = letters[letters.length - 1].x + letters[letters.length - 1].width
  const node = mainGroupRef.value?.getNode()
  if (node) {
    node.x(Math.max(20, (STAGE_W - totalW) / 2))
    node.y(Math.max(20, (STAGE_H - state.fontSize) / 2))
    node.getLayer()?.batchDraw()
  }
  mainPositioned.value = true
})

const subPositioned = ref(false)
watch(subLetters, (letters) => {
  if (subPositioned.value || !letters.length) return
  const totalW = letters[letters.length - 1].x + letters[letters.length - 1].width
  const node = subGroupRef.value?.getNode()
  if (node) {
    node.x(Math.max(20, (STAGE_W - totalW) / 2))
    node.y(Math.round(STAGE_H * 0.68))
    node.getLayer()?.batchDraw()
  }
  subPositioned.value = true
})

// ── Posicionamiento inicial de extras (cuando carga la imagen) ────────────────
watch(
  () => state.extras.map((e) => !!e.img),
  () => {
    const stage = stageRef.value?.getNode()
    state.extras.forEach((entry) => {
      if (!entry.img || entry.positioned) return
      const node = extraNodeRefs.get(entry.id)?.getNode()
      if (!node) return
      const w = 200
      const h = entry.img.naturalHeight * (w / entry.img.naturalWidth)
      node.x(Math.max(20, (STAGE_W - w) / 2))
      node.y(Math.max(20, (STAGE_H - h) / 2))
      entry.positioned = true
      // Si este extra está seleccionado, reajusta el transformer a los bounds reales
      if (state.selectedItemId === entry.id) {
        const tr = transformerRef.value?.getNode()
        if (tr) tr.nodes([node])
      }
    })
    stage?.batchDraw()  // más fiable que node.getLayer()?.batchDraw()
  },
  { flush: 'post' },  // dispara DESPUÉS del DOM → v-image ya está montada en Konva
)

// ── Exportar ──────────────────────────────────────────────────────────────────
function exportToPng() {
  const stage = stageRef.value?.getNode()
  const tr = transformerRef.value?.getNode()
  if (!stage) return

  const prevNodes = tr ? [...tr.nodes()] : []
  tr?.nodes([])
  tr?.getLayer()?.batchDraw()

  const dataUrl = stage.toDataURL({ pixelRatio: 2 })

  if (tr && prevNodes.length) {
    tr.nodes(prevNodes)
    tr.getLayer()?.batchDraw()
  }

  const link = document.createElement('a')
  link.download = 'wow-logo.png'
  link.href = dataUrl
  link.click()
}

defineExpose({ exportToPng })
</script>

<template>
  <div class="canvas-wrapper" :class="{ 'bg-transparent': state.bgColor === 'transparent' }">
    <div v-if="isLoading" class="loading-badge">Cargando…</div>

    <v-stage
      ref="stageRef"
      :config="{ width: STAGE_W, height: STAGE_H }"
      @click="onStageClick"
    >
      <!-- Fondo: listening:false para que los clicks pasen al stage -->
      <v-layer>
        <v-rect
          v-if="state.bgColor !== 'transparent'"
          :config="{
            width: STAGE_W,
            height: STAGE_H,
            fill: state.bgColor,
            listening: false,
          }"
        />
      </v-layer>

      <!-- Marco: listening:false -->
      <v-layer>
        <v-image v-if="frameConfig" :config="frameConfig" />
      </v-layer>

      <!-- Textos + Extras + Transformer en la misma capa (z-order controlado por orderedItems) -->
      <v-layer>
        <template v-for="item in orderedItems" :key="item.id">

          <!-- Texto principal -->
          <v-group
            v-if="item.type === 'main'"
            :ref="setMainRef"
            :config="{ x: 100, y: 200, draggable: true }"
            @click="selectItem('mainText')"
          >
            <v-image
              v-for="letter in mainLetters"
              :key="letter.key"
              :config="{
                image: letter.img,
                x: letter.x,
                y: letter.y,
                width: letter.width,
                height: letter.height,
              }"
            />
          </v-group>

          <!-- Subtexto -->
          <v-group
            v-else-if="item.type === 'sub'"
            :ref="setSubRef"
            :config="{ x: 100, y: 400, draggable: true }"
            @click="selectItem('subText')"
          >
            <v-image
              v-for="letter in subLetters"
              :key="letter.key"
              :config="{
                image: letter.img,
                x: letter.x,
                y: letter.y,
                width: letter.width,
                height: letter.height,
              }"
            />
          </v-group>

          <!-- Extra -->
          <v-group
            v-else-if="item.entry"
            :ref="setExtraRef(item.id)"
            :config="{ draggable: true }"
            @click="selectItem(item.id)"
          >
            <v-image
              v-if="item.entry.img"
              :config="{
                image: item.entry.img,
                x: 0,
                y: 0,
                width: 200,
                height: item.entry.img.naturalHeight * 200 / item.entry.img.naturalWidth,
              }"
            />
          </v-group>

        </template>

        <!-- Transformer siempre encima -->
        <v-transformer
          ref="transformerRef"
          :config="{
            rotateEnabled: true,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            boundBoxFunc: (_old, newBox) => (newBox.width < 20 ? _old : newBox),
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  position: relative;
  display: inline-block;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  background: #000;
}

.canvas-wrapper.bg-transparent {
  background:
    repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%)
    0 0 / 16px 16px;
}

.loading-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  pointer-events: none;
}
</style>
