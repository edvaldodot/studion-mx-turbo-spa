<script>
import { Carousel, Slide } from 'vue-carousel'
import config from '@/config'
import Action from '../Action'

export default {
  components: {
    Action,
    VueCarousel: Carousel,
    Slide,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    navs: {
      type: Boolean,
      default: true,
    },
    pageInfo: {
      type: Boolean,
      default: true,
    },
    dark: {
      type: Boolean,
    },
    navigateTo: {
      type: [Number, Array],
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      page: 0,
      pageCount: 0,
      perPage: 1,
      prevNavDisabled: true,
      nextNavDisabled: false,
      autoplayCarousel: null,
    }
  },
  computed: {
    currentPage() {
      return this.page + 1
    },
    classes() {
      return {
        dark: this.dark,
      }
    },
    showNavigation() {
      return this.pageCount > 1
    },
  },
  watch: {
    navigateTo(value) {
      this.page = value
    },
    items() {
      this.$nextTick(() => {
        this.updateCarouselState()
      })
    },
  },
  mounted() {
    this.autoPlaySlider()

    this.$nextTick(() => {
      this.updateCarouselState()
    })
  },
  destroyed() {
    this.pauseSlider()
  },
  methods: {
    updateCarouselState() {
      const carousel = this.$refs.carousel
      if (carousel) {
        this.pageCount = carousel.pageCount || 0
        this.perPage = carousel.perPage || 0
        this.configNavButtons()
      }
    },
    autoPlaySlider() {
      if (this.autoplay) {
        const { pageCount } = this.$refs.carousel

        let { CAROUSEL_AUTOPLAY_TIMER } = config
        CAROUSEL_AUTOPLAY_TIMER = CAROUSEL_AUTOPLAY_TIMER || 7

        this.autoplayCarousel = setInterval(() => {
          this.currentPage !== pageCount ? this.moveCarousel('next') : (this.page = 0)
        }, CAROUSEL_AUTOPLAY_TIMER * 1000)
      }
    },
    pauseSlider() {
      clearInterval(this.autoplayCarousel)
    },
    moveCarousel(direction) {
      const { pageCount, currentPage } = this.$refs.carousel

      if (direction === 'next' && currentPage < pageCount - 1) {
        if (Array.isArray(this.page)) {
          this.page = this.page[0] + 1
          return
        }

        this.page = this.page + 1
      }

      if (direction === 'prev' && currentPage > 0) {
        this.page--
      }
    },
    handlePageChange(page) {
      this.page = page
      this.updateCarouselState()
      this.$emit('page-change')
    },
    configNavButtons() {
      this.prevNavDisabled = this.page === 0
      this.nextNavDisabled = this.$refs.carousel && this.page === this.$refs.carousel.pageCount - 1
    },
  },
}
</script>

<template>
  <div
    class="carousel"
    :class="classes"
    @mouseover="pauseSlider"
    @mouseout="autoPlaySlider"
  >
    <vue-carousel
      ref="carousel"
      v-bind="$attrs"
      :navigate-to="page"
      v-on="$listeners"
      @page-change="handlePageChange"
    >
      <slide
        v-for="(item, index) in items"
        :key="index + 1 + '' + Math.floor(Math.random() * 1000) + 1"
      >
        <slot :item="item"></slot>
      </slide>
    </vue-carousel>

    <div
      v-if="showNavigation"
      class="carousel__navs"
    >
      <action
        v-if="navs"
        type="button"
        icon="keyboard_backspace"
        :disabled="prevNavDisabled"
        :dark="dark"
        @click="moveCarousel('prev')"
      />
      <div
        v-if="pageInfo"
        class="page-info"
      >
        <strong>{{ currentPage }}</strong>
        <span>de</span>
        {{ pageCount }}
      </div>
      <action
        v-if="navs"
        :disabled="nextNavDisabled"
        type="button"
        icon="keyboard_backspace"
        :dark="dark"
        @click="moveCarousel('next')"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import './Carousel.scss';
</style>
