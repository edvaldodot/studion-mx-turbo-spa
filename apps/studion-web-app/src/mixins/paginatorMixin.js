import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import Vue from 'vue'
import _ from 'lodash/'
import {
  createRouteParams,
  stringifyNestedParamKeys,
  checkIsSameRouteParams,
} from './paginatorUtils'

export const DEFAULT_PAGE_SIZE = 12

export const paginateMixin = {
  data() {
    return {
      activeTab: 0,
      pgtrTagAllFilters: null,
      pgtrFilterTagOptions: [],
      pgtrOptions: '',
      pgtrAction: '',
      pgtrIsInitialized: false,
      pgtrIsFetching: false,
      queryHistory: [],
      pgtrLastPage: null,
      pgtrCurrentData: [],
      pgtrDefaultOrder: {
        property: 'created_at',
        type: 'desc',
      },
      pgtrLoaded: false,
      pgtrRouteParams: {
        active: false,
        ignore: ['embed'],
      },
      pgtrParams: {
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
        order: null,
        query: {},
        filter: null,
      },
    }
  },
  watch: {
    'pgtrParams.page': function () {
      this.query()
    },
    'pgtrParams.limit': function () {
      this.query()
    },
    'pgtrParams.order': function () {
      if (this.pgtrIsInitialized && this.pgtrParams.page !== 1) this.pgtrParams.page = 1
      else this.query()
    },
    'pgtrParams.query': function () {
      if (this.pgtrIsInitialized && this.pgtrParams.page !== 1) this.pgtrParams.page = 1
      else this.query()
    },
    'pgtrParams.filter': {
      deep: true,
      handler: function () {
        if (this.pgtrIsInitialized && this.pgtrParams.page !== 1) this.pgtrParams.page = 1
        else this.query()
      },
    },
    filterActiveItems: {
      deep: true,
      handler: function () {
        if (this.pgtrParams.filter) {
          this.pgtrParams.filter = {
            ...this.pgtrParams.filter,
            categories: this.pgtrParams.filter.categories,
            ...this.filterActiveItems,
          }
          return
        }

        this.pgtrParams.filter = { ...this.filterActiveItems }
      },
    },
  },
  computed: {
    filterActiveItems() {
      return this.pgtrFilterTagOptions.reduce((carr, option) => {
        let itemsActive = option.items.filter((item) => item.active)

        carr[option.name] = (itemsActive || []).reduce((carrItem, itemActive) => {
          carrItem.push(itemActive.id)
          return carrItem
        }, [])

        return carr
      }, {})
    },
    pgtrIsFiltering() {
      return Object.keys(this.filterActiveItems).length > 0 || this.activeTab > 0
    },
    pgtrIsSearching() {
      return Object.keys(this.pgtrParams.query).length > 0
    },
  },
  methods: {
    pgtrInitializePagination(action, options, customParams) {
      this.pgtrIsInitialized = false

      const itemsPerPagePreferences = this.getFromLocalStorage('itemsPerPagePreferences') || {}
      if (itemsPerPagePreferences[this.$route.name]) {
        this.pgtrParams.limit = itemsPerPagePreferences[this.$route.name]
      }

      this.pgtrParams.order = this.pgtrDefaultOrder
        ? { [this.pgtrDefaultOrder.property]: this.pgtrDefaultOrder.type }
        : null

      let params = {
        ...this.pgtrParams,
        ...customParams,
      }

      if (this.pgtrRouteParams.active) {
        params = {
          ...params,
          ...this.pgtrGetRouteParamsParsed(),
        }
      }

      this.pgtrParams = params

      if (this.pgtrRouteParams.active) {
        this.pgtrSetFiltersActive()
      }

      this.queryHistory = []
      this.pgtrAction = action
      this.options = options
      this.$nextTick(() => {
        this.pgtrIsInitialized = true
        this.query()
      })
    },
    async query() {
      if (!this.pgtrIsInitialized) return
      let queryParams = createQuery(this.pgtrParams)
      let history = this.queryHistory.find((hist) => hist.queryParams === queryParams)
      if (!history) {
        let args = {
          params: this.pgtrParams,
          options: this.options,
          fromCache: false,
        }
        this.pgtrIsFetching = true
        let response = await this.$store.dispatch(this.pgtrAction, args)
        this.pgtrIsFetching = false

        this.pgtrCurrentData = response.data
        this.queryHistory.push({ response, queryParams })
        this.pgtrLastPage = response.lastPage
      } else {
        let args = {
          pgtrParams: this.pgtrParams,
          options: this.options,
          fromCache: history.response.data,
        }
        await this.$store.dispatch(this.pgtrAction, args)
        this.pgtrCurrentData = history.response.data
        this.pgtrLastPage = history.response.lastPage
      }
      if (this.pgtrParams.page > this.pgtrLastPage) {
        this.pgtrClearQueryHistory()
        this.pgtrParams.page = 1
      }

      if (this.pgtrRouteParams.active) {
        this.pgtrReplaceRouteWithParams()
      }

      this.pgtrLoaded = true
    },
    pgtrSetSearch(key, value) {
      this.pgtrParams.query = { ...this.pgtrParams.query, [key]: value }
      if (this.pgtrParams.query[key] === null) {
        delete this.pgtrParams.query[key]
      }
    },
    pgtrUpdateOrder(value) {
      if (value) this.pgtrParams.order = { [value.property]: value.type }
      else
        this.pgtrParams.order = this.pgtrDefaultOrder
          ? { [this.pgtrDefaultOrder.property]: this.pgtrDefaultOrder.type }
          : null
    },
    /**
     * Set a custom filter param, can be used before initialization to set default filters
     * and can be used after initialization to change custom filters
     * @param {string} field field that will be changed or set
     * @param {*} value
     */
    pgtrSetCustomFilter(field, value) {
      if (!this.pgtrParams.filter) {
        this.pgtrParams.filter = {}
      }
      Vue.set(this.pgtrParams.filter, field, value)
    },
    pgtrSetFilterCategories(value) {
      if (value !== null && value.length) {
        if (this.pgtrParams.filter)
          this.pgtrParams.filter = { ...this.pgtrParams.filter, categories: [...value] }
        else this.pgtrParams.filter = { categories: [...value] }
      } else {
        if (this.pgtrParams.filter)
          this.pgtrParams.filter = { ...this.pgtrParams.filter, categories: null }
      }
    },
    pgtrClearQueryHistory() {
      this.queryHistory = []
    },
    pgtrRefresh() {
      this.queryHistory = []
      this.query()
    },

    /**
     * Set all activated params on SPA queryString Params.
     */
    pgtrReplaceRouteWithParams() {
      const queryParamsStringified = stringifyNestedParamKeys(
        this.pgtrParams,
        this.pgtrRouteParams.ignore
      )

      if (checkIsSameRouteParams(queryParamsStringified, this.$route.query)) return

      this.$router.push({ query: queryParamsStringified })
    },

    /**
     * Get all params on SPA queryString Params
     * and parse string keys from stringifyNestedParamKeys function.
     */
    pgtrGetRouteParamsParsed() {
      const params = createRouteParams(this.$route.query, this.pgtrRouteParams.ignore)
      return _.cloneDeep(params)
    },

    /**
     * Set filter as active based on pgtrParams filter.
     */
    pgtrSetFiltersActive() {
      this.pgtrFilterTagOptions = this.pgtrFilterTagOptions.map((filter) => {
        const paramsFilter = this.pgtrParams && this.pgtrParams.filter
        const specificRouteFilter = paramsFilter && paramsFilter[filter.name]
        if (!specificRouteFilter) return filter

        filter.items = filter.items.map((item) => {
          const filterSelected = specificRouteFilter.find((value) => value === item.id)

          if (filterSelected) {
            item.active = true
          }

          return item
        })

        return filter
      })
    },
    /**
     * Cleans Search for all filters.
     */
    callClearSearchOnFilterList(refName) {
      const comp = this.$refs[refName]
      if (comp && typeof comp.clearSearch === 'function') {
        comp.clearSearch()
      } else {
        console.warn(`Cannot clear search: Ref '${refName}' not found or missing clearSearch()`)
      }
    },
  },
}
