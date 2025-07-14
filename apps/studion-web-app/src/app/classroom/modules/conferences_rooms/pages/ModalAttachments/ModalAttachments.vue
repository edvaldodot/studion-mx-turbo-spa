<template>
  <div>
    <modal
      v-show="!modalImportActive"
      class="modal-attachments"
      is-page
      :active="true"
      @close="goToConferencesList()"
    >
      <div class="modal-form modal-add-session">
        <span class="modal-subtitle">{{ $tc('global:attachment', 2) }}</span>
        <h2 class="modal-title text-color">{{ currentConferenceName }}</h2>
        <div class="modal-description text-color">
          <p v-if="!isStudent()">{{ $t('classroom.conference:attachment.add.edit') }}</p>
        </div>
      </div>

      <filter-list>
        <action
          v-if="!isStudent()"
          slot="button"
          :text="$t('classroom.library:modal.import.media')"
          type="button"
          flat
          large
          fixed-width
          dark
          @click="openModalImportMedia"
        ></action>
      </filter-list>

      <datatable
        class="mt-5"
        :items="linkedMedias"
        dark
      >
        <template slot="thead">
          <tr>
            <th
              class="th"
              width="60%"
            >
              {{ $tc('global:attachment', 1) }}
            </th>
            <th
              class="th"
              width="30%"
            >
              {{ $t('global:size') }}
            </th>
            <th
              class="th"
              width="10%"
            ></th>
            <th class="th"></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr class="tr-colspan">
            <td class="td">
              <span class="td-text">{{ props.item.title }}</span>
            </td>
            <td class="td">
              <span class="td-text">{{
                props.item.metaType !== 'external_link'
                  ? props.item.size
                  : $t('global:external.media')
              }}</span>
            </td>
            <td class="td">
              <action
                v-if="props.item.metaType !== 'external_link'"
                type="button"
                :text="$t('global:download')"
                flat
                dark
                @click="downloadMedia(props.item)"
              ></action>
              <action
                v-else
                type="link"
                :text="$t('global:access')"
                :url="props.item.url"
                target="_blank"
                flat
                dark
              ></action>
            </td>
            <td class="td">
              <dropdown
                icon="dots-vertical"
                icon-size="medium"
                right
              >
                <dropdown-link
                  :text="$t('classroom.conference:link.remove')"
                  @click="removeLink(props.item)"
                ></dropdown-link>
              </dropdown>
            </td>
          </tr>
        </template>
      </datatable>
    </modal>

    <modal-import-media
      v-if="modalImportActive"
      :linked-medias="linkedMedias"
      :title="currentConferenceName"
      @submited="linkMedias"
      @close="closeModalImportMedia"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { formatFileSize } from '@/support/utils/storageUnit'
import { fileTypes } from '@/domains/library/support/fileTypes'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import Modal from '@/components/general/Modal'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import FilterList from '@/components/general/FilterList'
import { downloadFileMixin } from '@/mixins/downloadFileMixin.js'

const ModalImportMedia = () => import('../../components/ModalImportMedia/ModalImportMedia')

export default {
  name: 'ModalAttachments',
  components: {
    Action,
    Datatable,
    Modal,
    ModalImportMedia,
    Dropdown,
    DropdownLink,
    FilterList,
  },
  mixins: [downloadFileMixin],

  props: {
    id: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      modalImportActive: false,
      library_files: [],
      linkedMedias: null,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account']),
    currentConferenceName() {
      const conference = this.$store.getters.getConferenceById(this.id)
      if (conference) {
        return conference.name
      }

      return ''
    },
  },
  created() {
    this.loadLinkedMedias()
  },
  methods: {
    ...mapActions([
      'setFetching',
      'attemptConferenceRoomUpdate',
      'attemptConferenceMediasList',
      'attemptDownloadLibraryFileRetrieval',
      'attemptClassroomDownloadLibraryFile',
    ]),
    loadLinkedMedias() {
      this.setFetching(true)
      this.attemptConferenceMediasList(this.id)
        .then(({ data: response }) => {
          this.linkedMedias = response.data.map((media) => {
            return this.fileFormat(media)
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    linkMedias(newMedias) {
      this.setFetching(true)
      this.attemptConferenceRoomUpdate({
        conferenceRoomId: this.id,
        data: {
          library_files: newMedias.map((item) => item.id),
        },
      })
        .then(() => {
          this.linkedMedias = newMedias
          this.closeModalImportMedia()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    removeLink(media) {
      this.library_files = this.linkedMedias.map((item) => item.id)
      let idx = this.library_files.indexOf(media.id)
      this.library_files.splice(idx, 1)

      this.setFetching(true)
      this.attemptConferenceRoomUpdate({
        conferenceRoomId: this.id,
        data: {
          library_files: this.library_files,
        },
      })
        .then(() => {
          this.linkedMedias = this.linkedMedias.filter((item) => item.id !== media.id)
          if (this.linkedMedias.length === 0) {
            this.goToConferencesList()
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    downloadMedia(file) {
      this.setFetching(true)
      if (this.notEqualsProfile('student')) {
        this.attemptDownloadLibraryFileRetrieval(file)
          .catch(() => {
            this.setFeedback({
              message: this.$t('library:feedback.download.file.error'),
              type: 'error',
            })
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else {
        this.$downloadFile(this.attemptClassroomDownloadLibraryFile, file)
      }
    },
    fileFormat(file) {
      return {
        id: file.id,
        title: file.title,
        description: file.description,
        size: formatFileSize(file.vendorMeta.size),
        url: file.path,
        metaType: file.meta.type,
        type: this.getFileTypes(file.vendorMeta.getcontenttype),
        fileName: file.filename,
        courses: file.courses ? file.courses : [],
        sessions: file.sessions ? file.sessions : [],
        session_uuid: this.$route.params.session_uuid,
      }
    },
    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
    openModalImportMedia() {
      this.modalImportActive = true
    },
    closeModalImportMedia() {
      this.modalImportActive = false
    },
    goToConferencesList() {
      this.$router.push({ name: 'classroom.conference' })
    },
  },
}
</script>
