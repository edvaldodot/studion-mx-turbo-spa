<template>
  <Tooltip :uppercase="false" :width="174" :bold-font="false">
    <template v-slot:activator="{ on }">
      <icon
        name="calendar-range"
        size="small"
        @mouseenter.native="on.mouseenter"
        @mouseleave.native="on.mouseleave"
        wrapper
      />
    </template>
    <span>{{ $t("mediation.links:modal.session.manual.date:tooltip") }}</span>
  </Tooltip>
</template>

<script>
import Icon from '@/components/general/Icon'
import Tooltip from '@/components/general/Tooltip'

export default {
  name: 'ManualDateTooltip',

  components: {
    Icon,
    Tooltip
  }
}
</script>
