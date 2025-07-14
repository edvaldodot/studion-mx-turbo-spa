<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import {
  Button,
  Carousel,
  Dropdown,
  DropdownLink,
  EmptyMessage,
  Rating,
  Link,
} from '@/components/general'

import CardCatalogSolution from '../CardCatalogSolution'
import SkeletonCatalogItem from '../SkeletonCatalogItem'
import OfferingCard from '../../components/OfferingCard'

export default defineComponent({
  name: 'OfferingSection',

  components: {
    Button,
    CardCatalogSolution,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    Carousel,
    Rating,
    SkeletonCatalogItem,
    Link,
    OfferingCard,
  },

  props: {
    id: {
      type: Number,
      default: null,
    },

    title: {
      type: String,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },

    ratingAnalysis: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      solutions: [],
      page: 0,
      isLoading: false,
      seeAll: false,
    }
  },

  computed: {
    ...mapState(['accessibility']),

    getEmbed() {
      return 'categories,rating_analysis'
    },
  },

  created() {
    this.isLoading = true
    this.attemptOfferingCoursesRetrieval({
      offeringId: this.id,
      params: {
        embed: this.getEmbed,
      },
    })
      .then(({ data }) => {
        this.solutions = data.data
          .map((item) => {
            const embedded = item['_embedded'] || {}

            return {
              id: item['course_id'],
              name: item['course_name'],
              image: item['course_image'],
              type: {
                name: item['course_type_name'],
                alias: item['course_type_alias'],
              },
              position: item['position'],
              ratingAnalysis: embedded['rating_analysis'],
              categories: embedded['categories'],
              description: item['course_description'],
            }
          })
          .sort((a, b) => a.position - b.position)
      })
      .finally(() => {
        this.isLoading = false
      })
  },

  methods: {
    ...mapActions(['attemptOfferingCoursesRetrieval']),

    editItem() {
      this.$emit('edit')
    },

    removeItem() {
      this.$emit('remove')
    },

    toggleItemActiveStatus() {
      this.$emit('toggle-active-status')
    },
    showAll() {
      this.seeAll = !this.seeAll
    },
  },
})
</script>

<template>
  <div :class="['offering-section p-4 my-4 border-round-xl', { 'shadow-1': seeAll }]">
    <div
      class="flex justify-start lg:justify-between align-items-end lg:align-items-center mb-3 gap-3"
    >
      <div class="flex flex-column lg:flex-row lg:align-items-center lg:gap-3 flex-1">
        <div class="flex flex-column gap-1">
          <h3 class="text-2xl font-bold">{{ title }}</h3>

          <Rating
            class="infos__rating"
            dark
            :rating-analysis="ratingAnalysis"
            resource-type="offering"
          />
        </div>
        <div>
          <Button
            v-if="seeAll"
            variant="text"
            @click="showAll"
          >
            {{ $t('global:view.less') }}
          </Button>
          <Button
            v-else
            variant="text"
            @click="showAll"
          >
            {{ $t('global:view.all') }}
          </Button>
        </div>
      </div>

      <Link :to="{ name: 'offerings.view', params: { id } }">
        <Button>
          {{ $t('global:explore') }}
        </Button>
      </Link>

      <div class="offering-header__options mb-2 lg:mb-0">
        <Dropdown
          v-if="notEqualsProfile('student') && canWrite('offerings')"
          class="offering-header__options__item"
          classes="text-color"
          icon="dots-vertical"
          icon-size="medium"
          right
          dark
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
            v-if="!active"
            :text="$t('global:activate')"
            @click="toggleItemActiveStatus"
          />

          <DropdownLink
            v-if="active"
            :text="$t('global:deactivate')"
            @click="toggleItemActiveStatus"
          />
        </Dropdown>
      </div>
    </div>

    <div
      v-if="seeAll"
      class="grid mt-4"
    >
      <div
        v-for="(item, index) in solutions"
        :key="index"
        class="col-12 lg:col-3 xl:col-3"
      >
        <OfferingCard
          class="my-3 lg:my-2 xl:my-2 fadein animation-duration-1000"
          :item="item"
          :index="index"
          :permission-actions="true"
          @edit="editItem()"
          @toggle-active-status="toggleActiveStatus()"
          @remove="removeItem()"
        />
      </div>
    </div>
    <div
      v-else
      :class="[
        'offering-solutions fadein animation-duration-1000',
        { '--more-indicator': solutions.length > 4 },
      ]"
    >
      <Carousel
        v-if="solutions.length > 0"
        :navigate-to="page"
        :scroll-per-page="false"
        :per-page-custom="[
          [300, 1],
          [768, 2],
          [1025, 4],
        ]"
        :pagination-enabled="false"
        :speed="400"
        :mouse-drag="$media.mobile"
        :items="solutions"
        :page-info="false"
        @pageChange="page = $event"
      >
        <template #default="props">
          <Link :to="{ name: 'offerings.view', params: { id } }">
            <CardCatalogSolution :item="props.item" />
          </Link>
        </template>
      </Carousel>

      <EmptyMessage
        v-else-if="!isLoading"
        boxed
        class="white"
      >
        <h4 class="text-base">{{ $t('offerings.view.list:empty.message') }}</h4>
      </EmptyMessage>
    </div>

    <SkeletonCatalogItem
      v-if="isLoading"
      hide-header
    />
  </div>
</template>

<style lang="scss">
@import 'OfferingSection.scss';
</style>
