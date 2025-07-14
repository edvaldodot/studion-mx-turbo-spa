<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'

export default defineComponent({
  name: 'FabButton',
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
    hasButtonPrev: {
      type: Boolean,
      default: true,
    },
    hasButtonNext: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      open: false,
      timeOut: null,
      showDragTip: false,
      buttonPrev: '',
      buttonNext: true,
    }
  },
  computed: {
    buttonsActives() {
      return this.buttonsList.map((item) => {
        if (this.labelButtons[item.id]) item.label = this.labelButtons[item.id]
        if (this.iconButtons[item.id]) item.icon = this.iconButtons[item.id]
        if (this.disableButtons[item.id]) item.disable = this.disableButtons[item.id]
        else item.disable = false
        return item
      })
    },

    isZendeskEnabled() {
      return this.$isEnabledFeature('chatbot')
    },

    isOpen() {
      return this.open
    },
  },

  watch: {
    hasButtonPrev() {
      this.buttonPrev = this.hasButtonPrev
    },

    hasButtonNext() {
      this.buttonNext = this.hasButtonNext
    },
  },

  created() {
    this.buttonPrev = this.hasButtonPrev

    this.buttonNext = this.hasButtonNext
  },
  mounted() {
    this.startTip()
  },
  methods: {
    closeMenu() {
      if (this.open) this.toggleMenu()
    },
    toggleMenu() {
      this.showDragTip = false

      if (this.buttonsActives.length === 1) {
        this.buttonEvent(this.buttonsActives[0], true)
        return
      }

      clearTimeout(this.timeOut)
      this.open = !this.open

      if (this.open === true) {
        this.timeOut = setTimeout(() => {
          this.open = false
        }, 4000)
      }
    },
    buttonEvent(button, preventToggleMenu = false) {
      this.$emit('button:' + button.id)
      !preventToggleMenu && this.toggleMenu()
    },
    startTip() {
      this.showDragTip = true
      setTimeout(() => {
        this.showDragTip = false
      }, 10000)
    },
  },
})
</script>

<template>
  <div
    class="fabbutton__area non-overlapping-element"
    :data-testid="$testId('FabButton')"
    touch-action="none"
  >
    <transition name="fabbutton-transition">
      <div
        v-if="showDragTip"
        class="fabbutton__tip"
      >
        <Icon name="treedashes" />
        <span>{{ $t('global:fab.tip:open') }}</span>
      </div>
    </transition>
    <transition name="fabbutton-transition">
      <div
        v-if="isOpen && buttonsActives.length > 1"
        class="fabbutton__generic"
      >
        <button
          v-for="button in buttonsActives"
          :key="button.id + button.icon + button.label + button.disable"
          class="fabbutton__button"
          :class="classButtons[button.id]"
          :disabled="disableButtons[button.id]"
          @click.stop="buttonEvent(button)"
        >
          <div
            v-if="button.label && !enableI18n"
            class="fabbutton__label"
          >
            {{ button.label }}
          </div>
          <div
            v-else-if="enableI18n && $t(button.label)"
            class="fabbutton__label"
          >
            {{ $t(button.label) }}
          </div>
          <div class="fabbutton__icon"><Icon :name="button.icon" /></div>
        </button>
      </div>
    </transition>

    <div
      class="fabbutton__wrapper"
      :class="{ prev: buttonPrev, next: buttonNext }"
      disable-buttons
    >
      <div v-if="buttonPrev">
        <button
          class="button-prev options"
          @click="$emit('button:previous')"
        >
          <div class="button__area">
            <p class="text-color">{{ $t(labelButtons.previous) }}</p>
            <Icon
              name="keyboard_backspace"
              class="button-icon"
              size="medium"
              wrapper
            />
          </div>
        </button>
      </div>

      <div
        class="wrapper-fabbutton__button"
        :class="{ prev: buttonPrev, next: buttonNext }"
      >
        <button
          class="fabbutton__button options"
          :class="{ open: isOpen }"
          @click="toggleMenu"
        >
          <div class="fabbutton__icon options">
            <div>
              <Icon
                :name="buttonsActives.length === 1 ? buttonsActives[0].icon : 'treedashes'"
                class="star"
                size="medium"
                wrapper
              />
            </div>
          </div>
        </button>
      </div>

      <div v-if="buttonNext">
        <button
          class="button-next options"
          :disabled="disableButtons && disableButtons.next"
          @click="disableButtons && !disableButtons.next ? $emit('button:next') : () => {}"
        >
          <div class="button__area">
            <p class="text-color">{{ $t(labelButtons.next) }}</p>
            <Icon
              v-if="labelButtons.next === 'global:next'"
              name="keyboard_backspace"
              class="button-icon"
              :class="{ 'button-icon--disabled': disableButtons && disableButtons.next }"
              size="medium"
              wrapper
            />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FabButton.scss';
</style>
