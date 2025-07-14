<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotificationCircle',
})
</script>

<template>
  <div
    :data-testid="$testId('notification-circle')"
    class="notification-circle__color"
  ></div>
</template>

<style lang="scss">
@import 'NotificationCircle.scss';
</style>
