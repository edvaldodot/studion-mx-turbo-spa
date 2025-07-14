<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import DataTableTd from '@/components/general/DataTableTd'

export default defineComponent({
  name: 'DatatableHistory',

  components: {
    Action,
    Datatable,
    EmptyMessage,
    DataTableTd,
  },

  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      numberColumns: 7,
    }
  },

  computed: {
    ...mapState(['accessibility']),

    datatableWidth() {
      if (this.$media.mobile) return '100%'
      return `calc(100% + ${this.numberColumns * 8}%)`
    },
  },

  methods: {
    viewDetails(item) {
      this.$emit('details', item)
    },

    formatNameList(item) {
      const names = item.map((i) => i.username)

      if (names.length === 1) return names[0]

      if (names.length === 2) return names.join(', ')

      const [first, second, ...rest] = names
      const remainingCount = rest.length

      return `${first}, ${second}${remainingCount > 0 ? `, + ${remainingCount}` : ''}`
    },

    getDate(date) {
      const fDate = this.formatDate(date, 'long')
      if (this.$i18n.locale !== 'pt-br') return fDate
      return fDate.replace(',', ' às')
    },
  },
})
</script>

<template>
  <div
    :style="{ '--width': datatableWidth }"
    class="datatable-history"
  >
    <template v-if="data.length">
      <div class="datatable__evaluations">
        <Datatable
          :items="data"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.pre.project:history.datatable.title.1')
                }}</span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.pre.project:history.datatable.title.2')
                }}</span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.pre.project:history.datatable.title.3')
                }}</span>
              </th>
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">{{
                  $t('classroom.pre.project:history.datatable.title.4')
                }}</span>
              </th>
              <th
                width="75"
                class="th"
              ></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
              <DataTableTd label="classroom.pre.project:history.datatable.title.1">
                {{ formatNameList(item.participants) }}
              </DataTableTd>

              <DataTableTd label="classroom.pre.project:history.datatable.title.2">
                {{ item.numberParticipants }}
              </DataTableTd>

              <DataTableTd label="classroom.pre.project:history.datatable.title.3">
                <span class="tag">
                  {{
                    !item.deleted
                      ? $t('global:active')
                      : $t('classroom.pre.project:history.datatable.filter.2')
                  }}
                </span>
              </DataTableTd>

              <DataTableTd label="classroom.pre.project:history.datatable.title.4">
                {{ getDate(item.lastUpdatedAt) }}
              </DataTableTd>

              <td class="td td-actions">
                <Action
                  :text="$t('global:view.details')"
                  type="button"
                  flat
                  class="is-highlight"
                  @click="viewDetails(item)"
                />
              </td>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>
  </div>
</template>

<style lang="scss">
@import './DatatableHistory.scss';
</style>
