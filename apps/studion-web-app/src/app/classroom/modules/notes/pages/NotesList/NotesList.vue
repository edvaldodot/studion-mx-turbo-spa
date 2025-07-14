<script>
import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Note from '@/components/general/Note'
import Pagination from '@/components/general/Pagination'
import ModalConfirm from '@/components/general/ModalConfirm'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'NotesList',

  components: {
    Action,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Note,
    Pagination,
    ModalConfirm,
  },

  mixins: [paginateMixin],

  data() {
    return {
      notes: [],
      openNote: {},
      deleteId: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),

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

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.pgtrDefaultOrder = {
      property: 'created_at',
      type: 'desc',
    }
    this.pgtrInitializePagination('classroomNotesResource', null, {
      filter: [{ note_id: this.Classroom.data.note.id }],
    })
  },

  methods: {
    ...mapActions([
      'attemptDeleteClassroomNote',
      'attemptDownloadNotes',
      'setFeedback',
      'setFetching',
    ]),

    closeNote() {
      this.openNote = {}
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
  },
}
</script>

<template>
  <div class="notes-list">
    <div class="m-4">
      <FilterList>
        <Action
          slot="button"
          :url="{ name: 'classroom.notes.create' }"
          :text="$t('notes:new')"
          primary
          large
          fixed-width
        />

        <FilterListSearch
          slot="search"
          hide-error-details
          @search="pgtrSetSearch('text', $event)"
        />
        <FilterListOrder
          slot="order"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <div class="center">
      <div
        v-if="pgtrCurrentData.length && pgtrCurrentData.length > 0"
        class="notes"
      >
        <Note
          v-for="note in pgtrCurrentData"
          :key="note.id"
          :data="note"
          mode="list"
          @click="openNote = note"
          @edit="$router.push({ name: 'classroom.notes.edit', params: { id: note.id } })"
          @delete="deleteHandler(note.id)"
          @download="download(note.id)"
        />
      </div>

      <EmptyMessage
        v-else
        class="mb-5"
      >
        <h2 class="mb-5">{{ $t('classroom.notes:empty.title') }}</h2>
      </EmptyMessage>

      <div
        v-if="openNote.id"
        class="open-note"
      >
        <Note
          :data="openNote"
          mode="view"
          @close="closeNote"
        />
      </div>
    </div>

    <Pagination
      class="center"
      :active-page="pgtrParams.page"
      :page-count="pgtrLastPage"
      @next-page="pgtrParams.page++"
      @previous-page="pgtrParams.page--"
      @first-page="pgtrParams.page = 1"
      @last-page="pgtrParams.page = pgtrLastPage"
      @go-to-page="pgtrParams.page = $event"
      @change-items-per-page="pgtrParams.limit = $event"
    />

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
@import './NotesList.scss';
</style>
