<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Checkbox from '@/components/general/Checkbox'

export default defineComponent({
  name: 'SendMessagesToAdmins',

  components: {
    Checkbox,
  },

  props: {
    modeDark: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      isSendMessages: this.value,
    }
  },

  computed: {
    ...mapState(['accessibility']),
  },
})
</script>

<template>
  <div
    class="send-messages-to-admins"
    :class="{ 'mode-dark': modeDark }"
  >
    <h2 class="text-color">
      {{ $t('offerings.sessions.edit:send.messages.to.admins:title') }}
    </h2>

    <div class="send-messages-to-admins__checkbox">
      <Checkbox
        v-model="isSendMessages.allowAllProfilesSendKb"
        :items="[{ value: true }]"
        :dark="modeDark"
        switch-type
      />
      <p class="send-messages-to-admins__label-input text-color">
        {{ $t('offerings.sessions.edit:send.messages.to.admins:label.input') }}
      </p>
    </div>

    <p class="send-messages-to-admins__text text-color">
      {{ $t('offerings.sessions.edit:send.messages.to.admins:text') }}
    </p>
  </div>
</template>

<style lang="scss">
@import './SendMessagesToAdmins.scss';
</style>
