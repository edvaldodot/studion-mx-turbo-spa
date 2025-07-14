<script>
import { defineComponent } from 'vue'

import config from '@/config'
const { PORTAL_CONFIGS } = config

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'PortalSection',

  components: {
    Action,
  },

  methods: {
    goToPortal() {
      window.location.assign(PORTAL_CONFIGS.COURSES_URL)
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('portal-section')"
    class="portal-section"
  >
    <p class="mt-2">
      {{ $t('modal:end.course.portal.description.1') }}
    </p>
    <p class="mb-4">
      {{ $t('modal:end.course.portal.description.2') }}
    </p>
    <div class="actions-wrapper">
      <Action
        :text="$t('customer:go.to.portal')"
        type="button"
        secondary
        @click="goToPortal"
      />
    </div>
  </div>
</template>
