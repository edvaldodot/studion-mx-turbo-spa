<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'
import DataTableTd from '@/components/general/DataTableTd'
import DataTableCounter from '@/components/general/DataTableCounter'
import EmptyMessage from '@/components/general/EmptyMessage'

import Checkbox from '@/components/general/Checkbox'
import Tooltip from '@/components/general/Tooltip'
import InputField from '@/components/general/InputField'
import SessionLimit from '../SessionLimit/SessionLimit.vue'

export default defineComponent({
  name: 'SessionsDatatable',

  components: {
    DataTableTd,
    DataTableCounter,
    Datatable,
    Checkbox,
    Tooltip,
    EmptyMessage,
    InputField,
    SessionLimit,
  },

  props: {
    value: {
      type: Array,
      required: true,
    },

    dataList: {
      type: Array,
      default: () => [],
    },

    filterTool: {
      type: String,
      default: '',
    },

    showExtraForumColumns: {
      type: Boolean,
      default: false,
    },
    isForumEvaluation: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedIds: [],
    }
  },

  computed: {
    sessionsListComputed() {
      return this.filteredDataList.map((item) => {
        item.selected = this.getCheckValue(item.id)
        return item
      })
    },

    allPageItemsIsChecked() {
      let validItems = this.sessionsListComputed

      if (this.showExtraForumColumns) {
        validItems = this.sessionsListComputed.filter((item) => item.forumTool.remainingScore > 0)
      }

      const selectedList = this.sessionsListComputed.filter((i) => i.selected)
      return selectedList.length && selectedList.length === validItems.length
    },
    selectAllCheckboxItems() {
      return [
        {
          label: this.$t('global:select.all.from.page'),
          value: true,
        },
      ]
    },
    filteredDataList() {
      if (this.showExtraForumColumns) {
        return this.dataList.filter((item) => item.forumTool.isAvaliative)
      }
      return this.dataList
    },
    selectedSessions() {
      return this.sessionsListComputed.filter((session) => session.selected)
    },
    totalEnrollmentsCount() {
      return this.selectedSessions.reduce((total, session) => total + session.totalEnrollments, 0)
    },
    isConference() {
      return this.$route.name === 'management.conference.create'
    },
  },

  watch: {
    value(newValue) {
      this.selectedIds = newValue
    },
    selectedIds(newValue) {
      this.$emit('input', newValue)
      this.$emit('selected-sessions', this.selectedSessions)
    },

    allPageItemsIsChecked(newValue) {
      this.checkAll = newValue
    },
    showExtraForumColumns: {
      handler(newVal) {
        if (newVal) {
          this.removeNonAvaliativeItems()
        }
      },
      immediate: true,
    },
  },

  created() {
    this.selectedIds = this.value
  },

  methods: {
    getCheckValue(id) {
      return this.selectedIds.includes(id)
    },

    updateCheck(isCheck, item) {
      if (isCheck) {
        this.selectedIds.push(item.id)
      } else {
        this.selectedIds = this.selectedIds.filter((i) => i !== item.id)
      }
    },

    selectAllActivePage(selectAll) {
      if (!this.showExtraForumColumns) {
        const currentPageIds = this.sessionsListComputed.map((item) => item.id)

        if (selectAll) {
          this.selectedIds = Array.from(new Set([...this.selectedIds, ...currentPageIds]))
        } else {
          this.selectedIds = this.selectedIds.filter((id) => !currentPageIds.includes(id))
        }

        return
      }

      const currentPageIds = this.sessionsListComputed
        .filter((item) => item.forumTool.remainingScore > 0)
        .map((item) => item.id)

      if (selectAll) {
        this.selectedIds = [...new Set([...this.selectedIds, ...currentPageIds])]

        const allSessionsSelected = [...this.selectedSessions, ...this.sessionsListComputed]
        let filteredSelectedSessions = []

        for (let i = 0; i < this.selectedIds.length; i++) {
          const session = allSessionsSelected.find((item) => item.id === this.selectedIds[i])
          if (session && session.forumTool.remainingScore > 0) {
            filteredSelectedSessions.push(session)
          }
        }

        this.selectedIds = filteredSelectedSessions.map((session) => session.id)
      } else {
        this.selectedIds = this.selectedIds.filter((i) => !currentPageIds.includes(i))
      }
    },

    removeNonAvaliativeItems() {
      if (this.showExtraForumColumns) {
        this.selectedIds = this.selectedIds.filter((id) =>
          this.dataList.some(
            (item) => item.id === id && item.forumTool && item.forumTool.isAvaliative
          )
        )
      }
    },
    updateGrade(value, item) {
      const maxGrade = item.forumTool.remainingScore

      const adjustedValue = value > maxGrade ? maxGrade : value

      item.max_grade = adjustedValue

      this.$emit('define-grade', { value: adjustedValue, id: item.id })
    },
  },
})
</script>

<template>
  <div
    class="sessions__datatable"
    :data-testid="$testId('session-datatable')"
  >
    <div
      v-if="$media.mobile"
      class="sessions__select-all"
    >
      <Checkbox
        :key="allPageItemsIsChecked"
        :value="allPageItemsIsChecked"
        :items="selectAllCheckboxItems"
        switch-type
        dark
        @input="selectAllActivePage"
      />
    </div>

    <Datatable
      v-if="sessionsListComputed.length"
      :items="sessionsListComputed"
      dark
    >
      <template slot="thead">
        <tr v-if="!$media.mobile">
          <th
            class="th text-color"
            width="20%"
          >
            {{ $t('global:form.sessions') }}
          </th>

          <th
            class="th text-color"
            width="20%"
          >
            {{ $t('global:solutions') }}
          </th>
          <th
            class="th text-color"
            width="15%"
          >
            {{ $t('bind.sessions:modal.student.title') }}
          </th>
          <th
            class="th text-color"
            width="20%"
          >
            {{ $t('global:begin') }}
          </th>

          <th
            class="th text-color"
            width="20%"
          >
            {{ $t('global:end') }}
          </th>

          <template v-if="filterTool === 'forum' && showExtraForumColumns">
            <th class="th">
              {{ $t('classroom.forum:evaluation:modal.full.mark') }}
            </th>

            <th class="th">
              {{ $t('classroom.forum:evaluation:remaining.note') }}
            </th>

            <th class="th">
              {{ $t('classroom.forum:evaluation:bind.note') }}
            </th>
          </template>

          <th
            class="th text-color bg-black-50"
            width="5%"
          >
            <Checkbox
              :key="allPageItemsIsChecked"
              :value="allPageItemsIsChecked"
              :items="[
                {
                  value: true,
                },
              ]"
              switch-type
              class="m-3"
              @input="selectAllActivePage"
            />
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr
          :class="{
            'tr-body text-color': !$media.mobile,
            'tr-mobile text-color': $media.mobile,
          }"
        >
          <DataTableTd label="global:form.sessions">
            <Tooltip :uppercase="false">
              <template #activator="{ on }">
                <span
                  class="clamp-line"
                  v-on="on"
                >
                  {{ item.name }}
                </span>
              </template>

              <span>{{ item.name }}</span>
            </Tooltip>
          </DataTableTd>

          <DataTableTd label="global:solutions">
            <Tooltip :uppercase="false">
              <template #activator="{ on }">
                <span
                  class="clamp-line"
                  v-on="on"
                >
                  {{ item.courseName }}
                </span>
              </template>

              <span>{{ item.courseName }}</span>
            </Tooltip>
          </DataTableTd>

          <DataTableTd label="bind.sessions:modal.student.title">
            <Tooltip :uppercase="false">
              <template #activator="{ on }">
                <span
                  class="clamp-line"
                  v-on="on"
                  >{{ item.totalEnrollments }}</span
                >
              </template>
              <span>{{ item.totalEnrollments }}</span>
            </Tooltip>
          </DataTableTd>

          <DataTableTd
            label="global:begin"
            width="100"
          >
            {{ item.startTime ? formatDate(item.startTime) : '-' }}
          </DataTableTd>

          <DataTableTd
            label="global:end"
            width="100"
          >
            {{ item.endTime ? formatDate(item.endTime) : '-' }}
          </DataTableTd>

          <template v-if="filterTool === 'forum' && showExtraForumColumns">
            <DataTableTd
              label="classroom.forum:evaluation:modal.full.mark"
              width="150"
            >
              {{ item.forumTool.courseScore || '-' }}
            </DataTableTd>

            <DataTableTd
              label="classroom.forum:evaluation:remaining.note"
              width="150"
            >
              {{ item.forumTool.remainingScore || '-' }}
            </DataTableTd>

            <td class="td td__generic">
              <span
                v-if="$media.mobile"
                class="td-text-header clamp-line"
              >
                {{ $t('classroom.forum:evaluation:bind.note') }}
              </span>

              <InputField
                v-if="item.forumTool.courseScore"
                v-model="item.max_grade"
                class="grade-input"
                :min="0"
                :max="item.forumTool.remainingScore"
                :step="0.1"
                any-step
                type="number"
                hide-error-details
                dark
                @input="updateGrade($event, item)"
              />
              <span
                v-else
                class="td-text break-text clamp-line"
              >
                {{ '-' }}
              </span>
            </td>
          </template>

          <DataTableTd class="td-actions">
            <div class="custom-switch-button">
              <Tooltip
                v-if="isForumEvaluation && item.forumTool.remainingScore <= 0"
                :uppercase="false"
                :bold-font="false"
                :width="250"
                vertical-align="top"
              >
                <template #activator="{ on }">
                  <Checkbox
                    :value="item.selected"
                    :disabled="isForumEvaluation && item.forumTool.remainingScore <= 0"
                    :items="[
                      {
                        value: true,
                      },
                    ]"
                    switch-type
                    class="m-3"
                    @input="($e) => updateCheck($e, item)"
                    @mouseenter.native="on.mouseenter"
                    @mouseleave.native="on.mouseleave"
                  />
                </template>

                <span>{{ $t('management:forum.disable.checkbox.replicate') }}</span>
              </Tooltip>
              <Checkbox
                v-else
                :value="item.selected"
                :items="[
                  {
                    value: true,
                  },
                ]"
                switch-type
                class="m-3"
                @input="($e) => updateCheck($e, item)"
              />
            </div>
          </DataTableTd>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>

    <div class="sessions__datatable-bottom-content mb-5">
      <div>
        <SessionLimit
          v-if="isConference"
          class="text-color"
        />
      </div>

      <DataTableCounter
        :label="$t('bind.sessions:modal.student.count')"
        :count="totalEnrollmentsCount"
      />

      <DataTableCounter
        :label="$t('bind.sessions:modal.count')"
        :count="selectedIds.length"
      />
    </div>
  </div>
</template>

<style lang="scss">
.sessions__datatable {
  .datatable-wrapper {
    padding-bottom: 4px;

    .grade-input {
      width: 80px;
    }

    .tr-mobile {
      display: grid;
      grid-template-columns: 17% 50% auto;

      .td:first-of-type,
      .td:last-of-type,
      .td {
        border-radius: 0;
      }

      @media (max-width: 1023px) {
        .td {
          width: 100%;
          min-height: 70px;
          height: auto;
        }
        .td-text-header {
          display: block;
          font-weight: bold;
        }
      }

      .td {
        padding: 10px;
      }

      .td-actions {
        display: flex;
        width: 100%;
        margin-left: 0;
        padding-left: 0;
        grid-column: span 1;
        grid-row: span 3;
        order: -1;
        min-height: auto;
      }
    }
  }

  .sessions__select-all {
    display: flex;
    justify-content: center;

    .checkbox-form-item {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }

  &-bottom-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
}
</style>
