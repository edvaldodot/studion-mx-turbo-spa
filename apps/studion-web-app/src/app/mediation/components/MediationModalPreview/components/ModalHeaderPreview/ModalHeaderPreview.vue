<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ModalHeaderPreview',

  props: {
    title: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <div class="modal-discussion-header">
    <p class="modal-discussion-schedule-title">Prévia da ação Programada</p>

    <p class="modal-discussion-title text-color">{{ title }}</p>
  </div>
</template>

<style lang="scss">
.modal-discussion-schedule-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--alert-900);
  margin-bottom: 10px;
  padding-top: 30px;
}

.modal-discussion-title {
  font-size: 40px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 58px;
}

.modal-discussion-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
