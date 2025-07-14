<script>
import { defineComponent } from 'vue'
import { isAfter, parseISO } from 'date-fns'

import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import DropdownLinkTooltip from '@/components/shared/DropdownLinkTooltip'
import DataTableTd from '@/components/general/DataTableTd'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default defineComponent({
  name: 'DatatableManagementConference',

  components: {
    Datatable,
    Dropdown,
    DropdownLink,
    DropdownLinkTooltip,
    DataTableTd,
    ModalConfirm,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      editItem: {},
    }
  },

  computed: {
    computedItems() {
      const roomCount = this.items.reduce((acc, item) => {
        acc[item.vendorConferencesRoomsId] = (acc[item.vendorConferencesRoomsId] || 0) + 1
        return acc
      }, {})

      return this.items.map((item) => ({
        ...item,
        hasMoreThanOneRoom: roomCount[item.vendorConferencesRoomsId] > 1,
      }))
    },
  },

  methods: {
    canEdit(item) {
      return !isAfter(new Date(), parseISO(item.startTime))
    },

    editHandler(item) {
      if (item.multipleSessions && !this.editItem.id) {
        this.editItem = item
        return
      }

      this.editItem = {}
      this.$emit('edit', item)
    },
  },
})
</script>

<template>
  <div class="datatable-management-conference">
    <Datatable :items="computedItems">
      <template #thead>
        <tr v-if="!$media.mobile">
          <th
            class="th"
            width="250"
          >
            <span class="clamp-line">
              {{ $t('solutions:tools.conference') }}
            </span>
          </th>

          <th
            class="th"
            width="250"
          >
            <span class="clamp-line">
              {{ $t('global:begin') }}
            </span>
          </th>

          <th
            class="th"
            width="250"
          >
            <span class="clamp-line">{{ $t('global:end') }}</span>
          </th>

          <th
            class="th"
            width="250"
          >
            <span class="clamp-line">{{ $t('community.sessions:datatable.header.2') }}</span>
          </th>

          <th
            class="th"
            width="250"
          >
            <span class="clamp-line">{{ $t('global:session.multiple') }}</span>
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
          }"
        >
          <DataTableTd label="solutions:tools.conference">
            {{ item.name }}
          </DataTableTd>

          <DataTableTd label="global:begin">
            {{ item.startTime ? formatDate(item.startTime, 'long') : '-' }}
          </DataTableTd>

          <DataTableTd label="global:end">
            {{ item.endTime ? formatDate(item.endTime, 'long') : '-' }}
          </DataTableTd>

          <DataTableTd label="community.sessions:datatable.header.2">
            {{ item.sessionName }}
          </DataTableTd>

          <DataTableTd label="community.sessions:datatable.header.2">
            {{ item.multipleSessions ? $t('global:yes') : $t('global:no') }}
          </DataTableTd>

          <td class="td td-actions">
            <Dropdown icon="dots-vertical">
              <DropdownLinkTooltip
                :dropdown-props="{
                  text: $t('global:edit'),
                  disabled: !canEdit(item),
                }"
                :tooltip="{
                  condition: !canEdit(item),
                  text: $t('classroom.conference:feedback.edit.already_started'),
                  props: { uppercase: false },
                }"
                @click="editHandler(item)"
              />

              <DropdownLink
                :text="$t('classroom.conference:multiple.conference.room.delete')"
                @click="$emit('removeMultiple', item)"
              />
              <DropdownLink
                v-if="item.hasMoreThanOneRoom"
                :text="$t('classroom.conference:conference.room.delete')"
                @click="$emit('remove', item)"
              />

              <DropdownLink
                :text="$t('global:access')"
                @click="$emit('access', item)"
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </Datatable>

    <ModalConfirm
      :active="editItem.id"
      :title="$t('classroom.conference:multiple.edit.title')"
      @confirm="editHandler(editItem)"
      @close="editItem = {}"
    >
      <p>{{ $t('classroom.conference:multiple.edit.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss"></style>
