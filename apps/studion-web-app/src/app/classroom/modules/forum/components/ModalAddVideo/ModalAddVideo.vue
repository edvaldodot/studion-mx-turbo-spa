<script>
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import { required, url } from 'vuelidate/lib/validators'
import urlYoutubeVimeoValidator from '@/support/customValidators/urlYoutubeVimeoValidator'

export default {
  name: 'modalAddVideo',
  components: {
    Action,
    InputField
  },
  data () {
    return {
      formData: {
        active: true,
        url: null
      }
    }
  },
  validations () {
    return {
      formData: {
        url: {
          required,
          url,
          urlYoutubeVimeoValidator
        }
      }
    }
  },
  methods: {
    addUrlIFrame () {
      if (!this.$v.formData.url.$invalid) {
        this.$emit('addIFrame', this.formData.url)
        this.formData.url = null
      }
    }
  }
}
</script>

<template>
  <div class="modal-form">
    <h2 class="modal-title text-color is-capitalize">{{ $t('classroom.forum:modal.add.video.title') }}</h2>
    <div class="modal-description text-color">
      <p class="text-color">{{ $t('classroom.forum:modal.add.video.description') }}</p>
    </div>
    <form>
      <input-field
        :label="$t('classroom.forum:modal.add.video.input.label')"
        v-model="formData.url"
        :validation="$v.formData.url"
        dark
      />
      <div class="form-submit text-center">
        <action
          :text="$t('global:add')"
          type="button"
          secondary
          large
          fixed-width
          @click="addUrlIFrame()"
        />
      </div>
    </form>
  </div>
</template>
