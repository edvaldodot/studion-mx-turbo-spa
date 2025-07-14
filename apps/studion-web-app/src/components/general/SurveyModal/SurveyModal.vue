<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Modal from '../Modal'
import Action from '../Action'

export default defineComponent({
  components: {
    Action,
    Modal,
  },

  data() {
    return {
      showModal: false,
    }
  },

  computed: {
    ...mapState({
      user: (state) => state.Account.user,
      showSurvey: (state) => state.showSurvey,
      language: (state) => state.language,
    }),

    paramString() {
      return `#email=${this.user.data.email}&produto=studion&cliente=${window.location.hostname}`
    },

    surveyUrl() {
      if (!this.user.data) return

      const url = 'https://dotiea.typeform.com/to/'
      let code = ''

      switch (this.language) {
        case 'en':
          code = 'FGPdDO0M'
          break
        case 'es':
          code = 'fKWsSnVO'
          break
        default:
          code = 'pXSRTN8s'
      }

      return url + code + this.paramString
    },
  },

  watch: {
    showSurvey(value) {
      this.showModal = value
    },
  },

  methods: {
    ...mapActions(['setShowSurvey']),

    closeModal() {
      this.setShowSurvey(false)
    },
  },
})
</script>

<template>
  <Modal
    class="survey-modal"
    :active="showModal"
    :cancel="false"
  >
    <div
      v-if="user.data"
      class="survey-wrapper"
    >
      <iframe
        :src="surveyUrl"
        frameborder="0"
      ></iframe>
    </div>

    <Action
      dark
      class="close-button"
      type="button"
      icon="close"
      @click="closeModal"
    />
  </Modal>
</template>

<style lang="scss">
@import 'SurveyModal.scss';
</style>
