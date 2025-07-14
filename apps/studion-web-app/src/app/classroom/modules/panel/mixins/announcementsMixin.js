import { mapActions, mapState } from 'vuex'
import { minValue, required, requiredIf } from 'vuelidate/lib/validators'

import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'

import { format, parseISO } from 'date-fns'

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export default {
  data() {
    return {
      tabLinks: [
        {
          text: 'classroom.panel:tab.link.1',
          location: {
            name: 'classroom.panel.dashboard',
          },
        },
        {
          text: 'classroom.panel:tab.link.2',
          location: {
            name: 'classroom.panel.announcements',
          },
        },
        {
          text: 'classroom.panel:tab.link.3',
          location: {
            name: 'classroom.panel.calendar',
          },
        },
      ],
      items: [],
      modalAddAnnouncement: false,
      announcement: null,
      formData: {
        announcement_id: null,
        title: null,
        start_time: null,
        end_time: null,
        content: null,
        fixed: false,
        should_confirm: 0,
        sessions_ids: null,
      },
      tempMediaFile: null,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      importImage: true,
      validation: null,
      modalSession: false,
      managementCreate: false,
    }
  },

  validations: {
    formData: {
      title: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
      },
      content: {
        required,
      },
      sessions_ids: {
        required: requiredIf(function () {
          return this.managementCreate && !this.formData.id
        }),
      },
    },
    tempMediaFile: {
      filesize: filesizeValidator(5242880),
      mimeType: mimeTypeValidator(ALLOWED_IMAGE_TYPES),
    },
  },

  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    today() {
      return format(new Date(), 'yyyy-MM-dd')
    },
    sessionUuid() {
      return this.$route.params.session_uuid
    },

    layoutList() {
      const list = []

      const subListNumber = this.$media.mobile ? 1 : 3;

      for (let i = 0; i < subListNumber; i++) {
        list.push([])
      }

      let count = 0;
      for (let i = 0; i < this.items.length; i++) {
        list[count].push(this.items[i]);
        count++

        if (count >= subListNumber) count = 0
      }

      return list.filter((i) => i.length);
    }

  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptClassroomAnnouncementsRetrieval',
      'attemptAnnouncementCreation',
      'attemptAnnouncementUpdate',
      'attemptAnnouncementRemoval',
      'attemptUploadMediaFile',
      'openModalReadMoreAnnouncement',
      'Management/announcement/attemptManagementAnnouncementCreation',
    ]),

    setup() {
      const params = {
        sessionUuid: this.sessionUuid,
        profileAlias: this.Account.user.currentProfile,
      }
      this.setFetching(true)
      this.$emit('change-header', {
        tabLinks: this.tabLinks,
      })
      this.attemptClassroomAnnouncementsRetrieval(params)
        .then(({ data }) => {
          this.items = data
          this.announcement = this.Classroom.data.announcement
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    openModalAddAnnouncement() {
      this.modalAddAnnouncement = true
    },
    closeModalAddAnnouncement() {
      this.modalAddAnnouncement = false
      this.formData.title = null
      this.formData.start_time = null
      this.formData.end_time = null
      this.formData.content = null
      this.formData.fixed = false
      this.formData.should_confirm = 0

      delete this.formData.announcement_id
      delete this.formData.id

      this.$v.$reset()
    },
    editAnnouncement(item, index) {
      this.formData.index = index
      this.formData.id = item.id
      this.formData.title = item.title
      this.formData.content = item.contentRaw

      this.formData.start_time = format(
        parseISO(item.sessionName ? item.startTime : item.availability.startTime),
        'yyyy-MM-dd HH:mm'
      )
      this.formData.end_time = format(
        parseISO(item.sessionName ? item.endTime : item.availability.endTime),
        'yyyy-MM-dd HH:mm'
      )
      this.formData.fixed = item.fixed ? true : false
      this.formData.should_confirm = item.should_confirm ? 1 : 0

      this.openModalAddAnnouncement()
    },
    submit() {
      this.$v.formData.$touch()
      if (this.$v.formData.sessions_ids.$invalid) {
        this.setFeedback({
          message: this.$t('management:announcement.validation.replicate.class'),
        })
      }
      if (!this.$v.formData.$invalid) {
        this.formData.id ? this.submitUpdate() : this.submitCreation()
      }
    },

    submitCreation() {
      this.managementCreate ? this.submitCreationManagement() : this.submitCreationAnnoucement()
    },

    submitCreationAnnoucement() {
      this.setFetching(true)
      this.modalAddAnnouncement = false

      let data = this.formData
      data.announcement_id = this.announcement.id
      this.attemptAnnouncementCreation(data)
        .then(({ data }) => {
          this.closeModalAddAnnouncement()
          this.setFeedback({ message: this.$t('classroom.panel.announcements:feedback.created') })
          this.refreshData()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.panel.announcements:feedback.created.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setup()
          this.setFetching(false)
        })
    },

    submitCreationManagement() {
      this.setFetching(true)
      this.modalAddAnnouncement = false

      let data = this.formData

      this['Management/announcement/attemptManagementAnnouncementCreation'](data)
        .then(({ data }) => {
          this.items.push(data)
          this.closeModalAddAnnouncement()
          this.setFeedback({ message: this.$t('classroom.panel.announcements:feedback.created') })
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.panel.announcements:feedback.created.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
          this.pgtrRefresh()
        })
    },
    submitUpdate() {
      this.setFetching(true)
      this.modalAddAnnouncement = false

      const entryId = this.formData.id
      let data = this.formData

      this.attemptAnnouncementUpdate({ entryId, data: data })
        .then(({ data }) => {
          this.items[this.formData.index] = data
          this.closeModalAddAnnouncement()
          this.setFeedback({ message: this.$t('classroom.panel.announcements:feedback.updated') })
        })
        .finally(() => {
          this.refreshData()
          this.setFetching(false)
        })
    },

    refreshData() {
      this.setup()
    },

    deleteAnnouncement(item, index) {
      this.setFetching(true)

      const entryId = item.id

      this.attemptAnnouncementRemoval(entryId)
        .then(() => {
          this.items.splice(index, 1)
          this.setFeedback({ message: this.$t('classroom.panel.announcements:feedback.removed') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    addMediaFile(file) {
      this.tempMediaFile = file

      if (!this.$v.tempMediaFile.$invalid) {
        this.setFetching(true)
        this.attemptUploadMediaFile({ file: this.tempMediaFile })
          .then(({ data }) => {
            let imgAttrs = { width: '100%' }
            if (this.tempMediaFile[0].type === 'image/gif') {
              imgAttrs = { 'max-width': '100%' }
            }
            this.$refs.modalAnnoucements.$refs.textField.addImageUrl(data.url, imgAttrs)
            this.tempMediaFile = null
            this.$refs.modalAnnoucements.$refs.mediaFile.clear()
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else if (!this.$v.tempMediaFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.size'),
          type: 'error',
        })
      }
    },
    backAction() {
      this.$router.push({ name: this.$route.params.management })
      return
    },
  },
}
