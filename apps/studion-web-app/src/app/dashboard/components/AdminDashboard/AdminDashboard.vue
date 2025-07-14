<script>
import { defineComponent } from 'vue'

import configControlViewMixin from '@/mixins/configControlView'

import VerticalBannersCarousel from '../VerticalBannersCarousel'
import HorizontalBannersCarousel from '../HorizontalBannersCarousel'
import ClassroomAccessCard from '../ClassroomAccessCard'

export default defineComponent({
  name: 'AdminDashboard',

  components: {
    VerticalBannersCarousel,
    ClassroomAccessCard,
    HorizontalBannersCarousel,
  },

  mixins: [configControlViewMixin],

  props: {
    slideshowItems: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      windowX: null,
    }
  },

  created() {
    this.setWindowX()
    this.setResizeListener()
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.setWindowX)
  },

  methods: {
    setWindowX() {
      this.windowX = window.innerWidth
    },

    setResizeListener() {
      window.removeEventListener('resize', this.setWindowX)
      window.addEventListener('resize', this.setWindowX)
    },
  },
})
</script>

<template>
  <div class="dashboard-layout admin">
    <div v-if="config_showBannersContainer">
      <HorizontalBannersCarousel
        v-if="windowX > 575 && windowX < 1321"
        :banners="slideshowItems"
        autoplay
      />

      <div
        v-else
        class="banners-container"
      >
        <VerticalBannersCarousel
          :banners="slideshowItems"
          autoplay
        />
      </div>
    </div>

    <div class="featured-content-container">
      <ClassroomAccessCard :cards-banner="true" />
    </div>
  </div>
</template>
