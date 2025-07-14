<script>
import { mapActions, mapState } from 'vuex'

import Modal from '@/components/general/Modal'
import Tabs from '@/components/general/Tabs'

export default {
  name: 'ModalViewFilter',

  components: {
    Modal,
    Tabs
  },

  data () {
    return {
      tabLinks: [
        {
          text: 'mediation.filter:modal.tab.1',
          location: { name: 'filter.view' }
        },
        {
          text: 'mediation.filter:modal.tab.2',
          location: { name: 'filter.view.result' }
        }
      ],

      formData: {
        name: null,
        description: null,
        filterType: null,
        solution: null
      }
    }
  },

  computed: {
    ...mapState([
      'accessibility',
      'fetching'
    ])
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFilterTypesRetrieval',
      'attemptFilterByIdRetrieval',
      'attemptCourseByIdRetrieval',
      'attemptScormTopicsRetrieval'
    ]),

    showResults (event) {
      this.$router.push({
        name: 'filter.view.result.show',
        params: {
          session: event
        }
      })
    },

    async getSolutionData (meta) {
      if (!meta['solution_id']) return []

      const solution = {
        'course_id': meta['solution_id'],
        'course_name': meta['solution_name']
      }

      if (!solution['course_name']) {
        const { data } = await this.attemptCourseByIdRetrieval(meta['solution_id'])
        solution['course_name'] = data.name
      }

      return solution
    },

    filterSelectedTopics (topics, idList) {
      return (topics || []).filter(topic => idList.find(topicId => topicId === topic.id))
    },

    async getScormData (meta) {
      if (!meta['asset_id']) return {}

      const scormFormData = {
        scorm: [],
        topic: meta['asset_topics'],
        status: meta['content_status']
      }

      const selectedScormInfo = {
        name: meta['asset_name'],
        id: meta['asset_id']
      }

      if (!selectedScormInfo.name) {
        const { data } = await this.attemptScormTopicsRetrieval({ scormId: meta['asset_id'] })
        const metaData = (data && data.meta) || {}
        selectedScormInfo.name = metaData['class_name'] || ''
        scormFormData.topic = this.filterSelectedTopics(metaData.topics, meta['scorm_topics_id'])
      }

      scormFormData.scorm = [selectedScormInfo]

      return scormFormData
    },

    async parseToFormData (data) {
      const filterValues = data.filterValues && data.filterValues
      const info = filterValues && filterValues.length && filterValues[0]
      const meta = info && info.meta && info.meta.meta

      let formData = {
        name: info.name,
        description: data.description,
        filterType: data.type.alias,
      }

      if (!Array.isArray(meta)) {
        const solution = await this.getSolutionData(meta)
        const scorm = await this.getScormData(meta)

        formData = {
          ...formData,
          solution: [solution],
          ...scorm
        }
      }

      return formData
    },

    async responseHandler (data) {
      try {
        return this.parseToFormData(data)
      } catch (error) {
        throw new Error(error)
      }
    }
  },

  created () {
    this.setFetching(true)

    Promise.all([
      this.attemptFilterTypesRetrieval(),
      this.attemptFilterByIdRetrieval(this.$route.params.id)
    ])
      .then(([_, filterByIdResponse]) => this.responseHandler(filterByIdResponse.data))
      .then(generatedFilter => {
        this.formData = generatedFilter
      })
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
  <modal :active="!fetching" :back="true" is-page>
    <div class="modal-form modal-view-filter">
      <span class="modal-subtitle">{{ $t('global:menu.mediation') }}</span>
      <h2 class="modal-title text-color">{{ formData.name }}</h2>

      <div class="modal-container">
        <tabs
          :links="tabLinks"
          slot="tabs"
          :showBottomBorder="true"
          dark
        />

        <router-view :value="formData"/>
      </div>

    </div>
  </modal>
</template>

<style lang="scss">
  @import "./ModalViewFilter.scss";
</style>
