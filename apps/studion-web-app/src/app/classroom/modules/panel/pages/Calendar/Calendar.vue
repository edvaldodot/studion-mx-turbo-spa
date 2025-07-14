<script>
import { mapActions } from 'vuex'
import { format, isSameMonth } from 'date-fns'
import { eventMixin } from '@/mixins/eventMixin'

import Action from '@/components/general/Action'
import Calendar from '@/components/general/Calendar'
import CalendarEventModal from '@/components/general/Calendar/CalendarEventModal'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Tabs from '@/components/general/Tabs'

const Datatable = () => import('@/components/general/Datatable')
const DatatableCollapseRow = () => import('@/components/general/DatatableCollapseRow')

export default {
  name: 'ClassroomCalendar',
  components: {
    Action,
    Calendar,
    CalendarEventModal,
    Datatable,
    DatatableCollapseRow,
    Dropdown,
    DropdownLink,
    EmptyMessage,
    FilterList,
    Tabs,
  },

  mixins: [eventMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  data() {
    return {
      modalAddEvent: false,
      tabLinks: [
        {
          text: 'classroom.panel:tab.link.1',
          location: {
            name: 'classroom.panel.dashboard',
          },
        },
        {
          text: 'classroom.panel:tab.link.2',
          location: {
            name: 'classroom.panel.announcements',
          },
        },
        {
          text: 'classroom.panel:tab.link.3',
          location: {
            name: 'classroom.panel.calendar',
          },
        },
      ],
      calendarLinksActive: 0,
      calendarLinks: [{ text: 'global:month' }, { text: 'global:week' }, { text: 'global:events' }],
      events: [],
      weekly: false,
      autocompleteResult: null,
      autocompleteUsers: [],
      eventId: null,
      addParamsModal: {},
    }
  },

  created() {
    if (!this.Classroom.data.announcement) {
      this.tabLinks.splice(1, 1)
    }
    this.$emit('change-header', {
      tabLinks: this.tabLinks,
    })
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptClassroomCalendarMonthRetrieval']),
    changeCalendarMonth() {
      this.weekly = false
    },
    changeCalendarWeek() {
      this.weekly = true
    },
    calendarNext() {
      this.weekly ? this.$refs.calendar.onClickNextWeek() : this.$refs.calendar.onClickNextMonth()
      this.loadActualMonthData()
    },
    calendarPrev() {
      this.weekly ? this.$refs.calendar.onClickPrevWeek() : this.$refs.calendar.onClickPrevMonth()
      this.loadActualMonthData()
    },
    loadActualMonthData() {
      if (!this.$refs.calendar) return
      const month = format(new Date(this.$refs.calendar.date), 'MMMM').toLowerCase()
      const year = format(new Date(this.$refs.calendar.date), 'yyyy')
      const sessionUuid = this.sessionUuid

      this.setFetching(true)
      this.attemptClassroomCalendarMonthRetrieval({ sessionUuid, month, year })
        .then(({ data }) => {
          this.events = data
            ? data.map((item) => {
                return {
                  author: {
                    name: item.ownerName,
                    image: item.ownerImage,
                  },
                  id: item.event.id,
                  title: item.event.title,
                  startDate: item.event.period.initial,
                  endDate: item.event.period.final,
                  color: item.event.color,
                  description: item.event.description,
                  isOwner: item.isOwner,
                  allUsers: item.allUsers,
                  conferenceRoom: item.event.conferenceRoom,
                  topic: item.event.topic,
                  dropdown: false,
                }
              })
            : []
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.panel.calendar:load.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    getMonth() {
      let localeString = this.$i18n.locale.replace(/-\w*/g, (string) =>
        string.replace('-', '').toUpperCase()
      )
      const locale = require('date-fns/locale')[localeString]
      if (this.$refs.calendar) {
        if (this.weekly) {
          if (
            isSameMonth(
              new Date(this.$refs.calendar.firstDayWeek),
              new Date(this.$refs.calendar.lastDayWeek)
            )
          ) {
            return format(new Date(this.$refs.calendar.firstDayWeek), 'MMMM yyyy', {
              locale: locale,
            })
          } else {
            return (
              format(new Date(this.$refs.calendar.firstDayWeek), 'MMMM', {
                locale: locale,
              }).substring(0, 3) +
              ' ' +
              format(new Date(this.$refs.calendar.firstDayWeek), 'yyyy') +
              ' - ' +
              format(new Date(this.$refs.calendar.lastDayWeek), 'MMMM', {
                locale: locale,
              }).substring(0, 3) +
              ' ' +
              format(new Date(this.$refs.calendar.lastDayWeek), 'yyyy')
            )
          }
        } else {
          return format(new Date(this.$refs.calendar.date), 'MMMM yyyy', { locale: locale })
        }
      } else {
        return format(new Date(), 'MMMM yyyy', { locale: locale })
      }
    },
    checkTab(index) {
      this.calendarLinksActive = index
      if (index === 0 || index === 2) {
        this.changeCalendarMonth()
      } else if (index === 1) {
        this.changeCalendarWeek()
      }
    },
    getCleanDate(date) {
      return format(new Date(date), 'dd/MM - HH:mm')
    },
    openTableDropdown(item) {
      item.dropdown = !item.dropdown
    },
    addEventDay(date, allDay) {
      this.openModalAddEvent({ date, allDay })
    },
    updateEvents() {
      this.loadActualMonthData()
    },
  },
}
</script>

<template>
  <div
    v-if="canRead('classroom:event')"
    class="inner-content"
  >
    <div class="p-4">
      <FilterList>
        <Action
          slot="button"
          :text="$t('classroom.panel.calendar:btn.add')"
          :dark="accessibility"
          type="button"
          fixed-width
          primary
          large
          @click="openModalAddEvent()"
        />

        <template slot="calendar">
          <div class="calendar-filter">
            <div
              v-if="$media.mobile"
              class="filter-tab-options"
            >
              <Tabs
                :index-active="calendarLinksActive"
                :links="calendarLinks"
                :dark="accessibility"
                @tabChange="checkTab"
              />
            </div>
            <div class="calendar-controls">
              <Action
                class="btn-left"
                type="button"
                icon="keyboard_arrow_left"
                @click.prevent="calendarPrev()"
              />
              <Action
                class="btn-right"
                type="button"
                icon="keyboard_arrow_right"
                @click.prevent="calendarNext()"
              />
              <span class="calendar-controls-month">{{ getMonth() }}</span>
            </div>
            <div
              v-if="!$media.mobile"
              class="filter-tab-options"
            >
              <Tabs
                :index-active="calendarLinksActive"
                :links="calendarLinks"
                :dark="accessibility"
                @tabChange="checkTab"
              />
            </div>
          </div>
        </template>
      </FilterList>
    </div>
    <div class=" center">
      <Calendar
        v-show="calendarLinksActive !== 2"
        ref="calendar"
        :add-event-label="$t('global:calendar.event.label')"
        :events="events"
        :weekly="weekly"
        @clickDay="addEventDay"
        @deleteEvent="deleteEvent"
        @loadEventUpdate="editEvent"
        @mounted="loadActualMonthData"
      />

      <EmptyMessage v-if="calendarLinksActive === 2 && events.length === 0">
        <h2>{{ $t('classroom.panel.calendar:empty.title') }}</h2>
        <p class="text-color">{{ $t('classroom.panel.calendar:empty.message') }}</p>
      </EmptyMessage>

      <Datatable
        v-if="calendarLinksActive === 2 && events.length"
        :items="events"
        :dark="accessibility"
        class="datatable-calendar"
      >
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th
              class="th"
              width="62%"
            >
              {{ $t('classroom.panel.calendar:datatable.header.1') }}
            </th>
            <th
              class="th"
              width="17%"
            >
              {{ $t('classroom.panel.calendar:datatable.header.2') }}
            </th>
            <th
              class="th"
              width="17%"
            >
              {{ $t('classroom.panel.calendar:datatable.header.3') }}
            </th>
            <th
              class="th"
              width="4%"
            ></th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="props"
        >
          <tr
            v-if="$media.mobile"
            class="tr-colspan tr-parent-dropdown"
            :class="{ 'is-open': props.item.dropdown }"
          >
            <td
              class="td"
              colspan="3"
            >
              <div class="td-user">
                <span
                  class="td-calendar-color"
                  :style="{ backgroundColor: props.item.color }"
                ></span>
                <span class="td-text bolder compact-lines">{{ props.item.title }}</span>
              </div>
            </td>
          </tr>
          <tr
            class="tr-body tr-parent-dropdown"
            :class="{ 'is-open': props.item.dropdown }"
          >
            <td
              v-if="!$media.mobile"
              class="td"
            >
              <div class="td-user">
                <span
                  class="td-calendar-color"
                  :style="{ backgroundColor: props.item.color }"
                ></span>
                <span class="td-text bolder compact-lines">{{ props.item.title }}</span>
              </div>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('classroom.panel.calendar:datatable.header.2') }}
              </span>
              <span class="td-text">{{ getCleanDate(props.item.startDate) }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
              >
                {{ $t('classroom.panel.calendar:datatable.header.3') }}
              </span>
              <span class="td-text">{{ getCleanDate(props.item.endDate) }}</span>
            </td>
            <td
              class="td td-actions"
              width="40"
            >
              <Action
                v-if="fullPermission"
                type="button"
                icon="keyboard_arrow_down"
                class="btn-dropdown text-right"
                @click="openTableDropdown(props.item)"
              />
              <Dropdown
                v-if="fullPermission"
                icon="dots-vertical"
                right
              >
                <DropdownLink
                  :text="$t('global:edit')"
                  :dark="accessibility"
                  type="button"
                  flat
                  @click="editEvent(props.item.id)"
                />
                <DropdownLink
                  :text="$t('global:remove')"
                  :dark="accessibility"
                  type="button"
                  flat
                  @click="deleteEvent(props.item.id)"
                />
              </Dropdown>
            </td>
          </tr>
          <DatatableCollapseRow
            :colspan="4"
            :open="props.item.dropdown"
          >
            <div
              class="td-calendar-description"
              v-html="props.item.description"
            ></div>
          </DatatableCollapseRow>
        </template>
      </Datatable>
    </div>

    <CalendarEventModal
      v-if="modalAddEvent"
      :session-uuid="sessionUuid"
      :params="addParamsModal"
      :full-permission="fullPermission"
      @close="closeModalAddEvent"
      @events-update="loadActualMonthData"
    />
  </div>
</template>
