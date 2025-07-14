<script>
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import Tooltip from '@/components/general/Tooltip'

export default {
  name: 'DataTableActions',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    Tooltip,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      itemsWithDropdown: [],
    }
  },

  watch: {
    /**
     * Set a reactive data `itemsWithDropdown` containing
     * property `dropdown` to be able to toggle visualization on list.
     */
    items: {
      immediate: true,
      handler(newItemList) {
        this.itemsWithDropdown = newItemList.map((item) => ({
          ...item,
          dropdown: false,
        }))
      },
    },
  },

  methods: {
    hasProfileItems(item) {
      return item.profiles && item.profiles.items && item.profiles.items.length
    },
  },
}
</script>

<template>
  <datatable
    :items="itemsWithDropdown"
    item-identifier="day"
  >
    <template
      slot="thead"
      v-if="!$media.mobile"
    >
      <tr>
        <th class="th">{{ $t('global:day') }}</th>
        <th class="th">{{ $t('mediation.actions:datatable.header.1') }}</th>
        <th class="th">{{ $t('mediation.actions:datatable.header.2') }}</th>
        <th width="210" />
      </tr>
    </template>

    <template
      slot="tbody"
      slot-scope="{ item }"
    >
      <tr
        class="tr-parent-dropdown"
        :class="{ 'is-open': item.dropdown }"
      >
        <td
          class="td td-day"
          width="10%"
        >
          <span
            class="td-text-header"
            v-if="$media.mobile"
            >{{ $t('global:day') }}</span
          >
          <span class="td-text">{{ item.day }}</span>
        </td>

        <td
          class="td"
          width="35%"
        >
          <span
            class="td-text-header"
            v-if="$media.mobile"
            >{{ $t('mediation.list:datatable.header.1') }}</span
          >
          <span class="td-text clamp-line">{{ item.actions ? item.actions.title : '' }}</span>
        </td>

        <td class="td">
          <div class="actions">
            <span>
              <span
                class="td-text-header"
                v-if="$media.mobile"
                >{{ $t('mediation.list:datatable.header.2') }}</span
              >
              <span class="td-text clamp-line">{{ item.profiles ? item.profiles.title : '' }}</span>
            </span>
          </div>
        </td>
        <td>
          <div
            class="group-buttons"
            :class="{ hidden: !canWrite('mediation_plan') }"
          >
            <action
              v-if="!$media.mobile"
              type="button"
              @click="$emit('go-to', item)"
              :text="$t('global:view.more')"
              flat
            />

            <action
              v-if="hasProfileItems(item)"
              type="button"
              icon="keyboard_arrow_down"
              class="btn-dropdown text-right"
              @click="item.dropdown = !item.dropdown"
            />

            <dropdown
              v-if="canWrite('mediation_plan')"
              :disabled="!hasProfileItems(item)"
              icon="dots-vertical"
              right
            >
              <dropdown-link
                v-if="$media.mobile"
                @click="$emit('go-to', item)"
                :text="$t('global:view.more')"
              />

              <dropdown-link
                :text="$t('mediation.list:remove_actions')"
                @click="hasProfileItems(item) && $emit('delete-action', item)"
              />
            </dropdown>
          </div>
        </td>
      </tr>

      <datatable-collapse-row
        v-if="hasProfileItems(item) && item.dropdown"
        :colspan="4"
        :open="item.dropdown"
      >
        <datatable
          :items="item.profiles.items"
          class="details"
        >
          <template
            slot="tbody"
            slot-scope="{ item: innerItem }"
          >
            <tr>
              <td
                class="td td-day"
                width="10%"
              ></td>

              <td
                class="td p-0"
                width="35%"
              >
                <span class="td-text">{{ innerItem.action }}</span>
              </td>

              <td class="td">
                <span class="td-text">{{ innerItem.profile }}</span>
              </td>
            </tr>
          </template>
        </datatable>
      </datatable-collapse-row>
    </template>
  </datatable>
</template>
