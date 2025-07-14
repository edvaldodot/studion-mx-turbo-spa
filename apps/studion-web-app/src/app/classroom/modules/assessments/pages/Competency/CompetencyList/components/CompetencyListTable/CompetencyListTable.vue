<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Tooltip from '@/components/general/Tooltip'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'CompetencyByEvaluation',

  components: {
    Action,
    Datatable,
    Tooltip,
    NotificationCircle,
  },

  mixins: [EvaluationMixin],

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
    }
  },
})
</script>

<template>
  <div class="center competency-list__table">
    <datatable
      :items="competency"
      item-identifier="enrollment_competency"
    >
      <template slot="thead">
        <tr>
          <th class="th col-5">
            {{ $t('classroom.assessments.tab.link.2') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('global:status') }}
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
            <span class="td-text bolder">{{ props.item.competency_title }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text">{{
              props.item.status
                ? $t(`classroom.assessments.evaluation:competency.${props.item.status}`)
                : $t(`classroom.assessments.evaluation:competency.open`)
            }}</span>
          </td>
          <td class="td td-actions text-right">
            <Tooltip
              :uppercase="false"
              :width="230"
              medium-font
              shadow
              dark
            >
              <template v-slot:activator="{ on }">
                <Action
                  :disabled="
                    (!equalsProfile('student') && !props.item.enrollment_competency) ||
                    !props.item.student_can_access
                  "
                  type="button"
                  flat
                  :text="$t(props.item.status === 'open' ? 'global:access' : 'global:view.more')"
                  @click="redirect(props)"
                  @mouseenter.native="on.mouseenter"
                  @mouseleave.native="on.mouseleave"
                />
              </template>
              <span
                v-if="!props.item.student_can_access"
                v-html="$t('classroom.evaluations:block.evaluation.access')"
              />
            </Tooltip>
          </td>
        </tr>
      </template>
    </datatable>
  </div>
</template>
<style lang="scss">
.competency-list__table {
  .btn.is-disabled {
    opacity: 0.5;
  }
}
</style>
