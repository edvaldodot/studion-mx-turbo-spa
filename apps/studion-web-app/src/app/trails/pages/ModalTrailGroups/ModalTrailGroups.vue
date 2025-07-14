<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'

import TrailGroupFrom from '@/app/trails/components/TrailGroupFrom'
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'
import Pagination from '@/components/general/Pagination'
import Tabs from '@/components/general/Tabs'
import Tooltip from '@/components/general/Tooltip'
import TextReduce from '@/components/general/TextReduce'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  components: {
    TrailGroupFrom,
    Action,
    Datatable,
    EmptyMessage,
    Icon,
    Modal,
    ModalConfirm,
    Pagination,
    Tabs,
    Tooltip,
    TextReduce,
  },

  mixins: [paginateMixin],

  props: {
    trailId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      confirmGroupRemoveModal: false,
      tablinks: [
        {
          text: 'trails.users:modal.tabs.students',
          location: { name: 'trails.users', params: { id: this.trailId } },
        },
        {
          text: 'trails.users:modal.tabs.groups',
          location: { name: 'trails.groups', params: { id: this.trailId } },
        },
      ],
    }
  },

  computed: {
    ...mapState({
      trail: (state) => state.Trails.current,
    }),
    canEnroll() {
      return this.trail.endTime && this.isDateBeforeToday(this.trail.endTime)
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.setup()
  },

  methods: {
    ...mapActions(['setFetching', 'setCurrent', 'removeTrailGroup']),
    setup() {
      const trailId = this.trailId || null
      if (!trailId) {
        this.$router.push({ name: 'trails.list' })
        return
      }
      this.pgtrInitializePagination('groupTrailListResource', { trailId }, { embed: 'users_count' })
      this.setCurrent(trailId)
    },
    openRemoveModal(groupId) {
      this.currentGroup = groupId
      this.confirmGroupRemoveModal = true
    },
    confirmRemove() {
      const payload = {
        trailId: this.trailId,
        groupId: this.currentGroup,
      }
      this.removeTrailGroup(payload)
        .then(() => {
          this.confirmGroupRemoveModal = false
        })
        .catch(({ response }) => {
          if (response.data.message === 'path_ended') {
            this.setFeedback({
              message: this.$t('classroom.list.trails:cant.reenroll.by.date'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.pgtrRefresh()
        })
    },
  },
}
</script>

<template>
  <div>
    <Modal
      v-show="!confirmGroupRemoveModal"
      class="trails-users-modal"
      :active="true"
      is-page
    >
      <span class="modal-subtitle">{{ $t('trails.users:modal.title') }}</span>
      <h2 class="modal-title text-color">{{ trail.name }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('trails.users:modal.description') }}</p>
      </div>
      <div class="center clearfix">
        <Tabs
          :links="tablinks"
          :index-active="0"
          class="text-center"
          dark
        />

        <div class="modal-form">
          <TrailGroupFrom
            :trail-id="trailId"
            :refresh-table="pgtrRefresh"
            :disabled="canEnroll"
            @mouseenter.native="on.mouseenter"
            @mouseleave.native="on.mouseleave"
          />
        </div>

        <Datatable
          v-if="trail && trail.groups.length > 0"
          dark
          class="datatable-dropdown-bg"
          :items="trail.groups"
        >
          <template
            v-if="!$media.mobile"
            slot="thead"
          >
            <tr>
              <th class="th">{{ $t('trails.groups:datatable.header.group') }}</th>
              <th class="th text-center d-flex align-center justify-center">
                {{ $t('trails.groups:datatable.header.users_count') }}
                <Tooltip
                  :uppercase="false"
                  :width="280"
                >
                  <template #activator="{ on }">
                    <span
                      class="d-inline-flex ml-1"
                      v-on="on"
                    >
                      <icon
                        dark
                        name="alert-circle"
                      />
                    </span>
                  </template>
                  <span>{{ $t('trails.groups:datatable.users.info') }}</span>
                </Tooltip>
              </th>
              <th class="th"></th>
            </tr>
          </template>

          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr class="tr-colspan">
              <td
                v-if="!$media.mobile"
                class="td"
              >
                <span
                  v-if="$media.mobile"
                  class="td-text-header text-color"
                >
                  {{ $t('trails.groups:datatable.header.group') }}
                </span>
                <span class="td-text text-color">{{ props.item.name }}</span>
              </td>
              <td class="td">
                <span
                  v-if="$media.mobile"
                  class="td-text-header text-color"
                >
                  {{ $t('trails.groups:datatable.header.users_count') }}
                </span>
                <span class="td-text text-color">{{ props.item._embedded.users_count }}</span>
              </td>
              <td class="td text-right">
                <Tooltip>
                  <template #activator="{ on }">
                    <action
                      type="button"
                      icon="delete"
                      @click="openRemoveModal(props.item.id)"
                      @mouseenter.native="on.mouseenter"
                      @mouseleave.native="on.mouseleave"
                    />
                  </template>
                  <span class="text-color">{{
                    $t('trails.groups:datatable.btn.remove.tooltip')
                  }}</span>
                </Tooltip>
              </td>
            </tr>
          </template>
        </Datatable>

        <EmptyMessage
          v-else
          class="mt-12"
        >
          <h2>{{ $t('trails.groups:empty.title') }}</h2>
          <p class="text-color">{{ $t('trails.groups:empty.message') }}</p>
        </EmptyMessage>

        <Pagination
          v-if="trail.groups.length > 0"
          dark
          :active-page="pgtrParams.page"
          :page-count="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </div>
    </Modal>

    <ModalConfirm
      :active="confirmGroupRemoveModal"
      :title="$t('trails.groups:confirm.title')"
      @close="confirmGroupRemoveModal = false"
      @confirm="confirmRemove()"
    >
      <p class="text-color">{{ $t('trails.groups:confirm.message') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/trails/styles.scss';
</style>
