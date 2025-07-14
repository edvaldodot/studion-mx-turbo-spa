<script>
import { defineComponent } from 'vue'

import Modal from '../Modal'
import Action from '../Action'
import Icon from '../Icon'

export default defineComponent({
  name: 'ModalClassic',

  components: {
    Modal,
    Action,
    Icon,
  },

  props: {
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    closable: {
      type: Boolean,
      default: true,
    },
    upsidedownIcon: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-classic')"
    :cancel="false"
    active
    is-page
  >
    <div class="modal-classic__wrapper">
      <div class="modal-classic__body">
        <Action
          v-if="closable"
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="$emit('close')"
        />

        <div class="modal-classic__header">
          <div
            v-if="icon || $slots.icon"
            :class="{ upsidedown_icon: upsidedownIcon }"
            class="header__icon"
          >
            <Icon
              v-if="icon"
              :name="icon"
              wrapper
            />

            <slot name="icon"></slot>
          </div>

          <div
            v-if="title || $slots.title"
            class="header__title"
          >
            <h3 v-if="title">
              {{ title }}
            </h3>

            <slot name="title"></slot>
          </div>

          <div
            v-if="description || $slots.description"
            class="header__description"
          >
            <span
              v-if="description"
              class="description__text"
            >
              {{ description }}
            </span>

            <slot name="description"></slot>
          </div>
        </div>

        <slot></slot>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@import 'ModalClassic.scss';
</style>
