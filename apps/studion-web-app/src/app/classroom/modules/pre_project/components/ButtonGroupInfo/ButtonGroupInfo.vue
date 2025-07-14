<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'ButtonGroupInfo',

  components: {
    Action,
  },
})
</script>

<template>
  <Action
    :text="$t('pre.project.panel.group:orientation.button')"
    class="btn-add-question"
    type="button"
    icon="info"
    icon-size="small"
    flat
    @click="$emit('click')"
    @mouseenter.native="on.mouseenter"
    @mouseleave.native="on.mouseleave"
  />
</template>

<style lang="scss">
@import './ButtonGroupInfo.scss';
</style>
