<template>
  <div class="form-responsible-picker">
    <h3 class="text-color">{{ $t("community.index:modal.tab.link.responsible") }}</h3>
    <radio
      class="text-color"
      :horizontal="true"
      :items="responsibleOptions"
      v-model="value.meta.responsible"
      :validation="validation.meta.responsible"
      :hint="$t('mediation.actions:hint.responsible')"
      :disabled="!canWrite('mediation_plan')"
    />
  </div>
</template>

<script>
import Radio from '@/components/general/Radio'

import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'

const RESPONSIBLE_OPTIONS = SESSION_TEAM_OPTIONS.slice(0, 2)

export default {
  name: 'ResponsiblePicker',

  components: {
    Radio
  },

  props: {
    accessibility: {
      type: Boolean,
      default: false
    },

    validation: {
      type: Object,
      required: true
    },

    value: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      responsibleOptions: RESPONSIBLE_OPTIONS
    }
  }
}
</script>

<style lang="scss">
@import "./ResponsiblePicker.scss";
</style>
