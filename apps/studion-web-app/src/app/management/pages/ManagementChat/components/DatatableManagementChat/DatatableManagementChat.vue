<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionsChat from '../ActionsChat'
import chatMixin from '../../mixins/chatmixin.js'

export default defineComponent({
  name: 'DatatableManagementChat',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsChat,
    ModalConfirm: () => import('@/components/general/ModalConfirm'),
    Modal: () => import('@/components/general/Modal'),
    ModalEditChat: () => import('@/components/shared/ModalEditChat'),
  },

  mixins: [chatMixin],

  props: {
    dataForum: {
      type: Array,
      default: () => [],
    },
  },

  created() {
    this.setNicknameData()
    this.isManagement = true
  },

  methods: {
    updateNickName() {
      const data = this.nicknameData

      this.$router.push({
        name: 'management.chat.nickname',
        params: {
          suggestion: data.suggestion,
          management: this.$route.name,
        },
      })
    },

    handleNavigationChat(item) {
      if (this.nicknameData.username) {
        return this.accessChatroom(item)
      }

      this.updateNickName(item)
    },

    refreshData() {
      this.$emit('refresh-data')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-chat-table')"
    class="management-chat__table"
  >
    <template v-if="dataForum.length">
      <div class="datatable__chat">
        <Datatable
          :items="dataForum"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="275"
              >
                <span class="clamp-line">
                  {{ $t('global:initial.date') }}
                </span>
              </th>

              <th
                class="th"
                width="275"
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
                <span class="clamp-line">{{ $t('classroom.chat:modal.form.title') }}</span>
              </th>
              <th
                class="th"
                width="150"
              >
                <span class="clamp-line">{{ $t('global:status') }}</span>
              </th>

              <th
                width="50px"
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

              <DataTableTd label="classroom.chat:modal.form.title">
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
                <Tooltip
                  :uppercase="false"
                  :width="150"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      {{ $t('management:chat.status.' + item.status) }}
                    </span>
                  </template>

                  <span> {{ $t('management:chat.status.' + item.status) }}</span>
                </Tooltip>
              </DataTableTd>

              <td class="td td-actions">
                <ActionsChat
                  :chat="item"
                  @visualize="handleNavigationChat"
                  @edit="editChat(item)"
                  @seemore="seeMore(item)"
                  @participate="handleNavigationChat"
                  @remove="removeConfirmationModal(item)"
                  @deactivate="activateToggle"
                  @activate="activateToggle"
                  @editNickName="updateNickName(item)"
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
      <ModalConfirm
        :title="$t('chatroom.list:modal.delete.title')"
        :active="modalConfirmDelete"
        @close="modalConfirmDelete = false"
        @confirm="remove(chat_id)"
      >
        <p class="text-color">{{ $t('chatroom.list:modal.delete.description') }}</p>
      </ModalConfirm>
      <Modal
        :active.sync="modalChatActive"
        @close="modalChatActive = false"
      >
        <ModalEditChat
          :chat="formData"
          :validations="$v"
          :is-management="true"
          :is-preview="isPreview"
          @submit="submitUpdate"
          @close="modalChatActive = false"
        />
      </Modal>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableManagementChat.scss';
</style>
