<script>
import lodash from 'lodash'
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'
import { format, parseISO, isBefore, isAfter, set, isEqual } from 'date-fns'

import Datatable from '@/components/general/Datatable'
import DataTableTd from '@/components/general/DataTableTd'
import Checkbox from '@/components/general/Checkbox'
import Datepicker from '@/components/general/Datepicker'
import EmptyMessage from '@/components/general/EmptyMessage'
import DataTableCounter from '@/components/general/DataTableCounter'
import Tooltip from '@/components/general/Tooltip'

import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

export default defineComponent({
  name: 'DataTableBatchDate',

  components: {
    Datatable,
    DataTableTd,
    Checkbox,
    Datepicker,
    EmptyMessage,
    DataTableCounter,
    Tooltip,
  },

  mixins: [formScrollValidationMixin],

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      selectedAll: false,
      dataList: [],
    }
  },

  validations: {
    dataList: {
      $each: {
        initial: {
          required: requiredIf(function (item) {
            return item && item.selected === true
          }),
          sessionPeriod(_, n) {
            if (n && n.initial)
              return (
                isAfter(parseISO(n.initial), parseISO(n.sessionStartDate)) &&
                isBefore(parseISO(n.initial), parseISO(n.sessionEndDate))
              )
            else return true
          },
        },

        end: {
          required: requiredIf(function (item) {
            return item && item.selected === true
          }),
          sessionPeriod(_, n) {
            if (n && n.end) {
              const endDate = set(parseISO(n.end), { seconds: 0, milliseconds: 0 })
              const sessionEndDate = set(parseISO(n.sessionEndDate), {
                seconds: 0,
                milliseconds: 0,
              })
              return (
                isAfter(parseISO(n.end), parseISO(n.sessionStartDate)) &&
                (isBefore(endDate, sessionEndDate) || isEqual(endDate, sessionEndDate))
              )
            } else return true
          },
          endNeedBeAfterThanInitial(_, n) {
            if (n && n.initial && n.end) return isAfter(parseISO(n.end), parseISO(n.initial))
            return true
          },
        },
      },
    },
  },

  computed: {
    ...mapState(['accessibility']),

    selectedSessions() {
      return this.dataList.filter((i) => i.selected)
    },
  },

  watch: {
    items(newItems) {
      this.selectedAll = false
      this.dataList = []

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i]
        this.dataList.push({
          ...lodash.clone(item),
          initial: item.schedulePeriodStart || null,
          end: item.schedulePeriodEnd || null,
          selected: false,
        })
      }
    },
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptPostTopicPeriodsSchedulesMass']),

    verifySelectAll(selected) {
      if (selected === false) {
        this.selectedAll = false
        return
      }

      this.$nextTick(() => {
        if (this.selectedSessions.length === this.dataList.length) this.selectedAll = true
      })
    },

    sessionDate(date) {
      if (!date) return '-'
      return format(parseISO(date), 'dd/MM/yyyy')
    },

    updateSelected(event, item) {
      this.verifySelectAll(event.checked)
      this.handleItemDate(item, event.checked)
    },

    toggleAll(event) {
      const selected = event.checked

      for (let i = 0; i < this.dataList.length; i++) {
        const item = this.dataList[i]

        if (item.sessionStartDate && item.sessionEndDate) item.selected = selected

        if (selected === false) {
          item.initial = item.schedulePeriodStart
          item.end = item.schedulePeriodEnd
        }
      }
    },

    handleItemDate(itemToUpdate, selected) {
      if (selected === true) return

      for (let i = 0; i < this.dataList.length; i++) {
        const item = this.dataList[i]

        if (item.sessionId === itemToUpdate.sessionId) {
          item.initial = item.schedulePeriodStart
          item.end = item.schedulePeriodEnd
          break
        }
      }
    },

    setDatePeriod(initialDate = null, endDate = null) {
      for (let i = 0; i < this.dataList.length; i++) {
        if (this.dataList[i].selected) {
          if (initialDate) this.dataList[i].initial = initialDate
          if (endDate) this.dataList[i].end = endDate
        }
      }
    },

    getSubmitPayload() {
      const list = []

      for (let i = 0; i < this.dataList.length; i++) {
        const item = this.dataList[i]

        if (item.selected && item.initial && item.end) {
          list.push({
            active: true,
            session_id: item.sessionId,
            start_time: item.initial + ':00',
            end_time: item.end + ':00',
          })
        }
      }

      return list
    },

    async submit() {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      const payload = this.getSubmitPayload()

      if (payload.length === 0) {
        this.$emit('close')
        return
      }

      try {
        this.setFetching(true)

        await this.attemptPostTopicPeriodsSchedulesMass({
          topicId: this.$route.params.topicId,
          data: payload,
        })

        this.setFeedback({
          message: this.$t('community.sessions.timeline.dropdown:batch.success.message'),
        })

        this.$emit('close')
      } finally {
        this.setFetching(false)
      }
    },
  },
})
</script>
<template>
  <div class="batch-data__table">
    <template v-if="items.length">
      <div class="datatable__batch__data">
        <Datatable
          :items="dataList"
          dark
        >
          <template slot="thead">
            <span v-if="$media.mobile">
              <Checkbox
                v-model="selectedAll"
                :items="[
                  {
                    value: true,
                    label: $t('global:form.select.all'),
                  },
                ]"
                switch-type
                dark
                @change="toggleAll"
              />
            </span>
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="20"
              >
                <span>
                  <Checkbox
                    v-model="selectedAll"
                    :items="[
                      {
                        value: true,
                      },
                    ]"
                    switch-type
                    dark
                    @change="toggleAll"
                  />
                </span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('global:form.sessions') }} </span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('global:offerings') }} </span>
              </th>
              <th
                class="th"
                width="180"
              >
                <span class="clamp-line">
                  {{ $t('community.sessions.timeline.dropdown:batch:date.session') }}
                </span>
              </th>
              <th
                class="th"
                width="200"
              >
                <span class="clamp-line">
                  {{ $t('community.sessions.timeline.dropdown:batch:date.start.class') }}</span
                >
              </th>
              <th
                class="th"
                width="200"
              >
                <span class="clamp-line">
                  {{ $t('community.sessions.timeline.dropdown:batch:date.end.class') }}</span
                >
              </th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item, index }"
          >
            <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
              <td class="td td-actions">
                <Checkbox
                  v-model="item.selected"
                  :items="[
                    {
                      value: true,
                    },
                  ]"
                  :disabled="!item.sessionStartDate || !item.sessionEndDate"
                  switch-type
                  dark
                  @change="updateSelected($event, item)"
                />
              </td>

              <DataTableTd label="global:form.sessions">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="session-titles clamp-line"
                      v-on="on"
                    >
                      {{ item.sessionName }}
                    </span>
                  </template>

                  <span>{{ item.sessionName }}</span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="global:offerings">
                <Tooltip
                  v-if="item.offeringName"
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="session-titles clamp-line"
                      v-on="on"
                    >
                      {{ item.offeringName }}
                    </span>
                  </template>

                  <span>{{ item.offeringName }}</span>
                </Tooltip>

                <span
                  v-else
                  class="session-titles clamp-line"
                >
                  {{ '-' }}
                </span>
              </DataTableTd>

              <DataTableTd label="community.sessions.timeline.dropdown:batch:date.session">
                <div class="session-dates">
                  <div>{{ sessionDate(item.sessionStartDate) }}</div>
                  <div>{{ sessionDate(item.sessionEndDate) }}</div>
                </div>
              </DataTableTd>

              <td class="td td-actions generic td-datepicker">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line"
                >
                  {{ $t('community.sessions.timeline.dropdown:batch:date.start.class') }}
                </span>

                <Datepicker
                  v-if="item.sessionStartDate && item.sessionEndDate"
                  v-model="item.initial"
                  :label="$t('global:form.start')"
                  :floating-label="false"
                  :disabled="!item.selected"
                  :validation="$v.dataList.$each[index].initial"
                  time
                  dark
                />
              </td>

              <td class="td td-actions generic td-datepicker">
                <span
                  v-if="$media.mobile"
                  class="td-text-header clamp-line"
                >
                  {{ $t('community.sessions.timeline.dropdown:batch:date.end.class') }}
                </span>

                <Datepicker
                  v-if="item.sessionStartDate && item.sessionEndDate"
                  v-model="item.end"
                  :label="$t('global:form.closure')"
                  :floating-label="false"
                  :disabled="!item.selected"
                  :validation="$v.dataList.$each[index].end"
                  time
                  dark
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('community.sessions.timeline.dropdown:batch.empty') }}</h2>
    </EmptyMessage>

    <DataTableCounter
      :label="$t('community.sessions.timeline.dropdown:batch:date.selected.class')"
      :count="selectedSessions.length"
    />
  </div>
</template>
<style lang="scss">
@import './DataTableBatchData.scss';
</style>
