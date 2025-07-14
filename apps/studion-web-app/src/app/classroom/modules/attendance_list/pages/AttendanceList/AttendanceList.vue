<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import Pagination from '@/components/general/Pagination'
import EmptyMessage from '@/components/general/EmptyMessage'
import TableDiv from '@/components/general/TableDiv'
import TableDivCol from '@/components/general/TableDivCol'
import TableDivLine from '@/components/general/TableDivLine'
import TableDivAccordion from '@/components/general/TableDivAccordion'
import AttendanceTableLine from './components/AttendanceTableLine'
import AttendanceListStudentDatatable from './components/AttendanceListStudentDatatable'

import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListTag from '@/components/general/FilterListTag'

import {
  attendanceFilterListOrderOptions,
  attendanceFilterListTagOptions,
} from '@/support/utils/filters'

import { paginateMixin } from '@/mixins/paginatorMixin'

export default defineComponent({
  name: 'AttendanceList',
  components: {
    Action,
    Pagination,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    EmptyMessage,
    TableDiv,
    TableDivCol,
    TableDivLine,
    TableDivAccordion,
    AttendanceTableLine,
    AttendanceListStudentDatatable,
  },

  mixins: [paginateMixin],

  beforeRouteLeave(_, __, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      tabLinks: [],
    }
  },

  computed: {
    ...mapState(['Classroom', 'accessibility', 'Attendance']),
    attendanceFilterListOrderOptions,
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:attendance.list')
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

  mounted() {
    this.setup()
  },

  created() {
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
      customClasses: { 'attendance-list': true },
    })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptGetAttendanceLists',
      'attemptDownloadAttendanceList',
    ]),
    openModalAddAttendanceList() {
      this.$router.push({ name: 'classroom.attendance.create' })
    },
    openModalAttendanceList(item) {
      this.$router.push({
        name: 'classroom.attendance.apply',
        params: { id: item.i_attendance_list, attendance: item },
      })
    },

    openModalEditAttendanceList(item) {
      this.$router.push({
        name: 'classroom.attendance.edit',
        params: { id: item.i_attendance_list, attendance: item },
      })
    },

    openConfirmModalRemoveAttendance(item) {
      this.$router.push({
        name: 'classroom.attendance.remove',
        params: { id: item.i_attendance_list },
      })
    },

    downloadAttendanceList(item) {
      this.setFetching(true)
      this.attemptDownloadAttendanceList(item.i_attendance_list)
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.attendance.list:feedback.download.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    setup() {
      this.pgtrFilterTagOptions = [...attendanceFilterListTagOptions]
      this.pgtrInitializePagination('attemptGetAttendanceLists', {
        id: this.$route.params.session_uuid,
        isStudent: this.equalsProfile('student'),
      })
    },

    makeAttendanceTitleCol(attendance) {
      const { attendance_lists } = attendance
      const count = attendance_lists.length

      if (count == 1) return attendance_lists[0].title

      return `${attendance_lists[0].title}, +${count - 1}`
    },

    makeAttendanceModalityCol(attendanceLists) {
      let modalities = attendanceLists.map((item) =>
        !item.modality ? '' : this.$t(`attendance.type.${item.modality}`)
      )
      modalities = [...new Set(modalities)]
      return modalities.join(', ')
    },

    formatAttendanceItem(item) {
      const newItem = { ...item }
      newItem.modality = !newItem.modality ? '' : this.$t(`attendance.type.${newItem.modality}`)
      newItem.attendance_list_date = this.formatDate(newItem.attendance_list_date)
      return newItem
    },

    getSearchParam() {
      return this.equalsProfile('student') ? 'name' : 'title'
    },
  },
})
</script>

<template>
  <div class="inner-content p-4">
    <div class="py-4">
      <FilterList>
        <Action
          v-if="hasWriteAccess"
          slot="button"
          :text="$t('classroom.attendance.list:btn.add')"
          :dark="accessibility"
          type="button"
          primary
          large
          fixed-width
          @click="openModalAddAttendanceList()"
        />

        <FilterListSearch
          slot="search"
          @search="pgtrSetSearch(getSearchParam(), $event)"
        />

        <FilterListTag
          v-if="pgtrFilterTagOptions.length"
          slot="tag"
          :tag-all-filters-active="pgtrTagAllFilters"
          :options="pgtrFilterTagOptions"
          state="Attendance"
        />

        <FilterListOrder
          slot="order"
          :options="attendanceFilterListOrderOptions"
          :on-server="true"
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <EmptyMessage v-if="Attendance.attendanceLists.length === 0">
      <template v-if="equalsProfile('student')">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p
          v-if="pgtrIsSearching"
          class="text-color"
        >
          {{ $t('global:search.empty.message') }}
        </p>
      </template>
      <template v-else>
        <h2>{{ $t('classroom.attendance.list:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.attendance.list:empty.message') }}</p>
      </template>
    </EmptyMessage>

    <div
      v-if="Attendance.attendanceLists.length"
      class="center datatable-list"
    >
      <TableDiv v-if="!equalsProfile('student')">
        <template #header>
          <TableDivLine
            v-if="!$media.mobile"
            tr
          >
            <TableDivCol
              min-width="100px"
              th
            >
              {{ $t('global:form.date') }}
            </TableDivCol>

            <TableDivCol
              min-width="120px"
              th
            >
              {{ $t('global:hour') }}
            </TableDivCol>

            <TableDivCol
              max-width="500px"
              width="100%"
              th
            >
              {{ $t('classroom.attendance.list:name') }}
            </TableDivCol>

            <TableDivCol
              min-width="100px"
              th
            >
              {{ $t('global:modality') }}
            </TableDivCol>

            <TableDivCol min-width="130px" />
          </TableDivLine>
        </template>

        <template #body>
          <template v-for="attendance in Attendance.attendanceLists">
            <TableDivAccordion
              v-if="attendance.attendance_lists.length > 1"
              :key="attendance.list_date"
            >
              <template #header>
                <TableDivLine
                  :break-on-mobile="$media.mobile"
                  no-border
                >
                  <TableDivCol
                    :label="$t('global:form.date')"
                    :enable-label="$media.mobile"
                    min-width="100px"
                    p-size
                  >
                    {{ formatDate(attendance.list_date) }}
                  </TableDivCol>

                  <TableDivCol
                    min-width="120px"
                    p-size
                  />

                  <TableDivCol
                    :label="$t('classroom.attendance.list:name')"
                    :enable-label="$media.mobile"
                    max-width="500px"
                    width="100%"
                    break-label-line
                    bolder
                    p-size
                  >
                    {{ makeAttendanceTitleCol(attendance) }}
                  </TableDivCol>

                  <TableDivCol
                    :label="$t('global:modality')"
                    :enable-label="$media.mobile"
                    min-width="100px"
                    break-label-line
                    p-size
                  >
                    {{ makeAttendanceModalityCol(attendance.attendance_lists) }}
                  </TableDivCol>

                  <TableDivCol
                    align-right
                    min-width="130px"
                    fill
                  />
                </TableDivLine>
              </template>

              <template #body>
                <AttendanceTableLine
                  v-for="item in attendance.attendance_lists"
                  :key="item.i_attendance_list"
                  :item="formatAttendanceItem(item)"
                  show-hour
                  @open-attendance-list-modal="openModalAttendanceList(item)"
                  @open-edit-modal="openModalEditAttendanceList(item)"
                  @download-attendance-list="downloadAttendanceList(item)"
                  @open-confirm-modal-remove="openConfirmModalRemoveAttendance(item)"
                />
              </template>
            </TableDivAccordion>

            <AttendanceTableLine
              v-for="item in attendance.attendance_lists"
              v-else
              :key="item.i_attendance_list"
              :item="formatAttendanceItem(item)"
              show-hour
              show-date
              @open-attendance-list-modal="openModalAttendanceList(item)"
              @open-edit-modal="openModalEditAttendanceList(item)"
              @download-attendance-list="downloadAttendanceList(item)"
              @open-confirm-modal-remove="openConfirmModalRemoveAttendance(item)"
            />
          </template>
        </template>
      </TableDiv>

      <AttendanceListStudentDatatable
        v-if="equalsProfile('student')"
        :data="pgtrCurrentData"
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <RouterView @refresh-attendance-list="pgtrRefresh"></RouterView>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/attendance_list/styles.scss';
</style>
