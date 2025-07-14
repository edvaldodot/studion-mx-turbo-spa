<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import TagSelector from '@/components/general/TagSelector'
import Action from '@/components/general/Action'
import TagsAnnouncement from '@/components/shared/TagsAnnouncement'
import { tagsAnnouncementMixin } from '@/mixins/tagsAnnouncementMixin'
import SessionsBind from '@/app/management/pages/ManagementSessions/components/SessionsBind/SessionsBind.vue'

import { format } from 'date-fns'
import debounce from 'lodash/debounce'

const Datepicker = () => import('@/components/general/Datepicker')
const Checkbox = () => import('@/components/general/Checkbox')
const InputField = () => import('@/components/general/InputField')
const TextEditor = () => import('@/components/general/TextEditor')
const FileField = () => import('@/components/general/FileField')

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export default defineComponent({
  name: 'ActionsAnnouncement',

  components: {
    Action,
    Checkbox,
    Datepicker,
    InputField,
    TextEditor,
    FileField,
    SessionsBind,
    TagSelector,
    TagsAnnouncement,
  },

  mixins: [tagsAnnouncementMixin],

  props: {
    announcement: {
      type: Object,
      default: () => ({}),
    },
    show: {
      type: Boolean,
      default: false,
    },
    courseName: {
      type: String,
      default: '',
    },
    validations: {
      type: Object,
      default: () => ({}),
    },
    isManagement: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      mutableAnnoucements: null,
      tempMediaFile: null,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      importImage: true,
      announcementFixed: false,
      tags: [],
    }
  },
  computed: {
    today() {
      if (this.mutableAnnoucements.id) {
        return
      }

      return format(new Date(), 'yyyy-MM-dd')
    },
    minEndTIme() {
      if (!this.mutableAnnoucements.start_time) {
        return
      }

      let date = new Date(this.mutableAnnoucements.start_time)
      date.setMinutes(date.getMinutes() + 10)

      return format(date, 'yyyy-MM-dd-HH:mm')
    },
  },

  watch: {
    'announcement.content': {
      handler(newValue) {
        if (this.$refs.textField) {
          const newText = this.clampSessionStartDate(newValue)
          this.mutableAnnoucements.content = newText
        }
      },
      immediate: true,
    },
  },

  created() {
    this.mutableAnnoucements = this.announcement

    this.getTagsAnnouncement()
  },

  methods: {
    ...mapState(['accessibility']),
    ...mapActions(['setFetching', 'attemptGetAnnouncementTags']),

    submit() {
      this.$emit('submit')
    },

    emitFile() {
      this.$emit('add-media-file', this.tempMediaFile)
    },

    openMediaFile() {
      this.$refs.mediaFile.$refs.label.click()
    },

    hideImportImage() {
      this.importImage = false
      this.showImportImage(this)
    },
    showImportImage: debounce((context) => {
      context.importImage = true
    }, 1000),
  },
})
</script>

<template>
  <div class="w-12">
    <span class="modal-subtitle">{{ $t('classroom.panel.announcements:modal.subtitle') }}</span>
    <h2 class="modal-title text-color is-capitalize">{{ courseName }}</h2>
    <div class="modal-description text-color">
      <p class="text-color">{{ $t('classroom.panel.announcements:modal.description') }}</p>
    </div>
    <FileField
      ref="mediaFile"
      v-model="tempMediaFile"
      class="hidden"
      :label="$t('global:form.attach.file')"
      :validation="validations.tempMediaFile"
      dark
      :accept="allowedImageTypes.join()"
      @input="emitFile"
    ></FileField>
    <form @submit.prevent="submit">
      <div class="w-6 mx-auto">
        <InputField
          v-model="mutableAnnoucements.title"
          :label="$t('global:form.title')"
          :counter="100"
          :validation="validations.formData.title"
          dark
        ></InputField>
        <div
          class="form-group theme-dark clearfix"
          data-gap="40"
          data-cols="2"
        >
          <p class="form-item-description text-color">{{ $t('global:form.section.period') }}</p>
          <Datepicker
            v-model="mutableAnnoucements.start_time"
            :label="$t('global:form.start')"
            :validation="validations.formData.start_time"
            dark
            time
          ></Datepicker>
          <Datepicker
            :key="mutableAnnoucements.start_time"
            v-model="mutableAnnoucements.end_time"
            :label="$t('global:form.end')"
            :min="minEndTIme"
            :validation="validations.formData.end_time"
            :disabled="mutableAnnoucements.start_time == null"
            dark
            time
          ></Datepicker>
        </div>
        <div class="theme-dark">
          <p class="form-item-description text-color">{{ $t('global:form.section.content') }}</p>
          <TextEditor
            ref="textField"
            v-model="mutableAnnoucements.content"
            :floating-label="false"
            class="input-editor-announcements-form"
            :label="$t('global:form.content.announcement')"
            :validation="validations.formData.content"
            :max-rows="20"
            image-enabled
            @change="hideImportImage()"
          >
            <Action
              v-show="importImage"
              slot="embed-image"
              :class="{ 'has-error': validations.formData.content.$error }"
              type="button"
              icon="file-image"
              @click="openMediaFile"
            />
            <template #before-tools>
              <TagSelector
                :tags="tags.map((tag) => tag.value)"
                :tag-values="tags.map((tag) => tag.text)"
                :title="$t('text.editor:tag.selector.title')"
                tag-label="management:announcement.actions:tag.item:"
                @tag="$refs.textField.addTag($event)"
              />
            </template>
          </TextEditor>
        </div>
        <div class="announcements-toggle-fixed">
          <Checkbox
            v-model="mutableAnnoucements.fixed"
            :items="[{ value: true, label: $t('global:announcements.message.toggle') }]"
            switch-type
            dark
          />
        </div>
      </div>
      <TagsAnnouncement
        :text="$t('management:announcement.actions:tag.discussion')"
        :tags="tags"
        @add:tag="addTagToTextEditor"
      />
      <div class="w-12">
        <SessionsBind
          v-if="isManagement && !mutableAnnoucements.id"
          v-model="mutableAnnoucements.sessions_ids"
          :validation="validations.formData.sessions_ids"
          :name-bind-component="$t('management:announcement.replicate.name')"
          filter-tool="announcement"
          @modal-is-open="(e) => $emit('session-modal-open', e)"
        />
        <div class="form-submit text-center mt-4">
          <Action
            :text="mutableAnnoucements.id ? $t('global:save') : $t('global:create')"
            type="button"
            secondary
            large
            submit
            fixed-width
          ></Action>
        </div>
      </div>
    </form>
  </div>
</template>

<style lang="scss">
@import '../styles.scss';
</style>
