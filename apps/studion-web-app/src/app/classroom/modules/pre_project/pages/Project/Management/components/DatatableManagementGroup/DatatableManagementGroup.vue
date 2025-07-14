<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'
import DataTableTd from '@/components/general/DataTableTd'
import ActionsGroup from '../ActionsGroup'

export default defineComponent({
  name: 'DatatableManagementGroup',

  components: {
    Datatable,
    EmptyMessage,
    Tooltip,
    DataTableTd,
    ActionsGroup,
  },

  props: {
    itemsGroups: {
      type: [Array],
      default: () => [],
    },
  },
  computed: {
    ...mapState(['accessibility', 'Classroom', 'forums']),
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback']),
    getStudentsNameLabel(names) {
      const firstTwoNames = names.slice(0, 2).join(', ')
      const restCount = names.length - 2

      return restCount > 0 ? `${firstTwoNames} +${restCount}` : firstTwoNames
    },

    viewDetails(data) {
      this.$router.push({
        name: 'classroom.pre.project.management.modal.view.details',
        params: {
          id: data.preProjectGroupId,
        },
      })
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-group-table')"
    class="management-group__table"
  >
    <template v-if="itemsGroups.length">
      <div class="datatable__group">
        <Datatable
          :items="itemsGroups"
          :dark="accessibility"
        >
          <template slot="thead">
            <tr v-if="!$media.mobile">
              <th
                class="th"
                width="500"
              >
                <span class="clamp-line">
                  {{ $t('pre.project.management.group.datatable.header.1') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('pre.project.management.group.datatable.header.2') }}
                </span>
              </th>

              <th
                class="th"
                width="250"
              >
                <span class="clamp-line">
                  {{ $t('pre.project.management.group.datatable.header.3') }}</span
                >
              </th>

              <th
                width="75px"
                class="th"
              ></th>
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
              <DataTableTd label="pre.project.management.group.datatable.header.1">
                {{ getStudentsNameLabel(item.studentsNames) }}
              </DataTableTd>

              <DataTableTd label="pre.project.management.group.datatable.header.2">
                {{ item.totalStudents }}
              </DataTableTd>

              <DataTableTd label="pre.project.management.group.datatable.header.3">
                <Tooltip
                  :uppercase="false"
                  :width="200"
                >
                  <template #activator="{ on }">
                    <span
                      class="clamp-line"
                      v-on="on"
                    >
                      <span class="clamp-line">
                        <p class="modality-group text-base">
                          {{
                            item.isLonely
                              ? $t('pre.project.management.group.datatable.filter.1')
                              : $t('pre.project.management.group.datatable.filter.2')
                          }}
                        </p>
                      </span>
                    </span>
                  </template>

                  <span class="clamp-line">{{
                    item.isLonely
                      ? $t('pre.project.management.group.datatable.filter.1')
                      : $t('pre.project.management.group.datatable.filter.2')
                  }}</span>
                </Tooltip>
              </DataTableTd>

              <td class="td td-actions">
                <ActionsGroup
                  :item="item.data"
                  @visualize="viewDetails(item)"
                  @edit="$emit('edit', item)"
                  @remove="$emit('remove', item)"
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
@import './DatatableManagementGroup.scss';
</style>
