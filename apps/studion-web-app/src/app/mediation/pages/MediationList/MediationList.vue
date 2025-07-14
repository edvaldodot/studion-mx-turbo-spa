<script>
import Action from '@/components/general/Action'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListTag from '@/components/general/FilterListTag'
import FilterListSearch from '@/components/general/FilterListSearch'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import DropdownLinkTooltip from '@/components/shared/DropdownLinkTooltip'
import EmptyMessage from '@/components/general/EmptyMessage'
import InputField from '@/components/general/InputField'
import Pagination from '@/components/general/Pagination'
import MediationContentHeader from '../../components/MediationContentHeader'
import Checkbox from '@/components/general/Checkbox'
import mediationToggler from '../../mixins/mediationToggler'

import { mapState, mapActions } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { defaultFilterListTagOptions, defaultFilterListOrderOptions } from '../../shared'
import { required, sameAs } from 'vuelidate/lib/validators'

const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'MediationList',
  components: {
    Action,
    FilterList,
    FilterListOrder,
    FilterListTag,
    FilterListSearch,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    DropdownLinkTooltip,
    EmptyMessage,
    InputField,
    Pagination,
    MediationContentHeader,
    ModalConfirm,
    Checkbox,
  },

  mixins: [paginateMixin, mediationToggler],

  data() {
    return {
      mediationListWithDropdown: [],
      deleteModal: {
        open: false,
        confirm: null,
        mediation: {
          name: null,
        },
      },
      duplicateModal: {
        id: null,
        name: '',
        type: 'session',
        open: false,
        include: false,
      },
    }
  },

  computed: {
    ...mapState(['accessibility', 'Mediation']),
    filterListOrderOptions() {
      return defaultFilterListOrderOptions()
    },
  },

  validations() {
    return {
      deleteModal: {
        confirm: {
          required,
          sameMediation: sameAs(function () {
            return `${this.deleteModal.mediation.name}`.toUpperCase()
          }),
        },
      },
    }
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },

    'Mediation.mediationList': {
      handler(newMediationList) {
        this.mediationListWithDropdown = newMediationList.map((mediation) => ({
          ...mediation,
          dropdown: false,
        }))
      },
    },
  },

  created() {
    this.pgtrRouteParams.active = true
    this.pgtrFilterTagOptions = [...defaultFilterListTagOptions()]
    this.pgtrInitializePagination('mediationListResource')
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptRemoveMediation',
      'attemptCloneMediation',
    ]),

    /**
     * Remove mediation and refresh paginator
     * @param {Number} id
     */
    removeMediation(id) {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.setFetching(true)
      this.attemptRemoveMediation(id)
        .then(() => {
          this.setFeedback({ message: this.$t('mediation.list:modal.confirm.delete.feedback') })
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
          this.deleteModal.open = false
        })
    },

    /**
     * Returns courses or session given mediation applicability.
     * @param {Object} mediation
     * @returns {Object[]}
     */
    getDetailItems(mediation) {
      const attribute = mediation.applicability === 'session' ? 'sessions' : 'courses'
      return mediation[attribute] && mediation[attribute].length && mediation[attribute]
    },

    toLowercase(text) {
      return String(text).toLowerCase()
    },

    /**
     * Open modal and set data to delete
     * @param {Object} item
     */
    openDeleteConfirm(item) {
      this.deleteModal = {
        open: true,
        confirm: null,
        mediation: item,
      }
    },
    openDuplicateModal(item) {
      this.duplicateModal.type = item.applicability
      this.duplicateModal.id = item.id
      this.duplicateModal.name = item.name
      this.duplicateModal.open = true
    },
    async duplicateMediation() {
      const payload = { id: this.duplicateModal.id, addLinks: this.duplicateModal.include }

      try {
        this.setFetching(true)

        await this.attemptCloneMediation(payload)

        this.setFeedback({ message: this.$t('mediation.list:modal.confirm.duplicate.feedback') })
        this.duplicateModal.open = false
        this.setFetching(false)

        this.pgtrRefresh()
      } catch (_) {
        this.setFetching(false)
        this.setFeedback({ message: this.$t('mediation.list:modal.confirm.duplicate.error') })
      }
    },
  },
}
</script>

<template>
  <div class="main-content mediation">
    <MediationContentHeader />

    <div class="p-3">
      <FilterList>
        <action
          v-if="notEqualsProfile('student') && canWrite('mediation_plan')"
          :dark="accessibility"
          :url="{ name: 'mediation.create' }"
          :text="$t('mediation.list:btn.add')"
          primary
          large
          fixed-width
          slot="button"
        />
        <filter-list-search
          :initial-value="pgtrParams.query['name']"
          :dark="accessibility"
          :hideErrorDetails="true"
          @search="pgtrSetSearch('name', $event)"
          slot="search"
        />
        <filter-list-tag
          :options="pgtrFilterTagOptions"
          :tagAllFiltersActive="pgtrTagAllFilters"
          slot="tag"
          state="Mediation"
        />
        <filter-list-order
          :initial-value="pgtrParams.order"
          :onServer="true"
          :options="filterListOrderOptions"
          :label="$t('global:filter.order.label')"
          @update-orders="pgtrUpdateOrder"
          slot="order"
        />
      </FilterList>
    </div>

    <div class="p-4">
      <EmptyMessage
        v-if="Mediation.mediationList && Mediation.mediationList.length === 0 && !pgtrIsFetching"
      >
        <h2 v-if="pgtrIsSearching">{{ $t('global:search.empty.title') }}</h2>
        <h2 v-if="pgtrIsFiltering && !pgtrIsSearching">
          {{ $t('mediation.list:filter.empty.title') }}
        </h2>
        <h2 v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('mediation.list:empty.title') }}</h2>

        <p v-if="pgtrIsSearching">{{ $t('global:search.empty.message') }}</p>
        <p v-if="!pgtrIsFiltering && !pgtrIsSearching">{{ $t('mediation.list:empty.message') }}</p>
      </EmptyMessage>

      <div
        class="center mediation-list"
        v-else
      >
        <Datatable
          :items="mediationListWithDropdown"
          :dark="accessibility"
        >
          <template
            slot="thead"
            v-if="!$media.mobile"
          >
            <tr>
              <th class="th">{{ $t('mediation.list:datatable.header.1') }}</th>
              <th
                class="th"
                width="140"
              >
                {{ $t('mediation.list:datatable.header.2') }}
              </th>
              <th
                class="th"
                width="120"
              >
                {{ $t('mediation.list:datatable.header.5') }}
              </th>
              <th
                class="th"
                width="120"
              >
                {{ $t('mediation.list:datatable.header.6') }}
              </th>
              <th
                class="th"
                width="40"
              ></th>
            </tr>
          </template>
          <template
            slot="tbody"
            slot-scope="props"
          >
            <tr
              class="tr-parent-dropdown"
              :class="{ 'is-open': props.item.dropdown }"
            >
              <td class="td">
                <span
                  class="td-text-header"
                  v-if="$media.mobile"
                  >{{ $t('mediation.list:datatable.header.1') }}</span
                >
                <span class="td-text">{{ props.item.name }}</span>
              </td>
              <td class="td">
                <span
                  class="td-text-header"
                  v-if="$media.mobile"
                  >{{ $t('mediation.list:datatable.header.2') }}</span
                >
                <span class="td-text">{{
                  $t('mediation:applicability.' + props.item.applicability)
                }}</span>
              </td>
              <td class="td">
                <span
                  class="td-text-header"
                  v-if="$media.mobile"
                  >{{ $t('mediation.list:datatable.header.5') }}</span
                >
                <span class="td-text">{{
                  props.item.active ? $t('global:active') : $t('global:inactive')
                }}</span>
              </td>
              <td class="td">
                <span
                  class="td-text-header"
                  v-if="$media.mobile"
                  >{{ $t('mediation.list:datatable.header.6') }}</span
                >
                <span class="td-text">{{
                  props.item.published ? $t('global:active') : $t('global:inactive')
                }}</span>
              </td>
              <td
                class="td td-actions flex"
                width="100"
              >
                <Action
                  type="button"
                  icon="keyboard_arrow_down"
                  class="btn-dropdown text-right"
                  @click="props.item.dropdown = !props.item.dropdown"
                />

                <Dropdown
                  icon="dots-vertical"
                  right
                >
                  <DropdownLink
                    :text="canWrite('mediation_plan') ? $t('global:edit') : $t('global:view.more')"
                    @click="$router.push({ name: 'mediation.edit', params: { id: props.item.id } })"
                  />

                  <template v-if="canWrite('mediation_plan')">
                    <DropdownLink
                      :text="props.item.active ? $t('global:deactivate') : $t('global:activate')"
                      @click="
                        props.item.active
                          ? controlModalConfirm(props.item, 'active')
                          : toggler(props.item, 'active')
                      "
                    />
                    <DropdownLinkTooltip
                      :dropdown-props="{
                        text: $t('global:remove'),
                        disabled: props.item.active || props.item.published,
                      }"
                      :tooltip="{
                        condition: props.item.active || props.item.published,
                        text: $t('mediation.list:dropdown.remove.blocker'),
                        props: {
                          uppercase: false,
                        },
                      }"
                      @click="openDeleteConfirm(props.item)"
                    />
                    <DropdownLink
                      :text="props.item.published ? $t('global:unpublish') : $t('global:publish')"
                      @click="
                        props.item.published
                          ? controlModalConfirm(props.item, 'publish')
                          : toggler(props.item, 'publish')
                      "
                    />

                    <DropdownLink
                      :text="$t('global:duplicate')"
                      @click="openDuplicateModal(props.item)"
                    />
                    <DropdownLink
                      v-if="$mediationAiEnabled()"
                      :text="$t('mediation.actions:ia.settings.dropdown')"
                      @click="
                        $router.push({
                          name: 'mediation.actions',
                          params: { id: props.item.id, openSettings: true },
                        })
                      "
                    />
                  </template>
                </Dropdown>
              </td>
            </tr>

            <DatatableCollapseRow
              v-if="props.item.dropdown"
              :colspan="5"
              :open="props.item.dropdown"
            >
              <datatable
                v-if="getDetailItems(props.item)"
                :items="getDetailItems(props.item)"
                :dark="accessibility"
                class="details"
              >
                <template slot="thead">
                  <tr>
                    <th class="th">
                      {{
                        $t('mediation.list:details:datatable.header', {
                          applicability: $t(
                            `mediation.links:datatable.type.${props.item.applicability}`
                          ),
                        })
                      }}
                    </th>
                    <th
                      v-if="props.item.applicability === 'session'"
                      class="th"
                    ></th>
                  </tr>
                </template>
                <template
                  slot="tbody"
                  slot-scope="innerProps"
                >
                  <tr>
                    <td class="td">
                      <span class="td-text">{{ innerProps.item.name }}</span>
                    </td>
                    <td
                      v-if="props.item.applicability === 'session'"
                      class="td td-actions"
                    >
                      <Action
                        :text="$t('mediation.mediation:actions.report')"
                        :url="{
                          name: 'mediation.list.report',
                          params: {
                            id: props.item.id,
                            session_id: innerProps.item.id,
                          },
                        }"
                        class="pr-3"
                        flat
                      />
                    </td>
                  </tr>
                </template>
              </datatable>
              <EmptyMessage v-else>
                <h2>
                  {{
                    $t('mediation.list:details:datatable.empty.title', {
                      applicability: toLowercase(
                        $t(`mediation:applicability.${props.item.applicability}`)
                      ),
                    })
                  }}
                </h2>
                <p class="text-color">
                  {{
                    $t('mediation.list:details:datatable.empty.subtitle', {
                      applicability: toLowercase(
                        $t(`mediation.links:datatable.type.${props.item.applicability}`)
                      ),
                    })
                  }}
                </p>
              </EmptyMessage>
            </DatatableCollapseRow>
          </template>
        </Datatable>

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
      </div>
    </div>

    <ModalConfirm
      :active="openConfirmModal"
      :title="
        selectedAction === 'active'
          ? $t('mediation.list:modal.confirm.title.deactivate')
          : $t('mediation.list:modal.confirm.title.unpublish')
      "
      @close="openConfirmModal = false"
      @confirm="toggler(selectedItem, selectedAction)"
    >
      <p class="text-color">
        {{
          selectedAction === 'active'
            ? $t('mediation.list:modal.confirm.description.deactivate')
            : $t('mediation.list:modal.confirm.description.unpublish')
        }}
      </p>
    </ModalConfirm>

    <ModalConfirm
      :active="deleteModal.open"
      :title="$t('mediation.list:modal.confirm.delete.title')"
      :confirm-btn-text="$t('global:remove')"
      :disable-confirm="
        deleteModal.mediation.name &&
        deleteModal.mediation.name.toUpperCase() !== deleteModal.confirm
      "
      @confirm="removeMediation(deleteModal.mediation.id)"
      @close="deleteModal.open = false"
    >
      <slot name="description">
        <p
          v-html="
            $t('mediation.list:modal.confirm.delete.description', {
              name: deleteModal.mediation.name,
            })
          "
        ></p>

        <p v-if="deleteModal.mediation.applicability === 'solution'">
          {{ $t('mediation.list:modal.confirm.delete.description.solution') }}
        </p>

        <InputField
          v-model="deleteModal.confirm"
          :label="$t('mediation.list:modal.confirm.delete.label')"
          :validation="$v.deleteModal.confirm"
          disable-paste
        />
      </slot>
    </ModalConfirm>

    <ModalConfirm
      :active="duplicateModal.open"
      :title="$t('mediation.list:modal.confirm.duplicate.title')"
      @confirm="duplicateMediation"
      @close="duplicateModal.open = false"
    >
      <slot name="description">
        <p
          v-html="
            $t('mediation.list:modal.confirm.duplicate.description', {
              name: duplicateModal.name,
            })
          "
        ></p>

        <Checkbox
          :key="duplicateModal.type"
          v-model="duplicateModal.include"
          class="duplicate_modal__checkbox"
          :items="[
            {
              label: $t(`mediation.list:modal.confirm.duplicate.include.${duplicateModal.type}`),
              value: true,
            },
          ]"
        />
      </slot>
    </ModalConfirm>
    <RouterView />
  </div>
</template>

<style lang="scss">
@import './MediationList.scss';
</style>
