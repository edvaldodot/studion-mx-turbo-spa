<script>
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import urlYoutubeVimeoValidator from '@/support/customValidators/urlYoutubeVimeoValidator'

import { required, url } from 'vuelidate/lib/validators'

export default {
  name: 'ModalEmbedVideo',

  components: {
    Action,
    Modal,
    InputField,
  },

  data() {
    return {
      formData: {
        active: true,
        url: null,
      },
    }
  },

  validations() {
    return {
      formData: {
        url: {
          required,
          url,
          urlYoutubeVimeoValidator,
        },
      },
    }
  },

  methods: {
    submit() {
      if (!this.$v.formData.url.$invalid) {
        this.$emit('submit', this.formData.url)
        this.formData.url = null
        this.$emit('close')
      }
    },
  },
}
</script>

<template>
  <Modal
    active
    is-page
    only-close-one-modal
    @close="$emit('close')"
  >
    <h2 class="modal-title is-capitalize">{{ $t('classroom.forum:modal.add.video.title') }}</h2>
    <div class="modal-description">
      <p>{{ $t('classroom.forum:modal.add.video.description') }}</p>
    </div>
    <form>
      <InputField
        v-model="formData.url"
        :label="$t('classroom.forum:modal.add.video.input.label')"
        :validation="$v.formData.url"
        dark
      />
      <div class="form-submit text-center">
        <Action
          :text="$t('global:add')"
          type="button"
          secondary
          large
          fixed-width
          @click="submit()"
        />
      </div>
    </form>
  </Modal>
</template>
