<script>
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import Datatable from '@/components/general/Datatable'
import DataTableTd from '@/components/general/DataTableTd'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

import { mapActions } from 'vuex'

export default {
  name: 'ModalListForumSessions',

  components: {
    Modal,
    ModalHeader,
    Datatable,
    DataTableTd,
    Dropdown,
    DropdownLink,
  },

  data() {
    return {
      data: [],
    }
  },

  created() {
    this.setFetching(true)
    this.attemptDiscussionRetrieval({
      sessionUuid: this.$route.params.session_uuid,
      discussionId: this.$route.params.id,
    })
      .then(({ data }) => {
        this.data = data.linkedSessions
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions(['attemptRemoveDiscussionLink', 'attemptDiscussionRetrieval', 'setFetching']),

    remove(item) {
      this.setFetching(true)
      this.attemptRemoveDiscussionLink(item.i_discussions)
        .then(() => {
          this.data = this.data.filter((i) => i.i_discussions !== item.i_discussions)
          if (this.data.length === 0) this.close()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    close() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <Modal
    active
    back
    is-page
    @close="close"
  >
    <ModalHeader
      :sub-title="$t('classroom.forum:multiple.sessions')"
      :title="$t('classroom.forum:multiple.sessions.description')"
    />

    <div class="center mt-5">
      <Datatable
        :items="data"
        dark
      >
        <template #thead>
          <tr v-if="!$media.mobile">
            <th
              class="th"
              width="50%"
            >
              <span class="clamp-line">
                {{ $t('community.users:modal.confirm.datatable.header.session') }}
              </span>
            </th>

            <th
              class="th"
              width="25%"
            >
              <span class="clamp-line">
                {{ $t('global:begin') }}
              </span>
            </th>

            <th
              class="th"
              width="25%"
            >
              <span class="clamp-line">{{ $t('global:end') }}</span>
            </th>

            <th
              class="th"
              width="25%"
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
              {{ item.session_name }}
            </DataTableTd>

            <DataTableTd label="global:end.date">
              {{ item.session_start_time ? formatDate(item.session_start_time) : '-' }}
            </DataTableTd>

            <DataTableTd label="community.index:modal.datatable.header.3">
              {{ item.session_end_time ? formatDate(item.session_end_time) : '-' }}
            </DataTableTd>

            <td class="td td-actions">
              <Dropdown icon="dots-vertical">
                <DropdownLink
                  :text="$t('classroom.conference:link.remove')"
                  @click="remove(item)"
                />
              </Dropdown>
            </td>
          </tr>
        </template>
      </Datatable>
    </div>
  </Modal>
</template>
