<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalPreviewCertificate',
  components: {
    Action,
    Icon,
    Modal
  },
  data () {
    return {
      certificateName: 'Nome do certificado aqui!!!',
      certificateBody: null
    }
  },
  computed: {
    ...mapState(['fetching']),
    isEditing () {
      return this.$route.meta.editing
    },
    getCertificateBody () {
      return this.certificateBody
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCertificatePreviewRetrieval'
    ])
  },
  created () {
    this.setFetching(true)
    this.attemptCertificatePreviewRetrieval(this.$route.params.id)
      .then(({data}) => {
        this.certificateBody = data
      })
      .finally(() => {
        this.setFetching(false)
      })
  }
}
</script>

<template>
  <modal :active="!fetching" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('settings.certificate:modal.preview.header.title') }}</span>
      <h2 class="modal-title text-color">{{ certificateName }}</h2>
      <div class="modal-description text-color certificate-preview">
        <div v-html="certificateBody"></div>
      </div>
    </div>
  </modal>
</template>
