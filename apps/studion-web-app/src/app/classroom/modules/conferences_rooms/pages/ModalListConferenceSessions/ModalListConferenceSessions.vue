<script>
import Modal from '@/components/general/Modal'
import ModalHeader from '@/components/general/ModalHeader'
import Datatable from '@/components/general/Datatable'
import DataTableTd from '@/components/general/DataTableTd'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

import { mapActions } from 'vuex'

export default {
  name: 'ModalListConferenceSessions',

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
    this.attemptConferenceRoomRetrieval(this.$route.params.id)
      .then(({ data }) => {
        this.data = data.linkedSessions
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions(['attemptConferenceRoomRetrieval', 'attemptConferenceRoomDelete', 'setFetching']),

    remove(item) {
      this.setFetching(true)
      this.attemptConferenceRoomDelete(item.i_conferences_rooms)
        .then(() => {
          this.data = this.data.filter((i) => i.i_conferences_rooms !== item.i_conferences_rooms)
          if (this.data.length === 0) this.$router.push(this.$route.meta.modalCloseLink)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <Modal
    active
    back
    is-page
  >
    <ModalHeader
      :title="$t('classroom.conference:multiple.sessions.title')"
      :sub-title="$t('classroom.conference:multiple.sessions.description')"
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
              {{ item.start_time ? formatDate(item.start_time) : '-' }}
            </DataTableTd>

            <DataTableTd label="community.index:modal.datatable.header.3">
              {{ item.end_time ? formatDate(item.end_time) : '-' }}
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

<style lang="scss" scoped></style>
