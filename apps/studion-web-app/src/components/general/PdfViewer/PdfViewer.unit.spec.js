import { shallowMount } from '@vue/test-utils'

jest.mock('@/config', () => ({
  PDF_NAVIGATION_INTERVAL: undefined,
}))

jest.mock('vue-pdf-embed/dist/vue2-pdf-embed', () => ({
  name: 'VuePdfEmbed',
  render: (h) => h('div'),
}))

describe('PdfViewer.vue', () => {
  let wrapper

  const createComponent = (mockConfig) => {
    jest.doMock('@/config', () => mockConfig)

    const PdfViewer = require('./PdfViewer').default

    const wrapperComponent = shallowMount(PdfViewer, {
      propsData: { src: 'test.pdf' },
      mocks: { $media: {} },
    })

    wrapperComponent.vm.$refs.pdfRef.render = () => {}

    return wrapperComponent
  }

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  describe('Pdfviewer PDF_NAVIGATION_INTERVAL configuration handling', () => {
    const FALLBACK_VALUE = 2000

    it('should default to 2000ms when PDF_NAVIGATION_INTERVAL is not set', () => {
      wrapper = createComponent({ PDF_NAVIGATION_INTERVAL: undefined })
      expect(wrapper.vm.pdfInterval).toBe(FALLBACK_VALUE)
    })

    it('should correctly set interval when PDF_NAVIGATION_INTERVAL is defined', () => {
      wrapper = createComponent({ PDF_NAVIGATION_INTERVAL: 3 })
      expect(wrapper.vm.pdfInterval).toBe(3000)
    })

    it('should ignore non-numeric PDF_NAVIGATION_INTERVAL and default to 2000ms', () => {
      wrapper = createComponent({ PDF_NAVIGATION_INTERVAL: 'invalid' })
      expect(wrapper.vm.pdfInterval).toBe(FALLBACK_VALUE)
    })

    it('should correctly recognize zero as 0ms', () => {
      wrapper = createComponent({ PDF_NAVIGATION_INTERVAL: 0 })
      expect(wrapper.vm.pdfInterval).toBe(0)
    })

    it('should ignore negative values and default to 2000ms', () => {
      wrapper = createComponent({ PDF_NAVIGATION_INTERVAL: -5 })
      expect(wrapper.vm.pdfInterval).toBe(FALLBACK_VALUE)
    })
  })
})
