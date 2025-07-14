<script>
import { tns } from 'tiny-slider/src/tiny-slider.module.js'
import config from '@/config'
import Action from '../Action'

export default {
  name: 'slideshow',
  components: {
    Action,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      slider: null,
      index: 1,
    }
  },
  mounted() {
    this.mountSlider()

    var self = this

    this.slider.events.on('indexChanged', function () {
      self.index = self.slider.getInfo().navCurrentIndex + 1
    })
  },
  beforeDestroy() {
    this.slider.destroy()
    this.slider = null
  },
  methods: {
    goToUrl(item) {
      if (typeof item.url === 'object') {
        this.$router.push(item.url)
      } else {
        window.location = item.url
      }
    },
    getBackgroundImage(item) {
      return item.image ? `url('${item.image}')` : null
    },
    goPrev() {
      this.slider.goTo('prev')
    },
    goNext() {
      this.slider.goTo('next')
    },
    mountSlider() {
      var { CAROUSEL_AUTOPLAY_TIMER } = config
      CAROUSEL_AUTOPLAY_TIMER = CAROUSEL_AUTOPLAY_TIMER || 7

      this.slider = tns({
        container: this.$refs.slideshowList,
        items: 1,
        slideBy: 'page',
        autoplay: this.autoplay,
        autoplayTimeout: CAROUSEL_AUTOPLAY_TIMER * 1000,
        autoplayHoverPause: true,
        autoplayButtonOutput: false,
        controls: false,
        loop: true,
      })
    },
  },
}
</script>

<template>
  <div class="slideshow">
    <div
      v-if="slider"
      class="slideshow-pager"
    >
      <div class="slideshow-pager-inner">
        <action
          type="button"
          icon="keyboard_backspace"
          icon-size="small"
          class="btn-prev"
          :disabled="index === 1"
          @click="goPrev()"
        />
        <div class="slideshow-pager-counter">
          <span class="slideshow-pager-counter-active">{{ index }}</span>
          <span> {{ $t('global:of') }} {{ slider.getInfo().slideCount }}</span>
        </div>
        <action
          type="button"
          icon="keyboard_backspace"
          icon-size="small"
          class="btn-next"
          :disabled="index === slider.getInfo().slideCount"
          @click="goNext()"
        />
      </div>
    </div>
    <div
      ref="slideshowList"
      class="slideshow-list"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="slideshow-item"
        :class="{ 'has-link': item.url }"
        @click="goToUrl(item)"
      >
        <img
          :src="item.image"
          width="100%"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Slideshow.scss';
</style>
