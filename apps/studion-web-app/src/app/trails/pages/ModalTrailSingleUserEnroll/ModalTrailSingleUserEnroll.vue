<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'

export default {
  components: {
    Modal,
    Action,
    Autocomplete
  },
  props: {
    trailId: Number
  },
  data () {
    return {
      userSelect: null,
      autocompleteItems: [],
      autocompleteLoading: false
    }
  },
  validations: {
    userSelect: {
      required
    }
  },
  computed: {
    ...mapState({
      fetching: 'fetching',
      accessibility: 'accessibility',
      Sessions: 'Sessions',
      trail: state => state.Trails.current
    })
  },
  created () {
    this.setup()
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setCurrent',
      'attemptTrailSearchStudent',
      'attemptTrailEnrollSingleUser'
    ]),
    async setup () {
      const trailId = this.trailId || null
      if (!trailId) {
        this.$router.replace({ name: 'trails.list' })
        return
      }
      this.setCurrent(trailId)
    },
    getUsersList (value) {
      value = value.trim()
      if (value.length) {
        const trailId = this.trailId || null
        this.autocompleteLoading = true
        const requestData = {
          filter: value,
          pathsId: trailId
        }
        this.attemptTrailSearchStudent(requestData).then(({ data }) => {
          this.autocompleteLoading = false
          this.autocompleteItems = data ? data.map(({ name, uuid, email }) => ({ name, uuid, email })) : []
        })
      }
    },
    registerUser () {
      this.$v.userSelect.$touch()
      if (this.$v.userSelect.$invalid) {
        return
      }

      let userSelect = this.userSelect[0]
      this.attemptTrailEnrollSingleUser(userSelect.uuid)
        .then(() => {
          this.$router.push({ name: 'trails.users' })
        })
        .catch(({ response }) => {
          if (response.data.message === 'path_ended') {
            this.setFeedback({
              message: this.$t('classroom.list.trails:cant.enroll.by.date'),
              type: 'error',
            })
          }
        })
    }
  }
}
</script>

<template>
  <modal :active="true" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ trail.name }}</span>
      <h2 class="modal-title text-color">{{ $t('trails.users:modal.single.title') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.users:modal.single.description') }}</p>
      </div>
      <form @submit.prevent="registerUser()">
        <autocomplete
          dark
          async
          v-model="userSelect"
          append-icon="search"
          option-property=":name (:email)"
          :validation="$v.userSelect"
          :label="$t('trails.users:modal.single.form.user')"
          :is-custom-property="true"
          :loading="autocompleteLoading"
          :items="autocompleteItems"
          @search="getUsersList($event)"
        />
        <div class="form-submit text-center">
          <action
            secondary
            large
            submit
            type="button"
            :text="$t('trails.users:modal.single.form.btn.submit')"
          />
        </div>
      </form>
    </div>
  </modal>
</template>
