<script>
import { mapActions, mapState } from 'vuex'

import Datatable from '@/components/general/Datatable'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default {
  name: 'MetadataList',

  components: {
    Datatable,
    Dropdown,
    DropdownLink
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },

    dark: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState(['accessibility'])
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptMetasRemoval',
      'setMetadataData'
    ]),

    /**
     * @param {string} value
     */
    sanitizeString (value) {
      return value.replace('_', '.')
    },

    /**
     * @param {Object} metadata
     */
    editMetadata (metadata) {
      this.setMetadataData({ path: 'current', value: metadata })
      this.$router.push({ name: 'solutions.metadata.edit', params: { id: metadata.id } })
    },

    /**
     * @param {Object} metadata
     */
    removeMetadata (metadata) {
      this.setFetching(true)

      const body = {
        entity: metadata.entity.alias,
        id: metadata.id
      }

      this.attemptMetasRemoval(body).then(() => {
        this.setFeedback({ message: this.$t('solutions.metadata:feedback.remove.success') })
        this.$emit('remove')
      }).catch(() => {
        this.setFeedback({message: this.$t('solutions.metadata:feedback.remove.error'), type: 'error'})
      }).finally(() => {
        this.setFetching(false)
      })
    }
  },

  beforeDestroy () {
    this.setMetadataData({ path: 'current', value: null })
  }
}
</script>

<template>
  <div>
    <datatable
      :items="items"
      v-if="items.length > 0"
      :dark="accessibility || dark"
    >
      <template slot="thead">
        <tr>
          <th class="th">
            {{ $t("global:metadata.datatable.header.1") }}
          </th>

          <th class="th" width="20%">
            {{ $t("global:metadata.datatable.header.2") }}
          </th>

          <th class="th" width="40"></th>
        </tr>
      </template>

      <template slot="tbody" slot-scope="{ item }">
        <tr>
          <td class="td">
            <span class="td-text-header" v-if="$media.mobile">
              {{ $t("global:metadata.datatable.header.1") }}
            </span>
            <span class="td-text">{{ item.meta.name }}</span>
          </td>

          <td class="td">
            <span class="td-text-header" v-if="$media.mobile">
              {{ $t("global:metadata.datatable.header.2") }}
            </span>
            <span class="td-text">{{
              $t(`global:metadata.type.${sanitizeString(item.meta.type.alias)}`)
            }}</span>
          </td>

          <td class="td td-actions">
            <dropdown
              v-if="notEqualsProfile('student') && canWrite('courses') && canWrite('metadata')"
              icon="dots-vertical"
              right
            >
              <dropdown-link :text="$t('global:edit')" @click="editMetadata(item)" />

              <dropdown-link :text="$t('global:remove')" @click="removeMetadata(item)" />
            </dropdown>
          </td>
        </tr>
      </template>
    </datatable>
  </div>
</template>
