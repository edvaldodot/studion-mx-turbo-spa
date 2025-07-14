<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionsAnnouncement from '../ActionsAnnouncement.vue'
import announcementsMixin from '@/app/classroom/modules/panel/mixins/announcementsMixin.js'
import ModalAnnouncements from '@/app/classroom/modules/panel/pages/Announcements/ModalAnnouncements/ModalAnnouncements.vue'
const Modal = () => import('@/components/general/Modal')

export default defineComponent({
  name: 'DatatableAnnouncement',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsAnnouncement,
    ModalAnnouncements,
    Modal,
  },

  mixins: [announcementsMixin],

  props: {
    dataAnnouncement: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    ...mapState(['accessibility']),
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptAnnouncementRemoval']),

    visualizeAnnouncement(item) {
      this.$router.push({
        name: 'classroom.panel.announcements',
        params: {
          announcement_id: item.id,
          session_uuid: item.sessionUuid,
          management: this.$route.name,
        },
      })
    },

    refreshData() {
      this.$emit('refresh-data')
    },

    removeAnnouncement(item) {
      this.setFetching(true)

      const entryId = item.id

      this.attemptAnnouncementRemoval(entryId)
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.panel.announcements:feedback.removed') })
          this.refreshData()
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
    :data-testid="$testId('management-announcement-table')"
    class="management-announcement__table"
  >
    <template v-if="dataAnnouncement.length">
      <div class="datatable__announcement">
        <Datatable
          :items="dataAnnouncement"
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
                {{ formatDate(item.startTime, 'long') }}
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
                {{ $t('management:announcement.status.' + item.status) }}
              </DataTableTd>

              <td class="td td-actions">
                <ActionsAnnouncement
                  :announcement="item"
                  @visualize="visualizeAnnouncement"
                  @edit="editAnnouncement"
                  @remove="removeAnnouncement"
                />
              </td>
            </tr>
          </template>
        </Datatable>
        <modal
          :active.sync="modalAddAnnouncement"
          close-event
          @close="closeModalAddAnnouncement"
        >
          <ModalAnnouncements
            ref="modalAnnoucements"
            :announcement="formData"
            :course-name="dataAnnouncement.courseName"
            :validations="$v"
            @submit="submit"
            @add-media-file="addMediaFile"
          />
        </modal>
      </div>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableAnnouncement.scss';
</style>
