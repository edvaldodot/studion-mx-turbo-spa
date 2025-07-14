<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import ModalExaminationsStudents from '../ModalExaminationsStudents'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'EvaluationList',

  components: {
    Action,
    Datatable,
    ModalExaminationsStudents,
    NotificationCircle,
  },

  mixins: [EvaluationMixin],

  props: {
    evaluations: {
      type: Object,
      default: () => {},
    },
  },

  methods: {
    openEvaluation(examination) {
      this.$router.push({ params: { id: examination.examination_id } })
    },

    close() {
      this.$router.push({ params: { id: null } })
    },
  },
})
</script>
<template>
  <div
    class="evaluation-list__container"
    :data-test="$testId('evaluation-list')"
  >
    <Datatable :items="evaluations.data">
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th class="th col-4">
            {{ $t('classroom.assessments.evaluation:datatable.header.1') }}
          </th>
          <th class="th col-2">
            {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
          </th>
          <th class="th col-2">
            {{ $t('classroom.assessments.evaluation:datatable.header.3') }}
          </th>
          <th class="th col-2">{{ $t('classroom.assessments.evaluation:datatable.header.4') }}</th>
          <th class="th col-1"></th>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td
            class="label-title"
            :colspan="4"
          >
            <span class="td-text bolder">{{
              $t('classroom.assessments.evaluation:datatable.header.1')
            }}</span>
          </td>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td
            class="label-title-name"
            colspan="4"
          >
            <span
              :style="{ display: 'block' }"
              class="td-text"
            >
              {{ props.item.name }}
            </span>
          </td>
        </tr>

        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td colspan="2">
            <span class="td-text bolder">
              {{ $t('classroom.assessments.evaluation:datatable.header.5') }}
            </span>
            <span
              class="td-text"
              style="display: block"
            >
              {{ props.item.qtt_students }}
            </span>
          </td>
          <td colspan="2">
            <span class="td-text bolder">
              {{ $t('classroom.assessments.evaluation:datatable.header.3') }}
            </span>
            <span
              class="td-text"
              style="display: block"
            >
              {{ props.item.qtt_answered }}
            </span>
          </td>
          <td colspan="2">
            <span class="td-text bolder">
              {{ $t('classroom.assessments.evaluation:datatable.header.4') }}
            </span>
            <span
              class="td-text"
              style="display: block"
            >
              {{ props.item.qtt_graded }}
            </span>
          </td>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-colspan text-left"
        >
          <td class="td">
            <Action
              :text="$t('global:view.more')"
              flat
              type="button"
              class="is-highlight"
              @click="openEvaluation(props.item)"
            />
          </td>
        </tr>

        <tr class="tr-body">
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <NotificationCircle
              v-if="checkExistingNotification('examination_id', props.item.examination_id)"
              class="datatable__notification-circle"
            />
            <span class="td-text column-td bolder">{{ props.item.name }}</span>
          </td>
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <span class="td-text column-td">{{ props.item.qtt_students }}</span>
          </td>
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <span class="td-text column-td">{{ props.item.qtt_answered }}</span>
          </td>

          <td
            v-if="!$media.mobile"
            class="td"
          >
            <span class="td-text column-td">{{ props.item.qtt_graded }}</span>
          </td>

          <td
            v-if="!$media.mobile"
            class="td text-right td-actions"
          >
            <Action
              :disabled="props.item.attempts === null"
              type="button"
              :text="$t('global:view.more')"
              flat
              class="is-highlight"
              @click="openEvaluation(props.item)"
            />
          </td>
        </tr>
      </template>
    </Datatable>

    <ModalExaminationsStudents
      v-if="$route.params.id"
      @close="close"
    />
  </div>
</template>
