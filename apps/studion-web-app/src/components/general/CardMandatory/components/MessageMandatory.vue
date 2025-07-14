<script>
import { defineComponent } from 'vue'
import Icon from '../../Icon'

export default defineComponent({
  name: 'MessageMandatory',
  components: {
    Icon,
  },
})
</script>

<template>
  <div class="message__mandatory">
    <div>
      <Icon
        name="info"
        wrapper
        size="small"
      />
    </div>
    <span class="text__mandatory">{{ $t('global:mandatory.consumption') }}</span>
  </div>
</template>

<style lang="scss">
.message__mandatory {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
