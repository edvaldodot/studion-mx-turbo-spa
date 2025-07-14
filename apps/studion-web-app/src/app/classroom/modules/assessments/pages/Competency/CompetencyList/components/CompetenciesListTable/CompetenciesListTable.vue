<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import ModalCompetencyByStudent from '../ModalCompetencyByStudent'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'CompetenciesListTable',

  components: {
    Action,
    Datatable,
    ModalCompetencyByStudent,
    NotificationCircle
  },

  mixins: [EvaluationMixin],

  data() {
    return {
      selectedCompetency: null,
    }
  },

  computed: {
    ...mapState({
      competency: (state) => state.Classroom.competencyList,
    }),
  },

  methods: {
    redirect(props) {
      if (this.notEqualsProfile('student')) {
        return this.$router.push({
          name: 'classroom.assessments.competency.feedback',
          params: {
            id: props.item.enrollment_competency,
          },
        })
      }

      return this.$router.push({
        name: 'classroom.lessons.course.type',
        params: {
          type_id: props.item.topic_id,
          type: 'competency',
          session_uuid: this.$route.params.session_uuid,
        },
      })
    },

    closeModal() {
      this.selectedCompetency = null
      this.$emit('updateList')
    },
  },
})
</script>

<template>
  <div
    class="center competency-list__table"
    :data-testid="$testId('competencies-list--table')"
  >
    <Datatable
      :items="competency"
      item-identifier="enrollment_competency"
    >
      <template slot="thead">
        <tr>
          <th class="th col-5">
            {{ $t('classroom.assessments.tab.link.2') }}
          </th>
          <th class="th col-2">
            {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
          </th>
          <th class="th col-2">
            {{ $t('classroom.evaluations:question.submited') }}
          </th>
          <th class="th col-2">
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
              v-if="checkExistingNotification('competency_id', props.item.competency_id)"
              class="datatable__notification-circle"
            />
            <span class="td-text bolder">{{ props.item.title }}</span>
          </td>
          <td class="td">
            <span class="td-text">
              {{ props.item.qtd_students }}
            </span>
          </td>
          <td class="td">
            <span class="td-text">{{ props.item.qtd_competency_answered }}</span>
          </td>
          <td class="td">
            <span class="td-text">{{ props.item.qtd_comment }}</span>
          </td>
          <td class="td td-actions text-right">
            <Action
              :disabled="props.item.qtd_competency_answered === 0"
              type="button"
              flat
              :text="$t(props.item.status === 'open' ? 'global:access' : 'global:view.more')"
              @click="selectedCompetency = props.item"
            />
          </td>
        </tr>
      </template>
    </Datatable>
    <ModalCompetencyByStudent
      v-if="selectedCompetency"
      :competency="selectedCompetency"
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
