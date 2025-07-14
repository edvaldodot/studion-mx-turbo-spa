<script>
import Action from '@/components/general/Action'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListSearch from '@/components/general/FilterListSearch'
import FilterListOrder from '@/components/general/FilterListOrder'
import Pagination from '@/components/general/Pagination'
import DatatableManagementConference from './components/DatatableManagementConference'
import ModalConfirm from '@/components/general/ModalConfirm'

import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions } from 'vuex'

export default {
  name: 'ManagementConferences',

  components: {
    Action,
    EmptyMessage,
    FilterList,
    FilterListSearch,
    FilterListOrder,
    Pagination,
    ModalConfirm,
    DatatableManagementConference,
  },

  mixins: [paginateMixin],

  data() {
    return {
      orderOptions: [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: this.$t('community.sessions.orders:start.time.asc'),
          value: 1,
          property: 'start_time',
          type: 'asc',
        },
        {
          text: this.$t('community.sessions.orders:start.time.desc'),
          value: 2,
          property: 'start_time',
          type: 'desc',
        },
      ],
      removeItem: {},
    }
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
    this.pgtrDefaultOrder = {
      property: 'start_time',
      type: 'desc',
    }

    this.pgtrInitializePagination('Management/conference/conferenceResource')
  },

  methods: {
    ...mapActions([
      'attemptConferenceRoomDelete',
      'attemptMultiConferenceRoomDelete',
      'setFeedback',
      'setFetching',
    ]),

    create() {
      this.$router.push({ name: 'management.conference.create' })
    },

    removeMultipleHandler(conference) {
      if (this.removeItem.id) {
        this.multiConferenceRoomDelete(conference)
        return
      }

      this.removeItem = conference
    },

    removeHandler(conference) {
      this.conferenceRoomDelete(conference)
    },

    conferenceRoomDelete(conference) {
      this.setFetching(true)
      this.attemptConferenceRoomDelete(conference.id)
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.conference:feedback.remove.room') })
        })
        .catch(({ response }) => {
          if (response.data.message === 'conference_room_has_started') {
            this.setFeedback({
              message: this.$t(`classroom.conference:error.${response.data.message}`),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.pgtrRefresh()
          this.setFetching(false)
        })
    },

    multiConferenceRoomDelete(conference) {
      this.setFetching(true)
      this.attemptMultiConferenceRoomDelete(conference.vendorConferencesRoomsId)
        .then(() => {
          this.removeItem = {}
          this.setFeedback({ message: this.$t('classroom.conference:feedback.remove') })
        })
        .catch(({ response }) => {
          if (response.data.message === 'conference_room_has_started') {
            this.setFeedback({
              message: this.$t(`classroom.conference:error.${response.data.message}`),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.pgtrRefresh()
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div class="management-conference">
    <div class="p-3">
      <FilterList>
        <Action
          slot="button"
          :text="$t('classroom.conference:btn.add')"
          type="button"
          primary
          large
          fixed-width
          @click="create"
        />

        <FilterListSearch
          slot="search"
          :initial-value="pgtrParams.query['name']"
          hide-error-details
          @search="pgtrSetSearch('name', $event)"
        />

        <FilterListOrder
          slot="order"
          :initial-value="pgtrParams.order"
          :options="orderOptions"
          on-server
          @update-orders="pgtrUpdateOrder"
        />
      </FilterList>
    </div>

    <div class="center">
      <EmptyMessage v-if="pgtrLoaded && pgtrCurrentData.length === 0">
        <h3>{{ $t('global:search.empty.title') }}</h3>
      </EmptyMessage>

      <DatatableManagementConference
        v-else
        :items="pgtrCurrentData"
        @remove="removeHandler($event)"
        @removeMultiple="removeMultipleHandler($event)"
        @access="
          $router.push({
            name: 'classroom.conference',
            params: {
              session_uuid: $event.sessionUuid,
              management: true,
            },
          })
        "
        @edit="
          $router.push({
            name: 'management.conference.edit',
            params: {
              id: $event.id,
            },
          })
        "
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />

      <ModalConfirm
        :active="Boolean(removeItem.id)"
        :title="
          removeItem.multipleSessions
            ? $t('classroom.conference:multiple.remove.title')
            : $t('community.index:modal.confirm.title')
        "
        @confirm="removeMultipleHandler(removeItem)"
        @close="removeItem = {}"
      >
        <p>
          {{
            removeItem.multipleSessions
              ? $t('classroom.conference:multiple.remove.description')
              : $t('classroom.conference:confirm.delete')
          }}
        </p>
      </ModalConfirm>

      <RouterView
        @create="setFeedback({ message: $t('classroom.conference:modal.feedback.create') })"
        @edit="setFeedback({ message: $t('classroom.conference:modal.feedback.edit') })"
        @close="pgtrRefresh"
      />
    </div>
  </div>
</template>

<style lang="scss">
.modal-form.modal-conference__form {
  form {
    max-width: 100%;

    > * {
      max-width: 520px;
      margin: auto;

      &.form-full-w {
        max-width: 100%;
      }
    }
  }
}
</style>
