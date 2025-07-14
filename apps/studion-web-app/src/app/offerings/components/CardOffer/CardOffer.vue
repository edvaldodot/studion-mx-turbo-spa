<script>
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import CardImage from '@/components/general/CardImage'
import CardActions from '@/components/general/CardActions'
import CategoriesChips from '@/components/general/CategoriesChips'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Rating from '@/components/general/Rating'

export default {
  name: 'CardOffer',
  components: {
    Action,
    Card,
    CardBody,
    CardImage,
    CardActions,
    CategoriesChips,
    Dropdown,
    DropdownLink,
    Rating
  },
  props: {
    category: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: null
    },
    oldPrice: {
      type: Number,
      default: null
    },
    paid: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    published: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    categories: {
      type: Array,
      default: () => ([])
    },
    ratingAnalysis: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility'])
  },
  methods: {
    editItem () {
      this.$emit('edit')
    },
    removeItem () {
      this.$emit('remove')
    },
    toggleItemActiveStatus () {
      this.$emit('toggle-active-status')
    }
  }
}
</script>

<template>
  <card class="card-offer" rounded>
    <card-body>
      <div class="card-offer__header">
        <span class="card-offer__category">{{category ? category : $t('global:without.category')}}</span>
        <h2 class="card-subtitle" v-if="title" :title="title">{{title}}</h2>
      </div>
      <div class="card-offer__options">
        <dropdown
          v-if="this.notEqualsProfile('student') && canWrite('offerings')"
          class="card-offer__options__item"
          icon="dots-vertical"
          icon-size="medium"
          right
        >
          <dropdown-link :text="$t('global:edit')" @click="editItem()"/>
          <dropdown-link :text="$t('global:remove')" @click="removeItem()"/>
          <dropdown-link v-if="!active" :text="$t('global:activate')" @click="toggleItemActiveStatus()"/>
          <dropdown-link v-if="active" :text="$t('global:deactivate')" @click="toggleItemActiveStatus()"/>
        </dropdown>
      </div>
    </card-body>
    <card-image :src="image" height="auto" use-img overlay>
      <span
        :class="`card-offer__published ${categories.length > 0 && 'with-categories'}`"
        v-if="published && active && this.notEqualsProfile('student')"
      >
        {{ $t('offerings:published') }}
      </span>
      <categories-chips :categories="categories" class="card-offer__categories" color="success" />
    </card-image>
    <card-actions class="card-offer__footer">
      <div class="card-offer__actions">
        <action
          :url="{ name: 'offerings.view', params: {id: id} }"
          :text="$t('global:view.more')"
          :dark="accessibility"
          flat
        />
        <action
          v-if="this.notEqualsProfile('student') && this.canWrite('offerings')"
          :url="{ name: 'offerings.update', params: {id: id} }"
          :text="$t('global:edit')"
          :dark="accessibility"
          flat
        />
      </div>
      <rating class="card-offer__rating" :rating-analysis="ratingAnalysis" resource-type="offering" />

      <div class="card-offer-price-wrapper" v-if="paid">
        <span class="card-offer-old-price" v-if="oldPrice">
          {{ $n(oldPrice, 'currency').replace(/^(\D+)/, '$1 ') }}
        </span>
        <span class="card-offer-price">
          {{ $n(price, 'currency').replace(/^(\D+)/, '$1 ') }}
        </span>
      </div>
    </card-actions>
  </card>
</template>

<style lang="scss">@import "CardOffer.scss";</style>
