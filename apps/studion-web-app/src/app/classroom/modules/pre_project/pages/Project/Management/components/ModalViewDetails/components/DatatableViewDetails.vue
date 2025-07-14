<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import DataTableTd from '@/components/general/DataTableTd'

export default defineComponent({
  name: 'DatatableViewDetails',

  components: {
    Datatable,
    Icon,
    DataTableTd,
  },

  props: {
    students: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapState(['accessibility', 'Classroom', 'forums']),
  },

  created() {},

  methods: {
    ...mapActions(['setFetching', 'setFeedback']),
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-group-table')"
    class="management-group__table"
  >
    <template v-if="students.length">
      <div class="datatable__group">
        <Datatable
          :items="students"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('pre.project.management.datatable.view.details.header') }}
                </span>
              </th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="{ item }"
          >
            <tr
              :class="{
                'tr-body': !$media.mobile,
                'tr-mobile': $media.mobile,
                'new-message': !item.seenAt,
              }"
            >
              <DataTableTd label="global:initial.date">
                <div class="datatable-users">
                  <div class="datatable-image">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      class="w-2rem border-circle"
                    />

                    <Icon
                      v-else
                      class="text-3xl icon-fill-1"
                      name="account_circle"
                      pack="material"
                    />
                  </div>
                  <span>
                    {{ item.name }}
                  </span>
                </div>
              </DataTableTd>
            </tr>
          </template>
        </Datatable>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.datatable__group {
  .datatable-image {
    width: 40px;
    height: 40px;
    min-height: 40px;
    margin-right: 5px;

    .icon {
      width: 40px;
      height: 40px;
    }
  }
  .datatable-users {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>
