<script>
import { mapActions, mapState } from 'vuex'
import { communityMixin } from '@/mixins/community'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Icon from '@/components/general/Icon'
import Pagination from '@/components/general/Pagination'
const Modal = () => import('@/components/general/Modal')

export default {
  name: 'CommunityMetadata',
  mixins: [communityMixin],
  components: {
    Action,
    ActionBar,
    ContentHeader,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    Icon,
    Modal,
    Pagination
  },
  data () {
    return {
      index: null,
      currentMetadata: null,
      typeOptions: [
        {
          text: this.$t('global:metadata.type.date'),
          value: 'date'
        },
        {
          text: this.$t('global:metadata.type.integer'),
          value: 'int'
        },
        {
          text: this.$t('global:metadata.type.text.mask'),
          value: 'string'
        },
        {
          text: this.$t('global:metadata.type.text'),
          value: 'text'
        },
        {
          text: this.$t('global:metadata.type.select'),
          value: 'select'
        },
        {
          text: this.$t('global:metadata.type.multiple.select'),
          value: 'multiple_select'
        },
        {
          text: this.$t('global:metadata.type.opt_in'),
          value: 'opt_in'
        }
      ],
      typeOptionsValue: null,
      filterTagOptions: [],
      paging: {actualPage: 1},
      queryParams: {
        page: 1,
      },
      modalRemoveMetadata: false
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'community.metadata') {
      this.queryParams.page = 1
      this.loadMetas()
    }
    next()
  },
  computed: {
    ...mapState(['Account', 'accessibility', 'metadata']),
    isEditing () {
      return this.$route.meta.editing === true
    }
  },
  watch: {
    'queryParams.page'() {
      this.loadMetas()
    }
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptMetasListRetrieval',
      'attemptMetasTypesListRetrieval',
      'attemptProfileListRetrieval',
      'attemptMetasRemoval',
      'setMetadataData'
    ]),
    changeItemsPerPage(val) {
      this.queryParams.limit = val
      if (this.queryParams.page !== 1) {
        this.queryParams.page = 1
        return
      }
      this.loadMetas()
    },
    openModalAddMetadata () {
      this.$router.push({ name: 'community.metadata.create' })
    },
    edit (item, index) {
      this.setMetadataData({path: 'current', value: item})
      this.$router.push({ name: 'community.metadata.edit', params: { id: item.id } })
    },
    remove (id, entity, index) {
      this.setFetching(true)
      this.attemptMetasRemoval({ entity, id }).then(() => {
        this.queryParams.page = 1
        this.modalRemoveMetadata = false
        this.setFeedback({ message: this.$t('community.metadata:feedback.remove.success') })
        this.loadMetas()
      }).catch(() => {
        this.setFeedback({message: this.$t('community.metadata:feedback.remove.error'), type: 'error'})
      }).finally(() => {
        this.setFetching(false)
      })
    },
    openModalRemoveMetadata (id, entity, index) {
      this.currentMetadata = { id: id, entity: entity, index: index }
      this.modalRemoveMetadata = true
    },
    openTableDropdown (item) {
      item.dropdown = !item.dropdown
    },
    loadMetas () {
      this.setFetching(true)
      return this.attemptMetasListRetrieval({entity: 'application_user', searchParams: this.queryParams}).then(({data}) => {
        this.paging = data
        const items = data.data.map(item => {
          return {
            id: item.id,
            name: item.meta.name,
            type: item.meta.type.alias === 'datetime' ? this.$t(`global:metadata.type.datetime`) : this.typeOptions.find(type => type.value === item.meta.type.alias).text,
            type_alias: item.meta.type.alias,
            metaFormat: item.meta.metaFormat ? item.meta.metaFormat.alias : null,
            entity: item.entity.alias,
            visible: item.adminShow,
            filled: item.adminWrite,
            required: item.parameters.required,
            options: item.parameters.options ? item.parameters.options : [],
            config: item.parameters.config ? item.parameters.config : {},
            optionsFields: item.parameters.optionsFields ? item.parameters.optionsFields : [],
            linkedProfiles: item.allowedProfiles,
            allowedAllProfiles: item.allowedAllProfiles,
            requiredProfiles: item.requiredProfiles,
            requiredAllProfiles: item.requiredAllProfiles,
            dropdown: false
          }
        })
        this.setMetadataData({path: 'items', value: items})
        this.setFetching(false)
        return Promise.resolve(data)
      }).finally(() => {
        this.setFetching(false)
      })
    },
    nextPage () {
      if (this.paging.nextPage) {
        this.queryParams.page = this.paging.nextPage
      }
    },
    previousPage () {
      if (this.paging.previousPage) {
        this.queryParams.page = this.paging.previousPage
      }
    },
    lastPage () {
      if (this.paging.lastPage) {
        this.queryParams.page = this.paging.lastPage
      }
    },
    firstPage () {
      if (this.paging.firstPage) {
        this.queryParams.page = this.paging.firstPage
      }
    },
    closeModalRemoveMetadata () {
      this.modalRemoveMetadata = false
    },
    getProfileName (name) {
      switch (name) {
        case 'Student':
          return this.$t('global:student')
        case 'Admin':
          return this.$t('global:admin')
        default:
          return name
      }
    }
  },
  created () {
    this.loadItemsPerPagePreferences(this.queryParams)
    this.loadMetas().then(() => {
      if (this.isEditing) {
        this.setMetadataData({path: 'current', value: this.metadata.items.find(item => item.id === parseInt(this.$route.params.id))})
        if (!this.metadata.current) {
          this.$router.push({ name: 'community.metadata' })
        }
      }
    })
  }
}
</script>

<template>
  <div class="main-content community">
    <ContentHeader
      :title="$t('community:header.title.4')"
      :description="$t('community:header.description.3')"
      :tag="$t('community:header.title')"
      class="header-admin"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>

    <div class="p-3">
      <filter-list>
        <action :text="$t('global:metadata.btn.add')" type="button" v-if="notEqualsProfile('student') && canWrite('metadata')" primary large fixed-width slot="button" @click="openModalAddMetadata()" :dark="accessibility"></action>
        <!-- <filter-list-tag slot="tag" :options="filterTagOptions"></filter-list-tag> -->
        <!-- <filter-list-order slot="order"></filter-list-order> -->
      </filter-list>
    </div>

    <div class="p-4">
      <empty-message v-if="metadata.items.length === 0">
        <h2>{{ $t('community.metadata:empty.title') }}</h2>
        <p class="text-color">{{ $t('community.metadata:empty.message') }}</p>
      </empty-message>
    </div>

    <div class="p-4" v-if="metadata.items.length">
      <datatable :items="metadata.items" class="datatable-dropdown-bg" :dark="accessibility" :class="{'datatable-metadata': $media.mobile}">
        <template slot="thead">
          <tr v-if="!$media.mobile">
            <th class="th">{{ $t('global:metadata.datatable.header.1') }}</th>
            <th class="th" width="180">{{ $t('global:metadata.datatable.header.2') }}</th>
            <th class="th" width="175">{{ $t('global:metadata.datatable.header.3') }}</th>
            <th class="th" width="175">{{ $t('global:metadata.datatable.header.4') }}</th>
            <th class="th" width="225"></th>
          </tr>
        </template>
        <template slot="tbody" slot-scope="props">
          <tr v-if="$media.mobile">
            <td class="td" colspan="4">
              <span class="td-text bolder" :style="{'width': '100%'}">{{ props.item.name }}</span>
            </td>
          </tr>
          <tr class="tr-parent-dropdown" :class="{'is-open':props.item.dropdown}">
            <td class="td" v-if="!$media.mobile">
              <span class="td-text bolder">{{ props.item.name }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:metadata.datatable.header.2') }}</span>
              <span class="td-text">{{ props.item.type }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:metadata.datatable.header.3') }}</span>
              <span class="td-text">{{ props.item.visible ? $t('global:admin') : $t('global:all') }}</span>
            </td>
            <td class="td">
              <span class="td-text-header" v-if="$media.mobile">{{ $t('global:metadata.datatable.header.4') }}</span>
              <span class="td-text">{{ props.item.filled ? $t('global:admin') : $t('global:user') }}</span>
            </td>
            <td v-if="$media.mobile" class="td td-actions text-right" width="35">
              <dropdown icon="dots-vertical" right v-if="notEqualsProfile('student') && canWrite('metadata')">
                <dropdown-link :text="$t('global:edit')" @click="edit(props.item, props.index)"></dropdown-link>
                <dropdown-link :text="$t('global:remove')" @click="openModalRemoveMetadata(props.item.id, props.item.entity, props.index)"></dropdown-link>
              </dropdown>
            </td>
            <td class="td td-actions flex gap-1 align-items-center" v-if="!$media.mobile">
              <action type="button" icon="keyboard_arrow_down" class="btn-dropdown" @click="openTableDropdown(props.item)"></action>
              <action type="button" :text="$t('global:view.more')" flat :dark="accessibility" @click="edit(props.item, props.index)"></action>
              <dropdown icon="dots-vertical" right v-if="notEqualsProfile('student') && canWrite('metadata')">
                <dropdown-link :text="$t('global:edit')" @click="edit(props.item, props.index)"></dropdown-link>
                <dropdown-link :text="$t('global:remove')" @click="openModalRemoveMetadata(props.item.id, props.item.entity, props.index)"></dropdown-link>
              </dropdown>
            </td>
          </tr>
          <tr v-if="$media.mobile" class="tr-colspan tr-parent-dropdown buttons-group" :class="{'is-open':props.item.dropdown}">
            <td class="td" colspan="4">
              <div class="td-actions" :style="{'display': 'contents'}">
                <action type="button" icon="keyboard_arrow_down" class="btn-dropdown" @click="openTableDropdown(props.item)"></action>
                <action type="button" class="text-more" :text="$t('global:view.more')" flat :dark="accessibility" @click="edit(props.item, props.index)"></action>
              </div>
            </td>
          </tr>
          <datatable-collapse-row v-show="props.item.dropdown" :colspan="5" :open="props.item.dropdown">
            <div class="metadata-tr-list clearfix flex gap-1 flex-column">
              <div class="metadata-tr-detail">
                <template v-if="props.item.optionsFields.length">
                  <div class="metadata-tr-detail-inner" v-for="(optionField, index) in props.item.optionsFields" :key="index">
                    <span class="metadata-tr-detail-title text-color text-base font-black">
                      {{ props.item.optionsFields.length === 1 ? $t('community.metadata:default.option') : optionField.name }}
                    </span>
                    <span class="metadata-tr-detail-item flex gap-1 flex-column py-1" v-for="(option, optionIndex) in props.item.options" :key="optionIndex">
                      {{ option.fields[optionField.alias] }}
                    </span>
                  </div>
                </template>
              </div>
              <div class="metadata-tr-detail my-3 flex gap-1 flex-column">
                <div class="metadata-tr-detail-title text-color text-base font-black">{{ $t('community.metadata:linked.profiles') }}</div>
                <template v-if="props.item.allowedAllProfiles">
                  <span class="metadata-tr-detail-item text-base" :key="`linked.profiles.${props.item.id}.all`">{{ $t('community.metadata:all.profiles') }}</span>
                </template>
                <template v-if="!props.item.allowedAllProfiles && props.item.linkedProfiles.length === 0">
                  <span class="metadata-tr-detail-item text-base" :key="`linked.profiles.${props.item.id}.none`">{{ $t('community.metadata:none.profiles') }}</span>
                </template>
                <template v-if="!props.item.allowedAllProfiles && props.item.linkedProfiles.length > 0">
                  <span class="metadata-tr-detail-item text-base" v-for="(item, index) in props.item.linkedProfiles" :key="`linked.profiles.${props.item.id}.${index}`">
                    {{ getProfileName(item.name) }}
                  </span>
                </template>
              </div>
              <div class="metadata-tr-detail flex gap-1 flex-column">
                <div class="metadata-tr-detail-title text-color text-base font-black">{{ $t('community.metadata:required.profiles') }}</div>
                <template v-if="props.item.requiredAllProfiles">
                  <span class="metadata-tr-detail-item text-base" :key="`required.profiles.${props.item.id}.all`">{{ $t('community.metadata:all.profiles') }}</span>
                </template>
                <template v-if="!props.item.requiredAllProfiles && props.item.requiredProfiles.length === 0">
                  <span class="metadata-tr-detail-item text-base" :key="`linked.profiles.${props.item.id}.none`">{{ $t('community.metadata:none.profiles') }}</span>
                </template>
                <template v-if="!props.item.requiredAllProfiles && props.item.requiredProfiles.length > 0">
                  <span class="metadata-tr-detail-item text-base" v-for="(item, index) in props.item.requiredProfiles" :key="`required.profiles.${props.item.id}.${index}`">
                    {{ getProfileName(item.name) }}
                  </span>
                </template>
              </div>
            </div>
          </datatable-collapse-row>
        </template>
      </datatable>
      <pagination
        :activePage="this.paging.actualPage"
        :pageCount="this.paging.lastPage"
        @next-page="nextPage"
        @previous-page="previousPage"
        @first-page="firstPage"
        @last-page="lastPage"
        @go-to-page="queryParams.page = $event"
        @change-items-per-page="changeItemsPerPage"
      ></pagination>
    </div>
    <modal :active="modalRemoveMetadata" :cancel="false">
      <div class="modal-confirm">
        <action type="button" icon="close" icon-size="medium" class="btn-close" @click="closeModalRemoveMetadata()"></action>
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">{{ $t('community.metadata:modal.confirm.title.1') }}</h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('community.metadata:modal.confirm.description.1') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action type="button" :text="$t('global:cancel')" flat @click="closeModalRemoveMetadata()"></action>
          <action type="button" :text="$t('global:exclude')" flat class="btn-cancel" @click="remove(currentMetadata.id, currentMetadata.entity, currentMetadata.index)"></action>
        </div>
      </div>
    </modal>
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import "~@/app/community/styles.scss";
</style>
