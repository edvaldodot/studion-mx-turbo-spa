<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'

const InputField = () => import('@/components/general/InputField')

export default defineComponent({
  name: 'ModalCreate',

  components: {
    Action,
    InputField,
    Modal,
  },

  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      createModalIsOpen: false,
      formData: {
        id: null,
        name: null,
      },
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
    },
  },
  computed: {
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  created() {
    if (this.isEditing) {
      this.formData = this.item
    }
  },

  methods: {
    ...mapState(['accessibility']),
    ...mapActions([
      'setFetching',
      'attemptCreateCategoryKB',
      'setFeedback',
      'attemptCreateSubCategoryKB',
      'attemptEditCategoryKB',
      'attemptEditSubCategoryKB',
    ]),

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      if (this.isEditing) {
        return this.isCategory ? this.submitUpdateCategory() : this.submitUpdateSubCategory()
      }
      this.isCategory ? this.submitCategory() : this.submitSubcategory()
    },

    close() {
      this.$emit('close')
    },

    submitCategory() {
      this.setFetching(true)
      this.attemptCreateCategoryKB({ sessionUuid: this.sessionUuid, payload: this.formData })
        .then(() => {
          this.$emit('refresh')
          this.$emit('refreshCategory')
          this.$router.back()
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:create:category.feedback.success'),
          })
        })
        .catch(({ response }) => {
          if (response.data.message === 'issue_category_already_exists') {
            this.setFeedback({
              message: this.$t(`classroom.knowledgeBase:${response.data.message}`),
              type: 'error',
            })
          } else {
            this.setFeedback({ message: this.$t('global:error'), type: 'error' })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    submitSubcategory() {
      this.setFetching(true)
      this.attemptCreateSubCategoryKB({
        sessionUuid: this.sessionUuid,
        category_id: this.category.id,
        payload: this.formData,
      })
        .then(() => {
          this.$emit('refresh')
          this.$router.back()
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:create:subcategory.feedback.success'),
          })
        })
        .catch(({ response }) => {
          if (response.data.message === 'issue_subcategory_already_exists_for_this_category') {
            this.setFeedback({
              message: this.$t(`classroom.knowledgeBase:${response.data.message}`),
              type: 'error',
            })
          } else {
            this.setFeedback({ message: this.$t('global:error'), type: 'error' })
          }
        })
        .finally(() => {
          this.$emit('updateHeight')
          this.setFetching(false)
        })
    },
    submitUpdateCategory() {
      this.setFetching(true)
      this.attemptEditCategoryKB({
        sessionUuid: this.sessionUuid,
        payload: this.formData,
      })
        .then(() => {
          this.$emit('refresh')
          this.$router.back()
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:edit:category.feedback.success'),
          })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    submitUpdateSubCategory() {
      this.setFetching(true)
      this.attemptEditSubCategoryKB({
        sessionUuid: this.sessionUuid,
        category_id: this.category.id,
        payload: this.formData,
      })
        .then(() => {
          this.$emit('refresh')
          this.$router.back()
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:edit:subcategory.feedback.success'),
          })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:error'), type: 'error' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    is-page
    @close="close"
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{
        isCategory ? $t('classroom.knowledgeBase.help:modal.add.categories.title') : category.name
      }}</span>

      <h2 class="modal-title is-capitalize">
        {{
          isCategory
            ? $t('classroom.knowledgeBase.help:modal.add.categories.subtitle')
            : $t('classroom.knowledgeBase.help:modal.add.subcategories.subtitle')
        }}
      </h2>

      <div class="modal-description">
        <p>
          {{
            isCategory
              ? $t('classroom.knowledgeBase.help:modal.add.categories.description')
              : $t('classroom.knowledgeBase.help:modal.add.subcategories.description')
          }}
        </p>
      </div>

      <form @submit.prevent="submit">
        <InputField
          v-model="formData.name"
          :label="
            item.id
              ? $t('classroom.knowledgeBase.help:modal.add.subcategories.input')
              : $t('classroom.knowledgeBase.help:modal.add.categories.input')
          "
          :counter="100"
          :validation="$v.formData.name"
          dark
        />

        <div class="form-submit text-center">
          <Action
            :text="formData.id ? $t('global:save') : $t('global:create')"
            type="button"
            secondary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>
  </Modal>
</template>

<style lang="scss"></style>
