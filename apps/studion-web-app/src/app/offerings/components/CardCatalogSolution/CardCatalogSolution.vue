<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'
import { isAfter } from 'date-fns'

import {
  Button,
  Dropdown,
  DropdownLink,
  CardV2,
  Chip,
  ChipGroup,
  Link,
  Icon,
} from '@/components/general'

export default defineComponent({
  name: 'CardCatalogSolution',

  components: {
    Button,
    Dropdown,
    DropdownLink,
    Card: CardV2,
    Chip,
    ChipGroup,
    Link,
    Icon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isRating() {
      return this.$isEnabledFeature('rating')
    },
  },
})
</script>

<template>
  <div class="my-4">
    <div class="text-base text-black-600 my-4">
      {{ $t(`solutions.type:${item.type.alias}`) }}
    </div>
    <Card :image="item.image">
      <template #title>
        <div class="absolute -mt-6">
          <ChipGroup
            chip-key="name"
            :chips="item.categories"
          />
        </div>
        {{ item.name }}
      </template>
      <template #subTitle>
        {{ item.description }}
      </template>
      <template #content>
        <div class="flex gap-1 absolute top-0 -mt-3">
          <Chip
            color="default"
            icon="book_2"
            pack-icon="material"
            icon-class="text-base"
            class="icon-fill-1"
          >
            {{ $t('global:course') }}
          </Chip>
        </div>
        <div
          v-if="isRating"
          class="flex flex-column gap-1 text-black-600 text-sm"
        >
          {{ $t('rating:title') }}
          <div class="flex align-items-center text-base gap-1">
            <Icon
              class="text-black-600 text-base"
              name="star"
              pack="material"
            />
            {{ item.ratingAnalysis.average }}
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
@import 'CardCatalogSolution.scss';
</style>
