<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionsMessages from '../ActionsMessages.vue'
import NotificationCircle from '@/components/general/NotificationCircle'

export default defineComponent({
  name: 'DatatableEvaluations',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsMessages,
    NotificationCircle,
  },

  props: {
    messages: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['accessibility']),
  },

  methods: {
    accessMessage(message) {
      this.$router.push({
        name: 'classroom.messages.view',
        params: {
          interaction_id: message.messageInteractionId,
          session_uuid: message.uuid,
          type: 'inbox',
          management: this.$route.name,
        },
      })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-messages-table')"
    class="management-messages__table"
  >
    <template v-if="messages.length">
      <div class="datatable__messages">
        <Datatable
          :items="messages"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="275"
              >
                <span class="clamp-line">
                  {{ $t('management:messages.receipt.date') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('global:user') }}</span>
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
              <DataTableTd label="management:messages.receipt.date">
                <NotificationCircle
                  v-if="!item.seenAt"
                  class="datatable__notification-circle"
                />
                <span>
                  {{ formatDate(item.creationTime, 'long') }}
                </span>
              </DataTableTd>

              <DataTableTd label="global:user">
                {{ item.userName }}
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
                      {{ item.solutionName }}
                    </span>
                  </template>

                  <span>{{ item.solutionName }}</span>
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

              <td class="td td-actions">
                <ActionsMessages
                  :message="item"
                  @access="accessMessage"
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
@import './DatatableMessages.scss';
</style>
