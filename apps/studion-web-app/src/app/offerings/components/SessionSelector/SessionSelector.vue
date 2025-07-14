<script>
import { mapState } from 'vuex'
import * as TYPES from '@/domains/offerings/vuex/mutations-types'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'

export default {
  name: 'SessionSelector',
  components: {
    Action,
    ClosedSessionForm: () => import('@/app/offerings/components/ClosedSessionForm'),
    Icon,
    IndividualSessionForm: () => import('@/app/offerings/components/IndividualSessionForm'),
    Modal: () => import('@/components/general/Modal'),
    OpenSessionForm: () => import('@/app/offerings/components/OpenSessionForm')
  },
  data () {
    return {
      slider: null,
      sessionsTypes: [
        {
          alias: 'individual',
          name: this.$t('offerings.sessions.edit:session.individual.name'),
          description: this.$t('offerings.sessions.edit:session.individual.description'),
          icon: 'c-googles'
        },
        {
          alias: 'open',
          name: this.$t('offerings.sessions.edit:session.open.name'),
          description: this.$t('offerings.sessions.edit:session.open.description'),
          icon: 'c-calendar'
        },
        {
          alias: 'closed',
          name: this.$t('offerings.sessions.edit:session.closed.name'),
          description: this.$t('offerings.sessions.edit:session.closed.description'),
          icon: 'c-clock'
        }
      ],
      modalConfirmSession: false
    }
  },
  computed: {
    ...mapState(['offerings', 'accessibility']),
    currentSessionType () {
      return this.offerings.current ? this.offerings.current.meta.sessionType : null
    },
    currentCourses () {
      return this.offerings.current ? this.offerings.current.meta.courses : null
    },
    currentConfigs () {
      return this.offerings.current ? this.offerings.current.meta.configs : null
    },
    sessionsTypesFiltered () {
      return this.sessionsTypes.filter(type => this.enableTypes.includes(type.alias))
    }
  },
  props: {
    enableTypes: {
      type: Array,
      default: () => []
    },
    reopenSession: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    configTypeIsDefined (sessionType) {
      return this.offerings.current && this.offerings.current.meta.configs.length && this.offerings.current.meta.sessionType !== sessionType
    },
    updateSessionType (alias) {
      this.$store.commit(TYPES.SET_CURRENT_SESSION_TYPE, alias)
      this.$store.commit(TYPES.SET_CONFIGS, [])
    },
    addSessionConfig (config) {
      var configs = this.currentConfigs

      if (this.currentSessionType === 'individual') {
        configs = []
      } else {
        config.courses = this.offerings.current.meta.courses.map(course => {
          return {
            ...course,
            isCustomPeriod: false,
            start_date: null,
            end_date: null
          }
        })
      }

      if (config.categories) {
        config.categories = config.categories.map(category => category.id)
      }

      configs.push(config)
      this.$store.commit(TYPES.SET_CONFIGS, configs)
    },
    resetSessionsConfigs () {
      this.$store.commit(TYPES.SET_CONFIGS, [])
    },
    removeOne (index) {
      const configs = this.currentConfigs

      configs.splice(index, 1)

      this.$store.commit(TYPES.SET_CONFIGS, configs)
    },
    openModalConfirmSession () {
      this.modalConfirmSession = true
    },
    closeModalConfirmSession () {
      this.modalConfirmSession = false
    }
  }
}
</script>
<template>
  <div class="session-wrapper">
    <div class="session-selector-container" v-if="!currentSessionType">
      <div class="session-selector-list" :class="{ 'is-one': sessionsTypesFiltered.length === 1}" ref="selector">
        <div
          class="session-type"
          :class="{
            'is-active': currentSessionType === sessionType.alias,
            'is-disabled': configTypeIsDefined(sessionType.alias),
            [sessionType.alias]: sessionType
          }"
          v-for="sessionType in sessionsTypesFiltered"
          :key="sessionType.alias"
        >
          <div class="session-type-inner">
            <div class="session-type-icon">
              <icon :name="sessionType.icon"/>
            </div>
            <div class="session-type-content">
              <span class="session-type-label">{{ $t('offerings.sessions.edit:session.type.label') }}</span>
              <span class="session-type-title">{{ sessionType.name }}</span>
              <span class="session-type-description">{{ sessionType.description }}</span>
              <action :text="$t('global:select')" type="button" primary dark @click="updateSessionType(sessionType.alias)"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="currentSessionType === 'individual'">
      <individual-session-form
        ref="form"
        @submit="addSessionConfig"
        @remove="removeOne"
        @reset-session="openModalConfirmSession()"
        :disabled="this.currentConfigs.length === 1"
      />
    </template>
    <template v-if="currentSessionType === 'open'">
      <open-session-form
        ref="form"
        :reopen-session="reopenSession"
        @submit="addSessionConfig"
        @remove="removeOne"
        @reset-session="openModalConfirmSession()"
      />
    </template>
    <template v-if="currentSessionType === 'closed'">
      <closed-session-form
        ref="form"
        :reopen-session="reopenSession"
        @submit="addSessionConfig"
        @remove="removeOne"
        @reset-session="openModalConfirmSession()"
      />
    </template>

    <modal :active.sync="modalConfirmSession" :cancel="false">
      <div class="modal-confirm">
        <action type="button" icon="close" icon-size="medium" class="btn-close" @click="closeModalConfirmSession()"></action>
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('offerings.sessions.edit:modal.change.confirm.title') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('offerings.sessions.edit:modal.change.confirm.message') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action type="button" :text="$t('global:confirm')" flat @click="updateSessionType(''), closeModalConfirmSession()" :dark="accessibility"></action>
          <action type="button" :text="$t('global:cancel')" flat class="btn-cancel" @click="closeModalConfirmSession()" :dark="accessibility"></action>
        </div>
      </div>
    </modal>
  </div>
</template>

<style lang="scss"></style>
