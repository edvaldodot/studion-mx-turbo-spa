<script>
import { defineComponent } from 'vue'

import Icon from '../Icon'

export default defineComponent({
  name: 'TheDropdown',

  components: {
    Icon,
  },

  props: {
    classes: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    iconSize: {
      type: String,
      default: null,
    },
    titleIconSize: {
      type: String,
      default: 'medium',
    },
    title: {
      type: String,
      default: null,
    },
    right: {
      type: Boolean,
      default: false,
    },
    links: {
      type: Array,
      default() {
        return []
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    absolute: {
      type: Boolean,
      default: false,
    },
    stopPropagation: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
      position: {
        x: 0,
        y: 0,
      },
      dropDownWidth: 180,
      dropDownHeight: 180,
    }
  },

  computed: {
    dropContentPosition() {
      if (this.absolute) {
        return {
          right: 0,
          top: 0,
          left: 'unset',
        }
      }

      if (this.position.x === 0 && this.position.y === 0)
        return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

      const displacement = 20
      let displacementX = this.right ? 0 - displacement : this.dropDownWidth * -1 + displacement

      let top = this.position.y - displacement
      let left = this.position.x + displacementX

      const leftCalc = left + this.dropDownWidth + displacement
      if (leftCalc >= screen.width || leftCalc >= window.innerWidth) {
        left -= this.dropDownWidth - displacement * 2
      }

      if (!this.right && left - this.dropDownWidth <= 10) {
        left += this.dropDownWidth - displacement * 2
      }

      const topCalc = top + this.dropDownHeight + displacement
      if (topCalc >= screen.height - 120) {
        top -= this.dropDownHeight - displacement * 2
        if (top + this.dropDownHeight > screen.height) top -= displacement
      }

      if (top <= 10) top += displacement

      return {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
      }
    },
  },

  methods: {
    toggleMenu(event) {
      if (this.disabled === true) return
      if (this.stopPropagation) event.stopPropagation()

      this.isOpen = !this.isOpen

      if (event) {
        this.position = { x: event.clientX, y: event.clientY }
      }

      this.$nextTick(() => {
        if (!this.$refs.dropdownContent) return
        this.dropDownWidth = this.$refs.dropdownContent.clientWidth
        this.dropDownHeight = this.$refs.dropdownContent.clientHeight
      })
    },

    outside() {
      this.isOpen = false
    },

    isDisabledClass() {
      return this.disabled === true ? 'is-disabled' : ''
    },
  },
})
</script>

<template>
  <div
    v-click-outside="outside"
    :data-testid="$testId('dropdown')"
    class="dropdown"
  >
    <a
      class="dropdown-link"
      :class="[classes, isDisabledClass()]"
      href="#"
      @click.prevent="toggleMenu"
    >
      <Icon
        v-if="icon"
        :name="icon"
        wrapper
        :size="iconSize"
      />
      <span
        v-if="text"
        class="text"
      >
        {{ text }}
      </span>
    </a>

    <Transition name="fadeInUp">
      <div
        v-show="isOpen"
        class="dropdown-content"
        :style="dropContentPosition"
      >
        <div
          v-if="title"
          class="dropdown-content-title"
        >
          <Icon
            v-if="icon"
            :name="icon"
            wrapper
            :size="titleIconSize"
          />

          <span class="text">{{ title }}</span>
        </div>

        <div
          ref="dropdownContent"
          class="dropdown-content-list"
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
@import 'Dropdown.scss';
</style>
