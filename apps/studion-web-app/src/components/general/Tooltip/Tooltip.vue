<script>
export default {
  name: 'Tooltip',
  props: {
    width: Number,
    uppercase: {
      type: Boolean,
      default: true,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    mediumFont: {
      type: Boolean,
      default: false,
    },
    boldFont: {
      type: Boolean,
      default: true,
    },
    arrow: {
      type: Boolean,
      default: false,
    },
    align: {
      type: String,
    },
    verticalAlign: {
      type: String,
      default: 'bottom',
    },
    shadow: {
      type: Boolean,
      default: false
    },
    textCenter: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activator: null,
      tooltip: null,
    }
  },
  computed: {
    classes() {
      return {
        '--uppercase': this.uppercase,
        '--dark': this.dark,
        '--medium-font': this.mediumFont,
        '--bold-font': this.boldFont,
        '--has-arrow': this.arrow,
        '--left': this.align === 'left',
        '--right': this.align === 'right',
        '--shadow': this.shadow,
        '--text-center': this.textCenter,
      }
    },
  },
  methods: {
    mouseenter() {
      const tooltipVNode = this.$slots.default && this.$slots.default[0]

      if (!tooltipVNode) return

      const activator = this.$el.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      this.tooltip = this.createTooltipElement(tooltipVNode)
      document.body.appendChild(this.tooltip)

      this.tooltip.style.width = this.width ? `${this.width}px` : 'auto'
      this.tooltip.style.top = `${activator.height + activator.y + 10}px`

      if (!this.align) {
        this.tooltip.style.left = `${
          activator.width / 2 - this.tooltip.offsetWidth / 2 + activator.x
        }px`
      } else if (this.align === 'left') {
        this.tooltip.style.left = `${
          activator.x - this.tooltip.offsetWidth + activator.width + 7
        }px`
      } else if (this.align === 'right') {
        this.tooltip.style.left = `${activator.x - 7}px`
      }

      if (this.tooltip.getBoundingClientRect().right > viewportWidth) {
        this.tooltip.style.left = `auto`
        this.tooltip.style.right = `20px`
      }

      if (this.tooltip.getBoundingClientRect().x < 0) {
        this.tooltip.style.left = `10px`
      }

      if (this.tooltip.getBoundingClientRect().width > viewportWidth) {
        this.tooltip.style.width = `${viewportWidth - 20}px`
      }

      if (this.verticalAlign === 'middle') {
        this.tooltip.style.top = `${
          activator.y + activator.height / 2 - this.tooltip.offsetHeight / 2
        }px`
        this.tooltip.style.left = `${
          activator.width - (this.tooltip.offsetWidth + 60) + activator.x
        }px`
      }

      if (this.verticalAlign === 'center-y') {
        this.tooltip.style.top = `${
          activator.y + activator.height / 2 - this.tooltip.offsetHeight / 2
        }px`
      }

      if (this.verticalAlign === 'top') {
        this.tooltip.style.top = `${activator.y - this.tooltip.offsetHeight - 10}px`
      }
    },
    mouseleave() {
      if (this.tooltip) {
        this.tooltip.remove()
      }
    },
    createTooltipElement(VNode) {
      let html

      if (VNode.tag) {
        html = document.createElement(VNode.tag)

        if (VNode.data && VNode.data.domProps && VNode.data.domProps.innerHTML) {
          html.innerHTML = VNode.data.domProps.innerHTML
        }

        if (VNode.children && VNode.children[0].text) {
          html.textContent = VNode.children[0].text
        }
      }

      html.classList.add('generic-tooltip')

      for (let keyClass in this.classes) {
        if (this.classes[keyClass]) {
          html.classList.add(keyClass)
        }
      }

      return html
    },
  },
  mounted() {
    this.activator = this.$el
  },
  destroyed() {
    if (this.tooltip) {
      this.tooltip.remove()
    }
  },
  render(h) {
    return this.$scopedSlots.activator({
      on: {
        mouseenter: this.mouseenter,
        mouseleave: this.mouseleave,
      },
    })
  },
}
</script>

<style lang="scss">
@import 'Tooltip.scss';
</style>
