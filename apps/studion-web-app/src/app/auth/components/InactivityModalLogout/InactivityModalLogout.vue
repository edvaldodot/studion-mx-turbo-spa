<script>
import { defineComponent } from 'vue'
import ModalClassic from '@/components/general/ModalClassic'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'InactivityModalLogout',

  components: {
    ModalClassic,
    Action,
  },

  methods: {
    makeLoginHandler() {
      this.$emit('close')
      this.$router.push({
        name: 'auth.logout',
        params: { isStudent: this.equalsProfile('student') },
      })
    },
  },
})
</script>

<template>
  <ModalClassic
    class="modal-inactivity-logout"
    :data-testid="$testId('modal-inactivity-logout')"
    active
    is-page
    :closable="false"
    icon="hourglass"
    upsidedown-icon
  >
    <template #title>
      <h1 class="text-color">
        {{ $t('modal.inactivity.logout:title') }}
      </h1>
    </template>
    <template #description>
      <Action
        class="mt-4"
        :text="$t('global:make.login')"
        type="button"
        secondary
        large
        fixed-width
        @click="makeLoginHandler()"
      />
    </template>
  </ModalClassic>
</template>
<style lang="scss">
.modal-inactivity-logout {
  .modal-classic__header .header__description {
    margin: 0;
  }
  .modal-classic__body {
    padding: 45px 45px 20px;
    width: 650px;
    max-width: 100%;
  }
}
</style>
