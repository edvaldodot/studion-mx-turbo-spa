<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalAddCategory',
  components: {
    Action,
    Icon,
    InputField,
    Modal
  },
  props: {
    categoryId: Number
  },
  data () {
    return {
      formData: {
        id: null,
        name: null,
        position: null
      },
      modalCustom: false
    }
  },
  validations: {
    formData: {
      name: {
        required
      }
    }
  },
  computed: {
    ...mapState({
      fetching: state => state.fetching,
      categoriesList: state => state.Categories.list
    }),
    isEditing () {
      return !!this.categoryId
    },
    hasWriteAccess () {
      return this.notEqualsProfile('student') && this.canWrite('settings')
    },
    hasReadAccess () {
      return this.notEqualsProfile('student') && this.canRead('settings')
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptSaveCategory',
      'attemptCategoryRetrieval'
    ]),
    submitCategory () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.submitFormData()
      }
    },
    submitFormData () {
      let messageContext = 'settings.categories:feedback'
      messageContext += this.isEditing ? '.updated' : '.created'

      this.attemptSaveCategory(this.formData).then(() => {
        this.setFeedback({ message: this.$t(messageContext + '.success') })
      }).catch(({ response }) => {
        let errorMessage = response.data.message
        let feedback = messageContext + '.error'

        if (errorMessage) {
          feedback += ':' + errorMessage
        }

        this.setFeedback({ message: this.$t(feedback) })
      }).finally(() => {
        this.$router.push({ name: 'settings.categories' })
      })
    },
    getNewPosition () {
      return this.categoriesList.length + 1
    }
  },
  created () {
    if (this.isEditing) {
      this.setFetching(true)
      this.formData.id = this.categoryId
      this.attemptCategoryRetrieval(this.formData)
        .then(({data}) => {
          this.formData.name = data.name
          this.formData.position = data.position ? data.position : this.getNewPosition()
        })
        .finally(() => {
          this.setFetching(false)
        })
    } else {
      this.formData.position = this.getNewPosition()
    }
  }
}
</script>

<template>
  <div>
    <modal :active="!fetching" is-page>
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('settings.categories:modal.header.title') }}</span>
        <h2 class="modal-title text-color">{{ isEditing ? $t('settings.categories:modal.title.edit') : $t('settings.categories:modal.title.add') }}</h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('settings.categories:modal.description') }}</p>
        </div>
        <form @submit.prevent="submitCategory()">
          <input-field :label="$t('settings.categories:modal.form.name')" v-model="formData.name" :validation="$v.formData.name" :counter="120" dark></input-field>
          <div class="form-submit text-center">
            <action :text="isEditing ? $t('global:save') : $t('global:create')" type="button" secondary large submit fixed-width></action>
          </div>
        </form>
      </div>
    </modal>
  </div>
</template>
