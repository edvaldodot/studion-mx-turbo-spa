<script>
import { defineComponent } from 'vue'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Datatable from '@/components/general/Datatable'
import Pagination from '@/components/general/Pagination'
import ModalInformation from '@/components/general/ModalInformation'

export default defineComponent({
  name: 'ModalViewHistory',

  components: {
    Action,
    Datatable,
    Icon,
    Pagination,
    ModalInformation,
  },

  mixins: [paginateMixin],

  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      dataActions: null,
      statusExamination: false,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    groups() {
      const preProjectGroupId = Number(this.$route.params.history)

      const groups = this.Classroom.preProjectGroups

      const index = groups.findIndex((item) => item.preProjectGroupId === preProjectGroupId)

      return groups[index]
    },

    participants() {
      if (Object.keys(this.item).length === 0) {
        return this.groups.participants
      }
      return this.item.participants
    },
  },

  watch: {
    pgtrIsFetching: {
      handler(loading) {
        this.setFetching(loading)
      },
    },
    pgtrCurrentData: {
      handler(newValue) {
        this.dataActions = newValue
        newValue.forEach((item) => {
          if (item.action === 'sent_examination') {
            this.statusExamination = true
          }
        })
      },
    },
  },

  created() {
    const payload = {
      group_id: this.$route.params.history,
    }

    this.pgtrRouteParams.active = false

    this.pgtrInitializePagination('attemptGetHistoryActionPreProject', payload)
  },

  methods: {
    ...mapActions(['setFetching']),

    close() {
      if (!this.$route.meta.modalCloseLink) {
        this.$router.push({ name: 'classroom.pre.project.details.history' })
        return
      }

      this.$router.push(this.$route.meta.modalCloseLink)
    },

    view() {
      this.$router.push({
        name: 'classroom.pre.project.details.history.view',
      })
    },

    download() {
      this.$router.push({
        name: 'classroom.pre.project.details.history.download',
      })
    },
    getDate(date) {
      const fDate = this.formatDate(date, 'long')
      if (this.$i18n.locale !== 'pt-br') return fDate
      return fDate.replace(',', ' às')
    },
  },
})
</script>

<template>
  <ModalInformation
    :data-testid="$testId('modal-group-orientation')"
    class="modal-view-history"
    closable
    is-page
    back
    @close="close"
  >
    <template #description>
      <template v-if="$route.name === 'classroom.pre.project.details.history'">
        <div class="modal-view-history__header mb-5">
          <div>
            <p class="mb-2">
              <b>
                {{ $t('classroom.pre.project:history.status.evaluation') }}
                <span
                  class="--sent"
                  :class="{ '--perding': !statusExamination }"
                >
                  {{
                    statusExamination
                      ? $t('classroom.pre.project:history.evaluation.sent')
                      : $t('classroom.pre.project:history.evaluation.pendent')
                  }}
                </span>
              </b>
            </p>
            <div>
              <Action
                :text="$t('classroom.pre.project:history.view')"
                icon="visibility"
                type="button"
                :disabled="!statusExamination"
                flat
                @click="view"
              />
              <Action
                :text="$t('classroom.pre.project:history.download')"
                icon="download"
                type="button"
                :disabled="!statusExamination"
                flat
                @click="download"
              />
            </div>
          </div>

          <div>
            <p class="mb-1">
              {{ $t('classroom.pre.project:history.opened.group') }}
              <strong>{{ formatDate(groups.createdAt) }}</strong>
            </p>
            <p v-if="item.deleted">
              {{ $t('classroom.pre.project:history.closed.group') }}
              <strong>{{ formatDate(groups.lastUpdatedAt) }}</strong>
            </p>
          </div>
        </div>

        <div class="modal-view-history__participants">
          <Datatable :items="participants">
            <template slot="thead">
              <tr>
                <th class="th">{{ $t('classroom.pre.project:history.participants') }}</th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr class="tr-colspan">
                <td class="td flex pt-4 gap-2 align-items-center">
                  <div class="datatable-image">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      class="w-2rem border-circle"
                    />

                    <Icon
                      v-else
                      name="account_circle"
                    />
                  </div>

                  <span class="td-text compact-lines clamp-line mx-3">
                    <p v-if="props.item.is_owner">
                      {{ $t('classroom.pre.project:history.creator') }}
                    </p>
                    {{ props.item.username }}
                  </span>
                </td>
              </tr>
            </template>
          </Datatable>
        </div>

        <div class="modal-view-history__data">
          <Datatable :items="dataActions">
            <template slot="thead">
              <tr>
                <th class="th">{{ $t('classroom.pre.project:history.action.history') }}</th>
                <th class="th">{{ $t('classroom.pre.project:history.responsible') }}</th>
                <th class="th">{{ $t('classroom.pre.project:history.date') }}</th>
              </tr>
            </template>
            <template
              slot="tbody"
              slot-scope="props"
            >
              <tr class="tr-body">
                <td class="td">
                  <span class="td-text">{{
                    $t(`classroom.pre.project:history.${props.item.action}`, {
                      name: props.item.user.name,
                    })
                  }}</span>
                </td>
                <td class="td">
                  <span class="td-text">{{ props.item.author.name }}</span>
                </td>
                <td class="td">
                  <span class="td-text">{{ getDate(props.item.createdAt) }}</span>
                </td>
              </tr>
            </template>
          </Datatable>

          <Pagination
            :active-page="pgtrParams.page"
            :page-count="pgtrLastPage"
            @next-page="pgtrParams.page++"
            @previous-page="pgtrParams.page--"
            @first-page="pgtrParams.page = 1"
            @last-page="pgtrParams.page = pgtrLastPage"
          />
        </div>
      </template>

      <RouterView class="pre-project-evaluation-history" />
    </template>
  </ModalInformation>
</template>

<style lang="scss">
.modal-information.modal-view-history .modal-confirm {
  padding: 28px;
}

.modal-view-history {
  &__header {
    font-family: var(--font-family);
    display: flex;
    justify-content: space-between;

    .--sent {
      color: var(--success-900);
    }
    .--perding {
      color: var(--alert-900);
    }
  }

  &__participants {
    td {
      display: flex;
      align-items: center;

      span {
        margin: initial;
        p {
          font-size: 0.8em;
        }
      }
    }
  }

  &__data {
    margin-top: 48px;
  }

  .datatable-wrapper {
    padding: 0;
  }

  th.th {
    text-transform: capitalize;
  }
}

.pre-project-evaluation-history {
  .examination__container {
    margin: 2em auto 2em auto;
  }

  .assessments-bar,
  .examination__lateral,
  .general-feedback__form,
  .dropdown-link {
    display: none;
  }
}
</style>
