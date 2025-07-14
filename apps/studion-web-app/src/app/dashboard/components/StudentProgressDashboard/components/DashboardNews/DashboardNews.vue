<script>
import { defineComponent } from 'vue'

import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import DashboardCard from '../DashboardCard'

import Carousel from '@/components/general/Carousel'

export default defineComponent({
  name: 'DashboardNews',

  components: {
    Action,
    DashboardCard,
    Carousel,
  },

  mixins: [paginateMixin],

  data() {
    return {
      carouselPage: 0,
    }
  },

  created() {
    this.pgtrInitializePagination('fetchNewsContentResource', null, {
      limit: 10,
      order: {
        created_at: 'desc',
      },
      embed: 'rating_analysis',
    })
  },
})
</script>

<template>
  <div
    v-if="pgtrCurrentData.length"
    :data-testid="$testId('dashboard-news')"
    class="dashboard-news"
  >
    <div class="dashboard-news__header">
      <h3>
        <b>{{ $t('classroom.panel.dashboard:news') }}</b>
      </h3>

      <Action
        type="button"
        :text="$t('global:view.all')"
        flat
        @click="$router.push({ name: 'offerings.list' })"
      />
    </div>

    <Carousel
      :navigate-to="carouselPage"
      :scroll-per-page="false"
      :per-page-custom="[
        [300, 1],
        [639, 2],
        [1146, 3],
        [1465, 4],
        [1920, 5],
      ]"
      :pagination-enabled="false"
      :speed="400"
      :mouse-drag="$media.mobile"
      :items="pgtrCurrentData"
      :page-info="false"
      @pageChange="carouselPage = $event"
    >
      <template #default="props">
        <DashboardCard
          :item="props.item"
          card-type="offerings"
          v2
        />
      </template>
    </Carousel>
  </div>
</template>

<style lang="scss">
@import './DashboardNews.scss';
</style>