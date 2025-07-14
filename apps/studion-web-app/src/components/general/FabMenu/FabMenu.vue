<script>
import interact from 'interactjs'
import Icon from '../Icon'

export default {
  name: 'FabMenu',
  components: {
    Icon,
  },

  props: {
    buttonsList: {
      type: Array,
      default: () => [],
    },
    disableButtons: {
      type: Object,
      default: () => {},
    },
    removeButtons: {
      type: Object,
      default: () => {},
    },
    labelButtons: {
      type: Object,
      default: () => {},
    },
    iconButtons: {
      type: Object,
      default: () => {},
    },
    classButtons: {
      type: Object,
      default: () => {},
    },
    enableI18n: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    dragTip: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      open: false,
      timeOut: null,
      draggin: false,
      position: { x: 0, y: 0 },
      showDragTip: false,
    }
  },
  computed: {
    buttonsActives() {
      return this.buttonsList
        .map((item) => {
          if (this.labelButtons[item.id]) item.label = this.labelButtons[item.id]
          if (this.iconButtons[item.id]) item.icon = this.iconButtons[item.id]
          if (this.disableButtons[item.id]) item.disable = this.disableButtons[item.id]
          else item.disable = false
          return item
        })
        .filter((button) => !this.removeButtons[button.id])
    },

    isZendeskEnabled() {
      return this.$isEnabledFeature('chatbot')
    },

    classPosition() {
      const positionClasses = {}
      if (Math.abs(this.position.x) > window.innerWidth / 2) positionClasses['to-right'] = true
      if (Math.abs(this.position.y) > window.innerHeight / 2) positionClasses['to-top'] = true
      return positionClasses
    },

    isOpen() {
      return this.open && !this.draggin
    },
  },

  mounted() {
    this.startTip()

    let position = { x: 0, y: 0 }

    const updatePosition = (x, y) => {
      const lastPosition = { ...this.position }
      const topLimitSize = this.fullscreen ? 85 : 130

      const rightLimit = x + lastPosition.x > 0
      const leftLimit = Math.abs(x + lastPosition.x - 85) > window.innerWidth
      const bottomLimit = y + lastPosition.y > 0
      const topLimit = Math.abs(y + lastPosition.y - topLimitSize) > window.innerHeight

      this.position.x += rightLimit || leftLimit ? 0 : x
      this.position.y += bottomLimit || topLimit ? 0 : y
    }

    const getLimits = (x, y) => {
      updatePosition(x, y)
      return this.position
    }

    const setDrag = (bool) => {
      this.draggin = bool
    }

    interact('.fabmenu__area')
      .draggable({
        listeners: {
          move(event) {
            position = getLimits(event.dx, event.dy)
            event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
          },
        },
      })
      .on('dragstart', () => {
        this.showDragTip = false
        setDrag(true)
      })
      .on('dragend', () => setDrag(false))
  },

  methods: {
    closeMenu() {
      if (this.open) this.toggleMenu()
    },
    toggleMenu() {
      clearTimeout(this.timeOut)
      this.open = !this.open

      if (this.open === true) {
        this.timeOut = setTimeout(() => {
          this.open = false
        }, 4000)
      }
    },
    buttonEvent(button) {
      this.$emit('button:' + button.id)
      this.toggleMenu()
    },
    startTip() {
      this.showDragTip = this.dragTip
      setTimeout(() => {
        this.showDragTip = false
      }, 10000)
    },
    clickOutside() {
      this.closeMenu()
      this.showDragTip = false
    },
  },
}
</script>

<template>
  <div
    v-show="buttonsActives.length"
    v-click-outside="clickOutside"
    class="fabmenu__area"
    :class="{ draggin: draggin, ...classPosition }"
    touch-action="none"
  >
    <transition name="fabmenu-transition">
      <div
        v-if="showDragTip"
        class="fabmenu__tip"
      >
        <Icon name="drag" />
        <span>{{ $t('global:fab.tip:move') }}</span>
      </div>
    </transition>

    <transition name="fabmenu-transition">
      <div
        v-if="isOpen"
        class="fabmenu__generic"
        :class="{ ...classPosition }"
      >
        <button
          v-for="button in buttonsActives"
          :key="button.id + button.icon + button.label + button.disable + removeButtons"
          class="fabmenu__button"
          :class="classButtons[button.id]"
          :disabled="disableButtons[button.id]"
          @click.stop="buttonEvent(button)"
        >
          <div
            v-if="button.label && !enableI18n"
            class="fabmenu__label"
          >
            {{ button.label }}
          </div>
          <div
            v-else-if="enableI18n && $t(button.label)"
            class="fabmenu__label"
          >
            {{ $t(button.label) }}
          </div>
          <div class="fabmenu__icon"><Icon :name="button.icon" /></div>
        </button>
      </div>
    </transition>
    <button
      class="fabmenu__button options"
      :class="{ open: isOpen }"
      @click="toggleMenu"
    >
      <div class="fabmenu__icon options">
        <Icon name="dots-vertical" />
      </div>
    </button>
  </div>
</template>

<style lang="scss">
@import 'FabMenu.scss';
</style>
