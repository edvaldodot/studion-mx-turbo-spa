import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  data() {
    return {
      items: [],
      showItems: [],
      forOptions: [],
      formData: {
        position: null,
        subject: null,
        question: null,
        attachment: null,
      },
      formDataFeedback: [],
      paging: { actualPage: 1 },
      kbIssuesQueryParams: {
        page: 1,
      },
      acceptedFormats: null,
      indexID: null,
      categories: null,
      formDataForward: {
        profile_id: null,
      },
    }
  },

  validations: {
    formData: {
      position: {
        required,
      },
      subject: {
        required,
      },
      question: {
        required,
      },
    },
    formDataFeedback: {
      $each: {
        answer: {
          required,
        },
      },
    },
  },

  created() {
    this.setAcceptedFormats()
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    isOpenFeedbackForm() {
      return this.showItems
    },
    sessionUuid() {
      return this.$route.params.uuid || this.$route.params.session_uuid
    },
  },

  watch: {
    items() {
      if (this.items.length) {
        this.$emit('change-theme-footer', { dark: false })
      }
    },
    'kbIssuesQueryParams.page'() {
      this.loadKbIssues()
    },
  },

  mounted() {
    this.$emit('change-theme-footer', { dark: false })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSessionTeamRetrieval',
      'attemptClassroomKbIssueCreation',
      'attemptClassroomKbIssuesRetrieval',
      'attemptClassroomKbInteractionCreation',
      'attemptKbQuestionFeedback',
      'attemptDownloadKbAttachment',
      'attemptGetKnowledgeBaseExtensions',
      'attemptCategoryFilterResource',
      'attemptForwardResponsible',
    ]),

    async setup() {
      this.loadItemsPerPagePreferences(this.kbIssuesQueryParams)

      await this.getProfiles()
      this.loadKbIssues()
    },

    getProfiles() {
      this.setFetching(true)
      let requestPromises = [this.attemptSessionTeamRetrieval(this.sessionUuid)]
      Promise.all(requestPromises)
        .then(([sessionTeamResponse]) => {
          let sessionTeam = sessionTeamResponse.data
          this.forOptions = sessionTeam.map(({ name, id }) => ({ text: name, value: id }))
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    async setupMangement() {
      await this.getCategories()
      this.setFetching(true)
      await this.getProfiles()
      this['Management/doubts/doubtsOnlyResource'](this.$route.params.id)
        .then((data) => {
          this.doubt = data
          Object.keys(this.doubt).forEach(() => {
            this.formDataFeedback.push({
              answer: null,
              file: null,
            })
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    changeItemsPerPage(val) {
      this.kbIssuesQueryParams.limit = val
      if (this.kbIssuesQueryParams.page !== 1) {
        this.kbIssuesQueryParams.page = 1
        return
      }
      this.loadKbIssues()
    },
    addQuestion() {
      this.$v.formData.$touch()
      if (this.$v.formData.$invalid) {
        return
      }
      let sessionUuid = this.$route.params.session_uuid
      let data = {
        profileId: this.formData.position,
        subject: this.formData.subject,
        question: this.formData.question,
        attachment: this.formData.attachment ? this.formData.attachment[0] : null,
      }
      this.setFetching(true)
      this.attemptClassroomKbIssueCreation({ sessionUuid, data: data })
        .then(() => {
          this.formData.position = null
          this.formData.subject = null
          this.formData.question = null
          this.formData.attachment = null
          this.$v.formData.$reset()
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:feedback.question.created'),
          })
          this.loadKbIssues()
          this.kbIssuesQueryParams.page = 1
          this.scrollToBottom()
        })
        .catch(({ response }) => {
          this.setFeedback({ message: this.$t(`classroom.knowledgeBase:${response.data.message}`) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openFeedbackForm(index) {
      this.$set(this.showItems, index, true)
    },
    setUseful(item, index) {
      let interactionIdx = item.interactions.length - 1
      let interaction = item.interactions[interactionIdx]
      let data = {
        sessionUuid: this.$route.params.session_uuid,
        interactionId: interaction.id,
        feedback: true,
      }
      this.setFetching(true)
      this.attemptKbQuestionFeedback(data)
        .then(() => {
          this.$set(this.items[index].interactions[interactionIdx], 'useful', true)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    addAnswer(item, index) {
      this.$v.formDataFeedback.$each[index].$touch()
      if (this.$v.formDataFeedback.$each[index].$invalid) {
        return
      }
      let sessionUuid = this.sessionUuid
      let category_id = this.formDataFeedback[index].category
      let subcategory = this.formDataFeedback[index].subcategory
      let data = {
        questionId: item.id,
        comment: this.formDataFeedback[index].answer,
        attachment: this.formDataFeedback[index].file ? this.formDataFeedback[index].file[0] : null,
        issue_category_id: category_id ? category_id : null,
        issue_subcategory_id: subcategory ? subcategory : null,
      }

      this.setFetching(true)
      this.attemptClassroomKbInteractionCreation({ sessionUuid, data: data })
        .then(({ data }) => {
          this.$v.formDataFeedback.$each[index].$reset()
          this.formDataFeedback[index].answer = null
          this.formDataFeedback[index].file = null
          item.status = data.status
          this.setFetching(false)
          if (this.Account.user.currentProfile === 'student') {
            this.setFeedback({
              message: this.$t('classroom.knowledgeBase:feedback.question.created'),
            })
          } else {
            this.setFeedback({
              message: this.$t('classroom.knowledgeBase:feedback.answer.created'),
            })
          }
          this.kbIssuesQueryParams.page = 1
          if (this.$route.params.uuid) {
            return this.setupMangement()
          }

          this.loadKbIssues()
        })
        .catch(({ response }) => {
          this.setFetching(false)
          this.setFeedback({ message: this.$t(`classroom.knowledgeBase:${response.data.message}`) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    downloadAttachment({ id, attachment }) {
      const { fileName, mimeType } = attachment
      const sessionUuid = this.sessionUuid
      const data = { id, fileName, mimeType }

      this.setFetching(true)
      this.attemptDownloadKbAttachment({ sessionUuid, data })
        .catch(() => {
          this.setFeedback({ message: this.$t('global.request:timeout.message') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    nextPage() {
      if (this.paging.nextPage) {
        this.kbIssuesQueryParams.page = this.paging.nextPage
      }
    },
    previousPage() {
      if (this.paging.previousPage) {
        this.kbIssuesQueryParams.page = this.paging.previousPage
      }
    },
    lastPage() {
      if (this.paging.lastPage) {
        this.kbIssuesQueryParams.page = this.paging.lastPage
      }
    },
    firstPage() {
      if (this.paging.firstPage) {
        this.kbIssuesQueryParams.page = this.paging.firstPage
      }
    },
    loadKbIssues() {
      this.kbIssuesQueryParams.sessionUuid = this.$route.params.session_uuid
      this.kbIssuesQueryParams.profileAlias = this.Account.user.currentProfile
      this.setFetching(true)
      this.attemptClassroomKbIssuesRetrieval(this.kbIssuesQueryParams)
        .then((issuesResponse) => {
          this.items = issuesResponse.data.data
          this.paging = issuesResponse.data
          this.items.forEach(() => {
            this.formDataFeedback.push({
              answer: null,
              file: null,
            })
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    scrollToBottom() {
      setTimeout(() => {
        window.scroll({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)
    },
    setAcceptedFormats() {
      this.attemptGetKnowledgeBaseExtensions().then((response) => {
        const responseArray = response.data.extensions
        const responseString = '.' + responseArray.join(',.')
        this.acceptedFormats = responseString
      })
    },

    getCategories() {
      this.setFetching(true)
      const payload = {
        sessionUuid: this.sessionUuid,
        params: {
          limit: 1000,
        },
      }
      this.attemptCategoryFilterResource(payload)
        .then(({ data }) => {
          this.categories = data
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global.request:timeout.message') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    forward(id) {
      this.setFetching(true)
      this.attemptForwardResponsible({ id, payload: this.formDataForward })
        .then(() => {
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:forward.responsible.doubts.feedback'),
          })
          if (!this.$route.params.id) {
            this.loadKbIssues()
          } else {
            this.$router.back()
          }
        })
        .catch(() => {
          this.setFetching(false)
          this.setFeedback({
            message: this.$t('global:error'),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
