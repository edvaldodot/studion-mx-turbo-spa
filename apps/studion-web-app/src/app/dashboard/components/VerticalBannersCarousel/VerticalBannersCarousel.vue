<script>
import { mapState } from 'vuex'
import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import Carousel from '@/components/general/Carousel'

export default {
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
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
}
</script>

<template>
  <Carousel
    v-if="banners.length"
    :autoplay="autoplay"
    :per-page="1"
    :mouse-drag="$media.mobile"
    :pagination-enabled="false"
    :items="banners"
  >
    <template #default="props">
      <Card
        rounded
        class="banner-item"
        :height="!$media.mobile ? 561 : 'auto'"
        @click="redirect(props.item.url)"
      >
        <CardImage
          :src="props.item.card_image ? props.item.card_image : props.item.image"
          height="auto"
          use-img
        />
        <CardBody>
          <h3 class="text-primary mb-1">
            {{ $te(props.item.title, 'pt-br') ? $t(props.item.title) : props.item.title }}
          </h3>
          <p class="text-base text-color">
            {{
              $te(props.item.description, 'pt-br')
                ? $t(props.item.description)
                : props.item.description
            }}
          </p>
        </CardBody>
        <CardActions>
          <Action
            type="button"
            flat
            :dark="accessibility"
            :text="$t('global:explore')"
          >
          </Action>
        </CardActions>
      </Card>
    </template>
  </Carousel>
</template>
<style lang="scss">
@import 'VerticalBannersCarousel.scss';
</style>