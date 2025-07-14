<script>
import Quill from 'quill'
import ResizeModule from '@botom/quill-resize-module'

import Action from '../Action'
import ValidationMessage from '../ValidationMessage'
import ModalEmbedVideo from '../ModalEmbedVideo'

import { mapActions } from 'vuex'

const TextAITool = () => import('@/components/shared/TextAITool')

Quill.register('modules/resize', ResizeModule)

export default {
  name: 'TextEditor',
  components: {
    Action,
    ModalEmbedVideo,
    TextAITool,
    ValidationMessage,
  },
  props: {
    value: {
      type: String,
      default: null,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: Number,
      default: 1,
    },
    maxRows: {
      type: Number,
      default: null,
    },
    counter: {
      type: Number,
      default: null,
    },
    hint: {
      type: String,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    bubble: {
      type: Boolean,
      default: false,
    },
    noFixed: {
      type: Boolean,
      default: false,
    },
    imageEnabled: {
      type: Boolean,
      default: false,
    },
    enableAi: {
      type: Boolean,
      default: false,
    },
    lightBg: {
      type: Boolean,
      default: false,
    },
    lightBgFull: {
      type: Boolean,
      default: false,
    },
    showOptional: {
      type: Boolean,
      default: true,
    },
    aiPrompt: {
      type: String,
      default: null,
    },
    formats: {
      type: Array,
      default: () => [
        'bold',
        'size',
        'italic',
        'link',
        'list',
        'image',
        'align',
        'video',
        'spanEmbed',
        'color',
        'background',
        'indent',
        'libras',
        'script',
      ],
    },
    embedVideo: {
      type: Boolean,
      default: false,
    },
    libras: {
      type: Boolean,
      default: false,
    },
    hideTools: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      quill: null,
      isMounted: false,
      isFocused: false,
      counterNum: 0,
      options: {
        modules: {
          toolbar: '',
          resize: {
            showSize: true,
            toolbar: {
              alingTools: false,
            },
            locale: {
              altTip: 'Hold down the alt key to zoom',
              floatLeft: 'Esquerda',
              floatRight: 'Direita',
              center: 'Centro',
              restore: 'Restaurar',
            },
          },
        },
        theme: 'bubble',
        formats: this.formats,
      },
      showPrompt: false,
      emojiDetail: {
        show: false,
        name: null,
      },
      emojiListOpen: false,
      emojiListStyle: {},
      emojiList: [
        {
          name: 'smile',
        },
        {
          name: 'tongue',
        },
        {
          name: 'wink',
        },
        {
          name: 'neutral',
        },
        {
          name: 'bothered',
        },
        {
          name: 'blowing_kisses',
        },
        {
          name: 'dead',
        },
        {
          name: 'happy',
        },
        {
          name: 'puke',
        },
        {
          name: 'thumbs_up',
        },
        {
          name: 'frown',
        },
        {
          name: 'heart_eyes',
        },
        {
          name: 'sunglasses',
        },
        {
          name: 'confused',
        },
        {
          name: 'anguished',
        },
        {
          name: 'sad',
        },
        {
          name: 'in_love',
        },
        {
          name: 'afraid',
        },
        {
          name: 'very_happy',
        },
        {
          name: 'angel',
        },
        {
          name: 'zzz',
        },
        {
          name: 'kiss',
        },
        {
          name: 'rage',
        },
        {
          name: 'disappointed',
        },
        {
          name: 'crying',
        },
        {
          name: 'heart',
        },
        {
          name: 'angry',
        },
        {
          name: 'rofl',
        },
        {
          name: 'calm',
        },
        {
          name: 'flustered',
        },
        {
          name: 'indifferent',
        },
        {
          name: 'lol',
        },
        {
          name: 'ok',
        },
        {
          name: 'surprised',
        },
      ],
      openedCustomSelects: [],
      showLibrasModal: false,
    }
  },
  computed: {
    hasValue() {
      return this.value !== null && this.value.toString().length > 0
    },
    hasValidation() {
      return Object.keys(this.validation).length
    },
    appendSize() {
      return this.isMounted ? this.$refs.append.offsetWidth : 0
    },
    isRequired() {
      return this.validation.$params != null && typeof this.validation.$params.required === 'object'
    },
  },
  watch: {
    value(newVal) {
      if (this.quill) {
        if (newVal && newVal !== this._content) {
          this._content = newVal
          this.quill.pasteHTML(newVal)
        } else if (!newVal) {
          this.quill.setText('')
        }
      }
    },
    disabled(newVal) {
      if (this.quill) {
        this.quill.enable(!newVal)
      }
    },
    appendSize() {
      this.$refs.editor.style.paddingRight = `${this.appendSize}px`
    },
    isFocused() {
      if (this.isFocused) {
        typeof this.validation.$reset === 'function' && this.validation.$reset()
      } else if (this.validation.$dirty) {
        typeof this.validation.$touch === 'function' && this.validation.$touch()
      }
    },
  },
  mounted() {
    this.sanitizeLink()
    this.options.theme = this.bubble ? 'bubble' : 'snow'
    this.options.modules.toolbar = this.$refs.editorTools

    var icons = Quill.import('ui/icons')
    icons['bold'] =
      '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
    icons['italic'] =
      '<svg viewBox="0 0 24 24"><path d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" /></svg>'
    icons['list']['ordered'] =
      '<svg viewBox="0 0 24 24"><path d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H3.8L2,13.1V14H5V13H3.2L5,10.9V10H2M3,8H4V4H2V5H3M2,17H4V17.5H3V18.5H4V19H2V20H5V16H2V17Z" /></svg>'
    icons['list']['bullet'] =
      '<svg viewBox="0 0 24 24"><path d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" /></svg>'
    icons['link'] =
      '<svg viewBox="0 0 24 24"><path d="M16,6H13V7.9H16C18.26,7.9 20.1,9.73 20.1,12A4.1,4.1 0 0,1 16,16.1H13V18H16A6,6 0 0,0 22,12C22,8.68 19.31,6 16,6M3.9,12C3.9,9.73 5.74,7.9 8,7.9H11V6H8A6,6 0 0,0 2,12A6,6 0 0,0 8,18H11V16.1H8C5.74,16.1 3.9,14.26 3.9,12M8,13H16V11H8V13Z" /></svg>'
    icons['clean'] =
      '<svg viewBox="0 0 24 24"><path d="M6,5V5.18L8.82,8H11.22L10.5,9.68L12.6,11.78L14.21,8H20V5H6M3.27,5L2,6.27L8.97,13.24L6.5,19H9.5L11.07,15.34L16.73,21L18,19.73L3.55,5.27L3.27,5Z" /></svg>'
    icons['size'] =
      '<svg viewBox="0 0 24 24"><path d="M3,12H6V19H9V12H12V9H3M9,4V7H14V19H17V7H22V4H9Z" /></svg>'
    icons['align'][''] =
      '<svg viewBox="0 0 24 24"><path d="M3 3h18v2.016h-18v-2.016zM3 21v-2.016h18v2.016h-18zM3 12.984v-1.969h18v1.969h-18zM15 6.984v2.016h-12v-2.016h12zM15 15v2.016h-12v-2.016h12z" /></svg>'
    icons['align']['center'] =
      '<svg viewBox="0 0 24 24"><path d="M3 3h18v2.016h-18v-2.016zM6.984 6.984h10.031v2.016h-10.031v-2.016zM3 12.984v-1.969h18v1.969h-18zM3 21v-2.016h18v2.016h-18zM6.984 15h10.031v2.016h-10.031v-2.016z" /></svg>'
    icons['align']['right'] =
      '<svg viewBox="0 0 24 24"><path d="M3 3h18v2H3zm0 8h18v2H3zm0 8h18v2H3zm6-4h12v2H9zm0-8h12v2H9z" /></svg>'
    icons['align']['justify'] =
      '<svg viewBox="0 0 24 24"><path d="M3 3h18v2H3zm0 8h18v2H3zm0 8h18v2H3zm0-4h18v2H3zm0-8h18v2H3z" /></svg>'
    icons['color'] =
      '<svg viewBox="0 -960 960 960" fill="#5f6368"><path d="M80 0v-160h800V0H80Zm140-280 210-560h100l210 560h-96l-50-144H368l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z"/></svg>'
    icons['background'] =
      '<svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M393-93 53-433l277-276-106-106 62-65 447 447L393-93Zm0-553L179-432h428L393-646Zm399 526q-36 0-61-25.5T706-208q0-27 13.5-51t30.5-47l42-54 44 54q16 23 30 47t14 51q0 37-26 62.5T792-120Z"/></svg>'
    icons['indent']['-1'] =
      '<svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm160 440L120-480l160-160v320Z"/></svg>'
    icons['indent']['+1'] =
      '<svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm320-160v-80h400v80H440Zm0-160v-80h400v80H440Zm0-160v-80h400v80H440ZM120-760v-80h720v80H120Zm0 440v-320l160 160-160 160Z"/></svg>'
    icons['script']['sub'] =
      '<svg viewBox="0 0 18 18"><path class="ql-fill" d="M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z"></path><path class="ql-fill" d="M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z"></path></svg>'
    icons['script']['super'] =
      '<svg viewBox="0 0 18 18"><path class="ql-fill" d="M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z"></path><path class="ql-fill" d="M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z"></path></svg>'
    this.registerImage()
    this.registerSpan()
    if (this.libras) this.registerLibras()
    this.quill = new Quill(this.$refs.editor, this.options)

    var keyboard = this.quill.getModule('keyboard')
    delete keyboard.bindings[13][5]
    delete keyboard.bindings[9]
    let form = this.$refs.input.form

    this.quill.keyboard.addBinding(
      {
        key: 13,
        ctrlKey: true,
      },
      function () {
        form.dispatchEvent(new Event('submit'))
      }
    )

    if (this.maxRows) {
      let maxHeight = 36 + (this.maxRows - 1) * 19
      this.quill.scrollingContainer.style.maxHeight = maxHeight + 'px'
    }
    if (this.rows > 1) {
      let minHeight = 36 + (this.rows - 1) * 19
      this.quill.scrollingContainer.style.minHeight = minHeight + 'px'
    }

    this.quill.root.spellcheck = false

    if (this.value) {
      var Delta = Quill.import('delta')

      this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node) => {
        return new Delta().insert(node.data)
      })

      this.quill.clipboard.addMatcher('strong', (_, delta) => {
        return delta.compose(new Delta().retain(delta.length(), { bold: true }))
      })

      this.quill.clipboard.addMatcher('.ql-size-large', (_, delta) => {
        return delta.compose(new Delta().retain(delta.length(), { size: 'large' }))
      })

      this.quill.root.innerHTML = this.changeTagInTokenValue(this.value)
    }

    if (this.disabled) {
      this.quill.enable(false)
    }

    this.quill.on('selection-change', (range) => {
      if (!range) {
        this.isFocused = false
        this.closeEmojiList()
        this.$emit('blur', this.quill)
      } else {
        this.isFocused = true
        this.$emit('focus', this.quill)
      }
    })

    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (this.counter !== null && this.quill.getLength() > this.counter) {
        this.quill.deleteText(this.counter, this.quill.getLength())
      }
      let text = this.quill.getText()
      if (source === 'user') {
        let lastChar = text.slice(-2, -1)
        const regex = /:\w+:/g
        if (lastChar === ':' && regex.test(text)) {
          let word = text.match(regex).pop()
          this.replaceByEmoticon(word)
        }
      }
      let html = this.$refs.editor.children[0].innerHTML
      if (html === '<p><br></p>') {
        html = ''
      }
      this._content = this.changeTagInTokenValue(html)
      if (source === 'user') {
        typeof this.validation.$touch === 'function' && this.validation.$touch()
      }
      this.counter && this.calculateLength(text)
      this.$emit('input', this._content)
      this.$emit('change', { html, text })
    })

    this.$emit('ready', this.quill)

    this.counter && this.calculateLength(this.quill.getText())
    this.isMounted = true
  },
  beforeDestroy() {
    this.quill = null
  },
  methods: {
    ...mapActions(['setFeedback']),
    calculateLength(value) {
      this.counterNum = value.length - 1
    },
    openEmojiList() {
      this.emojiListOpen = !this.emojiListOpen
      let top = this.$refs.emojiBtn.offsetTop + 40
      let left = this.$refs.emojiBtn.offsetLeft - 220
      if (this.inViewport()) {
        top = top - 290
      }
      if (this.bubble) {
        top = top + 50
      }
      this.emojiListStyle.top = top + 'px'
      this.emojiListStyle.left = left + 'px'
      this.addFocus()
    },
    closeEmojiList() {
      this.emojiListOpen = false
    },
    addEmoji(name) {
      this.closeEmojiList()
      let range = this.quill.getSelection().index
      this.quill.insertEmbed(range, 'emojiBlot', name, Quill.sources.USER)
      this.quill.insertText(range + 1, ' ', Quill.sources.SILENT)
      this.quill.setSelection(range + 2, Quill.sources.SILENT)
    },
    addText(text) {
      let range = this.quill.getSelection(true).index
      this.quill.insertText(range, text, Quill.sources.USER)
      this.quill.setSelection(range + text.length + 1, Quill.sources.SILENT)
    },
    setSelection(range) {
      this.quill.setSelection(range, Quill.sources.SILENT)
    },
    getSelection() {
      return this.quill.getSelection(true).index
    },
    replaceByEmoticon(word) {
      let name = word.replace(/:/g, '')
      let existsEmoji = this.emojiList.find((emoji) => emoji.name === name)
      if (existsEmoji) {
        let currentText = this.quill.getSelection()
        let endRetain = currentText.index - word.length
        let ops = [
          { retain: endRetain },
          { delete: word.length },
          { insert: { emojiBlot: name } },
          { insert: ' ' },
        ]
        this.quill.updateContents({ ops: ops })
      }
    },
    addDetail(name) {
      this.emojiDetail.show = true
      this.emojiDetail.name = name
    },
    removeDetail() {
      this.emojiDetail.show = false
      this.emojiDetail.name = null
    },
    inViewport() {
      return window.innerHeight - this.$refs.emojiList.getBoundingClientRect().bottom > 250
    },
    addFocus() {
      this.quill.focus()
    },
    registerEmoji() {
      const Embed = Quill.import('blots/embed')

      class EmojiBlot extends Embed {
        static create(value) {
          let node = super.create()
          node.classList.add('emoji')
          node.setAttribute('data-emoji', value)
          node.textContent = ' '
          return node
        }

        static value(node) {
          return node.getAttribute('data-emoji')
        }
      }

      EmojiBlot.blotName = 'emojiBlot'
      EmojiBlot.tagName = 'img'

      Quill.register('formats/emoji', EmojiBlot, true)
    },
    registerImage() {
      let BlockEmbed = Quill.import('blots/block/embed')

      class ImageBlot extends BlockEmbed {
        static create(value) {
          let node = super.create()
          if (typeof value['max-width'] !== 'undefined') {
            node.setAttribute('style', value['max-width'])
          }
          if (typeof value.width !== 'undefined') {
            node.setAttribute('width', value.width)
          }
          if (typeof value.alt !== 'undefined') {
            node.setAttribute('alt', value.alt)
          }
          node.setAttribute('src', value.url)
          return node
        }

        static value(node) {
          return {
            style: node.getAttribute('style'),
            width: node.getAttribute('width'),
            alt: node.getAttribute('alt'),
            url: node.getAttribute('src'),
          }
        }
      }

      ImageBlot.blotName = 'image'
      ImageBlot.tagName = 'img'

      Quill.register('formats/CustomImageBlot', ImageBlot, true)
    },
    registerSpan() {
      let Embed = Quill.import('blots/embed')

      class SpanEmbed extends Embed {
        static create(value) {
          let node = super.create()
          node.innerHTML = value
          return node
        }

        static value(node) {
          return node.innerHTML
        }
      }

      SpanEmbed.blotName = 'spanEmbed'
      SpanEmbed.tagName = 'span'
      SpanEmbed.className = 'span-tag'

      Quill.register('formats/CustomSpamEmbed', SpanEmbed, true)
    },
    registerLibras() {
      const BlockEmbed = Quill.import('blots/block/embed')

      class LibrasBlot extends BlockEmbed {
        static create(value) {
          let node = super.create()

          let title = document.createElement('div')
          title.className = 'libras-title'
          title.innerText = value.title || 'Título'

          title.setAttribute(
            'onclick',
            'this.nextElementSibling.style.display = this.nextElementSibling.style.display === "none" ? "block" : "none";'
          )

          let content = document.createElement('div')
          content.className = 'libras-content'

          if (value.videoType && value.videoId) {
            let iframe = document.createElement('iframe')
            iframe.className = `${value.videoType}-embed`
            if (value.videoType === 'vimeo') {
              iframe.src = `https://player.vimeo.com/video/${value.videoId}`
            } else if (value.videoType === 'youtube') {
              iframe.src = `https://www.youtube.com/embed/${value.videoId}`
            }
            iframe.setAttribute('frameborder', '0')
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture')
            iframe.setAttribute('allowfullscreen', true)
            content.appendChild(iframe)
          } else {
            content.innerText = value.content || 'Conteúdo oculto. Clique no título para mostrar.'
          }

          content.style.display = 'none'

          node.appendChild(title)
          node.appendChild(content)

          return node
        }

        static value(node) {
          let title = node.querySelector('.libras-title').innerText
          let iframe = node.querySelector('iframe')
          let videoType = null
          let videoId = null

          if (iframe) {
            if (iframe.className.includes('vimeo')) {
              videoType = 'vimeo'
              videoId = iframe.src.split('/').pop()
            } else if (iframe.className.includes('youtube')) {
              videoType = 'youtube'
              videoId = new URL(iframe.src).pathname.split('/').pop()
            }
          }

          return {
            title,
            videoType,
            videoId,
          }
        }
      }

      LibrasBlot.blotName = 'libras'
      LibrasBlot.tagName = 'div'
      LibrasBlot.className = 'libras-blot'

      Quill.register(LibrasBlot)
    },
    embedLibras(videoUrl) {
      let title = 'Libras'
      let videoId, videoType

      if (videoUrl.includes('vimeo.com')) {
        videoId = videoUrl.split('/').pop()
        videoType = 'vimeo'
      } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const url = new URL(videoUrl)
        if (url.hostname === 'youtu.be') {
          videoId = url.pathname.substring(1)
        } else if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v')
        }
        videoType = 'youtube'
      } else {
        return
      }

      const existingBlot = this.findLibrasBlot(this.quill)

      if (existingBlot) {
        existingBlot.domNode.querySelector('.libras-title').innerText = title
        const contentElement = existingBlot.domNode.querySelector('.libras-content')
        contentElement.innerHTML = ''
        let iframe = document.createElement('iframe')
        iframe.className = `${videoType}-embed`
        if (videoType === 'vimeo') {
          iframe.src = `https://player.vimeo.com/video/${videoId}`
        } else if (videoType === 'youtube') {
          iframe.src = `https://www.youtube.com/embed/${videoId}`
        }
        iframe.setAttribute('frameborder', '0')
        iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture')
        iframe.setAttribute('allowfullscreen', true)
        contentElement.appendChild(iframe)
        this.setFeedback({
          message: this.$t('libras.feedback:updated'),
        })
      } else {
        this.quill.insertEmbed(0, 'libras', {
          title: title,
          videoType: videoType,
          videoId: videoId,
        })
        this.setFeedback({
          message: this.$t('libras.feedback:added'),
        })
      }
    },
    findLibrasBlot(quill) {
      const librasElements = quill.container.querySelectorAll('.libras-blot')
      return librasElements.length > 0 ? Quill.find(librasElements[0]) : null
    },
    sanitizeLink() {
      let Link = Quill.import('formats/link')
      Link.sanitize = function (value) {
        let url = value.url ? value.url : value
        let match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)
        if (match) {
          url = (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/'
        } else {
          if (url.includes('https://youtu.be/')) {
            url = url.replace('https://youtu.be/', 'https://www.youtube.com/embed/')
          } else {
            if (url.includes('&')) {
              url = url.slice(0, url.indexOf('&'))
            }
            url = url.replace('watch?v=', 'embed/')
          }
        }
        const protocol = url.slice(0, url.indexOf(':'))
        if (Link.PROTOCOL_WHITELIST.indexOf(protocol) === -1) {
          url = 'http://' + url
        }
        return url
      }
    },
    addImageUrl(imageUrl, attributes) {
      let range = 0
      if (this.quill.getSelection()) {
        range = this.quill.getSelection().index
      }
      this.quill.insertEmbed(range, 'image', {
        url: imageUrl,
        ...attributes,
      })
      this.quill.setSelection(range + 1)
    },
    addIFrame(videoUrl, attributes) {
      let range = 0
      if (this.quill.getSelection()) {
        range = this.quill.getSelection().index
      }
      this.quill.insertEmbed(range, 'video', {
        url: videoUrl,
        ...attributes,
      })
      this.quill.setSelection(range + 1)
    },
    changeTagInTokenValue(html) {
      let htmlFormatted = html.replace(
        /({{\s?)(<['"a-z-_0-9=\s]*>)(.+?)(<\/['"a-z-_0-9=\s]*>)(\s?}})/g,
        (match, tokenOpen, tagOpen, variable, tagClose, tokenClose) => {
          return tagOpen + tokenOpen + variable + tokenClose + tagClose
        }
      )
      if (htmlFormatted !== html) {
        // Subtags
        htmlFormatted = this.changeTagInTokenValue(htmlFormatted)
      }
      return htmlFormatted
    },
    addTag(text) {
      const range = this.quill.getSelection(true).index
      this.quill.insertEmbed(range, 'spanEmbed', text)
      this.quill.setSelection(range + text.length)
    },
    replaceTextByFunction(text, replaceFunction) {
      const range = this.getSelection()
      const newText = replaceFunction(text)
      this.quill.pasteHTML(newText)
      this.setSelection(range)
    },
    modalEmbedVideo() {
      this.$emit('modalEmbedVideo')
    },
    closeAllQuillPickers() {
      this.$refs.editorTools.querySelectorAll('.ql-picker').forEach((picker) => {
        picker.classList.remove('ql-expanded')
      })
    },
    closeCustomSelect(refName) {
      this.openedCustomSelects.splice(this.openedCustomSelects.indexOf(refName), 1)
      this.$refs[refName].removeAttribute('show')
    },
    openCustomSelect(refName) {
      this.openedCustomSelects.push(refName)
      this.$refs[refName].setAttribute('show', true)
    },
    toggleCustomSelect(refName) {
      this.closeAllQuillPickers()

      if (this.openedCustomSelects.includes(refName)) {
        this.closeCustomSelect(refName)
      } else {
        this.openCustomSelect(refName)
      }
    },
    isCustomSelectOpened(refName) {
      return this.openedCustomSelects.includes(refName)
    },
  },
}
</script>

<template>
  <div
    class="form-item text-editor-container"
    :class="{
      'has-error': validation.$error,
      'has-value': hasValue,
      'has-focus': isFocused,
      'is-disabled': disabled,
      'has-floating-label': floatingLabel,
      'theme-dark': dark,
      'hide-details': hideDetails,
      'theme-snow': !bubble,
      'no-fixed': noFixed,
      'light-bg': lightBg,
      'light-bg-full': lightBgFull,
    }"
  >
    <label
      v-if="label"
      class="form-label"
      @click="addFocus()"
    >
      {{ label }}
      <span v-if="!isRequired && !disabled && showOptional">{{ $t('global:form.optional') }}</span>
    </label>
    <Input
      ref="input"
      type="hidden"
    />
    <div class="text-editor-wrapper">
      <div class="form-input-wrapper">
        <div
          ref="editor"
          class="form-editor"
        ></div>
        <slot name="attachment"></slot>
        <div
          ref="append"
          class="form-input-append"
        >
          <slot name="button"></slot>
        </div>
      </div>
      <div
        v-if="hint || hasValidation || counter"
        class="form-input-details"
      >
        <div
          v-if="hint && !validation.$error"
          class="input-hint-wrapper"
        >
          <span class="form-input-hint">
            {{ hint }}
          </span>
        </div>
        <ValidationMessage :validation="validation" />
        <div class="input-counter-wrapper">
          <span
            v-if="counter"
            class="form-input-counter"
          >
            {{ counterNum }} / {{ counter }}
          </span>
        </div>
      </div>
      <div
        v-if="!hideTools && !bubble"
        ref="formItemTools"
        class="form-item-tools"
      >
        <slot name="before-tools"></slot>
        <div
          ref="editorTools"
          class="form-editor-toolbar"
        >
          <select
            v-if="formats.includes('size')"
            class="ql-size"
          >
            <option value="small">{{ $t('global:small') }}</option>
            <option selected>{{ $t('global:normal') }}</option>
            <option value="large">{{ $t('global:large') }}</option>
          </select>
          <div
            v-if="
              formats.includes('bold') || formats.includes('italic') || formats.includes('script')
            "
            class="mobile-custom-select"
          >
            <Action
              icon="text-format"
              type="button"
              @click.stop="toggleCustomSelect('textFormatButtons')"
            />
            <span
              ref="textFormatButtons"
              v-click-outside="
                () => {
                  closeCustomSelect('textFormatButtons')
                }
              "
              class="custom-format-buttons"
            >
              <button
                v-if="formats.includes('bold')"
                class="ql-bold"
              ></button>
              <button
                v-if="formats.includes('italic')"
                class="ql-italic"
              ></button>
              <button
                v-if="formats.includes('script')"
                class="ql-script"
                value="sub"
              ></button>
              <button
                v-if="formats.includes('script')"
                class="ql-script"
                value="super"
              ></button>
            </span>
          </div>
          <button
            v-if="formats.includes('bold')"
            class="ql-bold hide-on-mobile"
          ></button>
          <button
            v-if="formats.includes('italic')"
            class="ql-italic hide-on-mobile"
          ></button>
          <button
            v-if="formats.includes('script')"
            class="ql-script hide-on-mobile"
            value="sub"
          ></button>
          <button
            v-if="formats.includes('script')"
            class="ql-script hide-on-mobile"
            value="super"
          ></button>
          <div
            v-if="formats.includes('list')"
            class="mobile-custom-select"
          >
            <Action
              icon="list-format"
              type="button"
              @click.stop="toggleCustomSelect('listFormatButtons')"
            />
            <span
              ref="listFormatButtons"
              v-click-outside="
                () => {
                  closeCustomSelect('listFormatButtons')
                }
              "
              class="custom-format-buttons"
            >
              <button
                v-if="formats.includes('list')"
                class="ql-list"
                value="ordered"
              ></button>
              <button
                v-if="formats.includes('list')"
                class="ql-list"
                value="bullet"
              ></button>
            </span>
          </div>
          <button
            v-if="formats.includes('list')"
            class="ql-list hide-on-mobile"
            value="ordered"
          ></button>
          <button
            v-if="formats.includes('list')"
            class="ql-list hide-on-mobile"
            value="bullet"
          ></button>
          <select
            v-if="formats.includes('align')"
            class="ql-align"
          >
            <option selected></option>
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
          <button
            v-if="formats.includes('link')"
            class="ql-link"
          ></button>
          <select
            v-if="formats.includes('color')"
            class="ql-color"
          >
            <option
              value="#000000"
              selected
            ></option>
            <option value="#ffffff"></option>
          </select>
          <button
            v-if="formats.includes('indent')"
            class="ql-indent"
            value="-1"
          ></button>
          <button
            v-if="formats.includes('indent')"
            class="ql-indent"
            value="+1"
          ></button>
          <slot name="attach"></slot>
          <slot
            v-if="imageEnabled && !bubble"
            name="embed-image"
          ></slot>
          <slot
            v-if="embedVideo"
            name="embed-video"
          >
            <Action
              type="button"
              icon="video-2"
              @click="modalEmbedVideo"
            />
          </slot>
          <button class="ql-clean"></button>

          <Action
            v-if="libras && !bubble"
            icon="libras"
            type="button"
            @click="showLibrasModal = true"
          />

          <Action
            v-if="enableAi && $mediationAiEnabled()"
            icon="chatbot"
            type="button"
            @click="showPrompt = !showPrompt"
          />
        </div>
        <div
          v-show="emojiListOpen"
          ref="emojiList"
          class="emoji-list-container"
          :style="emojiListStyle"
        >
          <div class="emoji-list clearfix">
            <button
              v-for="(emoji, index) in emojiList"
              :key="index"
              :data-emoji="emoji.name"
              type="button"
              class="emoji-btn"
              @click="addEmoji(emoji.name)"
              @mouseover="addDetail(emoji.name)"
              @mouseleave="removeDetail()"
            >
              {{ emoji.name }}
            </button>
          </div>
          <div class="emoji-detail">
            <template v-if="emojiDetail.name">
              <span
                class="emoji-detail-icon"
                :data-emoji="emojiDetail.name"
              ></span>
              <span class="emoji-detail-name">:{{ emojiDetail.name }}:</span>
            </template>
          </div>
        </div>
      </div>
    </div>
    <slot
      v-if="imageEnabled && bubble && isFocused"
      name="embed-image"
    ></slot>

    <Action
      v-if="libras && bubble && isFocused"
      icon="libras"
      type="button"
      @click="showLibrasModal = true"
    />

    <slot name="actions-tools"></slot>

    <slot name="after-tools"></slot>

    <TextAITool
      v-if="showPrompt && $mediationAiEnabled()"
      :ai-prompt="aiPrompt"
      @prompt="$emit('prompt', $event)"
      @settings="$emit('settings', true)"
    />

    <ModalEmbedVideo
      v-if="showLibrasModal"
      class="modal-embed-video"
      @close="showLibrasModal = false"
      @submit="embedLibras($event)"
    />
  </div>
</template>

<style lang="scss">
@import 'TextEditor.scss';
</style>
