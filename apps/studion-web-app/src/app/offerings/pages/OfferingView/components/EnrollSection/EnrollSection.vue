<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'EnrollSection',

  components: {
    Action,
  },

  props: {
    payment: {
      type: Object,
      default: () => ({}),
    },

    offeringIsPaid: {
      type: Boolean,
      default: false,
    },

    offeringIsAvailable: {
      type: Boolean,
      default: false,
    },

    showCancelEnrollmentButton: {
      type: Boolean,
      default: false,
    },

    showGoToClassroomButton: {
      type: Boolean,
      default: false,
    },

    availableSession: {
      type: Array,
      default: () => [],
    },

    audience: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <div
    :class="{ mobile: $media.mobile }"
    class="sidebar enroll-section"
  >
    <div
      :class="{ 'non-overlapping-element': $media.mobile }"
      class="offer-price-wrapper"
    >
      <template v-if="offeringIsPaid">
        <div :class="{ 'offer-price': offeringIsPaid }">
          <span class="offer-price-label">
            {{ $t('offerings.view:offer.price.label') }}
          </span>
          <span class="offer-price-value">
            {{ $n(payment.price, 'currency').replace(/^(\D+)/, '$1 ') }}
          </span>
        </div>
      </template>

      <Action
        v-if="showCancelEnrollmentButton"
        :disabled="notEqualsProfile('student')"
        :large="!$media.mobile"
        :text="$t('offerings.view:offer.cancel')"
        type="button"
        class="offer-buy-link sidebar__button--cancel"
        secondary
        @click="$emit('cancel:modal')"
      />

      <Action
        v-else-if="showGoToClassroomButton"
        :disabled="!offeringIsAvailable || (equalsProfile('student') && !availableSession.length)"
        :large="!$media.mobile"
        :text="$t('offerings.view:offer.access')"
        class="offer-buy-link"
        type="button"
        secondary
        @click="$emit('go:classroom')"
      />

      <Action
        v-else
        :disabled="
          notEqualsProfile('student') ||
          !offeringIsAvailable ||
          (equalsProfile('student') && !availableSession.length)
        "
        :text="offeringIsPaid ? $t('offerings.view:offer.buy') : $t('offerings.view:offer.want')"
        :icon="offeringIsPaid ? 'shopping_basket' : null"
        :large="!$media.mobile"
        secondary
        type="button"
        class="offer-buy-link"
        @click="$emit('check:enroll')"
      />
    </div>
    <div class="offer-info">
      <h3 class="offer-public-title">{{ $t('offerings.view:offer.public.title') }}</h3>
      <div class="offer-public-description">
        <p>{{ audience }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './EnrollSection.scss';
</style>