<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'

export default {
  name: 'ModalAddFaq',
  components: {
    Action,
    InputField,
    Modal,
    SelectField
  },
  data () {
    return {
      newCategory: false,
      formData: {
        category: null,
        question: null,
        answer: null,
        active: true,
        position: 1
      }
    }
  },
  validations: {
    formData: {
      category: {
        required
      },
      question: {
        required
      },
      answer: {
        required
      }
    }
  },
  computed: {
    ...mapState(['faqs', 'fetching']),
    categoriesOptions () {
      return this.faqs.categories.map(({ id, name }) => ({ value: id, text: name }))
    },
    isEditing () {
      return this.$route.meta.editing
    }
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptFaqQuestionsCreation',
      'attemptFaqQuestionsUpdate',
      'attemptFaqCategoryCreation',
      'setFaqsData',
      'addFaqsItems',
      'addFaqsCategories'
    ]),
    setNewCategory () {
      this.newCategory = true
      this.formData.category = null
      this.$nextTick(() => {
        this.$refs.inputCategory.$refs.input.focus()
      })
    },
    addNewFaq () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (this.newCategory) {
          this.setFetching(true)
          this.attemptFaqCategoryCreation({name: this.formData.category, active: true}).then(({ data }) => {
            this.addFaqsCategories(data)
            this.formData.category = data.id
            this.formData.id ? this.submitUpdate() : this.submitCreation()
          }).finally(() => {
            this.setFetching(false)
          })
        } else {
          this.formData.id ? this.submitUpdate() : this.submitCreation()
        }
      }
    },
    submitCreation () {
      this.setFetching(true)
      this.attemptFaqQuestionsCreation(this.formData).then(({ data }) => {
        this.addFaqsItems(data)
        this.$router.push({ name: 'faq.questions' })
        this.setFeedback({ message: this.$t('faq.questions:feedback.create.success') })
      }).catch(() => {
        this.setFeedback({ message: this.$t('faq.questions:feedback.create.error'), type: 'error' })
      }).finally(() => {
        this.setFetching(false)
      })
    },
    submitUpdate () {
      this.setFetching(true)
      this.attemptFaqQuestionsUpdate({ faqQuestionId: this.formData.id, data: this.formData }).then(({ data }) => {
        Object.assign(this.faqs.current, {})
        this.setFaqsData({path: 'current', value: null})
        this.$router.push({ name: 'faq.questions' })
        this.setFeedback({ message: this.$t('faq.questions:feedback.update.success') })
      }).catch(() => {
        this.setFeedback({ message: this.$t('faq.questions:feedback.update.error'), type: 'error' })
      }).finally(() => {
        this.setFetching(false)
      })
    }
  },
  created () {
    this.newCategory = this.faqs.categories.length === 0
    if (this.isEditing && this.faqs.current) {
      this.formData.id = this.faqs.current.id
      this.formData.question = this.faqs.current.question
      this.formData.answer = this.faqs.current.answer
      this.formData.likeStatistics = this.faqs.current.likeStatistics
      this.formData.category = this.faqs.current.category.id
    }
  }
}
</script>

<template>
  <modal :active="!fetching" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('faq:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">{{ formData.id ? $t('faq.index:modal.title.edit') : $t('faq.index:modal.title.add') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('faq.index:modal.description') }}</p>
      </div>
      <form @submit.prevent="addNewFaq">
        <div class="form-group form-group-category clearfix" v-if="!newCategory">
          <select-field :label="$t('global:form.category')" :items="categoriesOptions" v-model="formData.category" :validation="$v.formData.category" dark></select-field>
          <action :text="$t('faq.categories:btn.add')" type="button" flat @click="setNewCategory()" class="btn-add-category"></action>
        </div>
        <input-field :label="$t('global:form.category')" v-model="formData.category" :validation="$v.formData.category" dark ref="inputCategory" v-else></input-field>
        <input-field :label="$t('global:form.doubt')" v-model="formData.question" :validation="$v.formData.question" dark></input-field>
        <input-field :label="$t('global:form.answer')" v-model="formData.answer" :validation="$v.formData.answer" dark></input-field>
        <div class="form-submit text-center">
          <action :text="$t('global:form.save')" type="button" secondary large submit fixed-width></action>
        </div>
      </form>
    </div>
  </modal>
</template>
