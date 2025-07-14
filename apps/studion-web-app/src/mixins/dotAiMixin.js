import config from '@/config'
import { mapState } from 'vuex'

const { FORUM_AI } = config

export default {
  computed: {
    ...mapState({
      currentCourseId: (state) => state.Classroom.data.course.id,
      currentUserProfileId: (state) => state.Account.user.currentProfileId,
    }),
  },

  methods: {
    initializeDotAIAssistance() {
      const { ENABLED, COURSE_ID, PROFILE_ID, CHAT_ID, HOST } = FORUM_AI

      if (!FORUM_AI || !ENABLED) {
        return
      }

      if (COURSE_ID && !COURSE_ID.includes(this.currentCourseId)) {
        console.log(`DOTai: IA não habilitada para o curso ID ${this.currentCourseId}.`)
        return
      }

      if (PROFILE_ID && !PROFILE_ID.includes(this.currentUserProfileId)) {
        console.log(
          `DOTai: Usuário com perfil ID ${this.currentUserProfileId} não tem acesso à IA.`
        )
        return
      }

      const sessionIdFromRoute = this.$route.params.session_uuid
      if (!sessionIdFromRoute) {
        console.error('DOTai: session_id não encontrado nos parâmetros da rota.')
        return
      }

      const scriptSrc = `${HOST}/dot.ai/embed_lms/${CHAT_ID}/${sessionIdFromRoute}`

      // Avoid loading the script multiple times if the component is mounted/remounted
      if (document.querySelector(`script[src="${scriptSrc}"]`)) {
        if (window.configureAjudaEscrita && !window.dotAiConfigured) {
          this.configureDotAi()
        }
        return
      }

      const scriptElement = document.createElement('script')
      scriptElement.src = scriptSrc
      scriptElement.async = true
      scriptElement.onload = () => {
        this.configureDotAi()
      }
      scriptElement.onerror = () => {
        console.error('DOTai: Falha ao carregar o script embed.')
      }
      document.body.appendChild(scriptElement)
    },

    configureDotAi() {
      if (window.configureAjudaEscrita) {
        window.configureAjudaEscrita({
          textareaSelector: '.ql-editor.ql-blank',
          commentContainerSelector: '.forum-discussion',
          commentSelector: '.forum-discussion-item',
          responseSelector: '.forum-discussion-content',
          commentSectionSelector: '.forum-discussion-comment-list',
          myCommentContainerSelector: '.forum-discussion-form',
          contentHeaderSelector: '.forum-discussion-header',
        })
        window.dotAiConfigured = true
      } else {
        console.error('DOTai: Função configureAjudaEscrita não encontrada após carregar script.')
      }
    },

    removeDotAiScript() {
      const sessionIdFromRoute = this.$route.params.session_uuid
      const scriptSrc = `${FORUM_AI.HOST}/dot.ai/embed_lms/${FORUM_AI.CHAT_ID}/${sessionIdFromRoute}`

      const scriptElement = document.querySelector(`script[src="${scriptSrc}"]`)
      if (scriptElement) {
        document.body.removeChild(scriptElement)
      } else {
        console.error('DOTai: Script não encontrado para remoção.')
      }
    },
  },

  beforeDestroy() {
    this.removeDotAiScript()
  },
}
