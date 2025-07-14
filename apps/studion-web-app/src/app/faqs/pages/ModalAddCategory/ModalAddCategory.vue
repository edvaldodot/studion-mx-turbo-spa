<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalAddCategory',
  components: {
    Action,
    InputField,
    Modal
  },
  data () {
    return {
      formData: {
        name: null
      }
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
    ...mapState(['faqs', 'fetching']),
    isEditing () {
      return this.$route.meta.editing
    }
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFaqCategoryCreation',
      'attemptFaqCategoryUpdate'
    ]),
    addNewCategory () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        this.formData.id ? this.submitUpdate() : this.submitCreation()
      }
    },
    submitCreation () {
      this.attemptFaqCategoryCreation({name: this.formData.name, active: true})
        .then(({data}) => {
          this.$router.push({name: 'faq.categories', params: {refreshCategories: Date.now()}})
          this.setFeedback({message: this.$t('faq.categories:feedback.created.success')})
        })
        .catch(() => {
          this.$router.push({name: 'faq.categories'})
          this.setFeedback({message: this.$t('faq.categories:feedback.created.error'), type: 'error'})
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    submitUpdate () {
      this.attemptFaqCategoryUpdate({categoryId: this.formData.id, data: this.formData})
        .then(({data}) => {
          Object.assign(this.faqs.current, data)
          this.$router.push({name: 'faq.categories', params: {refreshCategories: Date.now()}})
          this.setFeedback({message: this.$t('faq.categories:feedback.updated.success')})
        })
        .catch(() => {
          this.$router.push({name: 'faq.categories'})
          this.setFeedback({message: this.$t('faq.categories:feedback.updated.error'), type: 'error'})
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },
  created () {
    if (this.isEditing && this.faqs.current) {
      this.formData.id = this.faqs.current.id
      this.formData.name = this.faqs.current.name
    }
  }
}
</script>

<template>
  <modal :active="!fetching" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('faq:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">{{ formData.id ? $t('faq.categories:modal.title.edit') : $t('faq.categories:modal.title.add') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('faq.categories:modal.description') }}</p>
      </div>
      <form @submit.prevent="addNewCategory">
        <input-field :label="$t('faq.categories:modal.form.name')" v-model="formData.name" :validation="$v.formData.name" dark></input-field>
        <div class="form-submit text-center">
          <action :text="$t('global:form.save')" type="button" secondary large submit fixed-width></action>
        </div>
      </form>
    </div>
  </modal>
</template>
