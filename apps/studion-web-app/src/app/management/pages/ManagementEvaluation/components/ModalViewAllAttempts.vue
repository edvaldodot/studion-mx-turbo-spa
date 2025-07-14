<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import ModalEvaluationSelectAttempt from '@/app/classroom/modules/assessments/pages/ModalEvaluationSelectAttempt'

export default defineComponent({
  name: 'ModalViewAllAttempts',

  components: {
    ModalEvaluationSelectAttempt,
  },

  data() {
    return {
      modalActive: false,
      currentData: null,
    }
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback']),

    openModal(evaluation) {
      this.loadEvaluationAttempts(evaluation)
    },

    closeModal() {
      this.modalActive = false
    },

    loadEvaluationAttempts(evaluation) {
      this.mountCurrentData(evaluation)
      this.modalActive = true
    },

    mountCurrentData(evaluation) {
      this.currentData = {
        topic: {
          id: evaluation.topicId,
          name: evaluation.topicName,
        },
        course: {
          name: evaluation.solutionName,
        },
        sessionUuid: evaluation.sessionUuid,
        params: {
          sessionUuid: evaluation.sessionUuid,
          examinationId: evaluation.examinationId,
          enrollmentId: evaluation.enrollmentId,
        },
      }
    },

    openEvaluation(lastTryId, sessionUuid, params = null) {
      let routeObject = {
        name: 'classroom.assessments.evaluation.student',
        params: {
          id: lastTryId,
          session_uuid: sessionUuid || this.currentData.sessionUuid,
          management: this.$route.name,
        },
      }

      if (params) {
        routeObject = {
          ...routeObject,
          query: {
            examination_id: params.examinationId,
            order: new URLSearchParams(params.order).toString(),
          },
        }
      }

      this.$router.push(routeObject)
    },
  },
})
</script>

<template>
  <ModalEvaluationSelectAttempt
    :active="modalActive"
    :data="currentData"
    @close="closeModal"
    @access="openEvaluation"
  />
</template>