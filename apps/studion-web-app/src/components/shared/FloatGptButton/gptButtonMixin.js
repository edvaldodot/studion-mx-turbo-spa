import config from '@/config'

const {
  APP_CHAT_BOT_MENTORING,
  APP_CHAT_BOT_STUDION,
  APP_CHAT_BOT_DOT_AI_STUDION,
  APP_CHAT_BOT_DOT_AI_MENTORING,
} = config

export default {
  computed: {
    canShowTip() {
      const userId = this.Account.user.id

      if (!this.showTip || this.getFromLocalStorage(`user-${userId}-chatbotModalNeedsToBeShown`))
        return false

      return (
        (this.isUserInClassroom &&
          this.Classroom &&
          this.Classroom.data &&
          this.Classroom.data.uuid &&
          !this.isFetching &&
          this.getAITutorCode) ||
        !this.getAITutorCode
      )
    },
    getChatbotEnv() {
      let defaultId =
        this.isDotAIEnabled && this.$isEnabledFeature('ai_mentoring')
          ? APP_CHAT_BOT_DOT_AI_MENTORING
          : this.isDotAIEnabled
          ? APP_CHAT_BOT_DOT_AI_STUDION
          : this.$isEnabledFeature('ai_mentoring')
          ? APP_CHAT_BOT_MENTORING
          : APP_CHAT_BOT_STUDION

      if (this.isDotAIEnabled) {
        defaultId += `/${this.Account.user.uuid}?name=${this.Account.user.data.username}`
      }

      if (!this.isUserInClassroom) {
        return defaultId
      }

      let formattedAiTutorCode

      if (this.getAITutorCode) {
        formattedAiTutorCode = `${this.getAITutorCode}/${this.Account.user.uuid}?name=${this.Account.user.data.username}`
      }

      return formattedAiTutorCode || defaultId
    },
    getAITutor() {
      return this.Classroom.data && this.Classroom.data.aiTutor ? this.Classroom.data.aiTutor : null
    },
    getAITutorCode() {
      return (this.getAITutor && this.getAITutor.meta && this.getAITutor.meta.code) || null
    },
    isDotAIEnabled() {
      return (
        (this.isUserInClassroom &&
          this.getAITutor &&
          this.getAITutor.vendor &&
          this.getAITutor.vendor === 'aiDot') ||
        APP_CHAT_BOT_DOT_AI_MENTORING ||
        APP_CHAT_BOT_DOT_AI_STUDION
      )
    },
    isUserInClassroom() {
      const currentLocation = this.$route.path
      const regexClassroom = /\/classroom\/[0-9a-fA-F]{8}/
      return regexClassroom.test(currentLocation)
    },
    getChatVendor() {
      return this.getAITutor && this.getAITutor.vendor && this.getAITutor.vendor === 'chatbase'
    },
  },
}
