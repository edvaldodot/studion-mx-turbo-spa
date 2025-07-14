<script>
import { mapState } from 'vuex'
import Action from '../Action'
import Icon from '../Icon'
import InputField from '../InputField'

export default {
  name: 'searchbar',
  components: {
    Action,
    Icon,
    InputField
  },
  data () {
    return {
      isOpen: false,
      formData: null
    }
  },
  props: {
    classes: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: ''
    }
  },
  methods: {
    toggleSearch () {
      this.isOpen = !this.isOpen
      this.$nextTick(() => {
        this.$refs.inputfield && this.$refs.inputfield.$refs.input.focus()
      })
    },
    outside () {
      this.isOpen = false
    }
  },
  computed: {
    ...mapState(['accessibility'])
  }
}
</script>

<template>
  <div class="search-bar" v-click-outside="outside" :class="{ 'is-open': isOpen }">
    <action type="link" icon="search" class="search-bar-link" @click="toggleSearch" :class="[classes]"></action>
    <div class="search-form" v-if="isOpen">
      <form>
        <input-field v-model="formData" :label="label" :floating-label="false" dark autofocus ref="inputfield"></input-field>
      </form>
    </div>
  </div>
</template>

<style lang="scss">@import "SearchBar.scss";</style>
