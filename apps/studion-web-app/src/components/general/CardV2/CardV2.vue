<script>
export default {
  name: 'CardV2',
  props: {
    title: {
      type: String,
      default: () => null,
    },
    subTitle: {
      type: String,
      default: () => null,
    },
    content: {
      type: String,
      default: () => null,
    },
    image: {
      type: String,
      default: () => null,
    },
  },
  computed: {
    classes() {
      return {}
    },
    style() {
      return {
        backgroundImage: `url(${this.image})`,
      }
    },
    showHeader() {
      return this.title || this.subTitle
    },
    cardIsBarAndNotImage() {
      return this.$slots.bar && !this.image
    },
  },
  methods: {
    handleClick() {},
  },
}
</script>

<template>
  <div
    :class="['card', classes]"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      v-show="image"
      class="card__image"
    >
      <img
        :src="image"
        alt="image-card"
      />
    </div>
    <div
      v-if="$slots.bar"
      class="card__bar"
    >
      <slot name="bar" />
    </div>
    <div :class="['card__header', { '--header-margin-top': cardIsBarAndNotImage }]">
      <div
        v-show="title || $slots.title"
        class="card__title"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div
        v-show="subTitle || $slots.subTitle"
        class="card__sub-title"
      >
        <slot name="subTitle">
          {{ subTitle }}
        </slot>
      </div>
    </div>
    <div
      v-show="content || $slots.content"
      class="card__content"
    >
      <slot name="content">
        {{ content }}
      </slot>
    </div>
    <div
      v-if="$slots.actions"
      class="card__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'Card.scss';
</style>
