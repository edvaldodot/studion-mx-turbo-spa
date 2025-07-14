<script>
import { defineComponent } from 'vue'
import { parseISO } from 'date-fns'

import Action from '@/components/general/Action'
import RadioItem from '@/components/general/RadioItem'
import ModalInformation from '@/components/general/ModalInformation'

export default defineComponent({
  name: 'ModalResponsiveEnrollSession',

  components: {
    Action,
    RadioItem,
    ModalInformation,
  },

  props: {
    active: {
      type: Boolean,
      default: false,
    },

    sessions: {
      type: Array,
      default: () => [],
    },
    tag: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      configSelected: null,
    }
  },

  computed: {
    submitDisabled() {
      return this.configSelected === null
    },
  },

  methods: {
    submit() {
      if (this.submitDisabled) return
      this.$emit('enroll', this.configSelected)
    },

    close() {
      this.configSelected = null
      this.$emit('close')
    },

    formatDate(date) {
      return date ? this.$d(parseISO(date), 'short') : '-'
    },
  },
})
</script>

<template>
  <ModalInformation
    :active="active"
    class="mobile-enroll-sessions"
    closable
    is-page
    @close="close"
  >
    <template #pre-content>
      {{ tag }}

      <p class="modal-responsive-title">
        {{ title }}
      </p>
    </template>

    <template #title>
      <p class="modal-resposive-description">
        {{ $t('offerings.view:modal.enroll.title') }}
      </p>
      <p class="modal-resposive-sub-description">
        {{ $t('offerings.view:modal.enroll.subtitle') }}
      </p>
    </template>

    <template #content>
      <div v-if="!$media.mobile">
        <div class="datatable-header">
          <div class="datatable-header__sessions">
            <p class="datatable-header__name">{{ $t('global:form.sessions') }}</p>
          </div>
          <div class="datatable-header__date">
            <div class="datatable-header__date__initial">
              <p class="text-color">{{ $t('global:begin') }}</p>
            </div>

            <div class="datatable-header__date__end">
              <p class="text-color">{{ $t('global:form.closure') }}</p>
            </div>
          </div>
        </div>

        <div
          v-for="(session, index) in sessions"
          :key="session.uuid"
          class="session-item"
        >
          <div class="session-item__session">
            <div class="session-item__radio-name">
              <RadioItem
                :checked="configSelected == session.uuid"
                :value="session.uuid"
                :name="index"
                @change="configSelected = session.uuid"
              />
              <p class="name clamp-line">{{ session.name }}</p>
            </div>
          </div>
          <div class="datatable-content-header">
            <div class="datatable-content-header__date__initial">
              <p class="text-color">{{ formatDate(session.period.initial) }}</p>
            </div>

            <div class="datatable-content-header__date__text">
              <p class="text-color">{{ formatDate(session.period.final) }}</p>
            </div>
          </div>
        </div>
      </div>

      <template v-if="$media.mobile">
        <div
          v-for="(session, index) in sessions"
          :key="session.uuid"
          class="session-item"
        >
          <RadioItem
            :checked="configSelected == session.uuid"
            :value="session.uuid"
            :name="index"
            @change="configSelected = session.uuid"
          />
          <div class="content">
            <p class="name clamp-line">{{ session.name }}</p>
            <p class="dates">
              <span>
                <div class="label">{{ $t('global:begin') }}</div>
                <div>{{ formatDate(session.period.initial) }}</div>
              </span>

              <span>
                <div class="label">{{ $t('global:end') }}</div>
                <div>{{ formatDate(session.period.final) }}</div>
              </span>
            </p>
          </div>
        </div>
      </template>
    </template>

    <template #actions>
      <Action
        :text="$t('offerings.view:offer.want')"
        :disabled="submitDisabled"
        type="button"
        secondary
        large
        @click="submit"
      />
    </template>
  </ModalInformation>
</template>

<style lang="scss">
@import './ModalResponsiveEnrollSession.scss';
</style>
