<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import CardConference from '../../components/CardConference'
import Chip from '@/components/general/Chip'
import CardFolder from '@/app/classroom/components/CardFolder'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import TopBar from '@/components/general/TopBar'

import conferenceMixin from '@/mixins/conferenceMixin'

const Modal = () => import('@/components/general/Modal')

export default {
  name: 'ConferenceRoomList',
  components: {
    Action,
    ActionSubmenu,
    Breadcrumbs,
    CardConference,
    Chip,
    FilterListSearch,
    FilterListOrder,
    CardFolder,
    EmptyMessage,
    FilterList,
    Icon,
    TopBar,
    Modal,
  },

  mixins: [conferenceMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },
  data() {
    return {
      conferenceQueryParams: {
        page: 1,
        query: {},
        order: { created_at: 'desc' },
      },
      breadcrumbsList: [
        {
          text: this.$t('global:menu.classroom.conference'),
          key: 0,
        },
      ],
      showSubmenu: false,
      modalParticipants: false,
      modalConferenceActive: false,
      allItems: [],
      modalImportActive: false,
      modalPreviewActive: false,
      modalAttachments: false,
      attachments: [],
      media: null,
      linkedMedias: [],
      selectConference: {
        title: null,
      },
      participants: [],
      items: [],
      sessionUuid: this.$route.params.session_uuid,
      modalConfirmDelete: false,
      currentFolder: {},
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'Classroom']),
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:conference')
    },
    folderId() {
      return this.$route.params.folderId
    },
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
  },
  created() {
    this.stopIdleTimer(true)
    this.$emit('change-header', {
      customClasses: { conferences_rooms: true },
    })

    if (this.folderId) {
      this.setFetching(true)
      this.attemptGetConferenceFolderById({
        sessionId: this.Classroom.data.id,
        folderId: this.folderId,
      })
        .then(({ data }) => {
          this.currentFolder = data
          if (data.parent) {
            this.addToBreadcrumbList(data.parent)
          }
          this.breadcrumbsList.push({ text: data.name, key: data.id })
        })
        .finally(() => {
          this.setFetching(false)
          this.loadConferences(this.folderId || 0)
        })
    } else {
      this.loadConferences()
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptConferenceRoomDelete',
      'attemptRemoveConferenceFolder',
      'attemptConferenceRoomRetrievalBySession',
      'attemptConferenceRoomsRecordingStatus',
      'setConferenceCurrentRecord',
      'attemptGetConferenceFolderById',
      'stopIdleTimer',
    ]),
    openSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },

    addToBreadcrumbList(folder) {
      if (folder.parent) {
        this.addToBreadcrumbList(folder.parent)
      }
      this.breadcrumbsList.push({ text: folder.name, key: folder.id })
    },

    /**
     * Show access record button
     * @param {Object} item
     */
    checkRecord(item) {
      if (!item.generateVideo) return item.conferenceRecord && item.conferenceRecord.shareUrl
      return item.video && item.video.embedLink
    },

    accessConference(conferenceRoomId, data = {}) {
      const sessionUuid = this.$route.params.session_uuid
      const config = { type: 'live', ...data }

      if (
        this.$isEnabledFeature('auto_create_conference_lessons') &&
        config.lesson &&
        config.lesson.id
      ) {
        return this.accessLesson(sessionUuid, config.lesson)
      }

      if (config.generateVideo) {
        if (config.video && config.video.success) {
          this.setConferenceCurrentRecord({
            id: config.id,
            url: config.video.embedLink,
            name: config.name,
            allowAdvance: config.allowAdvance,
          })

          return this.$router.push({
            name: 'classroom.conference.watch',
            params: { id: conferenceRoomId },
          })
        }

        return this.setFeedback({ message: this.$t('classroom.conference:recording.process') })
      }

      const shareURL = config.conferenceRecord && config.conferenceRecord.shareUrl
      if (shareURL) {
        config.type = 'external'
        config.url = shareURL
      }

      this.openConference(sessionUuid, conferenceRoomId, config)
    },

    accessLesson(session_uuid, lesson) {
      if (!lesson || !lesson.id || !session_uuid) return

      this.$router.push({
        name: 'classroom.lessons.course.type',
        params: { session_uuid, type: 'class', type_id: lesson.id },
        query: { accessType: 'recorded' },
      })
    },

    getRandomColor() {
      return 'color: #' + Math.floor(Math.random() * 16777215).toString(16)
    },
    openModalParticipants(item) {
      this.selectConference.title = item.title
      this.modalParticipants = true
    },
    closeModalParticipants() {
      this.modalParticipants = false
    },
    openModalAddConference() {
      this.$router.push({
        name: 'classroom.conference.create',
        params: { folderId: this.folderId },
      })
    },
    openModalAddFolder() {
      this.$router.push({
        name: 'classroom.conference.folder.create',
        params: { folderId: this.folderId },
      })
    },
    openModalConfirmDelete(id) {
      this.modalConfirmDelete = id
    },
    closeModalConfirmDelete() {
      this.modalConfirmDelete = false
    },
    openModalAttachments(id) {
      this.$router.push({
        name: 'classroom.conference.attachments',
        params: { id },
      })
    },
    remove(id) {
      this.setFetching(true)
      this.attemptConferenceRoomDelete(id)
        .catch(({ response }) => {
          if (response.data.message === 'conference_room_has_started') {
            this.setFeedback({
              message: this.$t(`classroom.conference:error.${response.data.message}`),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.loadConferences(this.folderId)
          this.closeModalConfirmDelete()
          this.setFetching(false)
        })
    },
    move(id) {
      this.$router.push({
        name: 'classroom.conference.move',
        params: { folderId: this.folderId, id },
      })
    },
    moveFolder(id) {
      this.$router.push({
        name: 'classroom.conference.move.folder',
        params: { folderId: this.folderId, id },
      })
    },
    edit(id) {
      this.$router.push({
        name: 'classroom.conference.edit',
        params: { id },
      })
    },
    loadConferences(folderId = 0) {
      const payload = {
        sessionUuid: this.sessionUuid,
        folder: folderId || null,
        query: this.conferenceQueryParams,
      }
      this.setFetching(true)
      this.attemptConferenceRoomRetrievalBySession(payload)
        .then(({ data }) => {
          this.items = data[0]
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    refreshAction(id) {
      this.setFetching(true)
      this.attemptConferenceRoomsRecordingStatus(id)
        .then(({ data }) => {
          if (!data) {
            this.setFeedback({ message: this.$t('classroom.conference:recording.process') })
          } else this.loadConferences(this.folderId)
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: this.$t(`classroom.conference:recording.error:${response.data.message}`),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openFolder(folder) {
      this.$router.replace({
        name: 'classroom.conference',
        params: { folderId: folder.id || null },
      })
      this.breadcrumbsList.push({ text: folder.name, key: folder.id })
      this.loadConferences(folder.id)
    },
    goToFolder(folderId) {
      this.$router.replace({ name: 'classroom.conference', params: { folderId: folderId || null } })
      const index = this.breadcrumbsList.findIndex((breadcrumb) => breadcrumb.key === folderId)
      if (this.breadcrumbsList.length > 1) {
        this.breadcrumbsList = this.breadcrumbsList.slice(0, index + 1)
      }
      this.loadConferences(folderId)
    },
    deleteFolder(folder) {
      this.setFetching(true)
      this.attemptRemoveConferenceFolder({ id: folder.id })
        .then(() => {
          this.setFeedback({ message: this.$t('library:feedback.delete.folder') })
          this.loadConferences(this.folderId)
        })
        .catch(({ response }) => {
          if (response.data.message === 'has_conferences_in_folder') {
            this.setFeedback({
              message: this.$t('library:feedback.delete.folder.has_conferences'),
              type: 'error',
            })
            return
          }

          this.setFeedback({
            message: this.$t('library:feedback.delete.folder.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    openModalEditFolder(folder) {
      const params = {
        session_uuid: this.$route.params.session_uuid,
        folderId: this.currentFolderId,
        id: folder.id,
      }
      this.$router.push({ name: 'classroom.conference.folder.edit', params })
    },
    filterSearch(search) {
      this.$set(this.conferenceQueryParams.query, 'name', search)
      this.goToFolder(this.folderId)
    },

    filterOrder(orderItem) {
      this.conferenceQueryParams.order = {}
      this.$set(
        this.conferenceQueryParams.order,
        orderItem && orderItem.property,
        orderItem && orderItem.type
      )
      this.loadConferences(this.folderId)
    },
  },
}
</script>

<template>
  <div class="inner-content">
    <TopBar v-if="$route.params.management">
      <Action
        icon="keyboard_backspace"
        :text="$t('management:back.to.management')"
        icon-size="small"
        type="button"
        flat
        @click="$router.push({ name: 'management.conference' })"
      />
    </TopBar>

    <breadcrumbs
      highlight-current
      clickable
      class="center library__breadcrumbs"
      :breadcrumbs-list="breadcrumbsList"
      :dark="accessibility"
      size="large"
      @click="goToFolder"
    />

    <div class="p-4">
      <FilterList>
        <ActionSubmenu
          v-if="hasWriteAccess"
          slot="button"
          :show.sync="showSubmenu"
        >
          <Action
            v-if="hasWriteAccess"
            slot="button"
            type="button"
            primary
            large
            fixed-width
            :text="$t('classroom.conference:btn.add')"
            :dark="accessibility"
            @click="openSubmenu()"
          />
          <template slot="actions">
            <Action
              :text="$t('solutions:tools.conference')"
              dark
              secondary
              small
              type="button"
              @click="openModalAddConference()"
            />
            <Action
              :text="$t('library:modal.title.add.folder')"
              dark
              secondary
              small
              type="button"
              @click="openModalAddFolder()"
            />
          </template>
        </ActionSubmenu>
        <FilterListOrder
          slot="order"
          :on-server="true"
          :options="filterListOrderOptions"
          @update-orders="filterOrder"
        />

        <FilterListSearch
          slot="search"
          ref="filterlistsearch"
          :dark="accessibility"
          @search="filterSearch"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <EmptyMessage v-if="items.length === 0 && !isStudent()">
        <h2>{{ $t('classroom.conference:empty.title:admin') }}</h2>
        <p class="text-color">{{ $t('classroom.conference:empty.message:admin') }}</p>
      </EmptyMessage>
      <EmptyMessage v-if="items.length === 0 && isStudent()">
        <h2>{{ $t('classroom.conference:empty.title:student') }}</h2>
        <p class="text-color">{{ $t('classroom.conference:empty.message:student') }}</p>
      </EmptyMessage>
    </div>

    <div class="center">
      <div class="conference-list">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="conference-list-card-wrapper"
        >
          <template v-if="item.vendorConferencesRoomsId">
            <Chip
              v-if="item.multipleSessions && !isStudent()"
              :text="$t('classroom.conference:multiple')"
              color="success"
            />
            <CardConference
              :id="item.id"
              :key="item.id"
              :active="item.active"
              :name="item.name"
              :start-time="item.schedulePeriod.start"
              :end-time="item.schedulePeriod.end"
              :total-participants="item.totalParticipants"
              :thumbnail="item.image"
              :url="item.url"
              :has-attachments="item.hasAttachments"
              :early-access="Number(item.earlyAccess)"
              :recording-password="item.conferenceRecord && item.conferenceRecord.password"
              :recording-url="checkRecord(item)"
              :lesson="item.lesson"
              :mandatory="item.mandatory"
              :show-passwd="!item.generateVideo"
              :multiple-sessions="item.multipleSessions"
              :item="item"
              @remove="openModalConfirmDelete(item.id)"
              @edit="edit(item.id, index)"
              @move="move(item.id)"
              @activate="activate(item.id, index)"
              @deactivate="deactivate(item.id, index)"
              @bookmark="bookmarkItem(index)"
              @access="accessConference(item.id)"
              @access-recorded="accessConference(item.id, item)"
              @openParticipants="openModalParticipants(item)"
              @openAttachments="openModalAttachments(item.id, item.name)"
              @refreshAction="refreshAction(item.id)"
            />
          </template>

          <CardFolder
            v-else
            :key="index"
            :name="item.name"
            :description="item.description"
            @move="moveFolder(item.id)"
            @open="openFolder(item)"
            @delete="deleteFolder(item)"
            @edit="openModalEditFolder(item)"
          />
        </div>
      </div>
    </div>

    <Modal :active.sync="modalParticipants">
      <div class="modal-content">
        <span class="modal-subtitle">{{ selectConference.title }}</span>
        <h2 class="modal-title text-color">{{ $t('classroom.conference:modal.participants.title') }}</h2>
        <div class="modal-conference-participants">
          <div
            v-for="(user, index) in participants"
            :key="index"
            class="modal-conference-user"
          >
            <div class="modal-conference-user-image-wrapper">
              <img
                v-if="user.image"
                :src="user.image"
                :alt="user.name"
              />
              <Icon
                v-else
                name="account_circle"
                :style="getRandomColor()"
              />
            </div>
            <span class="modal-conference-user-name">{{ user.name }}</span>
            <span class="modal-conference-user-status">{{ user.status }}</span>
          </div>
        </div>
      </div>
    </Modal>

    <Modal
      :active="!!modalConfirmDelete"
      :cancel="false"
      :close-event="true"
      @close="closeModalConfirmDelete"
    >
      <div class="modal-confirm">
        <Action
          class="btn-close"
          icon="close"
          icon-size="medium"
          type="button"
          @click="closeModalConfirmDelete()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('community.index:modal.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('classroom.conference:confirm.delete') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <Action
            :dark="accessibility"
            :text="$t('global:confirm')"
            flat
            type="button"
            @click="remove(modalConfirmDelete)"
          />
          <Action
            :dark="accessibility"
            :text="$t('global:cancel')"
            class="btn-cancel"
            flat
            type="button"
            @click="closeModalConfirmDelete()"
          />
        </div>
      </div>
    </Modal>

    <router-view @conference-saved="loadConferences($route.params.folderId)"></router-view>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/conferences_rooms/styles.scss';
</style>
