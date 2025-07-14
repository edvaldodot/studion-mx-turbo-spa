<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import Action from '../Action'
import Logo from '../Logo'
import Profile from '../Profile'

export default {
  name: 'ContentHeader',
  components: {
    Action,
    Logo,
    Profile,
  },
  props: {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    tag: {
      type: String,
      default: null,
    },
    background: {
      type: String,
      default: null,
    },
    backgroundBlur: {
      type: Boolean,
      default: false,
    },
    back: {
      type: Boolean,
      default: false,
    },
    backText: {
      type: String,
      default: 'Voltar',
    },
    backUrl: {
      type: Object,
      default: null,
    },
    thick: {
      type: Boolean,
      default: false,
    },
    retract: {
      type: Boolean,
      default: false,
    },
    beginRetract: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    lightTheme: {
      type: Boolean,
      default: false,
    },
    fitTitle: {
      type: Boolean,
      default: false,
    },
    float: {
      type: Boolean,
      default: false,
    },
    classroom: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
    },
    hideBottom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      retractActive: false,
      objectStyle: {
        backgroundImage: 'auto',
      },
    }
  },
  computed: {
    ...mapGetters(['isFullscreen', 'isFetching', 'isIntegrationAppMode']),
    ...mapState(['menuOpen']),
    hasTabsSlot() {
      return !!this.$slots.tabs
    },
  },
  watch: {
    title() {
      this.$nextTick(() => {
        !this.$media.mobile && this.calculateTitleFontSize()
      })
    },
  },
  created() {
    this.retractActive = this.beginRetract
    this.$root.$on('toggle-fullscreen', this.goFullscreen)
  },
  mounted() {
    this.title && !this.$media.mobile && this.calculateTitleFontSize()
  },
  methods: {
    ...mapActions(['setFullscreen', 'openMenu', 'resizeMenu']),
    goBack() {
      if (this.backUrl) {
        this.$router.push(this.backUrl)
      } else {
        this.$router.go(-1)
      }
    },
    goFullscreen() {
      this.setFullscreen()

      this.isFullscreen ? this.resizeMenu(false) : this.resizeMenu(true)
    },
    retractHeader() {
      this.retractActive = !this.retractActive
      !this.$media.mobile && this.calculateTitleFontSize()
      this.$emit('update-dimension-video', { headerIsRetracted: this.retractActive })
    },
    getBackgroundImage() {
      return 'bg-black-100'
    },
    calculateTitleFontSize() {
      if (this.retract) {
        let fontBase = 4
        let minFontSize = 1.6
        let maxHeight = this.retractActive ? 40 : 66
        if (this.$refs.title) this.$refs.title.style.fontSize = fontBase + 'em'
        while (this.$refs.title.scrollHeight > maxHeight) {
          if (fontBase <= minFontSize) return
          fontBase = (fontBase - 0.1).toFixed(1)
          if (this.$refs.title) this.$refs.title.style.fontSize = fontBase + 'em'
        }
      } else if (this.fitTitle) {
        let fontBase = 4.5
        let minFontSize = 1.6
        let maxHeight = 115
        if (this.$refs.title) this.$refs.title.style.fontSize = fontBase + 'em'
        while (this.$refs.title.scrollHeight > maxHeight) {
          if (fontBase <= minFontSize) return
          fontBase = (fontBase - 0.1).toFixed(1)
          if (this.$refs.title) this.$refs.title.style.fontSize = fontBase + 'em'
        }
      }
    },
  },
}
</script>

<template>
  <header
    v-show="!menuOpen"
    class="header"
    :class="{
      'has-background': background,
      'has-title': title,
      'has-bottom': ($slots.tabs || fullscreen || retract) && !hideBottom,
      'is-thick': thick,
      'is-retracted': retractActive,
      'is-fixed': fixed,
      'is-float': float,
      'light-theme': lightTheme,
      'is-small': small,
      'is-integration-app-mode': isIntegrationAppMode,
    }"
  >
    <div
      v-if="$media.mobile && !isIntegrationAppMode"
      class="mobile-header"
    >
      <action
        :icon="
          $route.name == 'classroom.lessons.course.type' && $media.mobile ? 'four-squares' : 'menu'
        "
        class="btn-menu"
        type="button"
        @click="openMenu()"
      ></action>
      <div
        v-show="$route.name == 'classroom.lessons.course.type' && $media.mobile"
        class="mobile-header__title"
      >
        {{ $t('classrom.panel.header.mobile.tools') }}
      </div>
      <logo
        class="logo-image"
        logo
        :theme="$theme"
      ></logo>
      <profile></profile>
    </div>
    <div
      v-if="!isIntegrationAppMode"
      class="header-content relative bg-black-100"
      :style="{ backgroundImage: getBackgroundImage() }"
    >
      <div
        v-if="background && backgroundBlur"
        :style="{ backgroundImage: getBackgroundImage() }"
      ></div>
      <div>
        <slot
          v-if="!$media.mobile"
          name="actionbar"
        ></slot>
        <slot
          v-if="!$media.mobile"
          name="search"
        ></slot>
        <slot name="back">
          <action
            v-if="back"
            class="btn-back text-color"
            icon="keyboard_backspace"
            type="button"
            :text="backText"
            @click="goBack()"
          ></action>
        </slot>
        <div
          v-if="tag || title || description || $slots.anything || $slots.progress"
          class="header-content-info w-11 mx-auto"
        >
          <span
            v-if="tag"
            class="header-tag"
            >{{ tag }}</span
          >
          <h1
            v-if="title"
            ref="title"
            class="header-title text-black-800"
          >
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="header-description text-black-800"
          >
            {{ description }}
          </p>
          <slot name="progress"></slot>
          <slot name="anything"></slot>
        </div>
        <div
          v-if="$slots.buttons"
          class="header-form-buttons"
        >
          <slot name="buttons"></slot>
        </div>
        <slot name="header-content"></slot>
      </div>
    </div>
    <div
      v-if="(hasTabsSlot || fullscreen || retract) && !hideBottom"
      class="header-bottom bg-black-300"
    >
      <slot name="tabs"></slot>
      <action
        v-if="fullscreen && !$media.mobile && !isIntegrationAppMode"
        class="btn-fullscreen"
        type="button"
        :icon="isFullscreen ? 'fullscreen_exit' : 'zoom_out_map'"
        @click="goFullscreen"
      ></action>
      <action
        v-if="retract && !isFullscreen && !isIntegrationAppMode"
        class="btn-retract"
        type="button"
        :icon="retractActive ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
        @click="retractHeader"
      ></action>
    </div>
  </header>
</template>

<style lang="scss">
@import 'ContentHeader.scss';
</style>
