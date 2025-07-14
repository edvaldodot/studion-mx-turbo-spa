<script>
import { mapActions, mapState } from 'vuex'

import Modal from '@/components/general/Modal'

import SessionTabsModal from '../../components/SessionTabsModal'
import ContentMediationList from './components/ContentMediationList'

export default {
  name: 'ModalSessionMediation',

  components: {
    ContentMediationList,
    Modal,
    SessionTabsModal
  },

  data () {
    return {
      formData: {
        session: {
          name: ''
        }
      }
    }
  },
  computed: {
    ...mapState(['accessibility', 'fetching', 'Sessions'])
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'resetMediationSessionList'
    ])
  },

  created () {
    if (this.$route.params.id && this.Sessions.current) {
      this.formData.session.name = this.Sessions.current.name
    } else {
      this.$router.push({name: 'community.sessions'})
    }
  },

  beforeDestroy () {
    this.resetMediationSessionList()
  }
}
</script>
<template>
  <modal :active="true" :cancel="true" is-page>
    <div class="modal-form modal-add-session">
      <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
      <h2 class="modal-title text-color" v-if="canWrite('sessions')">{{ $t('community.sessions:modal.edit.title') }}</h2>
      <h2 class="modal-title text-color" v-else>{{ formData.session.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.sessions:modal.description') }}</p>
      </div>

      <session-tabs-modal
        :show-mediation-plan-tab="(this.canRead('mediation_plan') || this.canWrite('mediation_plan')) && $isEnabledFeature('pm')"
        :tab-link-active="2"
      />

    </div>

    <content-mediation-list :session-id="$route.params.id"/>

  </modal>
</template>
