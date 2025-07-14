<script>
import { mapState } from 'vuex'
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Carousel from '@/components/general/Carousel'

export default defineComponent({
  name: 'HorizontalBannersCarousel',
  components: {
    Action,
    Carousel,
  },

  props: {
    banners: {
      type: Array,
      default: () => [],
    },

    autoplay: {
      type: Boolean,
      deafult: false,
    },
  },

  computed: {
    ...mapState({
      accessibility: (state) => state.accessibility,
    }),
  },

  methods: {
    redirect(url) {
      const isExternal = !url.includes(window.location.origin)

      if (isExternal) {
        window.open(url, '_blank')
        return
      }

      window.open(url, '_self')
    },
  },
})
</script>

<template>
  <Carousel
    v-if="banners.length"
    :autoplay="autoplay"
    :per-page="1"
    :mouse-drag="$media.mobile"
    :pagination-enabled="false"
    :items="banners"
    class="horizontal-banner"
    dark
  >
    <template #default="{ item }">
      <div
        rounded
        class="horizontal-banner-item"
        @click.prevent="redirect(item.url)"
      >
        <img
          :src="item.card_image ? item.card_image : item.image"
          :alt="$t('solutions.create.classes:modal.file.type.image') + ': ' + item.title"
        />

        <div class="card-description">
          <h3>
            {{ $te(item.title, 'pt-br') ? $t(item.title) : item.title }}
          </h3>

          <p class="text-color">
            {{ $te(item.description, 'pt-br') ? $t(item.description) : item.description }}
          </p>

          <Action
            type="button"
            flat
            :text="$t('global:explore')"
          />
        </div>
      </div>
    </template>
  </Carousel>
</template>

<style lang="scss">
@import './HorizontalBannersCarousel.scss';
</style>