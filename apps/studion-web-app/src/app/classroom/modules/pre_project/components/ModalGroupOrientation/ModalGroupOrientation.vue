<script>
import { defineComponent } from 'vue'

import ModalInformation from '@/components/general/ModalInformation'

export default defineComponent({
  name: 'ModalGroupOrientation',

  components: {
    ModalInformation,
  },

  data() {
    return {
      show: false,
    }
  },

  methods: {
    toggleVisualization() {
      this.show = !this.show
    },
  },
})
</script>

<template>
  <ModalInformation
    :data-testid="$testId('modal-group-orientation')"
    :active="show"
    class="modal-group-orientation"
    closable
    back
    @close="show = false"
  >
    <template #pre-content>
      <p class="text-color">{{ $t('pre.project.panel.group:modal.orientation:pre.content') }}</p>
    </template>

    <template #title>
      {{ $t('pre.project.panel.group:modal.orientation:title') }}
    </template>

    <template #description>
      <p
        v-html="
          $t('pre.project.panel.group:modal.orientation:description', {
            btnAlone: $t('pre.project.panel.group:do.alone'),
            btnNewGroup: $t('pre.project.panel.group:create.new.group'),
            btnLeaveGroup: $t('pre.project.panel.group:exit'),
          })
        "
      ></p>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
.modal-group-orientation {
  li {
    font-size: 1em;
  }
}
</style>