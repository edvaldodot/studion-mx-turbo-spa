<template>
<div class="checkbox-branches" :class="{'theme-dark': dark}">
  <tree :startOpened="openedBranches" :selectable="true" v-if="branchesTree && branchesTree.length && !loading" :branches="branchesTree" :dark="dark">
    <template v-slot:header>
      <div class="checkbox-branches__header">
        <div class="checkbox-header__item">
          <p class="text-color">{{label}}</p>
        </div>
      </div>
    </template>
    <template v-if="branchesTree && branchesTree.length" v-slot:row="props">
      <tree-checkbox-item
        :branch="props.branch"
        @toggle="props.toggle"
        @checked="select"
        :dark="dark"
        :isRoot="rootBranches.includes(props.branch.id)"
        :selectedId="value"
        :startOpened="openedBranches"
      />
    </template>
  </tree>
  <div v-else-if="loading || error">
    <div class="checkbox-branches__header">
      <div class="checkbox-header__item">
        <p class="text-color">{{label}}</p>
      </div>
    </div>
    <loading v-if="loading"></loading>
    <p class="checkbox-branches__error" v-if="error">{{$t('global:branches.loading.error')}}</p>
  </div>
  <div class="form-input-details" v-if="!hideErrorDetails" ref="details">
    <validation-message :validation="validation"></validation-message>
  </div>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import ValidationMessage from '@/components/general/ValidationMessage'
import TreeCheckboxItem from './TreeCheckboxItem'
import Tree from '@/components/general/Tree'
import Action from '@/components/general/Action'
import Loading from '@/components/general/Loading'

export default {
  components: {
    Action,
    TreeCheckboxItem,
    Tree,
    Loading,
    ValidationMessage
  },
  data () {
    return {
      loading: false,
      error: false,
      openedBranches: []
    }
  },
  props: {
    value: {
      type: Number,
      default: null
    },
    startOpened: {
      type: Number,
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    dark: {
      type: Boolean,
      default: false
    },
    hideErrorDetails: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {
    rootBranches () {
      return this.branchesTree.map(tree => tree.id)
    },
    ...mapState({branchesTree: state => state.Branches.tree})
  },
  async created () {
    this.loading = true
    try {
      await this.attemptTreeDetailsRetrieval(true)
      if (this.startOpened) {
        const res = this.$store.getters.getBranchById(this.startOpened, 'id')
        this.openedBranches = res.breadcrumbs
      }
    } catch (error) {
      this.error = true
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['attemptTreeDetailsRetrieval', 'setFetching']),
    select (value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss">
  @import "TreeCheckbox.scss";
</style>
