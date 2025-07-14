<script>
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'

import { getAttemptTriesLabel } from '@/app/classroom/modules/assessments/utils/labels'
import { mapQuestion } from '@/app/classroom/modules/assessments/utils/setupExaminationQuestions'
import EvaluationValidator from '@/app/classroom/modules/assessments/pages/EvaluationForm/EvaluationValidator.js'

import ModalInformation from '@/components/general/ModalInformation'
import EvaluationQuestions from '@/app/classroom/modules/assessments/pages/EvaluationForm/components/EvaluationQuestions.vue'
import Action from '@/components/general/Action'

export default defineComponent({
  name: 'ModalPreviewEvaluation',

  components: {
    Action,
    EvaluationQuestions,
    ModalInformation,
  },

  props: {
    evaluation: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      examination: {},
      questions: [],
      showLibras: false,
      hasLibras: false,
    }
  },

  validations: EvaluationValidator,

  computed: {
    ...mapGetters(['isFetching']),
  },

  created() {
    this.setFetching(true)
    this.attemptGetEvaluationPreview({
      topicId: this.evaluation.id,
    })
      .then(this.setupPreview)
      .finally(() => this.setFetching(false))
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptGetEvaluationPreview']),

    setupPreview({ data }) {
      this.examination = data
      const questions = this.examination.questions.map(mapQuestion(this.examination))

      this.$set(this, 'questions', questions)

      this.$nextTick(() => {
        this.hasLibras = document.querySelector('.libras-blot')
      })
    },

    getAttemptTriesLabel,
  },
})
</script>

<template>
  <ModalInformation
    :data-testid="$testId('modal-preview-evaluation')"
    class="modal-preview-evaluation"
    :class="{ 'libras-on': showLibras }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #content>
      <Action
        v-if="hasLibras"
        class="evaluation-libras-floating"
        type="button"
        icon="libras"
        icon-size="large"
        @click="showLibras = !showLibras"
      />

      <div class="evaluation-student examination__form">
        <div class="evaluation-header">
          <div class="evaluation-header-text">
            <div class="evaluation__status">
              <h2 class="evaluation-subtitle">
                {{ $t('classroom.assessments.evaluation:title') }}
              </h2>
            </div>

            <h3 class="evaluation-title">
              {{ examination.name }}
            </h3>

            <span class="evaluation-tries">
              {{ getAttemptTriesLabel(1, examination.tries) }}
            </span>
          </div>
        </div>

        <div
          v-if="examination.description"
          class="evaluation-description"
          v-html="examination.description"
        ></div>

        <form class="evaluation-form">
          <EvaluationQuestions
            :questions="questions"
            :validations="$v"
            review
          />
        </form>
      </div>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
@import './ModalPreviewEvaluation.scss';
</style>
