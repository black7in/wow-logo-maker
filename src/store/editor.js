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
})
