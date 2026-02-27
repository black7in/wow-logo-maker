<script setup>
import { ref } from 'vue'
import ControlPanel from '@/components/ControlPanel.vue'
import EditorCanvas from '@/components/EditorCanvas.vue'

const canvasRef = ref(null)

function handleExport() {
  canvasRef.value?.exportToPng()
}
</script>

<template>
  <div class="app-layout">
    <ControlPanel @export="handleExport" />
    <main class="canvas-area">
      <EditorCanvas ref="canvasRef" />
      <footer class="canvas-credits">
        <span>&copy; {{ new Date().getFullYear() }} black7in — Todos los derechos reservados.</span>
        <span class="credits-sep">·</span>
        <span>
          Algunos diseños de marcos e imágenes son propiedad de
          <strong>Fandom / Blizzard Entertainment</strong>.
        </span>
        <span class="credits-sep">·</span>
        <span>
          Recursos adicionales extraídos de
          <a href="https://sonceri.art/docs/photoshop/wow-logo" target="_blank" rel="noopener noreferrer">
            sonceri.art
          </a>
        </span>
      </footer>
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    repeating-conic-gradient(#161616 0% 25%, #111 0% 50%)
    0 0 / 24px 24px;
  overflow: auto;
  padding: 20px 20px 0;
  position: relative;
}

.canvas-credits {
  width: 100%;
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 10px;
  color: #333;
  flex-shrink: 0;
  margin-top: auto;
}

.canvas-credits strong {
  color: #3d3d3d;
  font-weight: 600;
}

.canvas-credits a {
  color: #3d3d3d;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.canvas-credits a:hover {
  color: #777;
}

.credits-sep {
  color: #2a2a2a;
}
</style>
