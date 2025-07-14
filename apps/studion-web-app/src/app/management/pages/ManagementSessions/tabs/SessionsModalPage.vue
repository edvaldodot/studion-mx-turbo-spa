<script>
import { defineComponent } from 'vue'
import SessionsBind from '../components/SessionsBind'

// TODO: remover página depois que todas as tarefas de replicar forem implementadas.
export default defineComponent({
  name: 'SessionsModalPage',

  components: {
    SessionsBind,
  },

  data() {
    return {
      idList: [],
    }
  },
})
</script>

<template>
  <div
    :data-testid="$testId('session-modal-page')"
    class="center"
  >
    <SessionsBind v-model="idList" />
  </div>
</template>

<style lang="scss"></style>
