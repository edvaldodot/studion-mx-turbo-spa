<script>
import { defineComponent } from 'vue'
import CardV2 from '../CardV2'
import Icon from '../Icon'
import Button from '../Button'

export default defineComponent({
  name: 'ModalBase',
  components: {
    Icon,
    CardV2,
    Button,
  },
  props: {
    value: {
      type: Boolean,
      default: () => false,
    },
    width: {
      type: String,
      default: () => '',
    },
    height: {
      type: String,
      default: () => '',
    },
    minWidth: {
      type: String,
      default: () => '',
    },
    minHeight: {
      type: String,
      default: () => '',
    },
    maxWidth: {
      type: String,
      default: () => '',
    },
    maxHeight: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {}
  },
  computed: {
    model: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      },
    },
    style() {
      return {
        width: this.width,
        height: this.height,
        minWidth: this.minWidth,
        minHeight: this.minHeight,
        maxWidth: this.maxWidth,
        maxHeight: this.maxHeight,
      }
    },
  },
  methods: {
    openModal() {
      this.model = true
    },
    closeModal() {
      this.model = false
    },
  },
})
</script>

<template>
  <div
    v-if="model"
    class="modalv2"
    :data-testid="$testId('modal-base')"
  >
    <div class="modalv2__overlay">
      <CardV2 :style="style">
        <template #bar>
          <div class="flex justify-content-end">
            <Button
              variant="icon"
              icon="close"
              @click="closeModal()"
            />
          </div>
        </template>
        <template #content>
          <slot />
        </template>
      </CardV2>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Modal.scss';
</style>
