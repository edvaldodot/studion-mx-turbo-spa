<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionForum from '../ActionsForums'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default defineComponent({
  name: 'DatatableMagementForum',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionForum,
    ModalConfirm,
  },

  props: {
    dataForum: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      modalConfirmData: null,
    }
  },

  computed: {
    ...mapState(['accessibility', 'Classroom', 'forums']),
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDiscussionRemoval',
      'attemptDiscussionStatusToggle',
    ]),
    handleNavigationForum(item) {
      this.$router.push({
        name: 'classroom.forum.discussion',
        params: {
          session_uuid: item.session_uuid,
          id: item.i_discussions,
          management: this.$route.name,
        },
      })
    },

    handleNavigationEvaluationStudent(item) {
      this.$router.push({
        name: 'classroom.forum.evaluation',
        params: {
          session_uuid: item.session_uuid,
          id: item.i_discussions,
          management: this.$route.name,
        },
      })
    },
    activateToggle(item) {
      this.setFetching(true)
      this.attemptDiscussionStatusToggle({
        sessionUuid: item.session_uuid,
        discussionId: item.i_discussions,
      })
        .then(() => {
          this.setFeedback({
            message:
              item.status !== 'active'
                ? this.$t('classroom.forum:feedback:activated')
                : this.$t('classroom.forum:feedback:deactivated'),
          })
          this.refreshData()
        })
        .catch(({ response }) => {
          const message = response.data.message

          if (message === 'max_grade_exceeds_remaining_score') {
            this.setFeedback({
              message: this.$t('classroom.forum:evaluaton:feedback:' + message),
              type: 'error',
            })
          }

          this.setFeedback({ message: this.$t(message) })
        })
        .finally(() => {
          this.setFetching(false)
          this.modalConfirmData = null
        })
    },
    editForum(item) {
      this.$router.push({
        name: 'classroom.forum.edit',
        params: {
          id: item.i_discussions,
          session_uuid: item.session_uuid,
          management: this.$route.name,
        },
      })
    },
    remove(item) {
      this.setFetching(true)
      this.attemptDiscussionRemoval({
        sessionUuid: item.session_uuid,
        discussionId: item.i_discussions,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.forum:feedback:removed') })
          this.refreshData()
        })
        .catch(({ response }) => {
          this.setFeedback({ message: this.$t(response.data.message) })
        })
        .finally(() => {
          this.setFetching(false)
          this.modalConfirmData = null
        })
    },
    refreshData() {
      this.$emit('refresh-data')
    },
    confirmHandler(item, next, action) {
      if (!item.is_multiple) return next(item)
      this.modalConfirmData = { ...item, action }
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-forum-table')"
    class="management-forum__table"
  >
    <template v-if="dataForum.length">
      <div class="datatable__forum">
        <Datatable
          :items="dataForum"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('global:initial.date') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('global:end.date') }}
                </span>
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
                <span class="clamp-line">{{ $t('global:form.title') }}</span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{ $t('classroom.forum:interaction:comments') }}</span>
              </th>

              <th
                class="th"
                width="150"
              >
                <span class="clamp-line">{{ $t('global:session.multiple') }}</span>
              </th>

              <th
                class="th"
                width="150"
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
                'new-message': !item.seenAt,
              }"
            >
              <DataTableTd label="global:initial.date">
                {{ formatDate(item.start_time, 'long') }}
              </DataTableTd>

              <DataTableTd label="global:end.date">
                {{ item.end_time ? formatDate(item.end_time, 'long') : '-' }}
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
                      {{ item.session_name }}
                    </span>
                  </template>

                  <span>{{ item.session_name }}</span>
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
                      {{ item.course_name }}
                    </span>
                  </template>

                  <span>{{ item.course_name }}</span>
                </Tooltip>
              </DataTableTd>

              <DataTableTd label="global:form.title">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ item.title }}
                    </span>
                  </template>

                  <span>{{ item.title }}</span>
                </Tooltip>
              </DataTableTd>
              <DataTableTd label="global:status">
                {{ item.total_comments }}
              </DataTableTd>

              <DataTableTd label="global:status">
                {{ item.is_multiple ? $t('global:yes') : $t('global:no') }}
              </DataTableTd>

              <DataTableTd label="global:status">
                {{ $t('management:forum.status.' + item.status) }}
              </DataTableTd>

              <td class="td td-actions">
                <ActionForum
                  :forum="item"
                  @visualize="handleNavigationForum"
                  @edit="confirmHandler(item, editForum, 'edit')"
                  @participate="handleNavigationForum"
                  @avaliative="handleNavigationEvaluationStudent"
                  @remove="confirmHandler(item, remove, 'remove')"
                  @deactivate="confirmHandler(item, activateToggle, 'deactivate')"
                  @activate="confirmHandler(item, activateToggle, 'activate')"
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

    <ModalConfirm
      v-if="!!modalConfirmData"
      :title="$t(`classroom.forum:multiple.${modalConfirmData.action}.title`)"
      active
      @confirm="
        modalConfirmData.action === 'edit'
          ? editForum(modalConfirmData)
          : modalConfirmData.action === 'remove'
          ? remove(modalConfirmData)
          : activateToggle(modalConfirmData)
      "
      @close="modalConfirmData = null"
    >
      <p>{{ $t(`classroom.forum:multiple.${modalConfirmData.action}.description`) }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './DatatableMagementForum.scss';
</style>
