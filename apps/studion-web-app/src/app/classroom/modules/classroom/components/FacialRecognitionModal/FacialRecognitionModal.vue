<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import config from '@/config'

import Action from '@/components/general/Action'
import AppCamera from '@/components/general/AppCamera'
import Icon from '@/components/general/Icon'
import ModalInformation from '@/components/general/ModalInformation'

const { PORTAL_CONFIGS } = config

export default defineComponent({
  name: 'FacialRecognitionModal',

  components: {
    Action,
    AppCamera,
    Icon,
    ModalInformation,
  },

  props: {
    classroomLoaded: {
      type: Boolean,
      default: false,
    },

    allowBack: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      currentStep: 0,
      status: 'error',
      detections: [],
      photo: null,
    }
  },

  computed: {
    ...mapState({
      facialRecognition: (state) => state.Classroom.facialRecognition,
    }),

    hasDetectionsInShape() {
      return this.detections.filter((d) => d.isCentered).length > 0
    },

    canReturn() {
      return (
        !this.classroomLoaded &&
        this.allowBack &&
        !(this.currentStep === 3 || (this.currentStep === 4 && this.status === 'success'))
      )
    },
  },

  methods: {
    ...mapActions([
      'setActiveFacialRecognition',
      'attemptVerifyBiometricCapture',
      'setTokenFacialRecognition',
      'resetFacialRecognition',
      'setFeedback',
    ]),

    setStep(step) {
      this.currentStep = step
    },

    takePhoto() {
      const cameraEl = this.$refs.camera
      cameraEl.takePhoto()
      this.photo = cameraEl.photo
      this.submit()
      this.setStep(3)
    },

    /**
     * Redirects to the next route if it exists.
     *
     * @return {void}
     */
    goNext() {
      if (this.status !== 'success') return

      const nextRoute = this.facialRecognition.next

      if (nextRoute) {
        this.resetFacialRecognition()
        this.$router.push(nextRoute)
      }
    },

    /**
     * Submits the biometric capture for verification.
     *
     * @return {void}
     */
    submit() {
      this.attemptVerifyBiometricCapture({
        data: this.photo,
        sessionUuid: this.$route.params.session_uuid,
      })
        .then(({ data }) => {
          const { status, token, error } = data

          this.status = status
          this.setTokenFacialRecognition(token)
          this.feedback(error)
          this.goNext()
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.facial:generic.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setStep(4)
        })
    },

    /**
     * Provides feedback to the user based on the given error.
     *
     * @param {string} error - The error message to be processed.
     * @return {void}
     */
    feedback(error) {
      if (!error) return
      const formattedText = this.formatText(error)

      this.setFeedback({
        message: this.$t(`classroom.facial:provider.error.${formattedText.toLowerCase()}`),
      })
    },

    /**
     * Replaces spaces with underscores, removes special characters,
     * and normalizes accents in the given text.
     *
     * @param {string} text - The text to be formatted.
     * @return {string} The formatted text.
     */
    formatText(text) {
      let formattedText = text.replace(/\s+/g, '_')
      formattedText = formattedText.replace(/[.,/#!$%^&*;:{}=\-`~()]/g, '')
      formattedText = formattedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      return formattedText
    },

    /**
     * Closes the FacialRecognitionModal.
     *
     * If the status is 'success', it sets the activeFacialRecognition to false and
     * emits a 'close' event. Otherwise, it resets the step to 0.
     *
     * @return {void}
     */
    close() {
      if (this.status === 'success') {
        this.setActiveFacialRecognition(false)
        this.$emit('close')
        return
      }

      return this.setStep(0)
    },

    /**
     * Redirects the user to the previous page or the classroom sessions page.
     * Resets the facial recognition state before redirecting.
     *
     * @return {void}
     */
    back() {
      this.resetFacialRecognition()

      if (PORTAL_CONFIGS && PORTAL_CONFIGS.COURSES_URL) {
        window.location = PORTAL_CONFIGS.COURSES_URL
        return
      }

      this.$router.push({
        name: 'classroom.sessions',
      })
    },
  },
})
</script>

<template>
  <ModalInformation
    class="modal-facial"
    :data-testid="$testId('modal-facial')"
    :closable="canReturn"
    :back="canReturn"
    :text-back="$t('global:back.solutions')"
    is-page
    @close="back"
  >
    <template #title>
      {{ $t('classroom.facial:title') }}
    </template>

    <template #description>
      <p class="text-center">
        {{ $t('classroom.facial:description') }}
      </p>
    </template>

    <template #content>
      <div
        v-if="currentStep === 0"
        class="modal-facial__step-00 text-center mt-5"
      >
        <Icon
          name="facial-scan"
          size="large"
          wrapper
        />
        <!-- eslint-disable -->
        <p
          class="mt-5 mb-5"
          v-html="$t('classroom.facial:intro')"
        ></p>
        <!-- eslint-enable -->
        <Action
          :text="$t('global:continue')"
          type="button"
          fixed-width
          primary
          large
          @click="setStep(1)"
        />
      </div>

      <div
        v-if="currentStep === 1"
        class="modal-facial__step-01 text-center"
      >
        <p class="mt-5">
          <b>{{ $t('classroom.facial:tips') }}</b>
        </p>
        <div class="modal-facial__tips mt-5 mb-5">
          <div class="modal-facial__tip">
            <Icon
              name="lamp"
              size="large"
              wrapper
            />
            <p class="text-color">{{ $t('classroom.facial:tips.light') }}</p>
          </div>
          <div class="modal-facial__tip">
            <Icon
              name="wout-mask"
              size="large"
              wrapper
            />
            <p class="text-color">{{ $t('classroom.facial:tips.mask') }}</p>
          </div>
          <div class="modal-facial__tip">
            <Icon
              name="selfie"
              size="large"
              wrapper
            />
            <p class="text-color">{{ $t('classroom.facial:tips.selfie') }}</p>
          </div>
          <div class="modal-facial__tip modal-facial__tip-blur">
            <div class="tip-icons">
              <Icon
                name="woman"
                size="large"
                wrapper
              />
              <Icon
                name="close"
                class="woman-blur-icon"
              />
            </div>
            <p class="text-color">{{ $t('classroom.facial:tips.blur') }}</p>
          </div>
        </div>
        <Action
          :text="$t('classroom.facial:recognition.capture.start')"
          type="button"
          fixed-width
          primary
          large
          @click="setStep(2)"
        />
      </div>

      <div
        v-if="currentStep === 2"
        class="modal-facial__step-02 text-center"
      >
        <AppCamera
          ref="camera"
          face-recognition
          @detections="detections = $event"
        />

        <Icon
          :name="$media.mobile ? 'face-shape-m' : 'face-shape'"
          class="camera-shape"
          :class="{ '--detected': hasDetectionsInShape }"
          wrapper
        />

        <p class="text-color">
          <b>{{ $t('classroom.facial:recognition.position') }}</b>
        </p>

        <Action
          :text="$t('classroom.facial:recognition.capture')"
          :disabled="!hasDetectionsInShape"
          class="mt-3"
          type="button"
          fixed-width
          primary
          large
          @click="takePhoto()"
        />
      </div>

      <div
        v-if="currentStep === 3"
        class="modal-facial__step-03 text-center"
      >
        <img
          class="modal-facial__loading"
          src="/assets/images/themes/default/gif/loading.gif"
        />
        <p class="text-color">
          <b>{{ $t('classroom.facial:recognition.processing') }}</b>
        </p>
      </div>

      <div
        v-if="currentStep === 4"
        class="modal-facial__step-04 text-center"
      >
        <Icon
          :name="status === 'success' ? 'check-ok' : 'check-fail'"
          size="large"
          class="mt-5"
          wrapper
        />
        <p class="mb-5 mt-3">
          <b>{{ $t(`classroom.facial:recognition.status.${status}`) }}</b>
        </p>
        <p
          v-if="status === 'error'"
          class="mb-5"
        >
          {{ $t('classroom.facial:recognition.status.error.description') }}
        </p>
        <Action
          :text="$t(`classroom.facial:recognition.button.${status}`)"
          type="button"
          fixed-width
          primary
          large
          @click="close"
        />
      </div>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import './FacialRecognitionModal.scss';
</style>
