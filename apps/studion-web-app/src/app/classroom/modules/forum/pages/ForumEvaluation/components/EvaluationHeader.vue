<script>
import { defineComponent } from 'vue'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'

import Action from '@/components/general/Action'

export default defineComponent({
  name: 'EvaluationHeader',

  components: {
    FilterList,
    FilterListSearch,
    FilterListOrder,
    FilterListTag,
    Action,
  },

  props: {
    orderOptions: {
      type: Array,
      default: () => [],
    },

    tagOptions: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    backButtonLabel() {
      return this.$route.params.management
        ? this.$t('management:back.to.management')
        : this.$t('global:back')
    },
  },

  methods: {
    backAction() {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }

      this.$router.push({
        name: this.$route.meta.backName,
      })
    },
  },
})
</script>

<template>
  <div class="evaluation-header">
    <Action
      slot="button"
      type="button"
      icon="keyboard_backspace"
      icon-size="small"
      :text="backButtonLabel"
      class="btn-back text-color"
      @click="backAction"
    />

    <FilterList>
      <FilterListOrder
        slot="order"
        :on-server="true"
        :options="orderOptions"
        @update-orders="$emit('change:order', $event)"
      />

      <FilterListTag
        slot="tag"
        :options="tagOptions"
      />

      <FilterListSearch
        slot="search"
        @search="$emit('search', $event)"
      />
    </FilterList>
  </div>
</template>

<style lang="scss">
.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 1em 0;
}
.btn-back {
  font-size: 1.4em;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
}
.filter > .center {
  padding: 0;
}
</style>
