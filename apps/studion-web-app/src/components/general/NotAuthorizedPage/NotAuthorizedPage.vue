<script>
import LogoutButton from './components/LogoutButton.vue'

export default {
  name: 'NotAuthorizedPage',

  components: {
    LogoutButton,
  },

  props: {
    error: {
      type: String,
      required: true,
    },
  },
}
</script>

<template>
  <div class="main-content  not-authorized">
    <LogoutButton />

    <div class="not-authorized__content">
      <h1>{{ $t(error) }}</h1>
    </div>
  </div>
</template>

<style lang="scss">
@import 'NotAuthorizedPage.scss';
</style>
