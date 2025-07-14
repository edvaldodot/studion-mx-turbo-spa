<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { FILTER_OPTIONS } from '../../shared'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import NotificationCircle from '@/components/general/NotificationCircle'
import EvaluationMixin from '@/mixins/Evaluation'

export default {
  name: 'ModalCompetencyByStudent',

  components: {
    Datatable,
    EmptyMessage,
    Modal,
    Action,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    NotificationCircle,
  },

  mixins: [paginateMixin, EvaluationMixin],

  props: {
    competency: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapState(['fetching']),

    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'student_name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.pgtrFilterTagOptions.push(FILTER_OPTIONS(this))

    const payload = {
      session_uuid: this.$route.params.session_uuid,
      query: { competency_id: this.competency.competency_id },
    }

    this.pgtrInitializePagination('getCompetencyListResource', null, payload)
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching']),

    redirect(props) {
      this.$router.push({
        name: 'classroom.assessments.competency.feedback',
        params: {
          id: props.item.enrollment_competency,
        },
      })
    }
  }
}
</script>

<template>
  <Modal
    :active="true"
    is-page
    :data-testid="$testId('modal-competency-by-student')"
    @close="$emit('close')"
  >
    <span class="modal-subtitle">{{ $t('classroom.assessments.tab.link.2') }}</span>
    <h2 class="modal-title text-color">{{ competency.title }}</h2>
    <div class="modal-description text-color">
      <p class="text-color">{{ $t('classroom.competencies.users.list:modal.description') }}</p>
    </div>
    <FilterList>
      <FilterListTag
        slot="tag"
        :tag-all-filters-active="pgtrTagAllFilters"
        :options="pgtrFilterTagOptions"
        state="Competencies"
        dark
      />
      <FilterListOrder
        slot="order"
        :options="filterListOrderOptions"
        :label="$t('global:filter.order.label')"
        on-server
        dark
        @update-orders="pgtrUpdateOrder"
      />
      <FilterListSearch
        slot="search"
        ref="filterlistsearch"
        hide-error-details
        dark
        @search="pgtrSetSearch('name', $event)"
      />
    </FilterList>
    <div class="center" v-if="pgtrCurrentData.length > 0">
      <Datatable :items="pgtrCurrentData" dark>
        <template slot="thead">
          <tr>
            <th class="th">{{ $t('classroom.assessments.evaluation:datatable.header.5') }}</th>
            <th class="th text-center" width="200">{{ $t('global:status') }}</th>
            <th class="th" width="100"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr class="tr-colspan">
            <td class="td">
              <NotificationCircle
                v-if="
                  checkExistingNotification(
                    'enrollment_competency_id',
                    props.item.enrollment_competency
                  )
                "
                class="datatable__notification-circle"
              />
              <span class="td-text bolder">{{ props.item.student_name }}</span>
            </td>
            <td class="td text-center">
              <span :class="{'td-tag': !$media.mobile, 'td-text': $media.mobile}" >
                {{ $t(`classroom.assessments.evaluation:competency.${props.item.status}`) }}
              </span>
            </td>
            <td class="td">
              <Action
                :disabled="!props.item.enrollment_competency"
                type="button"
                flat
                dark
                :text="$t('global:view.more')"
                @click="redirect(props)"
              />
            </td>
          </tr>
        </template>
      </Datatable>
    </div>
    <EmptyMessage v-else>
      <h2>{{ $t('classroom.competency.users.list:modal.title.empty') }}</h2>
    </EmptyMessage>
  </Modal>
</template>
