<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import ModalCompetencyStudent from '../ModalCompetencyStudent'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'CompetencyByEvaluation',

  components: {
    Action,
    Datatable,
    ModalCompetencyStudent,
    NotificationCircle,
  },

  mixins: [EvaluationMixin],

  data() {
    return {
      selectedStudent: null,
    }
  },

  computed: {
    ...mapState({
      competency: (state) => state.Classroom.studentsCompetencyList,
    }),
  },

  methods: {
    redirect(props) {
      this.$router.push({
        name: 'classroom.assessments.competency.modal.student',
        params: {
          id: props.item.enrollment_id,
        },
      })
    },

    closeModal() {
      this.selectedStudent = null
      this.$emit('updateList')
    },
  },
})
</script>

<template>
  <div
    class="center competency-list__table"
    :data-testid="$testId('classroom-competency-student--list')"
  >
    <datatable
      :items="competency"
      item-identifier="enrollment_competency"
    >
      <template slot="thead">
        <tr>
          <th class="th col-5">
            {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.assessments.tab.link.2') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.evaluations:question.submited') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.evaluations:question.commented') }}
          </th>
          <th class="th col-1"></th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr class="tr-body">
          <td class="td">
            <NotificationCircle
              v-if="checkExistingNotification('enrollment_id', props.item.enrollment_id)"
              class="datatable__notification-circle"
            />
            <span class="td-text bolder">{{ props.item.name }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text">
              {{ props.item.qtd_competencies }}
            </span>
          </td>
          <td class="td text-center">
            <span class="td-text">
              {{ props.item.qtd_competency_answered }}
            </span>
          </td>
          <td class="td text-center">
            <span class="td-text">
              {{ props.item.qtd_comment }}
            </span>
          </td>
          <td class="td td-actions text-right">
            <Action
              type="button"
              flat
              :text="$t('global:view.more')"
              @click="selectedStudent = props.item"
            />
          </td>
        </tr>
      </template>
    </datatable>
    <ModalCompetencyStudent
      v-if="selectedStudent"
      :student="selectedStudent"
      @close="closeModal"
    />
  </div>
</template>
<style lang="scss">
.competency-list__table {
  .btn.is-disabled {
    opacity: 0.5;
  }
}
</style>
