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
    listening: false, // no intercepta clicks, pasan al stage
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

// ── Selección ─────────────────────────────────────────────────────────────────
function selectGroup(groupRef) {
  const group = groupRef.value?.getNode()
  const tr = transformerRef.value?.getNode()
  if (!group || !tr) return
  tr.nodes([group])
  tr.getLayer()?.batchDraw()
}

function deselect() {
  const tr = transformerRef.value?.getNode()
  if (!tr) return
  tr.nodes([])
  tr.getLayer()?.batchDraw()
}

/**
 * Solo desselecciona cuando el click cae directamente en el stage
 * (no sobre ninguna figura). Funciona porque el fondo y el frame
 * tienen listening:false y los clicks los "atraviesan".
 */
function onStageClick(e) {
  if (e.target === e.target.getStage()) {
    deselect()
  }
}

// ── Posicionamiento inicial ───────────────────────────────────────────────────
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

      <!-- Textos + Transformer en la misma capa -->
      <v-layer>
        <v-group
          ref="mainGroupRef"
          :config="{ x: 100, y: 200, draggable: true }"
          @click="selectGroup(mainGroupRef)"
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

        <v-group
          ref="subGroupRef"
          :config="{ x: 100, y: 400, draggable: true }"
          @click="selectGroup(subGroupRef)"
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
