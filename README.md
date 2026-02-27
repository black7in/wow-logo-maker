# WoW Logo Maker

Herramienta web para crear logos al estilo de **World of Warcraft** usando fuentes de imagen letra a letra, marcos decorativos y exportación en PNG de alta resolución.

---

## Características

- Texto principal y subtexto con fuentes de imagen personalizadas
- Selección de marcos decorativos (grids con previsualización)
- Control de tamaño y espaciado de letra
- Fondo transparente o color sólido
- Grupo de texto arrastrable, escalable y rotable en el canvas
- Exportación a PNG a doble resolución (`pixelRatio: 2`)
- Auto-descubrimiento de fuentes y marcos al agregar carpetas/imágenes

---

## Stack técnico

- [Vue 3](https://vuejs.org/) + [Vite 7](https://vitejs.dev/)
- [vue-konva](https://github.com/konvajs/vue-konva) + [Konva](https://konvajs.org/) — canvas 2D
- Estado global con `reactive` (sin Pinia ni Vue Router)
- Plugin Vite propio (`publicAssetsPlugin`) para módulos virtuales `virtual:fonts` y `virtual:frames`

---

## Instalación y uso

```sh
# Instalar dependencias
npm install

# Servidor de desarrollo con hot-reload
npm run dev

# Build para producción
npm run build
```

---

## Agregar fuentes o marcos

### Nueva fuente de letras

1. Crea una carpeta en `public/letters/nombre-de-la-fuente/`
2. Agrega las imágenes con esta convención de nombres:

| Carácter | Nombre de archivo |
|----------|-------------------|
| Mayúscula `A` | `A.png` |
| Minúscula `a` | `_a.png` |
| Dígito `0` | `0.png` |
| Guión `-` | `-.png` |

3. Guarda los cambios — aparece automáticamente en el panel tras el hot-reload.

### Nuevo marco

1. Coloca el archivo PNG en `public/frames/`
2. Guarda — aparece automáticamente en la grilla de marcos.

---

## Estructura del proyecto

```
src/
  main.js                  → registra VueKonva
  App.vue                  → layout principal
  store/editor.js          → estado global reactive
  composables/
    useLetterImages.js     → carga y caché de imágenes por letra
  components/
    EditorCanvas.vue       → canvas Konva (fondo / marco / texto)
    ControlPanel.vue       → panel lateral de controles
  env.d.ts                 → tipos para virtual:fonts y virtual:frames
vite.config.js             → plugin de auto-descubrimiento de assets
public/
  letters/{fontName}/      → imágenes de letras por fuente
  frames/                  → marcos PNG
```

---

## Créditos y atribuciones

Algunos diseños de marcos e imágenes incluidos son propiedad de **Fandom / Blizzard Entertainment** y se usan únicamente con fines creativos y de comunidad.

Recursos adicionales extraídos de [sonceri.art — WoW Logo Photoshop Resources](https://sonceri.art/docs/photoshop/wow-logo).

---

## Autor

Creado por **black7in**

- Discord: `black7in`
- GitHub: [github.com/black7in](https://github.com/black7in)

¿Tienes un diseño de marco o fuente que quieras agregar? Envíalo por Discord.

---

© 2026 black7in — Todos los derechos reservados.
