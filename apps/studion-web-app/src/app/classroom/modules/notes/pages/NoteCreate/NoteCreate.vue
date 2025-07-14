<script>
import { required } from 'vuelidate/lib/validators'
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import TextEditor from '@/components/general/TextEditor'

import { REFERENCES } from '../../../classroom/components/FloatingNotes/shared'

export default {
  name: 'NoteCreate',

  components: {
    Action,
    TextEditor,
  },

  props: {
    bubble: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    id: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      formData: {
        title: null,
        content: null,
      },
    }
  },

  computed: {
    ...mapState(['Classroom']),
  },

  validations: {
    formData: {
      content: { required },
    },
  },

  created() {
    if (this.isEditing) this.setup()
  },

  methods: {
    ...mapActions([
      'attemptCreateClassroomNote',
      'attemptEditClassroomNote',
      'attemptGetClassroomNote',
      'setFeedback',
      'setFetching',
    ]),

    setup() {
      this.setFetching(true)
      this.attemptGetClassroomNote(this.id || this.$route.params.id)
        .then(({ data }) => {
          this.formData = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submit() {
      if (!this.validateForm()) return

      const payload = this.mountPayload()
      const submitAction = this.getSubmitAction()

      this.setFetching(true)
      submitAction(payload)
        .then(() => this.handleSuccess())
        .finally(() => this.setFetching(false))
    },

    validateForm() {
      this.$v.$touch()
      return !this.$v.$invalid
    },

    getSubmitAction() {
      return this.isEditing ? this.attemptEditClassroomNote : this.attemptCreateClassroomNote
    },

    handleSuccess() {
      this.$emit('created')
      this.setFeedback({
        message: this.$t(`notes:${this.isEditing ? 'edit' : 'create'}.success`),
      })

      if (this.$route.meta.group === 'notes') {
        this.$router.push({ name: 'classroom.notes' })
      }
    },

    mountPayload() {
      const pathGroup = this.$route.path.split('/')[3]
      const noteToolId = this.Classroom.data.note.id
      const refSlug = REFERENCES[pathGroup]
      const payload = { ...this.formData, note_id: noteToolId }

      if (refSlug && pathGroup !== 'lessons') {
        payload.reference_id = this.Classroom.data[refSlug.reference_slug].id
        payload.reference_slug = refSlug.reference_slug
      } else {
        payload.reference_id = null
        payload.reference_slug = pathGroup === 'lessons' ? 'topic' : 'course'
      }

      if (refSlug.title_selector) {
        payload.title = document.querySelector(refSlug.title_selector).innerText
      }

      return payload
    },
  },
}
</script>

<template>
  <div class="note-create main-content-inner mt-5">
    <div class="center">
      <h3 class="mb-1">{{ isEditing ? $t('notes:edit') : $t('notes:new') }}</h3>

      <TextEditor
        v-model="formData.content"
        :label="$t('global:form.description')"
        :validation="$v.formData.content"
        :rows="12"
        :max-rows="12"
        :counter="500"
        :bubble="bubble"
      />

      <div class="note-create__actions">
        <Action
          :text="$t('global:cancel')"
          type="button"
          flat
          @click="
            $route.meta.group === 'notes'
              ? $router.push({ name: 'classroom.notes' })
              : $emit('cancel')
          "
        />
        <Action
          :text="$t('global:save')"
          type="button"
          secondary
          @click="submit"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './NoteCreate.scss';
</style>
