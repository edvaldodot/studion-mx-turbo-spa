<script>
import { defineComponent } from 'vue'
import { format, parseISO } from 'date-fns'
import { mapActions, mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionsPoll from '../ActionsPoll.vue'

export default defineComponent({
  name: 'DatatablePoll',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsPoll,
  },

  props: {
    polls: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['accessibility']),
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptPollQuestionListRemoval']),

    accessPoll(poll) {
      this.$router.push({
        name: `classroom.poll.${poll.status === 'closed' ? 'ended' : 'active'}`,
        params: {
          session_uuid: poll.sessionUuid,
          management: this.$route.name,
          pollId: poll.id,
        },
      })
    },

    editPoll(poll) {
      this.$router.push({
        name: `classroom.poll.add`,
        params: {
          session_uuid: poll.sessionUuid,
          management: this.$route.name,
          poll: {
            id: poll.id,
            description: poll.question,
            start_time: format(parseISO(poll.startTime), 'yyyy-MM-dd HH:mm:ss'),
            end_time: format(parseISO(poll.endTime), 'yyyy-MM-dd HH:mm:ss'),
            multiples_choices: poll.multipleChoice ? 1 : 0,
            choices: poll.choices,
          },
        },
      })
    },

    removePoll(poll) {
      this.setFetching(true)

      this.attemptPollQuestionListRemoval(poll.id)
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.poll:feedback.removed.success') })
          this.$emit('refresh')
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.poll:feedback.removed.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-polls-table')"
    class="management-polls__table"
  >
    <template v-if="polls.length">
      <div class="datatable__polls">
        <Datatable
          :items="polls"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="170"
              >
                <span class="clamp-line">{{ $t('global:initial.date') }}</span>
              </th>

              <th
                class="th"
                width="130"
              >
                <span class="clamp-line">{{ $t('global:end.date') }}</span>
              </th>

              <th class="th">
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.3') }}</span>
              </th>

              <th class="th">
                <span class="clamp-line">{{ $t('community.index:modal.datatable.header.2') }}</span>
              </th>

              <th class="th">
                <span class="clamp-line">{{ $t('global:form.question') }}</span>
              </th>

              <th
                class="th"
                width="95"
              >
                <span class="clamp-line">{{ $t('global:votes') }}</span>
              </th>

              <th
                class="th"
                width="130"
              >
                <span class="clamp-line">{{ $t('global:status') }}</span>
              </th>

              <th
                width="10"
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
              }"
            >
              <DataTableTd label="global:initial.date">
                {{ item.startTime ? formatDate(item.startTime, 'long') : '-' }}
              </DataTableTd>

              <DataTableTd label="global:end.date">
                {{ item.endTime ? formatDate(item.endTime, 'long') : '-' }}
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

              <DataTableTd label="global:form.question">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.question }}
                    </span>
                  </template>

                  <span>{{ item.question }}</span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="global:votes">
                <span>{{ item.votes || 0 }}</span>
              </DataTableTd>

              <DataTableTd label="global:status">
                <span>{{ $t('management:polls.status.' + item.status) }}</span>
              </DataTableTd>

              <td class="td td-actions">
                <ActionsPoll
                  :poll="item"
                  @access="accessPoll"
                  @edit="editPoll"
                  @remove="removePoll"
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
@import './DatatablePoll.scss';
</style>
