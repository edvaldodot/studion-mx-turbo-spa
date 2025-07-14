<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import LinkedInAction from '@/components/general/LinkedInAction'

export default defineComponent({
  name: 'InfoActionCard',

  components: {
    Action,
    Icon,
    LinkedInAction,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    primary: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '',
    },
    buttonIcon: {
      type: String,
      default: '',
    },
    certificateTitle: {
      type: String,
      default: '',
    },
    certificateDate: {
      type: Object,
      default: () => {},
    },
  },
})
</script>
<template>
  <div
    :class="{ '--primary': primary, '--highlight': secondary, '--disabled': disabled }"
    class="classroom-cards__card"
  >
    <Icon
      class="panel-header__icon"
      :name="icon"
      size="large"
    />
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <div class="actions-wrapper">
      <slot name="actions" />
      <Action
        v-if="buttonText"
        :text="buttonText"
        :icon="buttonIcon"
        class="btn__toggle-hidden"
        type="button"
        flat
        @click="$emit('clickBtn')"
      />
      <LinkedInAction
        v-if="certificateTitle"
        :name="certificateTitle"
        :small="false"
        :date="certificateDate"
        dark
        tooltip
      />
    </div>
  </div>
</template>
<style lang="scss">
@import './InfoActionCard.scss';
</style>
