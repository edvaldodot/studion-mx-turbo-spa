<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { minValue, required, requiredIf } from 'vuelidate/lib/validators'
import { format, formatISO, isBefore, parseISO } from 'date-fns'
import { fileTypes } from '@/domains/library/support/fileTypes'
import { formatFileSize } from '@/support/utils/storageUnit'
import { previewModal } from '@/components/general/ModalPreview/methods'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Datepicker from '@/components/general/Datepicker'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import Upload from '@/components/general/Upload'
import TooltipSlot from '@/components/general/TooltipSlot'
import FormSection from '@/components/general/FormSection'
import Autocomplete from '@/components/general/Autocomplete'
import ModalPreview from '@/components/general/ModalPreview'
import SessionsBind from '@/app/management/pages/ManagementSessions/components/SessionsBind'
import ConferenceFolderSelector from '../../components/ConferenceFolderSelector/ConferenceFolderSelector'

import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

const ModalImportMedia = () => import('../../components/ModalImportMedia/ModalImportMedia')

export default {
  name: 'ModalAddConference',
  components: {
    Action,
    Checkbox,
    Datatable,
    Datepicker,
    Dropdown,
    DropdownLink,
    Icon,
    InputField,
    Modal,
    ModalImportMedia,
    Upload,
    FormSection,
    Autocomplete,
    ModalPreview,
    TooltipSlot,
    SessionsBind,
    ConferenceFolderSelector,
  },

  mixins: [formScrollValidationMixin],

  props: {
    id: {
      type: Number,
      default: null,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      modalImportActive: false,
      modalPreviewActive: false,
      loaded: false,
      earlyAccessCheckbox: false,
      formData: {
        name: null,
        image: null,
        start_time: null,
        end_time: null,
        library_files: [],
        conference_id: null,
        waiting_room: false,
        breakout_room: false,
        add_to_calendar: false,
        early_access: 0,
        folderId: 0,
        generate_video: false,
        generate_lesson: false,
        percentage: 70,
        allow_advance: false,
        mandatory: false,
        sessions_ids: [],
        host: {
          user: {
            name: null,
            id: null,
            uuid: null,
            user: null,
          },
          autocompleteItems: [],
          autocompleteLoading: false,
        },
        coHost: {
          user: {
            name: null,
            id: null,
            uuid: null,
            user: null,
          },
          autocompleteItems: [],
          autocompleteLoading: false,
        },
        coHosts: [],
      },
      initDate: null,
      selectedHost: '',
      linkedMedias: [],
      media: null,
      sessionModalIsOpen: false,
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
      start_time: {
        required,
        isFutureDate() {
          return isBefore(new Date(), parseISO(this.formData.start_time))
        },
      },
      end_time: {
        required,
        isEqualToStart() {
          return this.formData.start_time !== this.formData.end_time
        },
      },
      early_access: {
        required: requiredIf(function () {
          return this.earlyAccessCheckbox
        }),
        minValue: function () {
          if (!this.earlyAccessCheckbox) return true
          return minValue(1)(this.formData.early_access)
        },
      },
      host: {
        user: {
          user: {
            required,
          },
        },
      },
      sessions_ids: {
        required: requiredIf(function () {
          return this.isManagement && !this.isEditing
        }),
      },
    },
  },

  computed: {
    ...mapState(['Classroom', 'accessibility', 'Sessions']),
    ...mapGetters(['classroomBranchIds']),

    conferenceToolId() {
      return (
        this.Classroom &&
        this.Classroom.data &&
        this.Classroom.data.conference &&
        this.Classroom.data.conference.id
      )
    },

    isManagement() {
      return this.$route.meta.isManagement
    },

    today() {
      return format(new Date(), 'yyyy-MM-dd')
    },

    currentConference() {
      if (this.isEditing) {
        return this.$store.getters.getConferenceById(this.id)
      }

      return null
    },

    showRecordSettings() {
      if (this.$isEnabledFeature('auto_create_conference_lessons')) return true
      return this.formData.generate_video
    },

    minStartTime() {
      if (this.disableConferenceEdit || this.isEditing) return this.formData.start_time
      return this.formData.start_time && this.formData.start_time < this.today
        ? this.initDate
        : this.today
    },

    disableConferenceEdit() {
      return this.isEditing && this.initDate < this.today
    },
  },

  watch: {
    currentConference: {
      immediate: true,
      handler: function (newValue) {
        if (newValue) this.setupFormData()
      },
    },

    linkedMedias(newValue) {
      this.formData.library_files = newValue.map((media) => media.id)
    },
  },

  created() {
    if (this.$isEnabledFeature('auto_create_conference_lessons')) {
      this.formData.generate_lesson = true
    }

    if (this.isEditing) {
      this.loadLinkedMedias(this.id)
      this.attemptConferenceRoomRetrieval(this.id).then(({ data }) => {
        this.setupFormData(data)
        this.formData.host.user.id = data.host.userData.applicationUserId
        this.formData.host.user.name = data.host.userData.name
        this.formData.host.user.uuid = data.host.userData.uuid
        this.formData.host.user.user = [data.host.userData]
        this.formData.waiting_room = data.waitingRoom
        this.formData.breakout_room = data.breakoutRoom
        this.formData.add_to_calendar = data.addToCalendar
        this.formData.folderId =
          (data.conferenceRoomFolder && data.conferenceRoomFolder.id) ||
          parseInt(this.$route.params.folderId) ||
          0
        this.earlyAccessCheckbox = data.earlyAccess && data.earlyAccess > 0
        this.formData.early_access = data.earlyAccess
        this.formData.generate_video = data.generateVideo
        this.selectedHost = data.host.userData.name
        this.formData.coHosts = data.alternativeHosts.map(({ userData }) => {
          return { id: userData.applicationUserId, name: userData.name, uuid: userData.uuid }
        })
        this.formData.percentage = data.percentage
        this.formData.allow_advance = data.allowAdvance
        this.formData.mandatory = data.mandatory

        this.loaded = true

        if (this.isManagement) {
          this.setupFormData(data)
        }
      })
    } else {
      this.formData.folderId = parseInt(this.$route.params.folderId) || 0
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptConferenceRoomUpdate',
      'attemptConferenceRoomCreation',
      'attemptConferenceRoomRetrieval',
      'attemptDownloadLibraryFileRetrieval',
      'attemptConferenceMediasList',
      'attemptPreviewLibraryFileRetrieval',
      'attemptListUsersNonStudentByName',
      'attemptProfilesByUser',
    ]),

    previewModal,

    /**
     * Get the list of users that neeeds to be in the autocomplete component
     * @param {String} value searched value
     * @param {Boolean} isCoHost define if its a host or cohost list
     */
    getUsersList(value, isCoHost = false) {
      let hostType = isCoHost ? 'coHost' : 'host'

      if (value.length) {
        this.formData[hostType].autocompleteLoading = true
        this.formData[hostType].user.name = null
        this.formData[hostType].user.id = null
        this.formData[hostType].user.uuid = null
        this.formData[hostType].user.user = null
        this.attemptListUsersNonStudentByName({
          userName: value,
          branchIds: this.classroomBranchIds,
        })
          .then(({ data }) => {
            this.formData[hostType].autocompleteLoading = false
            this.formData[hostType].autocompleteItems = data
              ? data.map(({ name, applicationUserId, uuid }) => ({
                  name: name,
                  id: applicationUserId,
                  uuid: uuid,
                }))
              : []
          })
          .catch(() => {
            this.formData[hostType].autocompleteLoading = false
            this.formData[hostType].autocompleteItems = []
          })
      }
      return true
    },

    /**
     * Add selected user data to formData
     */
    selectUser(data, isCoHost = false) {
      let hostType = isCoHost ? 'coHost' : 'host'

      if (data && this.formData[hostType].user.id === null) {
        this.formData[hostType].user.name = data[0].name
        this.formData[hostType].user.id = data[0].id
        this.formData[hostType].user.uuid = data[0].uuid
        this.formData[hostType].user.user = data[0]
      }
    },

    /**
     * Check if searched cohost already is in list and if not add him to the CoHostLista
     */
    addCoHost() {
      if (this.formData.coHost.user.user) {
        let existentMember = this.formData.coHosts.find(
          (item) => item.uuid === this.formData.coHost.user.user[0].uuid
        )
        if (existentMember) {
          this.setFeedback({
            message: this.$t('community.sessions.add:modal.feedback.team.member.exists'),
            type: 'error',
          })
        } else {
          this.formData.coHosts.push({
            name: this.formData.coHost.user.user[0].name,
            user_id: this.formData.coHost.user.user[0].id,
            uuid: this.formData.coHost.user.user[0].uuid,
          })
        }
        this.formData.coHost.user.user = null
      }
    },

    removeCoHost(index) {
      this.formData.coHosts.splice(index, 1)
    },

    downloadMedia(file) {
      this.setFetching(true)
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
    },

    setupFormData(data) {
      const currentConference = data || this.currentConference

      this.formData.id = currentConference.id
      this.formData.conference_id = this.conferenceToolId
      this.formData.name = currentConference.name
      this.formData.active = currentConference.active
      this.formData.description = currentConference.description
      this.formData.image = currentConference.image
      this.initDate = currentConference.schedulePeriod.start
      this.$nextTick(() => {
        this.formData.start_time = formatISO(new Date(currentConference.schedulePeriod.start))
        this.formData.end_time = formatISO(new Date(currentConference.schedulePeriod.end))
      })
    },

    removeLink(media) {
      let idx = this.formData.library_files.indexOf(media.id)
      let idxLinkedMedias = this.linkedMedias.findIndex((item) => {
        return item.id === media.id
      })
      if (idx > -1) {
        this.formData.library_files.splice(idx, 1)
        this.linkedMedias.splice(idxLinkedMedias, 1)
      }
    },

    resetForm() {
      this.formData = {
        conference_id: null,
        name: null,
        image: null,
        start_time: null,
        end_time: null,
        library_files: [],
      }
      this.linkedMedias = []
      this.$v.$reset()
    },

    addNewConference() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.formData.conference_id = this.conferenceToolId
        this.submit()
      } else {
        this.$nextTick(() => this.scrollToInputError(this.$refs.form))
      }
    },

    formatDate(dateToEdit) {
      const formateThisDate = (oldDate) =>
        format(new Date(new Date(oldDate).toUTCString().substr(0, 25)), 'yyyy-MM-dd HH:mm')
      return dateToEdit ? formateThisDate(dateToEdit) : null
    },

    clearFormData(data) {
      if (!this.earlyAccessCheckbox) {
        data.early_access = 0
      }

      return data
    },

    createConference(data) {
      data = this.clearFormData(data)
      return this.attemptConferenceRoomCreation(data).then(() => {
        this.closeModalAddConference()
        this.$emit('conference-saved')
      })
    },

    updateConference(data) {
      data = this.clearFormData(data)
      return this.attemptConferenceRoomUpdate({ conferenceRoomId: data.id, data: data }).then(
        () => {
          this.closeModalAddConference()
          this.$emit('conference-saved')
        }
      )
    },

    submit() {
      this.setFetching(true)
      let data = Object.assign({}, this.formData)

      data.start_time = this.formatDate(data.start_time)
      data.end_time = this.formatDate(data.end_time)

      const submitAction = this.isEditing ? this.updateConference : this.createConference

      submitAction(data)
        .then(() => {
          this.isEditing ? this.$emit('edit') : this.$emit('create')
        })
        .catch(({ response }) => {
          const errorList = [
            'conference_already_started',
            'must_be_greater_than_0',
            'start_should_not_be_greater_than_end',
          ]
          const { data } = response

          const makeConferenceError = (errorName) => {
            return `classroom.conference:modal.feedback.${errorName.replaceAll('_', '.')}.error`
          }

          const hintErrors = data.hint && data.hint.errors ? Object.values(data.hint.errors) : []
          const messageError = data.message

          let errorName = this.isEditing ? 'update' : 'create'

          if (hintErrors.length && errorList.includes(hintErrors[0])) errorName = hintErrors[0]
          else if (errorList.includes(messageError)) errorName = messageError

          this.setFeedback({ message: this.$t(makeConferenceError(errorName)) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    fileFormat(file) {
      return {
        id: file.id,
        title: file.title,
        description: file.description,
        size: file.vendorMeta ? formatFileSize(file.vendorMeta.size) : null,
        url: file.path,
        metaType: file.meta ? file.meta.type : 'file',
        type: file.vendorMeta ? this.getFileTypes(file.vendorMeta.getcontenttype) : null,
        fileName: file.filename,
        courses: file.courses ? file.courses : [],
        sessions: file.sessions ? file.sessions : [],
      }
    },

    loadLinkedMedias(id) {
      this.setFetching(true)
      this.attemptConferenceMediasList(id)
        .then(({ data: response }) => {
          this.linkedMedias = response.data.map((media) => {
            return this.fileFormat(media)
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openModalImportMedia() {
      this.modalImportActive = true
    },

    closeModalImportMedia() {
      this.modalImportActive = false
    },

    openModalPreview(item) {
      this.media = item
      this.media.url = null
      this.setFetching(true)
      this.attemptPreviewLibraryFileRetrieval({
        id: item.id,
        fileName: item.fileName,
      })
        .then((data) => {
          this.modalPreviewActive = true
          this.media.url = window.URL.createObjectURL(data)
          if (this.media.fileName.split('.')[1] === 'txt') {
            this.media.type = 'txt'
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    closeModalPreview() {
      this.modalPreviewActive = false
      this.media = null
    },

    closeModalAddConference() {
      if (this.isManagement) {
        this.$emit('close')
        return this.$router.push(this.$route.meta.modalCloseLink)
      }

      this.$router.push({
        name: 'classroom.conference',
        params: { folderId: this.$route.params.folderId },
      })
    },

    linkMedias(medias) {
      this.linkedMedias = [
        ...medias.map((media) => {
          return this.fileFormat(media)
        }),
      ]
      this.closeModalImportMedia()
    },

    getFileTypeIcon(type) {
      return type ? 'file-' + type : 'external-link'
    },

    getFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },
  },
}
</script>

<template>
  <div>
    <Modal
      v-show="!modalImportActive && !sessionModalIsOpen"
      :back="isManagement"
      class="conference-room-modal"
      active
      is-page
      @close="closeModalAddConference()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('classroom.conference:modal.add.subtitle') }}</span>
        <h2 class="modal-title is-capitalize">
          {{ isManagement ? formData.name : Classroom.data.course.name }}
        </h2>
        <div class="modal-description">
          <p class="text-color">{{ $t('classroom.conference:modal.add.description') }}</p>
        </div>
        <form
          ref="form"
          @submit.prevent="addNewConference"
        >
          <InputField
            v-model="formData.name"
            :label="$t('classroom.conference:modal.form.title')"
            :counter="100"
            :disabled="disableConferenceEdit"
            :validation="$v.formData.name"
            dark
          />
          <div
            class="form-group clearfix theme-dark"
            data-cols="2"
            data-gap="40"
          >
            <p class="form-item-description">{{ $t('global:form.section.period') }}</p>
            <Datepicker
              v-model="formData.start_time"
              :label="$t('global:form.start')"
              :min="minStartTime"
              :disabled="disableConferenceEdit"
              :validation="$v.formData.start_time"
              dark
              time
            />
            <Datepicker
              v-model="formData.end_time"
              :label="$t('global:form.end')"
              :min="formData.start_time"
              :disabled="disableConferenceEdit"
              :validation="$v.formData.end_time"
              dark
              time
            />
          </div>
          <div class="checkbox-wrapper">
            <Checkbox
              v-model="formData.add_to_calendar"
              :items="[{ value: true, label: $t('classroom.conference:add.to.calendar') }]"
              :disabled="disableConferenceEdit"
              switch-type
              dark
            />
          </div>
          <div class="checkbox-wrapper">
            <Checkbox
              v-model="earlyAccessCheckbox"
              :items="[{ value: true, label: $t('classroom.conference:early.access') }]"
              :disabled="disableConferenceEdit"
              switch-type
              dark
            />
            <div
              v-if="earlyAccessCheckbox"
              class="early-access-wrapper"
            >
              <InputField
                v-model="formData.early_access"
                :label="$t('global:minutes')"
                :min="0"
                :max="60"
                :disabled="disableConferenceEdit"
                :validation="$v.formData.early_access"
                dark
                type="number"
              />
            </div>
          </div>
          <FormSection
            :title="$t('classroom.conference:host')"
            dark
          >
            <Autocomplete
              v-if="!isEditing || loaded"
              v-model="formData.host.user.user"
              :label="$tc('global:user')"
              :items="formData.host.autocompleteItems"
              :loading="formData.host.autocompleteLoading"
              :validation="$v.formData.host.user.user"
              :disabled="isEditing"
              :default-input-text="selectedHost"
              option-property="name"
              append-icon="search"
              async
              dark
              @search="getUsersList($event)"
              @input.capture="selectUser($event)"
            />
          </FormSection>

          <FormSection
            v-if="!isEditing"
            :title="$t('classroom.conference:co-host')"
            dark
          >
            <Autocomplete
              v-model="formData.coHost.user.user"
              :label="$tc('global:user')"
              :items="formData.coHost.autocompleteItems"
              :loading="formData.coHost.autocompleteLoading"
              :disabled="isEditing"
              option-property="name"
              append-icon="search"
              async
              dark
              @search="getUsersList($event, true)"
              @input.capture="selectUser($event, true)"
            />
            <Action
              v-if="!isEditing"
              type="button"
              :text="$t('classroom.conference:add-co-host')"
              class="mb-3"
              flat
              @click="addCoHost()"
            />
          </FormSection>

          <Datatable
            v-if="formData.coHosts.length"
            :items="formData.coHosts"
            :light="true"
            dark
          >
            <template
              v-if="!$media.mobile"
              slot="thead"
            >
              <tr>
                <th class="th">{{ $t('classroom.conference:co-hosts') }}</th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr
                v-if="$media.mobile"
                class="tr-colspan tr-colspan-small"
              >
                <td
                  class="td"
                  colspan="2"
                >
                  <span
                    class="td-text"
                    :style="{ width: 'calc(100% - 45px)' }"
                    >{{ props.item.name }}</span
                  >
                  <Action
                    v-if="!isEditing"
                    type="button"
                    class="btn-remove"
                    icon="close"
                    @click="removeCoHost(props.index)"
                  />
                </td>
              </tr>
              <tr>
                <td
                  v-if="!$media.mobile"
                  class="td"
                >
                  <span class="td-text bolder">{{ props.item.name }}</span>
                </td>
                <td
                  v-if="!$media.mobile"
                  class="td"
                  width="40"
                >
                  <action
                    v-if="!isEditing"
                    type="button"
                    class="btn-remove"
                    icon="close"
                    @click="removeCoHost(props.index)"
                  ></action>
                </td>
              </tr>
            </template>
          </Datatable>

          <div class="checkbox-wrapper">
            <Checkbox
              v-model="formData.waiting_room"
              :disabled="isEditing"
              :items="[{ value: true, label: $t('classroom.conference:allow.waiting.room') }]"
              switch-type
              dark
            />
            <Checkbox
              v-model="formData.breakout_room"
              :items="[{ value: true, label: $t('classroom.conference:allow.simultaneous.room') }]"
              :disabled="isEditing"
              switch-type
              dark
            />
            <Checkbox
              v-if="!$isEnabledFeature('auto_create_conference_lessons')"
              v-model="formData.generate_video"
              :items="[{ value: true, label: $t('classroom.conference:allow.generate_video') }]"
              :disabled="isEditing"
              switch-type
              dark
            />
          </div>

          <div
            v-if="showRecordSettings"
            class="conference-lessons"
          >
            <FormSection
              :title="$t('solutions.create.classes:video.consume.title')"
              dark
            >
              <div class="description">
                <p class="text-color">{{ $t('classroom.conference:allow.create.conference.lesson.description') }}</p>
              </div>

              <InputField
                v-model="formData.percentage"
                :label="$t('solutions.create.classes:video.consume.percentage')"
                :max="100"
                :min="0"
                :disabled="disableConferenceEdit"
                type="number"
                has-percent
                dark
              />
              <Checkbox
                v-model="formData.allow_advance"
                :items="[
                  { value: true, label: $t('solutions.create.classes:video.consume.seekable') },
                ]"
                :disabled="disableConferenceEdit"
                dark
              />
              <Checkbox
                v-model="formData.mandatory"
                :items="[{ value: true, label: $t('solutions.create.classes:modal.mandatory') }]"
                :disabled="disableConferenceEdit"
                dark
              />
            </FormSection>
          </div>

          <Upload
            v-model="formData.image"
            :icon="'image-multiple'"
            :label="$t('global:upload.add.image')"
            :description="$t('classroom.conference:modal.form.image')"
            :width="520"
            :cropper="true"
            :validation="$v.formData.image"
            :disabled="disableConferenceEdit"
            dark
          />

          <Action
            v-if="!isManagement"
            :text="$t('classroom.library:modal.import.media')"
            :disabled="disableConferenceEdit"
            type="button"
            flat
            @click="openModalImportMedia()"
          />

          <template v-if="linkedMedias.length > 0 && !isManagement">
            <Datatable
              :items="linkedMedias"
              light
              card
              :dark="accessibility"
            >
              <template slot="thead">
                <tr v-if="!$media.mobile">
                  <th
                    class="th"
                    width="60"
                  ></th>
                  <th class="th">{{ $t('classroom.conference:media.added') }}</th>
                  <th
                    class="th"
                    width="170"
                  >
                    {{ $t('library:datatable.header.2') }}
                  </th>
                  <th
                    class="th"
                    width="120"
                  ></th>
                </tr>
              </template>

              <template
                slot="tbody"
                slot-scope="props"
              >
                <tr
                  v-if="$media.mobile"
                  class="tr-colspan tr-colspan-small"
                >
                  <td
                    class="td"
                    colspan="2"
                  >
                    <Icon
                      :name="getFileTypeIcon(props.item.type)"
                      class="icon-filetype"
                      wrapper
                    />
                    <span class="td-text bolder">{{ props.item.title }}</span>
                  </td>
                </tr>
                <tr :class="{ 'tr-small': $media.mobile }">
                  <td
                    v-if="!$media.mobile"
                    class="td"
                  >
                    <Icon
                      :name="getFileTypeIcon(props.item.type)"
                      class="icon-filetype"
                      wrapper
                    />
                  </td>
                  <td
                    v-if="!$media.mobile"
                    class="td"
                  >
                    <span class="td-text bolder">{{ props.item.title }}</span>
                  </td>
                  <td class="td">
                    <span
                      v-if="$media.mobile"
                      class="td-text-header td-text-header-inline"
                    >
                      {{ $t('library:datatable.header.2') }}
                    </span>
                    <span class="td-text">{{
                      props.item.metaType !== 'external_link'
                        ? props.item.size
                        : $t('global:external.media')
                    }}</span>
                  </td>

                  <td
                    class="td td-actions"
                    width="120"
                  >
                    <Action
                      v-if="previewModal().accept(props.item.type, props.item.metaType)"
                      type="button"
                      icon="visibility"
                      @click="openModalPreview(props.item)"
                    />
                    <Action
                      v-if="props.item.metaType === 'external_link'"
                      type="link"
                      icon="goto-external"
                      :url="props.item.url"
                      target="_blank"
                    />
                    <Action
                      v-if="props.item.metaType !== 'external_link'"
                      type="link"
                      icon="download"
                      download
                      @click="downloadMedia(props.item)"
                    />
                    <Dropdown
                      v-if="notEqualsProfile('student') && canWrite('libraries')"
                      icon="dots-vertical"
                      right
                    >
                      <DropdownLink
                        :text="$t('global:remove')"
                        @click="removeLink(props.item)"
                      />
                      <DropdownLink
                        v-if="previewModal().accept(props.item.type, props.item.metaType)"
                        :text="$t('global:view.more')"
                        @click="openModalPreview(props.item)"
                      />
                      <DropdownLink
                        v-if="props.item.metaType !== 'external_link'"
                        :text="$t('global:download')"
                        download
                        @click="downloadMedia(props.item)"
                      />
                    </Dropdown>
                  </td>
                </tr>
              </template>
            </Datatable>
          </template>

          <FormSection
            :title="$t('solutions.create.conference:folder.selector.title')"
            :disabled="isManagement"
            class="mt-5"
            dark
          >
            <TooltipSlot
              v-if="isManagement"
              :uppercase="false"
              :width="300"
            >
              <template #activator="{ on }">
                <ConferenceFolderSelector
                  v-model="formData.folderId"
                  :validation="$v.formData.folderId"
                  mock
                  v-on="on"
                />
              </template>

              <template #content>
                <div class="conference-folder-selector__tooltip">
                  <p>{{ $t('solutions.create.conference:folder.selector.disabled') }}</p>
                </div>
              </template>
            </TooltipSlot>

            <ConferenceFolderSelector
              v-else
              v-model="formData.folderId"
              :validation="$v.formData.folderId"
              v-on="isManagement ? null : on"
            />
          </FormSection>

          <div class="modal-conference__sessions-bind form-full-w mb-5">
            <SessionsBind
              v-if="isManagement && !isEditing"
              v-model="formData.sessions_ids"
              :name-bind-component="$t('management:conference.replicate.name')"
              class="session-bind-class"
              filter-tool="conference"
              @modal-is-open="(e) => (sessionModalIsOpen = e)"
            />
          </div>

          <div class="form-submit text-center">
            <Action
              :text="formData.id ? $t('global:save') : $t('global:create')"
              type="button"
              secondary
              large
              submit
              fixed-width
            />
          </div>
        </form>
      </div>
    </Modal>

    <ModalImportMedia
      v-if="modalImportActive"
      :linked-medias="linkedMedias"
      :title="Classroom.data.course.name"
      @submited="linkMedias"
      @close="closeModalImportMedia"
    />

    <ModalPreview
      v-if="media"
      :media="media"
      :is-active="modalPreviewActive"
      @close="closeModalPreview"
      @download="downloadMedia(media)"
    />
  </div>
</template>

<style lang="scss">
@import './ModalAddConference.scss';
</style>
