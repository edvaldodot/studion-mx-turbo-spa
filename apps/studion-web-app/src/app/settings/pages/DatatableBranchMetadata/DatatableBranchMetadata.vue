<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Datatable from '@/components/general/Datatable'
import DatatableBranchMetadataActions from './components/DatatableBranchMetadataActions.vue'

export default defineComponent({
  name: 'DatatableBranchMetadata',

  components: {
    Datatable,
    DatatableBranchMetadataActions,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    ...mapActions(['accessibility']),

    getType(alias) {
      let type = alias
      if (alias === 'string') type = 'text.mask'
      return this.$t(`global:metadata.type.${type.replaceAll('_', '.')}`)
    },
  },
})
</script>

<template>
  <Datatable
    v-if="items.length"
    :data-testid="$testId('datatable-branch-metadata')"
    :items="items"
    dark
  >
    <template slot="thead">
      <tr v-if="!$media.mobile">
        <th
          class="th"
          width="70%"
        >
          <span class="clamp-line">{{ $t('global:metadata.datatable.header.1') }}</span>
        </th>
        <th class="th">
          <span class="clamp-line">{{ $t('global:metadata.datatable.header.2') }}</span>
        </th>

        <th
          width="40px"
          class="th"
        ></th>
      </tr>
    </template>

    <template
      slot="tbody"
      slot-scope="props"
    >
      <tr
        v-if="$media.mobile"
        class="tr-colspan"
      >
        <td
          class="td"
          colspan="2"
        >
          <span class="td-text-header">
            {{ $t('global:metadata.datatable.header.1') }}
          </span>

          <span class="td-text bolder">{{ props.item.meta.name }}</span>
        </td>

        <td
          class="td"
          colspan="2"
        >
          <span class="td-text-header">
            {{ $t('global:metadata.datatable.header.2') }}
          </span>

          <span class="td-text bolder">{{ getType(props.item.meta.type.alias) }}</span>
        </td>

        <td class="td td-actions text-right">
          <DatatableBranchMetadataActions
            v-if="notEqualsProfile('student') && canWrite('branches')"
            @edit="$emit('edit:additional-field', props.item)"
            @delete="$emit('delete:additional-field', props.item)"
          />
        </td>
      </tr>

      <tr
        v-else
        class="tr-body"
      >
        <td class="td">
          <span class="td-text">
            {{ props.item.meta.name }}
          </span>
        </td>
        <td class="td">
          <span class="td-text">
            {{ getType(props.item.meta.type.alias) }}
          </span>
        </td>

        <td class="td td-actions text-right">
          <DatatableBranchMetadataActions
            v-if="notEqualsProfile('student') && canWrite('branches')"
            @edit="$emit('edit:additional-field', props.item)"
            @delete="$emit('delete:additional-field', props.item)"
          />
        </td>
      </tr>
    </template>
  </Datatable>
</template>
