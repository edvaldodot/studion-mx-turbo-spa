<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardActions from '@/components/general/CardActions'

export default {
  components: {
    Action,
    Card,
    CardBody,
    CardActions,
  },
  props: {
    cardsBanner: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState({
      accessibility: (state) => state.accessibility,
    }),
  },
  methods: {
    goToClassrooms() {
      this.$router.push({ name: 'classroom.index' })
    },
    goToRanking() {
      this.$route.params.indexFromTabProfilePoints = 1
      this.$router.push({
        name: this.equalsProfile('student') ? 'profile.points' : 'ranking.list',
        params: this.$route.params,
      })
    },
  },
}
</script>

<template>
  <div
    class="card-dashboard-list-all"
    :class="{
      'card-dashboard-list-all--gamification': isGamificationEnable(),
      'card-dashboard-list-all--cards-banner': cardsBanner,
    }"
  >
    <card
      class="card-dashboard"
      rounded
      :horizontal="true"
    >
      <div class="card-dashboard-image card-dashboard-image--desktop">
        <img
          src="/assets/images/themes/default/fto/classroom-card-dashboard.png"
          alt="Classroom image"
        />
      </div>
      <card-body class="flex flex-column align-items-between card-dashboard-content">
        <div
          class="card-dashboard-header"
          style="display: flex; align-items: center"
        >
          <div class="card-dashboard-image card-dashboard-image--mobile">
            <img
              src="/assets/images/themes/default/fto/classroom-card-dashboard.png"
              alt="Classroom image"
            />
          </div>
          <h3 class="text-color mb-1">
            {{ $t('dashboard:card.2.title') }}
          </h3>
        </div>

        <div class="card-dashboard-description flex-1">
          <p class="text-base text-color">
            {{ $t('dashboard:card.2.description') }}
          </p>
          <p v-if="$te('dashboard:card.2.description.2')">
            {{ $t('dashboard:card.2.description.2') }}
          </p>
        </div>
        <card-actions no-padding>
          <action
            :text="$t('dashboard:card.2.btn.text')"
            flat
            :dark="accessibility"
            type="button"
            @click="goToClassrooms"
          ></action>
        </card-actions>
      </card-body>
    </card>
    <template v-if="isGamificationEnable()">
      <card
        rounded
        class="card-dashboard-ranking"
        :class="{ 'gamification-card--vertical': !$media.mobile && cardsBanner }"
      >
        <card-body>
          <h2
            class="card-dashboard-title"
            v-html="$t('dashboard:card.3.title')"
          ></h2>
          <div class="card-dashboard-description">
            <p class="text-color">{{ $t('dashboard:card.3.description') }}</p>
          </div>
        </card-body>
        <card-actions>
          <action
            type="button"
            flat
            :dark="accessibility"
            :text="$t('global:access')"
            @click="goToRanking"
          >
          </action>
        </card-actions>
      </card>
    </template>
  </div>
</template>
