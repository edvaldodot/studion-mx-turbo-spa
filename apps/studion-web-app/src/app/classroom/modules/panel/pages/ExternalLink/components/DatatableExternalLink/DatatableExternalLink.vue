<script>
import { defineComponent } from 'vue'

import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import ModalConfirm from '@/components/general/ModalConfirm'

export default defineComponent({
  name: 'DatatableExternalLink',

  components: {
    Datatable,
    EmptyMessage,
    Dropdown,
    DropdownLink,
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
      openModalConfirm: false,
      idExternalLink: null,
    }
  },

  methods: {
    openModalRemoveExternalLink(item) {
      this.openModalConfirm = true
      this.idExternalLink = item
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('datatable-pre-project')"
    class="center datatable-with-collapse px-4"
  >
    <Datatable
      v-if="items.length"
      :items="items"
    >
      <template slot="thead">
        <tr>
          <th class="th col-4">
            <span class="clamp-line">
              {{ $t('classrom.panel.datatable.external.link.header.1') }}
            </span>
          </th>

          <th class="th col-4">
            <span class="clamp-line">{{
              $t('classrom.panel.datatable.external.link.header.2')
            }}</span>
          </th>

          <th class="th col-2">
            <span class="clamp-line">{{
              $t('classrom.panel.datatable.external.link.header.3')
            }}</span>
          </th>

          <th class="th col-2">
            <span class="clamp-line">{{
              $t('classrom.panel.datatable.external.link.header.4')
            }}</span>
          </th>

          <th class="th">
            <span class="clamp-line">{{
              $t('classrom.panel.datatable.external.link.header.5')
            }}</span>
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <tr class="tr-parent-dropdown">
          <td class="td">
            <span class="td-text text-color">
              {{ item.name }}
            </span>
          </td>

          <td class="td">
            <span class="td-text text-color">
              {{ item.url }}
            </span>
          </td>

          <td class="td">
            <span class="td-text text-color">
              {{
                item.metaTypes.includes('meta') && item.metaTypes.includes('textual')
                  ? $t('tool.external.link.datatable.variable.both')
                  : item.metaTypes.includes('meta')
                  ? $t('tool.external.link.type.selector.1')
                  : $t('tool.external.link.datatable.variable.text')
              }}
            </span>
          </td>

          <td class="td">
            <div
              class="external-link-datatable-background-status"
              :class="{ 'inative-color': !item.active }"
            >
              <span class="td-text text-color">
                {{
                  item.active
                    ? $t(`classrom.panel.datatable.external.td.status.active`)
                    : $t('classrom.panel.datatable.external.td.status.inactive')
                }}
              </span>
            </div>
          </td>

          <td class="td td-actions">
            <Dropdown icon="dots-vertical">
              <DropdownLink
                :text="$t('global:edit')"
                icon="mode_edit"
                @click="$emit('edit', item.linkId)"
              />
              <DropdownLink
                :text="$t('global:remove')"
                icon="delete"
                @click="openModalRemoveExternalLink(item)"
              />
              <DropdownLink
                v-if="item.active"
                :text="$t('global:deactivate')"
                icon="visibility_off"
                @click="$emit('deactivate', item)"
              />

              <DropdownLink
                v-if="!item.active"
                :text="$t('global:activate')"
                icon="visibility"
                @click="$emit('activate', item)"
              />
            </Dropdown>
          </td>
        </tr>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('global:search.empty.title') }}</h2>
    </EmptyMessage>

    <ModalConfirm
      :title="$t('classrom.panel.datatable.external.modal.confirm.delete.title')"
      :active="openModalConfirm"
      :confirm-btn-text="$t('classrom.panel.datatable.external.modal.confirm.delete.button')"
      @close="openModalConfirm = false"
      @confirm="$emit('remove', idExternalLink)"
    >
      <p class="text-color">
        {{ $t('classrom.panel.datatable.external.modal.confirm.delete.description') }}
      </p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
.external-link-datatable-background-status {
  display: flex;
  width: 90px;
  justify-content: center;
  background-color: var(--success-100);
  padding: 3px;
  border-radius: 50px;

  &.inative-color {
    background-color: var(--error-100);
  }
}
</style>
