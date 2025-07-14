<script>
import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Breadcrumbs from '@/components/general/Breadcrumbs'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import Radio from '@/components/general/Radio'
import ValidationMessage from '@/components/general/ValidationMessage'

export default {
  name: 'BranchSelector',

  components: {
    Action,
    Breadcrumbs,
    EmptyMessage,
    FilterList,
    Icon,
    Loading,
    Radio,
    ValidationMessage,
    InputField,
  },

  mixins: [paginateMixin],

  props: {
    value: {
      type: Array,
      default: () => [],
    },
    dark: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      branchSearchInput: null,
      mappedBranches: null,
      breadcrumbsList: [],
      tempBreadcrumbs: [],
      currentBranchId: null,
      currentTree: [],
      selectedBranch: [],
      selectedIds: [],
      isLoading: null,
    }
  },

  computed: {
    ...mapState({
      branchesList: (state) => state.Branches.list,
      currentParentBranch: (state) => state.Branches.currentParentBranch,
    }),

    isSearch() {
      return Object.keys(this.pgtrParams.query).length > 0
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.isLoading = loading
      },
    },

    /**
     * Make parent branch selectable, adding it at the first position and map branches
     * @returns {Array<Object>}
     */
    branchesList: {
      handler(value) {
        const branches = cloneDeep(value)

        if (!this.isSearch) {
          const parentLevel = this.breadcrumbsList[this.breadcrumbsList.length - 1].value
          branches.unshift(parentLevel)
        }

        this.mappedBranches = branches.map((branch) => {
          this.mountBreadcrumbs(branch.parentGroup)
          return {
            ...branch,
            label: branch.name,
            value: branch.id,
            breadcrumbs: this.isSearch ? this.tempBreadcrumbs : null,
          }
        })

        this.currentBranchId = this.mappedBranches[0].id
      },
    },

    value: {
      immediate: true,
      handler(value) {
        if (value && !this.multiple) {
          this.selectBranchByBranchObject(value)
        }
        if (value && this.multiple) {
          this.selectedBranch = []
          value.forEach((branch) => {
            this.selectBranchByBranchObject(branch)
          })
        }
      },
    },

    /**
     * Keep currentBranchId's full parent tree
     * Ignore if 1 level if a parent is selected
     */
    currentBranchId: {
      handler() {
        if (!this.currentBranchId) return
        const currentBranch = this.mappedBranches.filter(
          (branch) => branch.id === this.currentBranchId
        )[0]

        if (!this.isSearch) {
          const tree = this.breadcrumbsList.map((item) => {
            return item.value
          })

          if (this.breadcrumbsList[this.breadcrumbsList.length - 1].value.id !== currentBranch.id) {
            tree.push(currentBranch)
          }

          this.currentTree = tree.map((item) => this.mapTree(item))
        } else {
          this.mountBreadcrumbs(currentBranch)
          this.currentTree = this.tempBreadcrumbs
        }
      },
    },

    currentParentBranch: {
      handler(parent) {
        if (!parent) return

        this.mountBreadcrumbs(parent)
        this.breadcrumbsList = this.tempBreadcrumbs

        this.pgtrParams.filter = { parent_id: parent.id }
        if (!this.pgtrIsInitialized) {
          this.pgtrInitializePagination('branchesListResource', {}, { limit: 9999 })
        }
      },
    },
  },

  async created() {
    this.changeBranchFolder()
  },

  methods: {
    ...mapActions(['attemptSetCurrentParent']),

    async changeBranchFolder(item = null) {
      this.pgtrIsInitialized = false
      this.pgtrParams.query = {}

      await this.attemptSetCurrentParent(item)
    },

    /**
     * Recursive function that returns full branch breadcrumbs
     * Keep result in a temp var
     */
    mountBreadcrumbs(currentItem, acc = []) {
      if (!currentItem) return

      acc.push(this.mapTree(currentItem))

      if (currentItem.parentGroup && typeof currentItem.parentGroup === 'object') {
        this.mountBreadcrumbs(currentItem.parentGroup, acc)
      } else {
        this.tempBreadcrumbs = acc.reverse()
      }
    },

    /**
     * Toggle params filter to search and list all view
     * Pause paginator mixin to avoid duplicated requests
     */
    setSearch(event) {
      this.pgtrIsInitialized = false
      this.pgtrSetSearch('name', event)

      if (event) {
        this.pgtrParams.filter = { ignore_user: 1 }
      } else {
        this.pgtrParams.filter = { parent_id: this.currentParentBranch.id }
      }

      this.pgtrInitializePagination('branchesListResource')
    },

    /**
     * Validate if branch has a valid children's to better up navigation
     * @param {Object} Branch
     * @returns {Boolean}
     */
    hasChildren(branch) {
      if (branch.materializedPathChildrens) {
        return branch.materializedPathChildrens.split(',').map((c) => c.trim()).length > 1
      }
    },

    /**
     * Map tree to a useful structure for Breadcrumb
     * @param {Object} item - Branch treeselectedBranch
     * @returns {Object}
     */
    mapTree(item) {
      return {
        text: item.name || item.text,
        key: item.id,
        value: item,
      }
    },

    /**
     * Select branch, show info and emit the selected ID or
     * IDs, if its multiple, to the parent
     */
    selectBranch() {
      if (!this.currentBranchId) return

      if (this.multiple) {
        if (this.selectedIds.includes(this.currentBranchId)) return
        this.$emit('change', [...this.selectedIds, this.currentBranchId])
        this.selectedBranch.push(this.currentTree)
        this.selectedIds.push(this.currentBranchId)
        return
      }
      this.$emit('change', this.currentBranchId)
      this.selectedBranch = this.currentTree
    },
    /**
     * Remove branch from selected list
     * @param {Number} index - Index of selected branch
     */
    removeSelectedBranch(index) {
      this.selectedBranch.splice(index, 1)
      this.selectedIds.splice(index, 1)
      this.$emit('change', [...this.selectedIds])
    },
    /**
     * Select a branch in the BranchSelector by a received
     * branch object, setting the required fields to show the
     * branch in the component
     * @param {Object} branch - Branch object
     */
    selectBranchByBranchObject(branch) {
      this.mountBreadcrumbs(branch)
      this.currentTree = this.tempBreadcrumbs
      this.currentBranchId = branch.id
      this.selectBranch()
    },

    /**
     *  This code snippet uses the debounce function
     *  to limit the frequency of calls to setSearch,
     *  with a 400 millisecond delay.
     */
    debounceSearch: debounce((setSearch, evt) => {
      setSearch(evt ? evt : null)
    }, 400),
  },
}
</script>

<template>
  <div
    v-if="$isEnabledFeature('branching')"
    :class="{ '--dark': dark, error: validation.$anyError }"
    class="branch-selector"
  >
    <h3 class="form-section-title">{{ $tc('global:branch') }}</h3>

    <div class="branch-selector__selector">
      <div class="brach-selector__filter-wrapper">
        <FilterList class="branch-selector__filter">
          <InputField
            slot="search"
            v-model="branchSearchInput"
            :dark="dark"
            append-icon="search"
            :label="$t('global:menu.search')"
            hide-error-details
            :show-optional="false"
            @input="debounceSearch(setSearch, $event)"
          />
        </FilterList>
        <Action
          type="button"
          :dark="dark"
          :disabled="selectedIds.includes(currentBranchId)"
          :text="$t('global:add')"
          primary
          icon="add"
          @click="selectBranch"
        />
      </div>

      <div class="branch-selector__results">
        <Loading
          v-if="isLoading"
          :dark="dark"
        />

        <div
          v-else
          class="branch-selector__result"
        >
          <Breadcrumbs
            v-if="breadcrumbsList.length && !isSearch"
            clickable
            highlight-current
            size="large"
            :breadcrumbs-list="breadcrumbsList"
            @click="changeBranchFolder"
          />

          <Radio
            v-if="mappedBranches"
            v-model="currentBranchId"
            :dark="dark"
            :items="mappedBranches"
            :class="{ 'is-search': isSearch }"
            dynamic
          >
            <template
              slot="precontent"
              slot-scope="props"
            >
              <Breadcrumbs
                v-if="isSearch"
                clickable
                highlight-current
                size="large"
                :breadcrumbs-list="props.item.breadcrumbs"
                @click="changeBranchFolder"
              />
            </template>
            <template
              slot="actions"
              slot-scope="props"
            >
              <Action
                v-if="hasChildren(props.item)"
                flat
                type="button"
                icon="keyboard_arrow_right"
                @click="changeBranchFolder(props.item)"
              />
            </template>
          </Radio>

          <EmptyMessage v-if="isSearch && !mappedBranches.length">
            <h2>{{ $t('global:search.empty.title') }}</h2>
          </EmptyMessage>
        </div>
      </div>
    </div>

    <h3
      v-if="selectedBranch.length"
      class="form-section-title mt-4"
    >
      {{ $t('global:branches.selected') }}
    </h3>
    <Breadcrumbs
      v-if="!multiple"
      :dark="dark"
      :breadcrumbs-list="selectedBranch"
      highlight-current
      size="large"
    />

    <template v-else>
      <div
        v-for="(branch, index) in selectedBranch"
        :key="index"
        class="branch-selector__selected-item"
      >
        <Breadcrumbs
          :dark="dark"
          :breadcrumbs-list="branch"
          size="large"
          highlight-current
        />

        <span
          class="branch-selector__remove-item"
          @click="removeSelectedBranch(index)"
        >
          <Icon name="close" />
        </span>
      </div>
    </template>

    <div class="branch-selector__info">
      <div
        v-if="validation.$error"
        class="validation-message"
      >
        <ValidationMessage :validation="validation" />
      </div>
    </div>

    <slot />
  </div>
</template>

<style lang="scss">
@import 'BranchSelector.scss';
</style>