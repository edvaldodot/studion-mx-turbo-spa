<script>
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'

export default {
  name: 'DatatableInstancePermission',

  components: {
    Checkbox,
    Datatable,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    instanceContexts: {
      type: Array,
      default: () => [],
    },

    blockedByDependency: {
      type: Array,
      default: () => [],
    },

    blockedProfiles: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * Computed property that filters and modifies the `items` array.
     *
     * This computed property processes the `items` array by performing two actions:
     * 1. It maps through the `items` and checks if the `context` of each item exists in the `blockedByDependency` array.
     *    - If the `context` is found in `blockedByDependency`, the `read` permission (within `action`) is set to `true` for that item.
     * 2. It filters out items where the `context` is equal to 'biometrics'.
     *
     * @returns {Array} The filtered and modified array of items.
     *
     * - Each item in the array should have the following structure:
     *   - `context`: A string representing the context of the item.
     *   - `action`: An object containing `read` and `write` permissions, where `read` is a boolean.
     *   - If the `context` of an item is included in `blockedByDependency`, its `read` permission will be set to `true`.
     *   - The array will exclude items where the `context` is equal to `'biometrics'`.
     */
    filteredItems() {
      return this.items
        .map((item) => {
          if (this.blockedByDependency.includes(item.context)) {
            item.action.read = true
          }
          return item
        })
        .filter((item) => item.context !== 'biometrics')
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('datatable-instance-permission')"
    class="datatable-permission"
  >
    <Datatable
      :items="filteredItems"
      no-margin-top
      dark
    >
      <template slot="thead">
        <tr>
          <th class="th"></th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.read') }}
          </th>
          <th
            class="th text-center"
            width="140"
          >
            {{ $t('community.profiles:modal.permissions.write') }}
          </th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr>
          <td class="td">
            <span class="td-text">{{
              $t(`community.profiles:permission.name:${props.item.context}`)
            }}</span>
          </td>

          <td class="td text-center">
            <Checkbox
              v-model="props.item.action.read"
              :items="[{ value: true }]"
              :disabled="
                props.item.action.write ||
                !canWrite('profiles') ||
                blockedProfiles ||
                blockedByDependency.includes(props.item.context)
              "
              switch-type
              dark
              @value="$emit('update:denied-contexts', props.item)"
            />
          </td>

          <td class="td text-center">
            <Checkbox
              v-model="props.item.action.write"
              :items="[{ value: true }]"
              :disabled="!canWrite('profiles') || blockedProfiles"
              switch-type
              dark
              @value="$emit('update:denied-contexts', props.item)"
            />
          </td>
        </tr>
      </template>
    </Datatable>
  </div>
</template>
