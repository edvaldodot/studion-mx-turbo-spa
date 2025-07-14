<script>
import FilterForm from '../../../components/FilterForm'

export default {
  name: 'FilterTabInfo',

  components: {
    FilterForm
  },

  props: {
    value: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<template>
  <filter-form
    :isEditing="true"
    :value="value"
  />
</template>
