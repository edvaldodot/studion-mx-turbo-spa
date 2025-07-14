<script>
import i18n from '@/support/i18n'
import { getActionInfo } from '@/domains/mediation/utils'

import Action from '@/components/general/Action'
import ActionSubmenu from '@/components/general/ActionSubmenu'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'

import FilterToggleView from './FilterToggleView'

export default {
  name: 'FilterGroupActions',

  components: {
    Action,
    ActionSubmenu,
    FilterList,
    FilterListOrder,
    FilterListTag,
    FilterToggleView,
  },

  props: {
    initialViewState: {
      type: Boolean,
      required: true,
    },

    profileOptions: {
      type: Array,
      default: () => [],
    },

    orderOptions: {
      type: Array,
      default: () => [
        {
          text: i18n.t('mediation.filter:day:orders.asc'),
          value: 0,
          property: 'day',
          type: 'asc',
        },
        {
          text: i18n.t('mediation.filter:day:orders.desc'),
          value: 1,
          property: 'day',
          type: 'desc',
        },
      ],
    },

    actionsOptions: {
      type: Array,
      default: () => [],
    },

    hasFilterActive: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showSubmenu: false,
    }
  },

  computed: {
    tagActionOptions() {
      return {
        title: this.$t('mediation.actions:datatable.header.1'),
        name: 'actionType',
        items: this.actionsOptions.map((actionValue) => {
          const action = getActionInfo(actionValue)

          return {
            ...action,
            active: false,
            id: action.value,
            property: 'action',
          }
        }),
      }
    },

    selectProfileOptions() {
      return this.profileOptions.map((profile) => ({
        value: profile,
        text: profile,
      }))
    },
  },

  methods: {
    toggleSubmenu() {
      this.showSubmenu = !this.showSubmenu
    },
  },
}
</script>

<template>
  <FilterList class="filter-group-actions">
    <ActionSubmenu
      slot="button"
      :show.sync="showSubmenu"
    >
      <Action
        v-if="canWrite('mediation_plan')"
        slot="button"
        :text="$t('mediation.mediation:btn.add')"
        type="button"
        primary
        large
        fixed-width
        @click="toggleSubmenu()"
      />

      <template slot="actions">
        <Action
          :text="$t('global:single')"
          type="button"
          primary
          small
          @click="$emit('add')"
        />
        <Action
          :text="$t('global:batch')"
          type="button"
          primary
          small
          @click="$emit('batch')"
        />
      </template>
    </ActionSubmenu>

    <Action
      v-if="!showSubmenu"
      slot="button"
      :text="$t('mediation.batch:list.title')"
      type="button"
      flat
      fixed-width
      @click="$emit('batch-list')"
    />

    <FilterListOrder
      slot="categories"
      :options="selectProfileOptions"
      :select-all-option="false"
      :label="$t('global:filter.label')"
      on-server
      multiple
      @update-orders="(value) => $emit('update-filter-profile', value)"
    />

    <FilterListOrder
      slot="order"
      :label="$t('global:filter.order.label')"
      :options="orderOptions"
      on-server
      @update-orders="(value) => $emit('update-order', value)"
    />

    <FilterListTag
      slot="tag"
      :options="[tagActionOptions]"
      @update-filters="(filters) => $emit('update-tag-filters', filters)"
    />

    <FilterToggleView
      slot="preferences"
      :disabled="hasFilterActive"
      :initial-view-state="initialViewState"
      @toggle="(state) => $emit('filter-view', state)"
    />
  </FilterList>
</template>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .filter-group-actions {
    .center {
      margin: 0 auto;
    }

    .action-submenu:has(.action-submenu-list) {
      margin-bottom: 5em;
    }

    .action-submenu-list {
      top: 28px;
      left: 45px;
    }
  }
}
</style>
