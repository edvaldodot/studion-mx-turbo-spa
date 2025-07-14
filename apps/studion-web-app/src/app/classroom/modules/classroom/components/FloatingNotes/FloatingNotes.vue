<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { REFERENCES } from './shared'

import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import ModalConfirm from '@/components/general/ModalConfirm'
import Note from '@/components/general/Note'
import NoteCreate from '../../../notes/pages/NoteCreate/NoteCreate.vue'

import config from '@/config'

const { ZENDESK_KEY_STUDENT, ZENDESK_KEY_ADMIN } = config

export default defineComponent({
  name: 'FloatingNotes',

  components: {
    Action,
    EmptyMessage,
    Icon,
    Note,
    Loading,
    FilterList,
    FilterListSearch,
    ModalConfirm,
    NoteCreate,
  },

  mixins: [paginateMixin],

  data() {
    return {
      yPos: 0,
      showTip: true,
      screen: 'home',
      loading: false,
      openNote: null,
      deleteId: null,
      edit: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    isShow() {
      const isToolEnabled = this.Classroom && this.Classroom.data && this.Classroom.data.note
      const isNotesGroup = this.$route.meta.group === 'notes'
      const isExaminationParam = this.$route.params.type === 'examination'
      const hasSlug = Boolean(REFERENCES[this.referenceGroup])

      if (!this.equalsProfile('student') || this.$isUserImpersonated()) return false

      return !(isNotesGroup || isExaminationParam || !isToolEnabled) && hasSlug
    },

    referenceGroup() {
      return this.$route.path.split('/')[3]
    },
  },

  watch: {
    'Classroom.onTutorial': {
      immediate: true,
      handler(value) {
        if (value) return (this.showTip = false)
        this.showTip = true
      },
    },

    '$route.name': {
      immediate: true,
      handler() {
        this.setPosition()
      },
    },

    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.loading = loading
      },
    },

    'Classroom.floatingNotes.active': {
      handler(val) {
        const toolId = this.Classroom.data.note.id
        const alreadyLoaded =
          this.pgtrIsInitialized && toolId === this.Classroom.floatingNotes.note_id

        if ((val && !this.Classroom.floatingNotes.data) || alreadyLoaded) return

        this.pgtrDefaultOrder = {
          property: 'created_at',
          type: 'desc',
        }
        this.pgtrInitializePagination('classroomNotesResource', null, {
          filter: [{ note_id: toolId }],
        })
      },
    },
  },

  mounted() {
    this.setPosition()
  },

  methods: {
    ...mapActions([
      'attemptDeleteClassroomNote',
      'attemptDownloadNotes',
      'toggleFloatingNotes',
      'classroomNotesResource',
      'setFetching',
      'setFeedback',
    ]),

    setPosition() {
      const BASE_BOTTOM_VALUE = 20
      const ADDITIONAL_OFFSETS = {
        zendesk: 80,
        floatGPT: 60,
        lessons: 60,
      }

      let bottomValue = BASE_BOTTOM_VALUE

      if (ZENDESK_KEY_ADMIN || ZENDESK_KEY_STUDENT) {
        bottomValue += ADDITIONAL_OFFSETS.zendesk
      }

      const floatGPTButton = document.querySelector('.float-gpt-button .float-button__button')
      if (floatGPTButton) {
        bottomValue += ADDITIONAL_OFFSETS.floatGPT
      }

      if (this.$route.name.includes('classroom.lessons.course') && this.$media.mobile) {
        bottomValue += ADDITIONAL_OFFSETS.lessons
      }

      this.yPos = bottomValue
    },

    floatingNotesToggler() {
      this.showTip = false
      this.toggleFloatingNotes()
    },

    createdHandler() {
      this.screen = 'home'
      this.pgtrRefresh()
    },

    deleteHandler(id) {
      this.deleteId = id
    },

    deleteNote() {
      this.setFetching(true)
      this.attemptDeleteClassroomNote(this.deleteId)
        .then(() => {
          this.setFeedback({ message: this.$t('notes:delete.success') })
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
          this.deleteId = null
        })
    },

    download(id) {
      this.setFetching(true)
      this.attemptDownloadNotes([id])
        .then(() => this.setFeedback({ message: this.$t('global:download.success') }))
        .finally(() => this.setFetching(false))
    },

    editHandler(id) {
      this.screen = 'create'
      this.edit = id
    },

    cancelHandler() {
      this.screen = 'home'
      this.edit = null
    },
  },
})
</script>

<template>
  <div
    v-show="isShow"
    :style="{ bottom: `${yPos}px` }"
    class="floating-notes-wrapper"
  >
    <div
      v-if="showTip"
      class="floating-notes__tip"
    >
      <p>
        {{ $t('notes:classroom.tooltip') }}
      </p>
      <Icon
        name="close"
        wrapper
        @click="showTip = false"
      />
    </div>

    <div
      v-if="!Classroom.floatingNotes.active"
      class="floating-notes"
      @click="floatingNotesToggler"
    >
      <Icon name="notes" />
    </div>

    <div
      v-if="Classroom.floatingNotes.active"
      class="floating-notes-float"
    >
      <div class="floating-notes-float__header">
        <template v-if="screen !== 'create'">
          <h3>{{ $t('notes:personal') }}</h3>
        </template>
        <template v-else>
          <Icon
            name="keyboard_backspace"
            wrapper
            @click="screen = 'home'"
          />
          <p>{{ $t('notes:personal') }}</p>
        </template>
        <Icon
          name="close"
          wrapper
          @click="floatingNotesToggler"
        />
      </div>

      <div
        v-if="screen === 'home'"
        class="floating-notes-float__body"
      >
        <div class="my-3">
          <FilterList>
            <FilterListSearch
              slot="search"
              hide-error-details
              @search="pgtrSetSearch('text', $event)"
            />
          </FilterList>
        </div>

        <Loading v-if="loading" />

        <template v-else>
          <template v-if="screen === 'home'">
            <Note
              v-for="note in pgtrCurrentData.slice(0, 5)"
              :key="note.id"
              :data="note"
              :mode="note.id === openNote ? 'view' : 'list'"
              class="mb-3 mr-1"
              @click="openNote = note.id"
              @close="openNote = null"
              @edit="editHandler(note.id)"
              @delete="deleteHandler(note.id)"
              @download="download(note.id)"
            />

            <div class="floating-notes-float__footer mt-3">
              <Action
                :text="$t('global:view.all.f')"
                type="button"
                secondary
                class="mb-5 mt-5"
                @click="$router.push({ name: 'classroom.notes' })"
              />
              <Action
                icon="add"
                type="button"
                secondary
                class="mb-5 mt-5 add"
                @click="screen = 'create'"
              />
            </div>
          </template>

          <template v-if="screen === 'home' && !pgtrCurrentData.length">
            <EmptyMessage empty-state="11" show-icon>
              <template #title>
                <div class="text-base">
                  {{ $t('notes:empty.title') }}
                </div>
              </template>
              <template #text>
                <div class="text-base">
                  {{ $t('notes:empty.description') }}
                </div>
              </template>
            </EmptyMessage>

            <Action
              :text="$t('notes:new')"
              type="button"
              secondary
              fixed-width
              flatten
              class="mb-5 mt-5"
              @click="screen = 'create'"
            />
          </template>
        </template>
      </div>

      <div
        v-if="screen === 'create'"
        class="floating-notes-create"
      >
        <NoteCreate
          :id="edit"
          :is-editing="!!edit"
          bubble
          @cancel="cancelHandler()"
          @created="createdHandler"
        />
      </div>
    </div>

    <ModalConfirm
      :active="deleteId"
      :title="$t('notes:delete.title')"
      @close="deleteId = null"
      @confirm="deleteNote"
    >
      <p>{{ $t('notes:delete.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './FloatingNotes.scss';
</style>
