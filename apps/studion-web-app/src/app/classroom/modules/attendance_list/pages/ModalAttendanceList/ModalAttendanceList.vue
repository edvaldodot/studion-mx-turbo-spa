<script>
import { mapState, mapActions } from 'vuex'

import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import ModalBody from '@/components/general/ModalBody'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Pagination from '@/components/general/Pagination'

import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'

import { paginateMixin } from '@/mixins/paginatorMixin'

import { userSheetsOrderOptions } from '@/support/utils/filters'
import ModalAttendanceListCheckItem from './components/ModalAttendanceListCheckItem.vue'

export default {
  name: 'ModalAttendanceList',

  components: {
    Icon,
    Modal,
    ModalHeader,
    ModalBody,
    Action,
    Checkbox,
    Datatable,
    EmptyMessage,
    Pagination,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    ModalAttendanceListCheckItem,
  },

  mixins: [paginateMixin],

  data() {
    return {
      items: [],
      selectedItems: [],
    }
  },

  computed: {
    ...mapState(['Sessions', 'Classroom']),

    userSheetsOrderOptions,

    sessionName() {
      return this.Classroom.data.name
    },

    listName() {
      return this.$route.params.attendance.title
    },

    getCheckedIcon() {
      return this.selectedItems.length === 0
        ? 'check_box_outline_blank'
        : this.selectedItems.length === this.pgtrCurrentData.length
        ? 'check_box_checked'
        : 'check_box_minus'
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },

    'pgtrParams.page': {
      immediate: true,
      handler() {
        this.$set(this, 'selectedItems', [])
      },
    },
  },

  mounted() {
    this.setup()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSaveAttendanceList',
      'attemptSessionUsersRetrieval',
    ]),

    setup() {
      const { id } = this.$route.params
      this.pgtrInitializePagination('attemptSessionUsersRetrieval', { id })
    },

    markSelectedAs(present) {
      this.pgtrCurrentData.forEach((student) => {
        const isSelected = !!this.selectedItems.find((i) => i.id === student.id)
        if (isSelected) student.present = present
      })
    },

    saveAttendance() {
      const { id } = this.$route.params

      this.setFetching(true)
      this.attemptSaveAttendanceList({
        attendance_list_id: id,
        sheet: this.pgtrCurrentData.map((student) => {
          return {
            application_user_id: student.id,
            present: student.present,
          }
        }),
      })
        .then(() => {
          this.setFeedback({
            message: this.$t('classroom.attendance.student:saved.attendance.success'),
          })
          this.$emit('refresh-attendance-list')
          this.$set(this, 'selectedItems', [])
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     *
     * @param {{checked: Boolean}} event
     * @param {{id: number}} eventItem
     */
    selectItem(event, eventItem) {
      const index = this.selectedItems.findIndex((item) => item.id === eventItem.id)
      if (index === -1 && event.checked) {
        this.selectedItems.push({ id: eventItem.id, selected: event.checked })
      } else if (event.checked) {
        this.selectedItems[index].selected = event.checked
      } else {
        this.selectedItems.splice(index, 1)
      }
    },

    async selectAll() {
      let selected = true
      if (this.selectedItems.length > 0) selected = false

      this.$nextTick().then(() => {
        this.pgtrCurrentData.forEach((item) => {
          this.selectItem({ checked: selected }, item)
        })
      })
    },
  },
}
</script>

<template>
  <Modal
    :data-testid="$testId('modal-attendance-list')"
    :active="true"
    is-page
    back
  >
    <ModalHeader
      :title="$t('classroom.attendance.list:modal.title')"
      :sub-title="`${$t('classroom.attendance.list:manage.modal.title')}: ${sessionName}`"
      :description="$t('classroom.attendance.list:modal.description', { listName })"
    />

    <ModalBody class="modal-attendance-list">
      <div class="py-3">
        <FilterList>
          <FilterListSearch
            slot="search"
            dark
            @search="pgtrSetSearch('username', $event)"
          />

          <FilterListOrder
            slot="order"
            :options="userSheetsOrderOptions"
            :on-server="true"
            dark
            @update-orders="pgtrUpdateOrder"
          />
        </FilterList>
      </div>

      <EmptyMessage v-if="pgtrCurrentData.length === 0">
        <h2>{{ $t('community.attendance.list:empty.student.list.title') }}</h2>
        <p v-html="$t('community.attendance.list:empty.student.list.description')"></p>
      </EmptyMessage>

      <Datatable
        v-if="pgtrCurrentData.length > 0"
        :items="pgtrCurrentData"
        :dark="true"
      >
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th
              class="th check-all"
              width="50"
              valign="top"
            >
              <Icon
                :name="getCheckedIcon"
                class="check-items-btn"
                wrapper
                @click="selectAll"
              />
            </th>

            <th class="th">
              {{ $t('global:user') }}
            </th>

            <th class="th">
              {{ $t('global:form.email') }}
            </th>

            <th class="th">
              {{ $t('global:assess.to') }}
            </th>

            <th
              class="th text-center"
              width="50"
            >
              {{ $t('classroom.attendance.list:name') }}
            </th>
          </tr>
        </template>

        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr>
            <td class="td">
              <ModalAttendanceListCheckItem
                class="ml-2"
                :item="props.item"
                :selected-items="selectedItems"
                :select-item="selectItem"
              />
            </td>

            <td class="td bolder">
              <p class="text-color text-base">{{ props.item.name }}</p>
              <p class="th-description text-color">
                {{ $t('global:enrolled.in') + formatDate(props.item.enrollment_date) }}
              </p>
            </td>

            <td class="td">
              <p class="text-color text-base">{{ props.item.email }}</p>
            </td>

            <td class="td">
              <template v-if="props.item.aud_dh_update">
                <p class="text-color text-base">{{ props.item.aud_user_update }}</p>
                <d class="th-description text-color text-base">
                  {{
                    $t('global:date.hours', {
                      date: formatDate(props.item.aud_dh_update),
                      hour: formatDate(props.item.aud_dh_update, 'shortTime'),
                    })
                  }}
                </d>
              </template>
              <p
                v-else
                class="text-color text-base"
              >
                -
              </p>
            </td>

            <td class="td text-center td-actions action-buttons">
              <Checkbox
                v-model="props.item.present"
                :items="[{ value: true }]"
                switch-type
                dark
              />
            </td>
          </tr>
        </template>
      </Datatable>

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        dark
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />

      <div v-if="pgtrCurrentData.length > 0">
        <Action
          :text="$t('classroom.attendance.students:mark.present')"
          class="attendance-action"
          type="button"
          flat
          dark
          @click="markSelectedAs(true)"
        />

        <Action
          :text="$t('classroom.attendance.students:mark.not.present')"
          class="attendance-action"
          type="button"
          flat
          dark
          @click="markSelectedAs(false)"
        />
      </div>

      <div
        v-if="pgtrCurrentData.length > 0"
        class="form-submit text-center"
      >
        <Action
          :text="$t('global:save')"
          type="button"
          fixed-width
          secondary
          large
          @click="saveAttendance"
        />
      </div>
    </ModalBody>
  </Modal>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/attendance_list/styles.scss';
</style>
