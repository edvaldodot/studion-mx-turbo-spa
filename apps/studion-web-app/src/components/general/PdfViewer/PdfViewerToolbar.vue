<script>
import Icon from '../Icon'
export default {
  components: {
    Icon,
  },
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    currentZoom: {
      type: Number,
      default: 50,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    previousPage() {
      this.$emit('previouspage')
    },
    nextPage() {
      this.$emit('nextpage')
    },
    changeZoom(zoomChange) {
      this.$emit('changezoom', zoomChange)
    },
  },
}
</script>

<template>
  <div class="pdf-viewer__toolbar">
    <div class="pdf-viewer__navigation">
      <button
        :disabled="currentPage === 1 || disabled"
        @click="previousPage()"
      >
        <icon name="keyboard_arrow_left" /> {{ $t('global:prev') }}
      </button>
      <div>{{ currentPage }} {{ $t('global:of') }} {{ pageCount }}</div>
      <button
        :disabled="currentPage === pageCount || disabled"
        @click="nextPage()"
      >
        {{ $t('global:next') }} <icon name="keyboard_arrow_right" />
      </button>
    </div>

    <div class="pdf-viewer__zoom">
      <button
        :disabled="currentZoom === 10 || disabled"
        @click="changeZoom(-10)"
      >
        <icon name="zoom-out" />
      </button>
      <span>{{ currentZoom }}%</span>
      <button
        :disabled="currentZoom === 100 || disabled"
        @click="changeZoom(10)"
      >
        <icon name="zoom-in" />
      </button>
    </div>
  </div>
</template>
