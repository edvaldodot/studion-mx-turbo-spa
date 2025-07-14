<script>
import { defineComponent } from 'vue'
import ModalHeader from '@/components/general/ModalHeader'

export default defineComponent({
  name: 'ModalMessage',

  components: {
    ModalHeader,
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    subtitle: {
      type: String,
      default: null,
    },
    bodyTitle: {
      type: String,
      default: null,
    },
    bodyText: {
      type: String,
      default: null,
    },
  },
})
</script>

<template>
  <div class="mediation-modal-message">
    <ModalHeader
      :title="title"
      :sub-title="subtitle"
    />

    <h3>{{ bodyTitle }}</h3>
    <p class="text-color">{{ bodyText }}</p>

    <slot name="actions" />
  </div>
</template>

<style lang="scss">
.mediation-modal-message {
  text-align: center;
  padding: 16em 0;
  h2 {
    text-transform: initial;
  }
  h3 {
    font-size: 2em;
    margin: 4em 0 1em 0;
    color: var(--black-700);
  }
  p {
    font-size: 1.6em;
    color: var(--black-500);
  }
  button {
    margin-top: 2em;
  }
}
</style>
