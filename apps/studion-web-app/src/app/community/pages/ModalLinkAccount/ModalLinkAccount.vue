<script>
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalLinkAccount',
  components: {
    Action,
    Checkbox,
    FormSection,
    InputField,
    Modal
  },
  data () {
    return {
      modalIsActive: false
    }
  },
  computed: {
    ...mapState(['fetching']),
    name () {
      return this.$route.params.name || 'invalid_name'
    },
    username () {
      return this.$route.params.username || 'invalid_user'
    },
    email () {
      return this.$route.params.email || 'invalid_email'
    }
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptProfileCreation',
      'attemptProfileUpdate'
    ]),
    redirectToUserForm () {
      this.$router.push({
        name: 'community.users.create',
        params: {
          name: this.name,
          username: this.username,
          email: this.email
        }
      })
    }
  },
  created () {
    this.modalIsActive = true
  }
}
</script>

<template>
  <modal :active="modalIsActive" is-page>
    <div class="modal-form modal-add-profile">
      <span class="modal-subtitle">{{ $t('community:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">{{ $t('community:modal.user.exists.subtitle') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community:modal.user.exists.description.1') }}</p>
        <p v-html="$t('community:modal.user.exists.description.2', {'email': email})"></p>
        <p class="text-color"><b>{{ $t('community:modal.user.exists.name') }}</b></p>
        <p class="text-color">{{ name }}</p>
        <p class="text-color"><b>{{ $t('community:modal.user.exists.username') }}</b></p>
        <p class="text-color">{{ username }}</p>
      </div>
      <form @submit.prevent="submit">
        <div class="form-submit text-center">
          <action text="Vincular" type="button" @click="redirectToUserForm" secondary large fixed-width></action>
        </div>
      </form>
    </div>
  </modal>
</template>
