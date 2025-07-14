<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Loading from '@/components/general/Loading'
import ContentHeader from '@/components/general/ContentHeader'
import MediationBatchStatusModal from './components/MediationBatchStatusModal'
import EmptyMessage from '@/components/general/EmptyMessage'

export default defineComponent({
  name: 'MediationBatchList',

  components: {
    Action,
    ContentHeader,
    Datatable,
    Icon,
    Loading,
    FilterList,
    EmptyMessage,
    MediationBatchStatusModal,
  },

  mixins: [paginateMixin],

  data() {
    return {
      selectedItem: {
        status: null,
        processId: null,
      },
      debounce: null,
    }
  },

  computed: {
    ...mapState({ mediationName: (state) => state.Mediation.current.mediationPlan.name }),

    hasProcessingItems() {
      return this.pgtrCurrentData.find((batch) => ['processing', 'pending'].includes(batch.status))
    },
  },

  created() {
    const pgtrConfig = { mediationId: this.$route.params.id }
    this.pgtrInitializePagination('mediationBatchesResource', pgtrConfig, { limit: 60 })
    this.debounceStatus()
  },

  beforeDestroy() {
    if (this.debounce) clearInterval(this.debounce)
  },

  methods: {
    ...mapActions(['attemptGetMediationBatchesSheet', 'setFetching', 'setFeedback']),

    debounceStatus() {
      this.debounce = setInterval(() => {
        if (this.hasProcessingItems) this.pgtrRefresh()
      }, 10000)
    },

    downloadBatchMediationTemplate(processId) {
      this.setFetching(true)
      this.attemptGetMediationBatchesSheet(processId)
        .then(() => {
          this.setFeedback({ message: this.$t('global:download.success') })
        })
        .catch(() => {
          this.setFeedback({ message: this.$t('global:download.error') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    getStatus(status) {
      if (status === 'completed') return 'finished'
      if (status === 'pending') return 'processing'
      if (status === 'error' || status === 'canceled') return 'err'
      return status
    },
  },
})
</script>

<template>
  <div class="mediation-batch-list">
    <ContentHeader
      :title="mediationName"
      light-theme
      fixed
    >
      <Action
        slot="back"
        class="btn-back text-color"
        icon="keyboard_backspace"
        type="button"
        :text="$t('global:back')"
        @click="$router.push({ name: 'mediation.actions' })"
      />
    </ContentHeader>

    <div class="mediation-batch-list__header">
      <h2>{{ $t('mediation.batch:list.title') }}</h2>
      <p class="mt-1">{{ $t('mediation.batch:list.description') }}</p>
    </div>

    <div class="p-3">
      <FilterList>
        <Action
          v-if="canWrite('mediation_plan')"
          slot="button"
          :text="$t('global:batch.register')"
          type="button"
          primary
          large
          @click="$router.push({ name: 'mediation.batch.list.add' })"
        />
      </FilterList>
    </div>

    <div class="center">
      <EmptyMessage v-if="!pgtrCurrentData.length && pgtrLoaded">
        <h2>{{ $t('mediation.batch:list.empty') }}</h2>
      </EmptyMessage>

      <Datatable
        v-else
        :items="pgtrCurrentData"
      >
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th
              class="th"
              width="30%"
            >
              {{ $t('global:file') }}
            </th>
            <th class="th">{{ $t('global:user') }}</th>
            <th class="th">{{ $t('global:send.datetime') }}</th>
            <th class="th">{{ $t('global:status') }}</th>
            <th class="th"></th>
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
            <td class="td">
              <span class="td-text bolder">{{ props.item.filename }}</span>
            </td>
          </tr>

          <tr>
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <span class="td-text bolder">{{ props.item.filename }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header bolder"
              >
                {{ $t('global:user') }}
              </span>
              <span class="td-text">{{ props.item.author }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header td-text-header-inline bolder"
              >
                {{ $t('global:metadata.type.datetime') }}
              </span>
              <span class="td-text">
                {{ formatDate(props.item.createdAt, 'long').replace(',', '') }}
              </span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header td-text-header-inline bolder"
              >
                {{ $t('global:status') }}
              </span>
              <span
                class="td-tag td-tag-fixed is-ok"
                :class="{ '--processing': props.item.status === 'processing' }"
                @click="selectedItem = props.item"
              >
                <span v-if="!$media.mobile">
                  {{ $t(`global:${getStatus(props.item.status)}`) }}
                </span>
                <Loading v-if="getStatus(props.item.status) === 'processing'" />
                <Icon
                  v-else-if="getStatus(props.item.status) === 'finished'"
                  name="check-all"
                  wrapper
                  size="medium"
                />
                <Icon
                  v-else-if="getStatus(props.item.status) === 'err'"
                  class="err"
                  name="close"
                  wrapper
                  size="medium"
                />
              </span>
            </td>
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <Action
                v-if="getStatus(props.item.status) !== 'processing'"
                :text="$t('global:download.sheet')"
                type="button"
                flat
                @click="downloadBatchMediationTemplate(props.item.processId)"
              />
            </td>
          </tr>

          <tr v-if="$media.mobile && getStatus(props.item.status) !== 'processing'">
            <td
              class="td text-center"
              colspan="3"
            >
              <Action
                v-if="getStatus(props.item.status) !== 'processing'"
                :text="$t('global:download.sheet')"
                type="button"
                flat
                @click="downloadBatchMediationTemplate(props.item.processId)"
              />
            </td>
          </tr>
        </template>
      </Datatable>
    </div>

    <MediationBatchStatusModal
      v-if="selectedItem.status"
      :status="getStatus(selectedItem.status)"
      @close="selectedItem = {}"
      @download="downloadBatchMediationTemplate(selectedItem.processId)"
    />

    <RouterView
      @status="selectedItem.status = $event"
      @refresh="pgtrRefresh"
    />
  </div>
</template>

<style lang="scss">
.mediation-batch-list {
  padding-bottom: 120px;
  &__header {
    margin-top: 120px;
    text-align: center;
    h2 {
      font-size: 4em;
      text-transform: uppercase;
      font-family: var(--font-family);
    }

    @media screen and (max-width: 1024px) {
      margin-top: 2em;
    }
  }
  .datatable {
    .td-tag {
      min-height: 30px;
      cursor: pointer;
      &.--processing {
        cursor: initial;
        pointer-events: none;
      }
    }

    @media screen and (max-width: 1023px) {
      .td-tag {
        min-width: unset;
        width: 50px;
      }
    }

    .err svg.icon {
      color: var(--alert-700);
    }
  }
}
</style>
