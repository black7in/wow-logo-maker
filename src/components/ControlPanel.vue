<script setup>
import { reactive } from 'vue'
import { state } from '@/store/editor'
import { fonts } from 'virtual:fonts'
import { frames } from 'virtual:frames'

const emit = defineEmits(['export'])

const open = reactive({ main: true, sub: false, fondo: false, marco: false })
function toggle(key) { open[key] = !open[key] }

function frameLabel(f) { return f.replace(/\.[^.]+$/, '').replace(/-/g, ' ') }
function fontLabel(n)  { return n.replace(/-/g, ' ') }
</script>

<template>
  <aside class="panel">
    <header class="panel-header">
      <span class="panel-title">WoW Logo Maker</span>
    </header>

    <div class="panel-scroll">
    <!-- ══ TEXTO PRINCIPAL ══ -->
    <div class="acc-item">
      <button class="acc-header" @click="toggle('main')">
        <span>Texto principal</span>
        <span class="chevron" :class="{ open: open.main }"></span>
      </button>
      <div class="acc-body" :class="{ open: open.main }">
        <div class="acc-inner">
          <section class="section">
            <label class="label">Texto</label>
            <input
              v-model="state.text"
              type="text"
              class="text-input"
              placeholder="Escribe tu logo…"
              maxlength="40"
            />
          </section>

          <section class="section">
            <label class="label">Tipo de letra</label>
            <div class="font-list">
              <button
                v-for="font in fonts"
                :key="font"
                class="font-btn"
                :class="{ active: state.selectedFont === font }"
                @click="state.selectedFont = font"
              >{{ fontLabel(font) }}</button>
            </div>
          </section>

          <section class="section">
            <label class="label">
              Tamaño <span class="label-value">{{ state.fontSize }}px</span>
            </label>
            <input v-model.number="state.fontSize" type="range" min="40" max="300" step="2" class="slider" />
            <label class="label mt">
              Espaciado <span class="label-value">{{ state.spacing }}px</span>
            </label>
            <input v-model.number="state.spacing" type="range" min="-10" max="40" step="1" class="slider" />
          </section>
        </div>
      </div>
    </div>

    <!-- ══ SUBTEXTO ══ -->
    <div class="acc-item">
      <button class="acc-header" @click="toggle('sub')">
        <span>Subtexto</span>
        <span class="chevron" :class="{ open: open.sub }"></span>
      </button>
      <div class="acc-body" :class="{ open: open.sub }">
        <div class="acc-inner">
          <section class="section">
            <label class="label">Texto</label>
            <input
              v-model="state.subText"
              type="text"
              class="text-input"
              placeholder="Subtítulo opcional…"
              maxlength="60"
            />
          </section>

          <section class="section">
            <label class="label">Tipo de letra</label>
            <div class="font-list">
              <button
                v-for="font in fonts"
                :key="font"
                class="font-btn"
                :class="{ active: state.subSelectedFont === font }"
                @click="state.subSelectedFont = font"
              >{{ fontLabel(font) }}</button>
            </div>
          </section>

          <section class="section">
            <label class="label">
              Tamaño <span class="label-value">{{ state.subFontSize }}px</span>
            </label>
            <input v-model.number="state.subFontSize" type="range" min="20" max="200" step="2" class="slider" />
            <label class="label mt">
              Espaciado <span class="label-value">{{ state.subSpacing }}px</span>
            </label>
            <input v-model.number="state.subSpacing" type="range" min="-10" max="40" step="1" class="slider" />
          </section>
        </div>
      </div>
    </div>

    <!-- ══ FONDO ══ -->
    <div class="acc-item">
      <button class="acc-header" @click="toggle('fondo')">
        <span>Fondo</span>
        <span class="chevron" :class="{ open: open.fondo }"></span>
      </button>
      <div class="acc-body" :class="{ open: open.fondo }">
        <div class="acc-inner">
          <section class="section">
            <div class="bg-row">
              <button
                class="bg-transparent-btn"
                :class="{ active: state.bgColor === 'transparent' }"
                title="Transparente"
                @click="state.bgColor = 'transparent'"
              >
                <span class="checker" />
                <span class="bg-btn-label">Transparente</span>
              </button>
              <label
                class="bg-color-btn"
                :class="{ active: state.bgColor !== 'transparent' }"
                title="Elegir color"
              >
                <input
                  type="color"
                  class="color-input"
                  :value="state.bgColor === 'transparent' ? '#000000' : state.bgColor"
                  @input="state.bgColor = $event.target.value"
                />
                <span
                  class="color-preview"
                  :style="{ background: state.bgColor === 'transparent' ? '#1a1a1a' : state.bgColor }"
                />
                <span class="bg-btn-label">Color</span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- ══ MARCO ══ -->
    <div class="acc-item">
      <button class="acc-header" @click="toggle('marco')">
        <span>Marco</span>
        <span class="chevron" :class="{ open: open.marco }"></span>
      </button>
      <div class="acc-body" :class="{ open: open.marco }">
        <div class="acc-inner">
          <section class="section">
            <div class="frames-grid">
              <button
                v-for="frame in frames"
                :key="frame"
                class="frame-btn"
                :class="{ active: state.frameSelected === frame }"
                :title="frameLabel(frame)"
                @click="state.frameSelected = frame"
              >
                <img :src="`/frames/${frame}`" :alt="frameLabel(frame)" class="frame-thumb" />
                <span class="frame-name">{{ frameLabel(frame) }}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>

    </div><!-- /panel-scroll -->

    <!-- ── Exportar ── -->
    <footer class="panel-footer">
      <button class="export-btn" @click="emit('export')">Exportar PNG</button>

      <div class="about">
        <p class="about-title">Creado por <strong>black7in</strong></p>
        <div class="about-links">
          <a
            href="https://github.com/black7in"
            target="_blank"
            rel="noopener noreferrer"
            class="about-link"
          >
            <svg class="about-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </a>
          <span class="about-link about-discord">
            <svg class="about-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            black7in
          </span>
        </div>
        <p class="about-submit">
          ¿Tienes un diseño de marco o fuente?<br>
          <span class="about-submit-cta">Envíalo por Discord</span>
        </p>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.panel {
  width: 260px;
  min-width: 260px;
  background: #111;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.panel-header {
  padding: 18px 16px;
  border-bottom: 1px solid #222;
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ── Acordeón ── */
.acc-item {
  border-bottom: 1px solid #222;
}

.acc-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #111;
  border: none;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.acc-header:hover {
  background: #1a1a1a;
}

.chevron {
  width: 10px;
  height: 10px;
  border-right: 2px solid #555;
  border-bottom: 2px solid #555;
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.chevron.open {
  transform: rotate(45deg);
  margin-bottom: -2px;
}

/* Truco grid-template-rows para animación sin max-height fijo */
.acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.22s ease;
}
.acc-body.open {
  grid-template-rows: 1fr;
}
.acc-inner {
  overflow: hidden;
}

/* ── Secciones internas ── */
.section {
  padding: 14px 16px;
  border-bottom: 1px solid #1c1c1c;
}
.section:last-child {
  border-bottom: none;
}

.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.label-value {
  color: #fff;
  font-weight: 600;
  font-size: 11px;
}

.mt { margin-top: 12px; }

/* ── Input texto ── */
.text-input {
  width: 100%;
  background: #000;
  border: 1px solid #333;
  border-radius: 3px;
  color: #fff;
  font-size: 15px;
  padding: 8px 10px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}
.text-input::placeholder { color: #444; }
.text-input:focus { border-color: #fff; }

/* ── Fuentes ── */
.font-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.font-btn {
  background: transparent;
  border: 1px solid #2a2a2a;
  border-radius: 3px;
  color: #666;
  font-size: 12px;
  padding: 7px 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.1s;
  text-transform: capitalize;
}
.font-btn:hover { border-color: #555; color: #ccc; }
.font-btn.active { border-color: #fff; background: #fff; color: #000; font-weight: 600; }

/* ── Sliders ── */
.slider { width: 100%; accent-color: #fff; cursor: pointer; }

/* ── Marcos ── */
.frames-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.frame-btn {
  background: #000;
  border: 1px solid #2a2a2a;
  border-radius: 3px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.frame-btn:hover { border-color: #666; }
.frame-btn.active { border-color: #fff; }
.frame-thumb {
  width: 100%;
  aspect-ratio: 5 / 3;
  object-fit: cover;
  border-radius: 2px;
  display: block;
}
.frame-name {
  font-size: 9px;
  color: #444;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.frame-btn.active .frame-name { color: #fff; }

/* ── Fondo ── */
.bg-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.bg-transparent-btn,
.bg-color-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 6px;
  border: 1px solid #2a2a2a;
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.1s;
  background: #000;
}
.bg-transparent-btn:hover, .bg-color-btn:hover { border-color: #555; }
.bg-transparent-btn.active, .bg-color-btn.active { border-color: #fff; }
.checker {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 0 0 / 8px 8px;
}
.color-input { display: none; }
.color-preview {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  border: 1px solid #333;
  display: block;
}
.bg-btn-label {
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.bg-transparent-btn.active .bg-btn-label,
.bg-color-btn.active .bg-btn-label { color: #fff; }

/* ── Export ── */
.panel-footer {
  padding: 16px;
  border-top: 1px solid #222;
  flex-shrink: 0;
}
.export-btn {
  width: 100%;
  padding: 10px;
  background: #fff;
  border: none;
  border-radius: 3px;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: background 0.1s;
}
.export-btn:hover { background: #ddd; }
.export-btn:active { background: #bbb; transform: translateY(1px); }

/* ── About / Créditos ── */
.about {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #222;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-title {
  font-size: 10px;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.about-title strong {
  color: #888;
  font-weight: 700;
}

.about-links {
  display: flex;
  gap: 6px;
}

.about-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 4px;
  border: 1px solid #222;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  color: #555;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: default;
  transition: border-color 0.15s, color 0.15s;
  background: transparent;
  user-select: text;
}

a.about-link {
  cursor: pointer;
}

a.about-link:hover {
  border-color: #555;
  color: #ccc;
}

.about-discord {
  cursor: default;
}

.about-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.about-submit {
  font-size: 9px;
  color: #3a3a3a;
  text-align: center;
  line-height: 1.5;
}

.about-submit-cta {
  color: #555;
  font-weight: 600;
}
</style>
