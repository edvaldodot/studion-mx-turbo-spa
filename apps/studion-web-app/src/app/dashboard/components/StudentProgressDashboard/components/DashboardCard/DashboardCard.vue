<script>
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'
import { isAfter } from 'date-fns'

import { progressMixin } from '@/mixins/progressMixin'

import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardActions from '@/components/general/CardActions'
import Chipbox from '@/components/general/Chipbox'
import ProgressLine from '@/components/general/ProgressLine'
import ProgressMenu from '@/components/general/ProgressMenu'

const Action = () => import('@/components/general/Action')
const Rating = () => import('@/components/general/Rating')
const CategoriesChips = () => import('@/components/general/CategoriesChips')

export default defineComponent({
  name: 'DashboardCard',

  components: {
    Action,
    Card,
    CardBody,
    CardActions,
    CategoriesChips,
    Chipbox,
    ProgressLine,
    ProgressMenu,
    Rating,
  },

  mixins: [progressMixin],

  props: {
    item: {
      type: Object,
      default: () => ({}),
    },

    cardType: {
      type: String,
      default: null,
    },

    v2: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters(['isFetching']),

    isDisabled() {
      return this.hasFutureAccess(this.item) || this.item.isBlocked
    },

    chipboxInfo() {
      const info = {
        colorVariant: this.cardType,
        icon: 'local_library',
        label: this.$t(`dashboard:card.subtitle.${this.cardType}`),
      }

      if (this.cardType !== 'sessions') {
        info.icon = this.cardType === 'trails' ? 'trails' : 'catalog'
      }

      return info
    },
  },

  methods: {
    hasFutureAccess(item) {
      return (
        item.period && item.period.initial && isAfter(new Date(item.period.initial), Date.now())
      )
    },

    redirect() {
      if (this.isDisabled) return
      this.$router.push(this.item.path)
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('dashboard-card')"
    class="dashboard-card"
    :class="{ v2 }"
    @click="redirect"
  >
    <Chipbox
      :label="chipboxInfo.label"
      :icon="chipboxInfo.icon"
      :color-variant="chipboxInfo.colorVariant"
    />

    <span
      v-if="v2"
      class="card-type"
    >
      {{ item.type ? $t(`solutions.type:${item.type}`) : '' }}
    </span>

    <Card
      :height="360"
      :class="{ disabled: isDisabled }"
      class="content-progress__card"
      rounded
    >
      <div class="card-image">
        <img
          :src="item.image"
          :alt="$t('solutions.create.classes:modal.file.type.image') + ': ' + item.title"
        />

        <CategoriesChips
          v-if="item.categories && item.categories.length"
          :categories="item.categories"
          class="card-categories-container"
        />
      </div>

      <template v-if="v2">
        <CardBody>
          <h2 class="card-title clamp-line">
            {{ item.title }}
          </h2>

          <p class="card-description clamp-line">{{ item.description }}</p>
        </CardBody>

        <CardActions>
          <div>
            <Rating
              :rating-analysis="item.rating"
              resource-type="offering"
            />
          </div>

          <Action
            :text="$t('global:view.more')"
            type="button"
            flat
          />
        </CardActions>
      </template>

      <template v-else>
        <CardBody>
          <h2 class="card-title clamp-line">
            {{ item.title }}
          </h2>

          <p v-if="item.isBlocked">
            {{ $t('classroom.list:session.block.general') }}
          </p>
        </CardBody>

        <CardActions>
          <div class="card__progress-menu">
            <ProgressMenu
              v-if="cardType === 'sessions'"
              :content="$mx_formatToProgressMenuContent(item.progress)"
              :extra-content="$mx_formatToProgressMenuExtraContent(item.progress)"
              card
            />

            <ProgressLine
              v-else-if="typeof item.progress === 'number'"
              :value="Math.round(item.progress)"
              :label="
                $t('global:progress.percentage', {
                  percentage: Math.round(item.progress),
                })
              "
            />
          </div>
        </CardActions>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
@import 'DashboardCard.scss';
</style>
