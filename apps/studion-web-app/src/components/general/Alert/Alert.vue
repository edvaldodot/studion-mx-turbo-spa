<script>
import Icon from '../Icon'

export default {
  components: {
    Icon,
  },
  props: {
    type: {
      type: String,
      default: 'warning',
    },
    text: {
      type: String,
    },
  },
  computed: {
    iconName() {
      switch (this.type) {
        case 'warning':
          return 'alert-circle'
      }

      return ''
    },
  },
}
</script>

<template>
  <div class="alert">
    <icon :name="iconName" />
    <p class="text-color">{{ text }}</p>
  </div>
</template>

<style lang="scss">
@import 'Alert.scss';
</style>
