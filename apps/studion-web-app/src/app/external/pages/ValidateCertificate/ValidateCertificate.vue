<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import LinksBar from '@/components/general/LinksBar'
import Logo from '@/components/general/Logo'
import CertificateResult from '../../components/CertificateResult'
import InlineSvg from 'vue-inline-svg'

export default {
  name: 'ValidateCertificate',
  components: {
    Action,
    InputField,
    LinksBar,
    Logo,
    CertificateResult,
    InlineSvg,
  },
  data() {
    return {
      hash: null,
      name: null,
      styles: null,
      styleName: null,
      date: null,
      isValid: true,
      isSubmit: false,
    }
  },
  validations: {
    hash: {
      required,
    },
  },
  computed: {
    ...mapState(['accessibility']),
    iconSource() {
      return `/assets/images/svg/neutralStates/neutral_state_57.svg`
    },
  },
  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptValidateCertificate']),
    submit() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        if (
          !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            this.hash
          )
        ) {
          return this.setFeedback({
            message: this.$t('external.certificates.error'),
            type: 'error',
          })
        }

        this.setFetching(true)
        this.attemptValidateCertificate(this.hash)
          .then(({ data }) => {
            this.hash = data.hashCertificate
            this.name = data.studentName
            this.styleName = data.courseName || data.pathName
            this.styles = data.courseName ? 'solution' : 'trail'
            this.date = data.dateFinish
            this.isValid = true
            this.isSubmit = true
          })
          .catch(() => {
            this.setFeedback({ message: this.$t('external.certificates.error'), type: 'error' })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
    back() {
      this.reset()
      this.$router.push({ name: 'auth.signin' })
    },
    reset() {
      this.hash = null
      this.$v.$reset()
    },
  },
}
</script>

<template>
  <div
    class="validate-certificate flex align-items-center justify-content-center bg-black-50 h-full text-black-900"
  >
    <LinksBar
      custom-class="text-primary absolute top-0 w-full justify-content-end"
      dark
    />
    <div
      class="flex flex-column gap-3 border-round-lg w-11 xl:w-4 border-1 border-black-200 surface-0 p-5"
    >
      <div class="flex justify-content-center">
        <Logo
          :theme="$theme"
          logo
        />
      </div>

      <div class="w-4 mx-auto my-3">
        <InlineSvg
          width="100%"
          height="100%"
          :src="iconSource"
        />
      </div>

      <div
        v-if="!isSubmit"
        class="text-black-900 text-center w-8 mx-auto"
      >
        <div class="text-2xl lato-regular font-normal my-3">
          {{ $t('external.certificates.validate') }}
        </div>
        <div class="text-black-600 line-height-3 lato-regular text-base">
          {{ $t('external.certificates.description') }}
        </div>
      </div>

      <div class="flex flex-column w-8 mx-auto justify-content-center">
        <form
          v-if="!isSubmit"
          :data-testid="$testId('auth--validate-certificate-form')"
          class="flex flex-column my-4 gap-2"
          @submit.prevent="submit"
        >
          <InputField
            v-model.trim="hash"
            placeholder="Ex.: 0004271930"
            :data-testid="$testId('input-field--validation-code')"
            :label="$t('external.certificates.hash')"
            :validation="$v.hash"
            type="text"
            dark
          />

          <div class="w-full flex justify-content-center">
            <Action
              :data-testid="$testId('action-button--submit')"
              :text="$t('global:validate')"
              :dark="accessibility"
              type="button"
              submit
              secondary
              large
              fixed-width
            />
          </div>
        </form>

        <CertificateResult
          v-if="isSubmit"
          :style-name="styleName"
          :is-valid="isValid"
          :styles="styles"
          :name="name"
          :date="date"
          :hash="hash"
        />

        <div
          v-if="isSubmit"
          class="w-full flex justify-content-center my-4"
        >
          <Action
            :data-testid="$testId('action-button--back')"
            :text="$t('auth.recovery:back')"
            :dark="accessibility"
            type="button"
            secondary
            large
            fixed-width
            @click="back"
          />
        </div>

        <div
          v-show="isSubmit"
          class="text-center text-primary text-base font-bold"
          @click="isSubmit = false"
        >
          <a
            class="cursor-pointer"
            @click="isSubmit = !isSubmit"
          >
            Validar novo certificado
          </a>
        </div>

        <div
          v-show="!isSubmit"
          class="text-center text-primary text-base font-bold"
        >
          <a
            class="cursor-pointer"
            @click="back"
          >
            {{ $t('auth.recovery:back') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'ValidateCertificate.scss';
body,
#app,
.main {
  height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
