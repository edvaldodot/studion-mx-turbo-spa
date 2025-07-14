<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'ModalOfferRegistration',

  components: {
    Action,
    ModalInformation: () => import('@/components/general/ModalInformation'),
    Icon: () => import('@/components/general/Icon'),
  },

  props: {
    tag: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    messageType: {
      type: String,
      default: '',
    },
    sessionName: {
      type: String,
      default: '',
    },
    sessionStartTime: {
      type: String,
      default: '',
    },
    sessionEndTime: {
      type: String,
      default: '',
    },
    startDatePast: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <ModalInformation
    class="modal-group-creation"
    :active="show"
    closable
    back
    is-page
    :text-back="$t('global:back.offerings')"
    @close="show = false"
  >
    <template #pre-content>
      <p class="modal-offer-type-class">{{ tag }}</p>
    </template>

    <template #title>
      <p class="modal-offer-title-class">{{ title }}</p>
    </template>

    <template #content>
      <div class="modal-offer-description">
        <Icon
          :name="messageType === 'error' ? 'close-circle' : 'check-circle'"
          size="large"
          wrapper
        />
        <h1
          v-if="messageType === 'error'"
          class="modal-offer-success-mesage"
        >
          {{ $t('offerings.view:modal.error.title') }}
        </h1>
        <h1
          v-else
          class="modal-offer-success-mesage"
        >
          {{ $t('offerings.view:modal.success.title') }}
        </h1>
        <div v-if="messageType === 'success-individual'">
          <p
            class="modal-offer-description-text"
            v-html="$t('offerings.view:modal.success.individual.description')"
          ></p>
        </div>

        <div v-if="messageType === 'error'">
          <p class="modal-offer-description-text__error">
            {{ $t('offerings.view:modal.error.description.1') }}
          </p>

          <p class="modal-offer-description-text__error">
            {{ $t('offerings.view:modal.error.description.2') }}
          </p>
        </div>

        <template v-if="messageType === 'success-open' || messageType === 'success-closed'">
          <div>
            <p class="modal-offer-description-text">
              {{ $t('offerings.view:modal.success.description.1') }}
            </p>
            <p class="modal-offer-description-session-name">
              {{ sessionName }}
            </p>
            <template v-if="sessionEndTime">
              <p class="modal-offer-description-text">
                {{ $t('offerings.view:modal.success.description.2') }}
              </p>
              <p
                class="modal-offer-description-session-name"
                v-html="
                  $t('offerings.view:modal.success.description.3', {
                    'start-time': sessionStartTime,
                    'end-time': sessionEndTime,
                  })
                "
              ></p>
            </template>
            <template v-if="startDatePast">
              <p class="modal-offer-description-text">
                {{ $t('offerings.view:modal.success.description.4') }}
              </p>
              <p class="modal-offer-description-session-name">
                <strong>{{ sessionStartTime }}</strong>
              </p>
            </template>
          </div>
        </template>
      </div>
    </template>
    <template #actions>
      <div
        v-if="messageType === 'error'"
        class="modal-offer-button-access"
      >
        <Action
          :text="$t('global:back.offerings')"
          type="button"
          icon="keyboard_backspace"
          icon-size="medium"
          class="btn-back text-color"
          secondary
          large
          @click="$emit('back:offerings')"
        />
      </div>
      <div
        v-else
        class="modal-offer-button-access"
      >
        <Action
          :text="$t('offerings.view:offer.access')"
          type="button"
          secondary
          large
          @click="$emit('go:classroom')"
        />
      </div>
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import './ModalOfferRegistration.scss';
</style>
