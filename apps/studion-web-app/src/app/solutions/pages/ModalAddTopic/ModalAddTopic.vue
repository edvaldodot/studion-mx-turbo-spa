<script>
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import sharedDataMixin from '../sharedDataMixin'

import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'
const ResearchForm = () => import('../../components/ResearchForm')
const ExaminationForm = () => import('../../components/ExaminationForm')
const ClassForm = () => import('../../components/ClassForm')
const CompetencyForm = () => import('../../components/CompetencyForm')

export default defineComponent({
  name: 'ModalAddTopic',

  components: {
    Modal,
    SelectField,
    ResearchForm,
    ExaminationForm,
    ClassForm,
    CompetencyForm,
  },

  mixins: [sharedDataMixin],

  beforeRouteEnter(_, __, next) {
    next((vm) => {
      if (!vm.$isEnabledFeature('topic_template') && vm.isTopicTemplate)
        next({ name: 'solutions.index' })
    })
  },

  props: {
    topicId: {
      type: Number,
      default: null,
    },
    courseId: {
      type: Number,
      default: null,
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      componentFormNames: {
        research: 'ResearchForm',
        examination: 'ExaminationForm',
        class: 'ClassForm',
        competency: 'CompetencyForm',
      },
      modalActive: true,
      topic: {
        id: null,
        type: null,
        name: null,
        description: '',
        mandatory: null,
        classLibrary: null,
        active: null,
        assets: [
          {
            type_id: null,
            asset_file: null,
            active: true,
            mandatory: null,
            name: '',
          },
        ],
      },
    }
  },

  computed: {
    ...mapGetters(['isFetching']),
    modalSubtitle() {
      return this.isTopicTemplate
        ? this.$t('solutions.create.topicTemplate:modal.subtitle')
        : this.$t('solutions.create.classes:modal.subtitle')
    },
    typeOptions() {
      return this.topicsTypesOptions.filter((item) => {
        if (this.isTopicTemplate) {
          return !['class'].includes(item.value)
        } else if (!this.isTopicTemplate && !this.$isEnabledFeature('competency')) {
          return item.value !== 'competency'
        }
        return item
      })
    },
  },

  async created() {
    this.attemptAssetsTypesRetrieval()
    if (this.topicId) {
      this.setupTopicData()
    }
    this.openModal()
  },

  methods: {
    ...mapActions(['attemptTopicRetrieval', 'attemptAssetsTypesRetrieval', 'fetchTopicTemplate']),
    async setupTopicData() {
      const topicResponse = this.isTopicTemplate
        ? await this.fetchTopicTemplate(this.topicId)
        : await this.attemptTopicRetrieval(this.topicId)
      this.topic = topicResponse.data
      if (this.isTopicTemplate) this.topic.mandatory = this.topic.meta.mandatory
    },
    openModal() {
      this.modalActive = true
    },
    formUpdate({ topic }) {
      this.$emit('saved-topic', topic)
    },
  },
})
</script>

<template>
  <Modal
    :active="modalActive"
    is-page
  >
    <div class="modal-form modal-form-class modal-solutions-create mb-10">
      <span class="modal-subtitle">{{ modalSubtitle }}</span>

      <h2 class="modal-title text-color">
        {{
          topic.id
            ? $t('solutions.create.classes:modal.title.edit')
            : $t('solutions.create.classes:modal.title.add')
        }}
      </h2>

      <div class="text-center mb-5 text-color">
        <p class="text-color">{{ $t('solutions.create.classes:modal.evaluation.description') }}</p>
      </div>

      <div class="centered-form my-3">
        <SelectField
          v-model="topic.type"
          :disabled="!!(!canWrite('courses') || topic.id)"
          :label="$t('global:form.type')"
          :items="typeOptions"
          dark
        />
      </div>

      <Component
        :is="componentFormNames[topic.type]"
        v-if="topic.type && componentFormNames[topic.type]"
        :is-topic-template="isTopicTemplate"
        :course-id="courseId"
        :topic="topic"
        @update="formUpdate"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
@import './ModalAddTopic.scss';
</style>
