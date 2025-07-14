<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'FacialRecognitionWarning',

  components: {
    Icon,
    Action,
  },

  computed: {
    ...mapState({ activeTool: (state) => state.Classroom.facialRecognition.activeTool }),
  },

  methods: {
    ...mapActions(['setActiveFacialRecognition']),

    showFacialRecognitionModal() {
      this.setActiveFacialRecognition(true)
    },
  },
})
</script>

<template>
  <div
    v-if="activeTool"
    class="facial-recognition-warning"
  >
    <Icon
      name="facial-scan"
      wrapper
    />
    <div class="facial-recognition-warning__text">
      <p class="title">
        {{ $t('classroom.facial:warning.title') }}
      </p>
    </div>
    <div class="facial-recognition-warning__action">
      <Action
        :text="$t('classroom.facial:warning.action')"
        type="button"
        flat
        large
        @click="showFacialRecognitionModal"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'FacialRecognitionWarning.scss';
</style>
