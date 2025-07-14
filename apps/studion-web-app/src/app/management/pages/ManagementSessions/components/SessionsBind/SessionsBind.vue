<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import SectionBlock from '@/components/general/SectionBlock'
import EmptyMessage from '@/components/general/EmptyMessage'
import SessionsDatatable from '../SessionsDatatable'
import SessionsModal from '../SessionsModal'

export default defineComponent({
  name: 'SessionsBind',

  components: {
    Action,
    SessionsModal,
    SectionBlock,
    SessionsDatatable,
    EmptyMessage,
  },

  props: {
    filterTool: {
      type: String,
      default: '',
    },
    nameBindComponent: {
      type: String,
      default: '',
    },
    showExtraForumColumns: {
      type: Boolean,
      default: false,
    },
    avaliativeForum: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      openModal: false,
      sessions: [],
      selectedIds: [],
      grades: [],
    }
  },

  watch: {
    value(newValue) {
      this.selectedIds = newValue
    },

    selectedIds(newValue) {
      this.$emit('input', newValue)
    },

    openModal(newValue) {
      this.$emit('modal-is-open', newValue)
    },
  },

  created() {
    this.selectedIds = this.value
  },

  methods: {
    updateSessions({ selectedIds, selectedSessions }) {
      this.selectedIds = [...selectedIds]
      const allSessions = [...this.sessions, ...selectedSessions]

      this.sessions = []

      for (let i = 0; i < this.selectedIds.length; i++) {
        const session = allSessions.find((item) => item.id === this.selectedIds[i])
        if (session) this.sessions.push(session)
      }
    },

    defineGrade({ id, value }) {
      const idx = this.grades.findIndex((g) => g.id === id)

      if (idx != -1) {
        this.grades[idx] = { id, value }
      } else {
        this.grades.push({ id, value })
      }

      this.$emit('update-grades', this.grades)
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('session-bind')">
    <div class="sessions-bind__container">
      <SectionBlock
        :title="$t('bind.sessions:modal.title')"
        :description="
          nameBindComponent
            ? $t('bind.sessions:modal.description') + ' ' + nameBindComponent
            : $t('bind.sessions:modal.description')
        "
      >
        <template #header-action>
          <Action
            :text="$t('global:bind')"
            type="button"
            primary
            dark
            @click="openModal = true"
          />
        </template>

        <SessionsDatatable
          v-if="sessions.length > 0"
          v-model="selectedIds"
          class="sessions-bind__datatable"
          :data-list="sessions"
          :filter-tool="filterTool"
          :show-extra-forum-columns="showExtraForumColumns"
          @define-grade="defineGrade"
        />

        <EmptyMessage v-else>
          <h2>{{ $t('solutions.create.classes:title.add.bindClass') }}</h2>
          <p class="text-color">{{ $t('solutions.create.classes:text.add.bindClass') }}</p>
        </EmptyMessage>
      </SectionBlock>
    </div>

    <SessionsModal
      v-if="openModal"
      :ids="selectedIds"
      :filter-tool="filterTool"
      :avaliative-forum="avaliativeForum"
      @close="openModal = false"
      @submit="updateSessions"
    />
  </div>
</template>

<style lang="scss">
@import 'SessionsBind.scss';
</style>
