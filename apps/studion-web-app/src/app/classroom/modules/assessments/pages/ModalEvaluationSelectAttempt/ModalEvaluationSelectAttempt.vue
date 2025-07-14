<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import Pagination from '@/components/general/Pagination'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'ModalEvaluationSelectAttempt',

  components: {
    Action,
    Datatable,
    Modal,
    ModalHeader,
    Pagination,
  },

  mixins: [paginateMixin],

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    title() {
      return (
        this.data.topic.name ||
        (this.pgtrCurrentData &&
          this.pgtrCurrentData[0] &&
          this.pgtrCurrentData[0].examination.topic.name)
      )
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    data: {
      immediate: true,
      handler(newVal) {
        if (newVal) this.getData(newVal)
      },
    },
  },

  methods: {
    ...mapActions(['setFetching']),

    getData(value) {
      value.params.isStudent = this.equalsProfile('student')
      this.pgtrInitializePagination('attemptGetEnrollmentExamination', null, value.params)
    },
  },
})
</script>

<template>
  <Modal
    v-if="data"
    :active="active"
    :data-testid="$testId('modal--evaluation-select-attempt')"
    close-event
    is-page
    @close="$emit('close')"
  >
    <div class="modal-evaluation-enrollment">
      <ModalHeader
        :title="title"
        :sub-title="data.course && data.course.name"
        class="modal-evaluation-enrollment__header"
      />

      <Datatable
        :items="pgtrCurrentData"
        dark
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th
              class="th col-6"
              colspan="1"
            >
              {{ $t('classroom.assessments.evaluation:enrollment.modal.datatable.header.1') }}
            </th>
            <th
              class="th text-center"
              :class="!$media.mobile ? 'col-2' : 'col-1'"
            >
              {{ $t('global:shipping.last') }}
            </th>
            <th class="th text-center col-1">
              {{ $t('classroom.assessments.evaluation:enrollment.modal.datatable.header.3') }}
            </th>
            <th
              class="th text-center"
              :class="!$media.mobile ? 'col-2' : 'col-1'"
            >
              {{ $t('global:correction.last') }}
            </th>
            <th class="th"></th>
            <th class="th"></th>
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
              colspan="3"
            >
              <span class="td-text">{{
                $t('classroom.assessments.evaluation:enrollment.attempt', {
                  num: props.item.attempt,
                })
              }}</span>
            </td>
          </tr>
          <tr
            v-if="$media.mobile"
            class="tr-colspan"
          >
            <td
              class="td"
              :class="{ 'col-6': !$media.mobile, 'col-4': $media.mobile }"
              :style="$media.mobile ? 'padding-left: 44px' : ''"
            >
              <span class="td-text bolder">{{ $t('global:shipping') }}</span>
              <span class="td-text bolder">{{ $t('global:shipping') }}</span>
            </td>
            <td
              class="td"
              :class="{ 'col-6': !$media.mobile, 'col-4': $media.mobile }"
            >
              <span class="td-text bolder">{{
                $t('classroom.assessments.evaluation:enrollment.modal.datatable.header.3')
              }}</span>
            </td>
            <td
              class="td"
              :class="{ 'col-6': !$media.mobile, 'col-4': $media.mobile }"
            >
              <span class="td-text bolder">
                {{ $t('global:correction') }}
              </span>
            </td>
            <td
              class="td"
              :class="{ 'col-6': !$media.mobile, 'col-4': $media.mobile }"
            >
              <span class="td-text bolder">
                {{ $t('global:correction') }}
              </span>
            </td>
          </tr>
          <tr class="tr-body">
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <span class="td-text">{{
                $t('classroom.assessments.evaluation:enrollment.attempt', {
                  num: props.item.attempt,
                })
              }}</span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
              :style="$media.mobile ? 'padding-left: 44px' : ''"
            >
              <span class="td-text">{{
                props.item.endTime ? formatDate(props.item.endTime, 'long') : '-'
              }}</span>
              <span class="td-text">{{
                props.item.endTime ? formatDate(props.item.endTime, 'long') : '-'
              }}</span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
            >
              <span class="td-text"
                >{{
                  props.item.isGraded
                    ? parseFloat(props.item.grade).toFixed(2).replace('.', ',')
                    : $t(`classroom.assessments.evaluation:status.${props.item.status}`)
                }}
              </span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
            >
              <span class="td-text">{{
                props.item.correctionTime ? formatDate(props.item.correctionTime, 'long') : '-'
              }}</span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
            >
              <span class="td-text">{{
                props.item.correctionTime ? formatDate(props.item.correctionTime, 'long') : '-'
              }}</span>
            </td>
            <td
              class="td"
              :class="{ 'text-center': !$media.mobile }"
            >
              <Action
                v-if="
                  equalsProfile('student') || !['started', 'expired'].includes(props.item.status)
                "
                :text="$t('global:access')"
                type="button"
                flat
                dark
                @click="$emit('access', equalsProfile('student') ? props.item : props.item.id)"
              />
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        disable-manual-page
        dark
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
  </Modal>
</template>
<style lang="scss">
.modal-evaluation-enrollment {
  .modal-evaluation-enrollment__header {
    padding-bottom: 50px;
  }
}
</style>
<style lang="scss">
.modal-evaluation-enrollment {
  .modal-evaluation-enrollment__header {
    padding-bottom: 50px;
  }
}
</style>
