<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import NotificationCircle from '@/components/general/NotificationCircle'

export default defineComponent({
  name: 'DatatableDoubts',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    Dropdown,
    DropdownLink,
    NotificationCircle,
  },

  props: {
    doubts: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      numberColumns: 7,
    }
  },

  computed: {
    ...mapState(['accessibility']),
  },

  methods: {
    handleNavigation(doubts) {
      this.$router.push({
        name: 'management.doubts.unique',
        params: {
          uuid: doubts.sessionUuid,
          management: this.$route.name,
          id: doubts.id,
        },
      })
    },

    convertSatusName(status) {
      const statusMap = {
        pending_feedback: 'classroom.knowledgeBase:help.status.feedback.pending',
        pending_response: 'classroom.knowledgeBase:help.status.pending',
        closed: 'classroom.knowledgeBase:help.status.closed',
      }

      return this.$t(statusMap[status] || '')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-doubts-table')"
    class="management-doubts__table"
  >
    <template v-if="doubts.length">
      <div class="datatable__doubts">
        <Datatable
          :items="doubts"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="300"
              >
                <span class="clamp-line">
                  {{ $t('classroom.assessments.evaluation:datatable.header.11') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.assessments.evaluation:datatable.header.5')
                }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.3') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.2') }}</span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('global:form.subject') }}</span>
              </th>
              <th
                class="th"
                width="300"
              >
                <span class="clamp-line">{{ $tc('global:category', 1) }}</span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('global:status') }}</span>
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
                'new-doubts': item.status === 'pending_response',
              }"
            >
              <DataTableTd label="classroom.assessments.evaluation:datatable.header.11">
                <NotificationCircle
                  v-if="item.status === 'pending_response'"
                  class="doubts-dont-answer"
                />
                {{ formatDate(item.sendDate, 'long') }}
              </DataTableTd>

              <DataTableTd label="global:user">
                {{ item.studentName }}
              </DataTableTd>

              <DataTableTd label="community.index:modal.datatable.header.3">
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

              <DataTableTd label="community.index:modal.datatable.header.2">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
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

              <DataTableTd label="global:form.subject">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.subject }}
                    </span>
                  </template>

                  <span>{{ item.subject }}</span>
                </Tooltip>
              </DataTableTd>
              <DataTableTd :label="$tc('global:category', 1)">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.categoryName ? item.categoryName : '-' }}
                    </span>
                  </template>

                  <span>{{ item.categoryName ? item.categoryName : '-' }}</span>
                </Tooltip>
              </DataTableTd>
              <DataTableTd label="global:status">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ convertSatusName(item.status) }}
                    </span>
                  </template>

                  <span>{{ convertSatusName(item.status) }}</span>
                </Tooltip>
              </DataTableTd>

              <td class="td td-actions">
                <Dropdown icon="dots-vertical">
                  <DropdownLink
                    :text="$t('global:access')"
                    @click="handleNavigation(item)"
                  />
                </Dropdown>
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
@import './DatatableDoubts.scss';
</style>
