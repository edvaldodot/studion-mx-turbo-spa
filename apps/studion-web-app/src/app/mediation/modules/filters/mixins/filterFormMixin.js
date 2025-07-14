import i18n from '@/support/i18n'
import { mapActions } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'

const filterFormMixin = {
  data () {
    return {
      formData: {
        name: null,
        description: null,
        filterType: null,
        solution: null,
        scorm: null,
        status: null,
        topic: []
      },

      params: {
        solutionId: null,
        scormId: null
      },

      status: {
        items: [],
        isLoading: false
      }
    }
  },

  validations: {
    formData: {
      name: { required },
      description: { required },
      filterType: { required },
      solution: { required },
      scorm: { required },
      status: { required },
      topic: {
        required,
        minLength: minLength(1)
      }
    }
  },

  watch: {
    /**
     * Trigger handler when was selected a filter type.
     */
    'formData.filterType' (selectedFilterType) {
      this.setStatusSelect(selectedFilterType)
    },

    /**
     * Delete cascade on empty solution autocomplete
     */
    'formData.solution': {
      immediate: true,
      handler (hasSolution) {
        if (hasSolution) {
          const [selectedCourse] = hasSolution
          this.params.solutionId = selectedCourse && selectedCourse.course_id
          return
        }

        this.formData.scorm = null
        this.params.solutionId = null
      }
    },

    /**
     * Delete cascade on empty scorm autocomplete
     */
    'formData.scorm': {
      immediate: true,
      handler (hasScorm) {
        if (hasScorm) {
          const [selectedScorm] = hasScorm
          this.params.scormId = selectedScorm && selectedScorm.id
          return
        }
        this.formData.status = null
        this.formData.topic = []
        this.params.scormId = null
      }
    }
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptStatusByContentTypeRetrieval'
    ]),

    /**
     * Defines Status options based on selected filter type.
     * @param {string} selectedFilterType
     */
    setStatusSelect (selectedFilterType) {
      if (!selectedFilterType) {
        this.status.items = []
        this.formData.solution = null
        return
      }

      this.status.isLoading = true

      this.attemptStatusByContentTypeRetrieval(selectedFilterType)
        .then(({ data: nestedResponse }) => {
          if (!Array.isArray(nestedResponse.data)) throw new Error()
          this.status.items = this.generateStatusOptions(nestedResponse.data)
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('global:error'),
            type: 'error'
          })
          this.$router.push({ name: 'filter.list' })
        })
        .finally(() => {
          this.status.isLoading = false
        })
    },

    /**
     * Generate Status options based on array of values.
     * @param {string[]} valuesList
     * @returns {object[]}
     */
    generateStatusOptions (valuesList) {
      return valuesList.map(value => ({
        text: i18n.t(`mediation.filter:form.status.options:${value}`),
        value: value
      }))
    }

  }
}

export default filterFormMixin
