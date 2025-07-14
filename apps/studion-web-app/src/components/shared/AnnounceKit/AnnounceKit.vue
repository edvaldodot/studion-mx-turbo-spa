<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import config from '@/config'
import Icon from '@/components/general/Icon'

const { ANNOUNCE_KIT } = config

export default defineComponent({
  components: {
    Icon,
  },

  props: {
    showSpan: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      ANNOUNCE_KIT: ANNOUNCE_KIT,
    }
  },

  computed: {
    ...mapState(['announceKitUnreads']),

    isEnabled() {
      return ANNOUNCE_KIT && ANNOUNCE_KIT.ENABLED
    },
  },

  methods: {
    openAnnouncekit() {
      const widgetName = this.ANNOUNCE_KIT.WNAME || 'announcekit'
      if (!window.announcekit) return

      window.announcekit[`widget$${widgetName}`].open()
    },
  },
})
</script>

<template>
  <div
    v-if="notEqualsProfile('student') && isEnabled"
    class="announcekit"
    :class="{ '--unread': announceKitUnreads }"
    @click="openAnnouncekit"
  >
    <Icon
      name="announce"
      wrapper
    />

    <div
      v-if="announceKitUnreads"
      class="announcekit-counter"
    >
      {{ announceKitUnreads }}
    </div>

    <span
      v-if="showSpan"
      class="text"
    >
      {{ $t('global:updates') }}
    </span>
  </div>
</template>

<style lang="scss">
@import './AnnounceKit.scss';
</style>
