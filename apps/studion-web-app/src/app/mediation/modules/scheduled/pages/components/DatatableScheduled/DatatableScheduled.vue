<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import Icon from '@/components/general/Icon'
import ActionsScheduled from '../ActionsScheduled'

export default defineComponent({
  name: 'DatatableScheduled',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsScheduled,
    Icon,
  },

  props: {
    dataSchedule: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState(['accessibility', 'Classroom', 'forums']),

    mappedDataSchedule() {
      return this.dataSchedule.map((item, index) => {
        return {
          ...item,
          uuid: `${item.sessionId}-${item.id}-${index}`,
        }
      })
    },

    sendThLabel() {
      return this.$t(
        `mediation:scheduled.action.header.1${
          ['email', 'sms'].includes(this.type) ? '.variation' : ''
        }`
      )
    },
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDiscussionRemoval',
      'attemptDiscussionStatusToggle',
    ]),
    seeActions(item) {
      this.$router.push({
        name: 'mediation.actions.day',
        params: {
          id: item.mediationPlanId,
          day: item.daysSinceReferenceDate,
          scheduled: this.$route.name,
        },
      })
    },

    reportAction(item) {
      this.$router.push({
        name: 'mediation.link.report',
        params: {
          session_id: item.sessionId,
          id: item.mediationPlanId,
          scheduled: this.$route.name,
        },
      })
    },
    previewAction(item) {
      this.$router.push({
        name: `${item.transmissionType}.preview`,
        params: {
          id: item.id,
          title: item.action,
          startDate: item.dateMediation ? item.dateMediation : null,
        },
      })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('scheduled-table')"
    class="scheduled__table"
  >
    <template v-if="dataSchedule.length">
      <div class="datatable__scheduled">
        <Datatable
          :items="mappedDataSchedule"
          :dark="accessibility"
          item-identifier="uuid"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ sendThLabel }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('mediation:scheduled.action.header.2') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('mediation:scheduled.action.header.3') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('mediation:scheduled.action.header.4') }}</span>
              </th>

              <th
                width="75px"
                class="th"
              ></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr
              :class="{
                'tr-body': !$media.mobile,
                'tr-mobile': $media.mobile,
                'new-message': !item.seenAt,
              }"
            >
              <DataTableTd
                v-if="item.dateMediation"
                :label="sendThLabel"
              >
                {{ formatDate(item.dateMediation) }} {{ item.triggerTime }}
              </DataTableTd>
              <DataTableTd
                v-else
                :label="sendThLabel"
              >
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      <span> - </span>
                      <Icon
                        name="help"
                        class="question-feedback-icon"
                        size="small"
                        wrapper
                      />
                    </span>
                  </template>

                  <span>
                    {{ $t('mediation:scheduled.td.tooltip') }}
                  </span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="mediation:scheduled.action.header.2">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.sessionName }}
                    </span>
                  </template>

                  <span>{{ item.sessionName }}</span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="mediation:scheduled.action.header.3">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.action }}
                    </span>
                  </template>

                  <span>
                    <span>{{ item.action }}</span>
                  </span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="mediation:scheduled.action.header.4">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
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
              <td class="td td-actions">
                <ActionsScheduled
                  :scheduled="item"
                  @see="seeActions"
                  @report="reportAction"
                  @preview="previewAction"
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableScheduled.scss';
</style>
