<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Action from '@/components/general/Action'
import ModalStudentExaminations from '../ModalStudentExaminations'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default defineComponent({
  name: 'EvaluationByStudent',

  components: {
    Datatable,
    Dropdown,
    DropdownLink,
    Action,
    ModalStudentExaminations,
    NotificationCircle,
  },

  mixins: [EvaluationMixin],

  props: {
    evaluations: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      selectedStudent: null,
    }
  },

  computed: {
    ...mapState(['accesibility']),

    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  methods: {
    openStudentExaminations(item) {
      this.selectedStudent = item
    },
  },
})
</script>
<template>
  <div
    class="evaluation-by-student__container"
    :data-test="$testId('evaluation-by-student')"
  >
    <Datatable :items="evaluations">
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th class="th col-5">
            {{ $t('classroom.assessments.evaluation:datatable.header.10') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.assessments.tab.link.1') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.assessments.evaluation:datatable.header.3') }}
          </th>
          <th class="th col-2 text-center">
            {{ $t('classroom.assessments.evaluation:datatable.header.4') }}
          </th>
          <th class="th col-1"></th>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td class="label-title">
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
              class="td-text"
              :style="{ display: 'block' }"
              >{{ props.item.name }}</span
            >
          </td>
        </tr>
        <tr
          v-if="$media.mobile"
          class="tr-colspan"
        >
          <td class="td text-center col-3">
            <span class="td-text bolder">{{
              $t('classroom.assessments.evaluation:datatable.header.10')
            }}</span>
          </td>
          <td class="td text-center col-3">
            <span class="td-text bolder">{{
              $t('classroom.assessments.evaluation:datatable.header.3')
            }}</span>
          </td>
          <td class="td text-center col-3">
            <span class="td-text bolder">{{
              $t('classroom.assessments.evaluation:datatable.header.4')
            }}</span>
          </td>
          <td
            v-if="notEqualsProfile('student')"
            class="td col-3 td-actions text-right"
          ></td>
        </tr>
        <tr class="tr-body">
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <NotificationCircle
              v-if="
                checkExistingNotification('enrollment_id', props.item.i_sessions_applications_users)
              "
              class="datatable__notification-circle"
            />
            <span class="td-text bolder">{{ props.item.name }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text">{{ props.item.qtt_examinations }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text">{{ props.item.qtt_answered }}</span>
          </td>
          <td class="td text-center">
            <span class="td-text bolder">{{ props.item.qtt_graded }}</span>
          </td>
          <td class="td td-actions text-right">
            <Action
              :text="$t('global:view.more')"
              :dark="accesibility"
              type="button"
              flat
              @click="openStudentExaminations(props.item)"
            />
            <dropdown
              v-if="false"
              icon="dots-vertical"
              right
            >
              <dropdown-link :text="$t('global:edit')" />
              <dropdown-link :text="$t('global:remove')" />
            </dropdown>
          </td>
        </tr>
      </template>
    </Datatable>
    <ModalStudentExaminations
      v-if="selectedStudent"
      :student="selectedStudent"
      @close="selectedStudent = null"
    />
  </div>
</template>
