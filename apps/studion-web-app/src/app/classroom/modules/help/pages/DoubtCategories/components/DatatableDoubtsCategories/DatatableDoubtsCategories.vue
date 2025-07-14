<script>
import { defineComponent } from 'vue'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import EmptyMessage from '@/components/general/EmptyMessage'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Modal from '@/components/general/Modal'

import ModalDelete from '../ModalDelete'

export default defineComponent({
  name: 'DatatableDoubtsCategories',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    EmptyMessage,
    Dropdown,
    DropdownLink,
    ModalDelete,
    Modal,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      itemsWithDropdown: [],
      modalDeleteItem: false,
      itemDelete: null,
      isSubCategory: false,
    }
  },

  computed: {
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },

  watch: {
    items: {
      handler(newItems) {
        this.itemsWithDropdown = newItems.map((item) => {
          return Object.assign({}, item, { dropdown: false })
        })
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDeleteCategoryKB',
      'attemptDeleteSubCategoryKB',
    ]),
    createSubcategory(item, category, index) {
      this.itemIndex = index
      this.$router.push({
        name: 'classroom.categories.create',
        params: {
          item,
          isCategory: false,
          category,
        },
      })
    },

    editSubcategory(item, category) {
      this.$router.push({
        name: 'classroom.categories.edit',
        params: {
          item,
          isCategory: false,
          isEditing: true,
          category,
        },
      })
    },

    editCategory(item) {
      this.$router.push({
        name: 'classroom.categories.edit',
        params: {
          item,
          isCategory: true,
          isEditing: true,
        },
      })
    },

    openModalConfirm(item, isSubCategory, index) {
      this.itemIndex = index
      this.modalDeleteItem = true
      this.itemDelete = item.id
      this.isSubCategory = isSubCategory
    },

    removeItem() {
      !this.isSubCategory ? this.removeCategory() : this.removeSubCategory()
    },

    removeCategory() {
      this.setFetching(true)
      this.attemptDeleteCategoryKB({
        sessionUuid: this.sessionUuid,
        category_id: this.itemDelete,
      })
        .then(() => {
          this.$emit('refresh')
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:delete:category.feedback.success'),
          })
        })
        .catch(({ response }) => {
          if (
            response.data.message === 'issue_category_has_issues_associated' ||
            response.data.message === 'issue_subcategory_has_issues_associated'
          ) {
            this.setFeedback({
              message: this.$t(`classroom.knowledgeBase:${response.data.message}`),
              type: 'error',
            })
          } else {
            this.setFeedback({ message: this.$t('global:error'), type: 'error' })
          }
        })
        .finally(() => {
          this.setFetching(false)
          this.closeModalConfirm()
        })
    },

    removeSubCategory() {
      this.setFetching(true)
      this.attemptDeleteSubCategoryKB({
        sessionUuid: this.sessionUuid,
        subcategory_id: this.itemDelete,
      })
        .then(() => {
          this.$emit('refresh')
          this.setFeedback({
            message: this.$t('classroom.knowledgeBase:delte:subcategory.feedback.success'),
          })
        })
        .catch(({ response }) => {
          if (response.data.message === 'issue_subcategory_has_issues_associated') {
            this.setFeedback({
              message: this.$t(`classroom.knowledgeBase:${response.data.message}`),
              type: 'error',
            })
          } else {
            this.setFeedback({ message: this.$t('global:error'), type: 'error' })
          }
        })
        .finally(() => {
          this.updateHeight(false)
          this.setFetching(false)
          this.closeModalConfirm()
        })
    },

    closeModalConfirm() {
      this.modalDeleteItem = false
    },

    updateHeight(add = true) {
      const arratLength = this.items[this.itemIndex].issueSubCategories.length
      const dropdownContent = document.querySelectorAll('tbody .tr-dropdown .tr-dropdown-content')[
        this.itemIndex
      ]
      if (dropdownContent) {
        if (arratLength < 1) {
          dropdownContent.style.height = dropdownContent.scrollHeight + 20 + 'px'
        } else {
          if (!add && arratLength > 1) {
            dropdownContent.style.height = dropdownContent.scrollHeight - 70 + 'px'
          } else if (add) {
            dropdownContent.style.height = dropdownContent.scrollHeight + 70 + 'px'
          }
        }
      }
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('datatable-pre-project')"
    class="datatable-with-collapse"
  >
    <Datatable
      v-if="itemsWithDropdown.length"
      :items="itemsWithDropdown"
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <tr>
          <th class="th col-4 pl-1">
            <span class="clamp-line">
              {{ $tc('global:category', 1) }}
            </span>
          </th>

          <th class="th">
            <span class="clamp-line">
              {{ $t('global:subcategory') }}
            </span>
          </th>

          <th
            class="th"
            width="40"
          ></th>
          <th
            class="th"
            width="40"
          ></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item, index }"
      >
        <tr
          class="tr-parent-dropdown"
          :class="{ 'is-open': item.dropdown }"
        >
          <td class="td pl-2">
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
              {{ $tc('global:category', 1) }}
            </span>
            <span
              class="td-text clamp-line"
              :class="{ bolder: !$media.mobile }"
            >
              {{ item.name }}
            </span>
          </td>

          <td class="td">
            <span
              v-if="$media.mobile"
              class="td-text-header clamp-line bolder"
            >
              {{ $t('global:subcategory') }}
            </span>

            <span class="td-text clamp-line">{{ item.issueSubCategories.length }}</span>
          </td>

          <td class="td td-actions">
            <Action
              type="button"
              icon="keyboard_arrow_down"
              class="btn-dropdown text-right"
              @click="item.dropdown = !item.dropdown"
            />
          </td>
          <td class="td">
            <Dropdown icon="dots-vertical">
              <DropdownLink
                :text="$t('global:edit')"
                @click="editCategory(item)"
              />
              <DropdownLink
                :text="$t('global:remove')"
                @click="openModalConfirm(item, false)"
              />
              <DropdownLink
                :text="$t('classroom.knowledgeBase.help:add.subcategories')"
                @click="createSubcategory(item, item, index)"
              />
            </Dropdown>
          </td>
        </tr>

        <DatatableCollapseRow
          v-if="item.dropdown"
          :colspan="6"
          :open="item.dropdown"
        >
          <Datatable
            v-if="item"
            :items="item.issueSubCategories"
            class="details"
          >
            <template slot="thead">
              <tr
                v-if="!$media.mobile"
                :class="{ 'not-subcategory': item.issueSubCategories.length <= 0 }"
              >
                <th class="th col-9">{{ $t('global:subcategory') }}</th>

                <th class="th col-2 text-right">
                  <Action
                    :text="$t('classroom.knowledgeBase.help:add.subcategories')"
                    icon-size="small"
                    type="button"
                    flat
                    small
                    @click="createSubcategory(item, item, index)"
                  />
                </th>
              </tr>
            </template>

            <template
              slot="tbody"
              slot-scope="innerProps"
            >
              <tr :class="{ 'tr-body': !$media.mobile, 'tr-mobile': $media.mobile }">
                <td class="td">{{ innerProps.item.name }}</td>

                <td class="td text-right">
                  <Dropdown icon="dots-vertical">
                    <DropdownLink
                      :text="$t('global:edit')"
                      @click="editSubcategory(innerProps.item, item)"
                    />
                    <DropdownLink
                      :text="$t('global:remove')"
                      @click="openModalConfirm(innerProps.item, true, index)"
                    />
                  </Dropdown>
                </td>
              </tr>
            </template>
          </Datatable>
        </DatatableCollapseRow>
      </template>
    </Datatable>

    <EmptyMessage v-else>
      <h2>{{ $t('classroom.knowledgeBase.help:empty.category.datatable.title') }}</h2>
      <p>
        {{ $t('classroom.knowledgeBase.help:empty.category.datatable') }}
      </p>
    </EmptyMessage>
    <Modal
      :active="modalDeleteItem"
      :cancel="false"
      is-page
    >
      <ModalDelete
        @delete="removeItem()"
        @close="closeModalConfirm()"
      />
    </Modal>
  </div>
</template>

<style lang="scss">
@import './DatatableDoubtsCategories.scss';
</style>
