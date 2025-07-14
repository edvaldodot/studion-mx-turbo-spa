<script>
import { mapActions, mapState } from 'vuex'
import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import FacialRecognitionModal from '../components/FacialRecognitionModal/'

const DASHBOARD_ROUTE = { name: 'dashboard' }

export default {
  name: 'ModalBlockedAccess',

  components: {
    Modal,
    FacialRecognitionModal,
    Action,
  },

  computed: {
    ...mapState({ facialRecognition: (state) => state.Classroom.facialRecognition }),
  },

  mounted() {
    this.setFetching(false)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptValidateExit',
      'setFacialRecognitionNext',
      'setActiveFacialRecognition',
    ]),

    goToDashboard() {
      this.$router.push(DASHBOARD_ROUTE)
    },

    exitHandler() {
      if (!this.$isEnabledFeature('biometrics') || !this.$route.params.session_uuid) {
        return this.goToDashboard()
      }

      this.setFetching(true)
      this.attemptValidateExit({
        uuid: this.$route.params.session_uuid,
        configType: 'exit_classroom',
      })
        .then(({ data: allowExit }) => {
          if (allowExit) {
            return this.goToDashboard()
          }
        })
        .catch(() => {
          this.setFacialRecognitionNext(DASHBOARD_ROUTE)
          return this.setActiveFacialRecognition(true)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <Modal
    :active="true"
    :cancel="false"
    is-page
  >
    <template v-if="!facialRecognition.active">
      <span class="modal-subtitle">{{ $t('classroom.blocked.access:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">{{ $t('classroom.blocked.access:modal.title') }}</h2>
      <div class="modal-description text-color blocked-access__message">
        <p class="text-color">{{ $t('classroom.blocked.access:modal.message.part.1') }}</p>
        <p class="text-color">{{ $t('classroom.blocked.access:modal.message.part.2') }}</p>
      </div>
      <div class="text-center">
        <Action
          :text="$t('global:back')"
          type="button"
          fixed-width
          secondary
          large
          @click="exitHandler"
        />
      </div>
    </template>

    <FacialRecognitionModal
      v-else
      :allow-back="false"
    />
  </Modal>
</template>

<style lang="scss">
.blocked-access__message {
  p {
    font-size: 2em;
    margin: 20px 0;
    font-family: var(--font-family);
    color: var(--text-color);
  }
}
</style>
