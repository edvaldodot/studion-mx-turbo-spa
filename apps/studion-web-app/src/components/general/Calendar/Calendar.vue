<script>
import { mapState } from 'vuex'
import {
  parseISO,
  format,
  isWithinInterval,
  isAfter,
  startOfMonth,
  areIntervalsOverlapping,
  getDay,
  getWeeksInMonth,
  subDays,
  isSameDay,
  isSameHour,
  isSameMonth,
  addHours,
  startOfHour,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  subYears,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  differenceInHours,
  differenceInMilliseconds,
} from 'date-fns'

import Action from '../Action'
import CalendarEventDetail from './CalendarEventDetail'

export default {
  name: 'Calendar',
  components: {
    Action,
    CalendarEventDetail,
  },
  props: {
    startDate: {
      type: Date,
      default() {
        return new Date()
      },
    },
    minDate: {
      type: Date,
      default: null,
    },
    maxDate: {
      type: Date,
      default: null,
    },
    monthNameFormat: {
      type: String,
      default: 'MMMM',
    },
    weekdayNameFormat: {
      type: String,
      default: 'eeee',
    },
    rangeDates: {
      type: Boolean,
      default: false,
    },
    events: {
      type: Array,
      default() {
        return []
      },
    },
    addEventLabel: {
      type: String,
      default: null,
    },
    weekly: {
      type: Boolean,
      default: false,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      calendar: [],
      today: new Date(),
      date: startOfMonth(this.startDate),
      selectDates: [],
      eventsOrdered: [],
      tempMaxEvents: 1,
      firstDayWeek: null,
      lastDayWeek: null,
      eventModal: false,
      eventModalDetail: null,
      locale: null,
      openedZoom: null,
    }
  },
  computed: {
    ...mapState(['accessibility']),
    weekDayNames() {
      const now = new Date()
      let array = eachDayOfInterval({ start: startOfWeek(now), end: endOfWeek(now) })
      array = array.map((date) => {
        return format(new Date(date), this.weekdayNameFormat, { locale: this.locale })
      })
      return array
    },
  },
  watch: {
    weekly() {
      this.generateCalendar()
    },
    events() {
      this.eventsOrdered = this.orderEventsByDuration(this.events.slice(0))
      this.weekly ? this.createCalendarWeek() : this.createCalendar()
    },
  },
  methods: {
    generateCalendar() {
      if (this.weekly) {
        this.date = this.today
        this.createCalendarWeek()
      } else {
        this.date = startOfMonth(this.today)
        this.createCalendar()
      }
    },
    getWeekdayNamesByIndex(index) {
      return this.weekDayNames[index]
    },
    createCalendar() {
      this.resetEventsIndex()
      const actualMonth = this.date
      const firstDay = getDay(actualMonth)
      const numWeeks = getWeeksInMonth(actualMonth)
      var firstDate = subDays(actualMonth, firstDay)
      this.calendar = []
      for (let countWeek = 0; countWeek < numWeeks; countWeek++) {
        let week = []
        for (let countWeekDay = 0; countWeekDay < 7; countWeekDay++) {
          let date = firstDate
          week.push({
            date: date,
            isToday: isSameDay(date, this.today),
            isOtherMonth: !isSameMonth(date, this.date),
            isActive: this.isDateActive(date),
            isInRange: this.isDateInBetween(date),
            isWeekend: countWeekDay === 0 || countWeekDay === 6,
            zoom: false,
            events: this.getDayEvents(date),
          })
          firstDate = addDays(firstDate, 1)
        }
        this.calendar.push(week)
      }
    },
    createCalendarWeek() {
      this.resetEventsIndex()
      var firstDate = startOfWeek(this.date)
      this.firstDayWeek = firstDate
      this.calendar = []
      let week = []
      this.tempMaxEvents = 1
      for (let countWeekDay = 0; countWeekDay < 7; countWeekDay++) {
        let date = firstDate
        week.push({
          date: date,
          isToday: isSameDay(date, this.today),
          isOtherMonth: !isSameMonth(date, this.date),
          isActive: this.isDateActive(date),
          isInRange: this.isDateInBetween(date),
          isWeekend: countWeekDay === 0 || countWeekDay === 6,
          hours: this.getHours(date),
          eventsAllDay: this.getDayEventsAllDay(date),
          events24hour: this.getDayEvents24hour(date),
        })
        firstDate = addDays(firstDate, 1)
      }
      this.lastDayWeek = subDays(firstDate, 1)
      this.calendar.push(week)
    },
    getHours(date) {
      let hours = []
      var tempDate = startOfHour(date)
      for (let i = 0; i < 24; i++) {
        hours.push(tempDate)
        tempDate = addHours(tempDate, 1)
      }
      return hours
    },
    getLimitWidth(start, end) {
      let multiplier = this.$media.mobile ? 80 : 120
      start = new Date(start)
      end = new Date(end)
      if (7 - start.getDay() < end.getDate() - start.getDate()) {
        return (7 - start.getDay()) * multiplier + 'px'
      }
      return (end.getDate() - start.getDate() + 1) * multiplier + 'px'
    },
    getLimitHeight(start, end) {
      start = new Date(start)
      end = new Date(end)
      if (start.getDate() === end.getDate()) {
        if (end.getHours() - start.getHours() <= 1) {
          return '50px'
        }
        if (end.getMinutes() > 0) {
          return 50 * (end.getHours() - start.getHours() + 1) - 10 + 'px'
        }
        return 50 * (end.getHours() - start.getHours()) - 10 + 'px'
      }
      return 50 * (24 - start.getHours()) - 10 + 'px'
    },
    resetEventsIndex() {
      for (let i = 0; i < this.eventsOrdered.length; i++) {
        delete this.eventsOrdered[i].index
      }
    },
    setEventsIndex(events) {
      if (events.length) {
        for (let i = 0; i < events.length; i++) {
          if (!events.some((event) => event.index === i + 1)) {
            let event = events.find((event) => event.index === undefined)
            if (event) {
              event.index = i + 1
            }
          }
        }
        events = this.orderEventsByIndex(events)
      }
      return events
    },
    orderEventsByDuration(events) {
      return events.sort(function (a, b) {
        return differenceInHours(parseISO(a.endDate), parseISO(a.startDate)) >
          differenceInHours(parseISO(b.endDate), parseISO(b.startDate))
          ? -1
          : 1
      })
    },
    orderEventsByIndex(events) {
      return events.sort((a, b) => {
        if (!a.index) return 1
        return a.index - b.index
      })
    },
    getDayEventsAllDay(date) {
      let dayEvents = this.eventsOrdered.filter(
        (event) =>
          isWithinInterval(date, {
            start: new Date(event.startDate),
            end: new Date(event.endDate),
          }) &&
          differenceInMilliseconds(new Date(event.endDate), new Date(event.startDate)) >= 86340000,
        this
      )
      this.tempMaxEvents =
        dayEvents.length > this.tempMaxEvents ? dayEvents.length : this.tempMaxEvents
      return this.setEventsIndex(dayEvents)
    },
    getDayEvents24hour(date) {
      let dayEvents = this.eventsOrdered.filter(
        (event) =>
          (isSameDay(date, new Date(event.startDate)) ||
            isWithinInterval(new Date(date), {
              start: new Date(event.startDate),
              end: new Date(event.endDate),
            })) &&
          differenceInMilliseconds(new Date(event.endDate), new Date(event.startDate)) < 86340000,
        this
      )
      return this.setEventsIndex(this.checkOverlap(dayEvents))
    },
    checkOverlap(events) {
      if (events.length > 1) {
        for (let i = 0; i < events.length; i++) {
          for (let x = i + 1; x < events.length; x++) {
            let dateRangesOverlap = areIntervalsOverlapping(
              { start: new Date(events[i].startDate), end: new Date(events[i].endDate) },
              { start: parseISO(events[x].startDate), end: parseISO(events[x].endDate) }
            )
            events[i].overlap = dateRangesOverlap
            events[x].overlap = dateRangesOverlap
          }
        }
      }
      return events
    },
    getDayEvents(date) {
      let dayEvents = this.eventsOrdered.filter(
        (event) =>
          isSameDay(date, new Date(event.startDate)) ||
          isWithinInterval(new Date(date), {
            start: parseISO(event.startDate),
            end: new Date(event.endDate),
          }),
        this
      )
      return this.setEventsIndex(dayEvents)
    },
    isDateActive(day) {
      return this.selectDates.filter(function (date) {
        return isSameDay(day, date)
      }).length
    },
    isDateInBetween(day) {
      return (
        this.selectDates.length >= 2 &&
        isWithinInterval(day, { start: this.selectDates[0], end: this.selectDates[1] })
      )
    },
    openZoom(day) {
      this.openedZoom = day
    },
    closeZoom() {
      this.openedZoom = null
    },
    onClickNextMonth() {
      this.date = startOfMonth(addMonths(new Date(this.date), 1))
    },
    onClickPrevMonth() {
      this.date = startOfMonth(subMonths(new Date(this.date), 1))
    },
    onClickNextWeek() {
      this.date = addWeeks(this.date, 1)
    },
    onClickPrevWeek() {
      this.date = subWeeks(this.date, 1)
    },
    onClickNextYear() {
      this.date = addYears(this.date, 1)
    },
    onClickPrevYear() {
      this.date = subYears(this.date, 1)
    },
    onClickDay(date, allDay) {
      if (this.readOnly) {
        return
      }
      if (
        (this.rangeDates &&
          this.selectDates.length === 1 &&
          isAfter(parseISO(this.selectDates[0]), parseISO(date))) ||
        (this.rangeDates && this.selectDates.length === 2) ||
        !this.rangeDates
      ) {
        this.selectDates = []
      }
      this.selectDates.push(date)
      this.$emit('clickDay', date, allDay)
    },
    openEvent(event, eventClick) {
      this.eventModalDetail = event
      this.eventModal = true
      this.$refs.modal.$el.style.top =
        eventClick.target.getBoundingClientRect().top -
        this.$refs.calendar.getBoundingClientRect().top +
        30 +
        'px'
      if (this.$media.mobile) {
        this.$refs.modal.$el.style.left = '0px'
        this.$refs.modal.$el.style.maxWidth = '100%'
        this.$nextTick(() => {
          window.scroll({
            top: this.$refs.modal.$el.offsetTop + this.$refs.modal.$el.offsetHeight,
            behavior: 'smooth',
          })
        })
      } else {
        this.$refs.modal.$el.style.left =
          eventClick.target.getBoundingClientRect().left -
          this.$refs.calendar.getBoundingClientRect().left +
          'px'
      }
    },
    format(date, formatType) {
      return format(new Date(date), formatType)
    },
    isWithinInterval(date, startDate, endDate) {
      startDate = parseISO(startDate)
      endDate = parseISO(endDate)

      if (endDate.getMinutes() === 0) {
        endDate = new Date(endDate.getTime() - 1000 * 60)
      }

      return isWithinInterval(date, { start: startDate, end: endDate })
    },
    isSameDay(dateA, dateB) {
      return isSameDay(parseISO(dateA), parseISO(dateB))
    },
    isSameHour(dateA, dateB) {
      return isSameHour(parseISO(dateA), parseISO(dateB))
    },
    checkColor(value) {
      const arrayColorWhite = ['#E64848', '#350756', '#01AFAA', '#5C2E91']
      return arrayColorWhite.indexOf(value) > -1 ? '#fff' : 'rgba(0,0,0,0.7)'
    },
    closeEventModal() {
      this.eventModal = false
    },
    removeEvent(eventId) {
      this.$emit('deleteEvent', eventId)
      this.closeEventModal()
    },
    loadEventUpdate(eventId) {
      this.$emit('loadEventUpdate', eventId)
      this.closeEventModal()
    },
    getEventColor(event) {
      if (!event) return '#fff'
      else return event.color
    },
  },
  created() {
    this.eventsOrdered = this.orderEventsByDuration(this.events.slice(0))
    this.generateCalendar()
  },
  mounted() {
    let localeString = this.$i18n.locale.replace(/-\w*/g, (string) =>
      string.replace('-', '').toUpperCase()
    )
    this.locale = require('date-fns/locale')[localeString]
    this.$emit('mounted')
  },
}
</script>

<template>
  <div
    ref="calendar"
    class="calendar clearfix"
    :class="{ 'has-events': events.length, 'calendar-weekly': weekly }"
  >
    <div class="calendar-inner-wrapper">
      <template v-if="!weekly">
        <div class="calendar-days-week">
          <div
            v-for="(dayWeekName, index) in weekDayNames"
            class="calendar-day-week-name"
            :key="index"
          >
            {{ !$media.mobile ? dayWeekName : dayWeekName.substring(0, 3) }}
          </div>
        </div>
        <div class="calendar-days-month">
          <div
            v-for="(week, weekIndex) in calendar"
            :key="`calendar-week-${weekIndex}`"
            class="calendar-week"
          >
            <div
              v-for="(day, index) in week"
              :key="`calendar-day-${index}`"
              class="calendar-day"
              :class="[
                {
                  'is-other-month': day.isOtherMonth,
                  'is-today': day.isToday,
                  'is-active': day.isActive,
                  'is-in-range': day.isInRange,
                  'is-weekend': day.isWeekend,
                  'is-zooming': day === openedZoom,
                  'is-disabled': readOnly,
                },
              ]"
              @click="onClickDay(day.date, true)"
            >
              <div class="calendar-day-container">
                <span class="calendar-day-number">{{ format(day.date, 'dd') }}</span>
                <span
                  v-if="addEventLabel && day.events.length === 0 && !readOnly"
                  class="calendar-day-add-event-label"
                >
                  {{ addEventLabel }}
                </span>
                <div
                  v-if="day.events.length"
                  class="calendar-day-events"
                >
                  <template v-for="(event, index) in day.events">
                    <template v-if="day.events.length < 3 || index < 2 || openedZoom === day">
                      <span
                        :key="index"
                        class="calendar-event"
                        :class="[
                          {
                            'is-starting': isSameDay(day.date, event.startDate),
                            'is-ending': isSameDay(day.date, event.endDate),
                          },
                          `slot-${index + 1}`,
                        ]"
                        :style="{
                          backgroundColor: getEventColor(event),
                          color: checkColor(event.color),
                        }"
                        @click.stop="openEvent(event, $event)"
                      >
                        {{ event.title }}
                      </span>
                    </template>
                  </template>
                  <a
                    v-if="day.events.length > 2 && day !== openedZoom"
                    href="#"
                    class="calendar-event-btn-more"
                    @click.stop="openZoom(day)"
                  >
                    {{
                      !$media.mobile
                        ? $t('global:calendar.see.more', { num: day.events.length - 2 })
                        : $t('global:calendar.more', { num: day.events.length - 2 })
                    }}
                  </a>
                </div>
                <action
                  v-if="day === openedZoom"
                  type="button"
                  icon="close"
                  icon-size="medium"
                  class="calendar-event-btn-close"
                  @click.stop="closeZoom()"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="(day, dayindex) in calendar[0]"
          :key="`calendar-day-week-${dayindex}`"
          class="calendar-day-week"
          :class="[
            {
              'is-other-month': day.isOtherMonth,
              'is-today': day.isToday,
              'is-active': day.isActive,
              'is-in-range': day.isInRange,
              'is-weekend': day.isWeekend,
            },
          ]"
        >
          <div class="calendar-day-week-header">
            {{ getWeekdayNamesByIndex(dayindex).substring(0, 3) }} {{ format(day.date, 'dd/MM') }}
          </div>
          <div class="calendar-event-all-day">
            <div
              v-if="dayindex === 0"
              class="calendar-day-week-label"
            >
              {{ $t('global:calendar.event.day.all') }}
            </div>
            <div
              v-for="(n, index) in tempMaxEvents"
              :key="`calendar-day-week-slot-${index}`"
              class="calendar-day-week-slot"
              :class="{ 'is-disabled': readOnly }"
              @click="onClickDay(day.date, true)"
            >
              <template v-for="(event, index) in day.eventsAllDay">
                <span
                  v-if="event.index === n"
                  :key="`calendar-day-week-event-${index}`"
                  class="calendar-day-week-event"
                  :class="{
                    'is-starting': isSameDay(day.date, event.startDate),
                    'is-ending': isSameDay(day.date, event.endDate),
                  }"
                  :style="{
                    backgroundColor: event.color,
                    color: checkColor(event.color),
                    width: isSameDay(day.date, event.startDate)
                      ? getLimitWidth(event.startDate, event.endDate)
                      : '',
                  }"
                  @click.stop="openEvent(event, $event)"
                >
                  <template v-if="isSameDay(day.date, event.startDate) || dayindex === 0">
                    {{ event.title }}
                  </template>
                </span>
              </template>
              <span
                v-if="addEventLabel && !readOnly"
                class="calendar-day-add-event-label"
                >{{ addEventLabel }}</span
              >
            </div>
          </div>
          <div class="calendar-event-hour-list">
            <template v-for="(dateTime, index) in day.hours">
              <div
                v-if="dayindex === 0"
                :key="`calendar-day-week-label-${index}`"
                class="calendar-day-week-label"
              >
                {{ format(dateTime, 'HH:mm') }}
              </div>
              <div
                v-if="day.hours.length"
                :key="index"
                class="calendar-day-week-slot"
                :class="{ 'is-disabled': readOnly }"
                :data-length="day.events24hour.length"
                @click="onClickDay(dateTime, false)"
              >
                <template v-for="(event, index) in day.events24hour">
                  <span
                    v-if="isWithinInterval(dateTime, event.startDate, event.endDate)"
                    :key="`calendar-day-week-event-${index}`"
                    class="calendar-day-week-event"
                    :class="[
                      `slot-${event.index}`,
                      {
                        'is-starting': isSameHour(dateTime, event.startDate),
                        'is-ending': isSameHour(dateTime, event.endDate),
                        'is-overlaping': checkOverlap(day.events24hour),
                      },
                    ]"
                    :style="{
                      backgroundColor: event.color,
                      color: checkColor(event.color),
                      height: isSameHour(dateTime, event.startDate)
                        ? getLimitHeight(event.startDate, event.endDate)
                        : 'inherit',
                    }"
                    @click.stop="openEvent(event, $event)"
                  >
                    <template v-if="isSameHour(dateTime, event.startDate)">
                      <span class="calendar-day-week-event-hour"
                        >{{ format(event.startDate, 'HH:mm') }} -
                        {{ format(event.endDate, 'HH:mm') }}</span
                      >
                      <span class="calendar-day-week-event-title">{{ event.title }}</span>
                    </template>
                  </span>
                </template>
                <span
                  v-if="addEventLabel && !readOnly"
                  class="calendar-day-add-event-label"
                  >{{ addEventLabel }}</span
                >
              </div>
            </template>
          </div>
        </div>
      </template>

      <CalendarEventDetail
        v-show="eventModal"
        ref="modal"
        v-click-outside="closeEventModal"
        :style="{ borderColor: getEventColor(eventModalDetail) }"
        :event-details="eventModalDetail"
        :close-event-modal="closeEventModal"
        :read-only="readOnly"
        @updateEvent="loadEventUpdate"
        @removeEvent="removeEvent"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import 'Calendar.scss';
</style>
