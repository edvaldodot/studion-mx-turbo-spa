<script>
import { defineComponent } from 'vue'
import config from '@/config'

import Action from '@/components/general/Action'

const { PORTAL_CONFIGS } = config

export default defineComponent({
  name: 'RedirectSection',

  components: {
    Action,
  },

  computed: {
    classroomRoute() {
      if (this.isPortalLink('COURSES_URL')) return 'portal.courses'

      return 'classroom.index'
    },
  },

  methods: {
    isPortalLink(url) {
      return PORTAL_CONFIGS && PORTAL_CONFIGS[url]
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('redirect-section')"
    class="redirect-section"
  >
    <p class="text-color">{{ $t('classrom.panel.class.cards:approved.no.cert.2') }}</p>

    <Action
      :text="$t('classrom.panel.class.cards:approved.no.cert:see.courses')"
      :url="{ name: classroomRoute }"
      secondary
      large
    />
  </div>
</template>
