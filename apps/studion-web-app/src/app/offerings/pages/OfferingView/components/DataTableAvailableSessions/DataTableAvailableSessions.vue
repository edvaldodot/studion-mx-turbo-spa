<script>
import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import DatatableCollapseRow from '@/components/general/DatatableCollapseRow'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import ModalInformation from '@/components/general/ModalInformation'

export default {
  name: 'DataTableAvailableSessions',

  components: {
    Action,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    ModalInformation,
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
      isModalOpen: false,
      currentModalItem: null,
    }
  },

  watch: {
    /**
     * Set a reactive data `itemsWithDropdown` containing
     * property `dropdown` to be able to toggle visualization on list.
     */
    items: {
      immediate: true,
      handler(newItemList) {
        this.itemsWithDropdown = newItemList.map((item) => ({
          ...item,
          dropdown: false,
        }))
      },
    },
  },

  methods: {
    toggleDropdown(item) {
      item.dropdown = !item.dropdown
    },

    openTimelineModal(sessionId) {
      this.$router.push({
        name: 'offerings.sessions.timeline',
        params: { sessionId },
      })
    },

    closeModal() {
      this.isModalOpen = false
    },

    openModal(item) {
      this.currentModalItem = item
      this.isModalOpen = true
    },
  }
}
</script>

<template>
  <div>
    <Datatable class="datatable-available-sessions" :items="itemsWithDropdown" light>
      <template v-if="!$media.mobile" slot="thead">
        <tr>
          <th class="th">
            <span class="pl-2">{{ $t('offerings.view:modal.enroll.datatable.header.1') }}</span>
          </th>

          <th class="th">
            {{ $t('offerings.view:modal.enroll.datatable.header.2') }}
          </th>

          <th class="th">
            {{ $t('offerings.view:modal.enroll.datatable.header.3') }}
          </th>
          <th class="th" width="15%"></th>
          <th class="th" width="5%"></th>
        </tr>
      </template>

      <template
        slot="tbody"
        slot-scope="{ item }"
      >
        <template v-if="$media.mobile">
          <tr
            class="tr-parent-dropdown"
            :class="{ 'is-open': item.dropdown }"
          >
            <td
              class="td no-bb"
              colspan="3"
            >
              <div class="pl-2">
                <span class="td-text-header">{{
                  $t('offerings.view:modal.enroll.datatable.header.1')
                }}</span>
                <span class="td-text bolder clamp-line">{{ item.name }}</span>
              </div>
            </td>
          </tr>

          <tr class="tr-parent-dropdown" :class="{ 'is-open': item.dropdown }">
            <td class="td">
              <div class="pl-2">
                <span class="td-text-header sub-header">{{ $t('offerings.view:modal.enroll.datatable.header.2') }}</span>
                <span class="td-text">{{ formatDate(item.period.initial) || '-' }}</span>
              </div>
            </td>

            <td class="td">
              <div class="pl-2">
                <span class="td-text-header sub-header">{{ $t('offerings.view:modal.enroll.datatable.header.3') }}</span>
                <span class="td-text">{{ formatDate(item.period.final) || '-' }}</span>
              </div>
            </td>
            <td class="td" width="40px">
              <Action
                v-if="item.courses.length"
                type="button"
                icon="keyboard_arrow_down"
                class="btn-dropdown"
                @click="toggleDropdown(item)"
              />
            </td>
          </tr>
        </template>

        <tr v-else class="tr-parent-dropdown" :class="{ 'is-open': item.dropdown }">
          <td class="td">
            <span class="td-text clamp-line pl-2">{{ item.name }}</span>
          </td>

          <td class="td">
            <span class="td-text">{{ formatDate(item.period.initial) || '-' }}</span>
          </td>

          <td class="td">
            <span class="td-text">{{ formatDate(item.period.final) || '-' }}</span>
          </td>

          <td class="td">
            <Action
              :text="$t('offerings.view:modal.enroll.datatable.schedule.button')"
              type="button"
              icon-size="large"
              icon-right
              dark
              flat
              @click="openModal(item)"
            />
          </td>

          <td class="td">
            <Action
              v-if="item.courses.length"
              type="button"
              icon="keyboard_arrow_down"
              class="btn-dropdown"
              @click="toggleDropdown(item)"
            />
          </td>
        </tr>

        <DatatableCollapseRow :colspan="6" :open="item.dropdown">
          <Datatable :items="item.courses" class="details pl-2">
            <template v-if="!$media.mobile" slot="thead">
              <tr>
                <th class="th">
                  <span class="pl-2">{{ $t('offerings.view:modal.enroll.datatable.header.1.1') }}</span>
                </th>

                <th class="th">
                  {{ $t('offerings.view:modal.enroll.datatable.header.2') }}
                </th>

                <th class="th">
                  {{ $t('offerings.view:modal.enroll.datatable.header.3') }}
                </th>
                <th class="th" width="5%"></th>
              </tr>
            </template>

            <template slot="tbody" slot-scope="{ item: innerItem }">
              <template v-if="$media.mobile">
                <tr>
                  <td class="td no-bb" colspan="3">
                    <div class="pl-2">
                      <span class="td-text-header">{{ $t('offerings.view:modal.enroll.datatable.header.1.1') }}</span>
                      <span class="td-text clamp-line">{{ innerItem.name }}</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td class="td">
                    <div class="pl-2">
                      <span class="td-text-header">{{ $t('offerings.view:modal.enroll.datatable.header.2') }}</span>
                      <span class="td-text">{{ formatDate(innerItem.start_date) || '-' }}</span>
                    </div>
                  </td>

                  <td class="td">
                    <div class="pl-2">
                      <span class="td-text-header">{{ $t('offerings.view:modal.enroll.datatable.header.3') }}</span>
                      <span class="td-text">{{ formatDate(innerItem.end_date) || '-' }}</span>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-else>
                <td class="td">
                  <span class="td-text clamp-line pl-2">{{ innerItem.name }}</span>
                </td>

                <td class="td">
                  <span class="td-text">{{ formatDate(innerItem.start_date) || '-' }}</span>
                </td>

                <td class="td">
                  <span class="td-text">{{ formatDate(innerItem.end_date) || '-' }}</span>
                </td>

                <td class="td">
                  <Dropdown
                    v-if="
                      notEqualsProfile('student') && canWrite('sessions')
                      && item.type === 'closed' && item.published && innerItem.session_id
                    "
                    icon="dots-vertical"
                    right
                  >
                    <DropdownLink
                      :text="$t('community.sessions.timeline.session')"
                      @click="openTimelineModal(innerItem.session_id)"
                    />
                  </Dropdown>
                </td>
              </tr>
            </template>
          </Datatable>
        </DatatableCollapseRow>
      </template>
    </Datatable>
    <ModalInformation
      :active="isModalOpen"
      closable
      width="580px"
      small-padding
      @close="closeModal"
    >
      <template #pre-content>
        {{ $t('offerings.view:modal.enroll.datatable.schedule.overtitle') }}
      </template>

      <template #title>
        {{ $t('offerings.view:modal.enroll.datatable.header.1.1') }}
      </template>

      <template #content>
        <div class="grid">
          <div
            v-for="course in currentModalItem.courses"
            :key="`course-item-${course.id}`"
            class="grid col-12"
          >
            <div class="col-12">
              <p class="item-title">{{ course.name }}</p>
            </div>
            <div class="grid col-12">
              <div class="col-12">
                <p class="item-label text-color">{{ $t('offerings.view:modal.enroll.datatable.header.2') }}</p>
                <p class="item-date text-color">{{ formatDate(course.start_date) || '-' }}</p>
              </div>
              <div class="col-12">
                <p class="item-label text-color">{{ $t('offerings.view:modal.enroll.datatable.header.3') }}</p>
                <p class="item-date text-color">{{ formatDate(course.end_date) || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ModalInformation>
  </div>
</template>

<style lang="scss">
@import 'DataTableAvailableSessions.scss';
</style>