<script>
import { mapActions, mapState, mapGetters } from 'vuex'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'

import FilterForm from '../../components/FilterForm'

export default {
  name: 'ModalAddFilter',

  components: {
    Action,
    FilterForm,
    Modal
  },

  data () {
    return {
      isLoading: false
    }
  },

  computed: {
    ...mapState([
      'fetching'
    ]),

    ...mapGetters([
      'getFilterTypeByValue'
    ])
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFilterTypesRetrieval',
      'attemptFilterCreation'
    ]),

    createFilterBody (filterData) {
      const filterType = this.getFilterTypeByValue(filterData.filterType)
      const [selectedSolution] = filterData.solution
      const [selectedScorm] = filterData.scorm
      const topicIds = filterData.topic.map(topic => topic.id)
      const assetTopics = filterData.topic.map(topic => ({ id: topic.id, title: topic.title }))

      const filter = {
        name: filterData.name,
        description: filterData.description,
        'type_id': filterType.id,
        query: '',
        fields: [],
        'meta_fields': [],
        params: [
          { alias: 'solution_id', type: 'int' },
          { alias: 'asset_id', type: 'int' },
          { alias: 'asset_name', type: 'string' },
          { alias: 'asset_topics', type: 'array' },
          { alias: 'content_status', type: 'string' },
          { alias: 'scorm_topics_id', type: 'array' },
          { alias: 'solution_name', type: 'string' }
        ]
      }

      const filterValue = {
        name: filterData.name,
        meta: {
          'solution_id': selectedSolution.course_id,
          'asset_id': selectedScorm.id,
          'asset_name': selectedScorm.name,
          'asset_topics': assetTopics,
          'content_status': filterData.status,
          'scorm_topics_id': topicIds,
          'solution_name': selectedSolution.course_name
        }
      }

      return {
        filter,
        'filter_value': filterValue
      }
    },

    /**
     * Handles error message.
     * @param {ErrorResponse}
     */
    errorHandler (error) {
      const errorResponse = error && error.response
      const errorMessage = errorResponse && errorResponse.data && errorResponse.data.message

      let errorLabel = 'global:error'
      if (errorMessage && (errorMessage === 'filter_name_already_exists')) {
        errorLabel = 'mediation.filter:create.feedback:fail:filter_name_already_exists'
      }

      this.setFeedback({
        message: this.$t(errorLabel),
        type: 'error'
      })
    },

    submit (data) {
      this.isLoading = true
      const filterRequestBody = this.createFilterBody(data)

      this.attemptFilterCreation(filterRequestBody)
        .then(() => {
          this.setFeedback({ message: this.$t('mediation.filter:create.feedback:success') })
          this.$emit('refreshList')
          this.$router.push({ name: 'filter.list' })
        })
        .catch(this.errorHandler)
        .finally(() => {
          this.isLoading = false
        })
    }
  },

  created () {
    this.setFetching(true)

    this.attemptFilterTypesRetrieval()
      .catch(() => {
        this.setFeedback({
          message: this.$t('global:error'),
          type: 'error'
        })
        this.$router.push({ name: 'filter.list' })
      })
      .finally(() => {
        this.setFetching(false)
      })
  }
}
</script>
<template>
  <modal :active="!fetching" :cancel="true" is-page>
    <div class="modal-form modal-add-filter">
      <span class="modal-subtitle">{{ $t('global:menu.mediation') }}</span>
      <h2 class="modal-title text-color">{{ $t('mediation.filter:btn.add') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('mediation.filter:modal.description') }}</p>
      </div>

      <filter-form
        :isProcessing="isLoading"
        @onSubmit="submit"
      />
    </div>
  </modal>
</template>
