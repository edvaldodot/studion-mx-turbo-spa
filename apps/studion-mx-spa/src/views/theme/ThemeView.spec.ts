// src/views/theme/ThemeView.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeView from '@/views/theme/ThemeView.vue'

describe('ThemeView.vue', () => {

  it('renderiza a seção de paleta com todas as cores', () => {
    const wrapper = mount(ThemeView)
    const paletteTitles = wrapper.findAll('section h2')
    const titlesText = paletteTitles.map(t => t.text())

    expect(titlesText).toContain('palette')
  })

  it('renderiza seção de tipografia com o texto "Somos DOT."', () => {
    const wrapper = mount(ThemeView)
    const typographySection = wrapper.findAll('section').find(s => s.text().includes('typography'))
    expect(typographySection?.text()).toContain('Somos DOT.')
  })

  it('renderiza os valores do array paddingMarginSizes', () => {
    const wrapper = mount(ThemeView)
    const paddingSection = wrapper.findAll('section').find(s => s.text().includes('padding'))
    expect(paddingSection?.text()).toContain('0')
    expect(paddingSection?.text()).toContain('96')
  })
})
