<script>
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'

export default {
  name: 'DataTableFiles',

  components: {
    Action,
    Datatable
  },

  props: {
    dark: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    items: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    formatBytes (bytes) {
      if (bytes < 1024) return bytes + ' bytes'
      if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
      if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB'
      return (bytes / 1073741824).toFixed(2) + ' GB'
    }
  }
}
</script>

<template>
  <datatable
    :items="items"
    item-identifier="name"
    :class="{ 'is-disabled': disabled }"
    :dark="dark"
  >
    <template slot="thead" v-if="!$media.mobile">
      <tr>
        <th class="th">{{ $t("global:file") }}</th>
        <th class="th">{{ $t("global:size") }}</th>
        <th class="th" v-if="!disabled"></th>
      </tr>
    </template>

    <template slot="tbody" slot-scope="{ item, index }">
      <tr>
        <td class="td" width="65%">
          <span class="td-text-header" v-if="$media.mobile">{{ $t("global:file") }}</span>
          <span class="td-text clamp-line">{{ item.name || item.originalName }}</span>
        </td>

        <td class="td" width="30%">
          <span class="td-text-header" v-if="$media.mobile">{{ $t("global:size") }}</span>
          <span class="td-text clamp-line">{{ formatBytes(item.size) }}</span>
        </td>

        <td class="td" v-if="!disabled">
          <action
            type="button"
            @click="$emit('remove-file', index)"
            :text="$t('global:upload.remove.modal.title')"
            icon="close"
            hide-label
            flat
          />
        </td>
      </tr>
    </template>
  </datatable>
</template>
