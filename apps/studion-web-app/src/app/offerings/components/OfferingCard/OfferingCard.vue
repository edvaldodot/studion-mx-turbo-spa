<script>
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

export default {
  name: 'OfferingCard',

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
    isOffering: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    offeringOrCourseLabel() {
      return this.isOffering ? this.$t('global:offering') : this.$t('global:course')
    },
    isNotOffering() {
      return !this.isOffering
    },
    isRating() {
      return this.$isEnabledFeature('rating')
    },
  },
  methods: {
    editItem() {
      this.$emit('edit')
    },
    removeItem() {
      this.$emit('remove')
    },
    toggleActiveStatus() {
      this.$emit('toggle-active-status')
    },
  },
}
</script>
<template>
  <div>
    <div
      v-if="isNotOffering"
      class="text-base text-black-600 my-4"
    >
      {{ $t(`solutions.type:${item.type.alias}`) }}
    </div>
    <Card :image="item.image">
      <template #bar>
        <div
          v-if="isOffering"
          class="flex justify-content-end"
        >
          <Dropdown
            v-if="notEqualsProfile('student') && canWrite('offerings')"
            classes="text-white"
            icon="dots-vertical"
            icon-size="medium"
          >
            <DropdownLink
              :text="$t('global:edit')"
              @click="editItem"
            />

            <DropdownLink
              :text="$t('global:remove')"
              @click="removeItem"
            />

            <DropdownLink
              v-if="!item.active"
              :text="$t('global:activate')"
              @click="toggleActiveStatus"
            />

            <DropdownLink
              v-if="item.active"
              :text="$t('global:deactivate')"
              @click="toggleActiveStatus"
            />
          </Dropdown>
        </div>
      </template>
      <template #title>
        <div class="absolute -mt-6">
          <ChipGroup
            chip-key="name"
            :chips="item.categories"
          />
        </div>
        {{ item.name || item.title }}
      </template>
      <template #subTitle>
        {{ item.description }}
      </template>
      <template #content>
        <div class="absolute top-0 -mt-3">
          <Chip
            color="default"
            icon="contextual_token"
            pack-icon="material"
            icon-class="text-base"
          >
            {{ offeringOrCourseLabel }}
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
      <template #actions>
        <Link
          v-if="isOffering"
          :to="{ name: 'offerings.view', params: { id: item.id } }"
        >
          <Button variant="text">
            {{ $t('global:explore') }}
          </Button>
        </Link>
      </template>
    </Card>
  </div>
</template>
