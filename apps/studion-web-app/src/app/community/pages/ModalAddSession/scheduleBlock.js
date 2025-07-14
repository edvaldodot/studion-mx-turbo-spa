/**
 * @typedef ScheduleBlock
 * @property {id} id
 * @property {string|Date} startDateAt
 * @property {string|Date} endDateAt
 * @property {string} frequency
 * @property {number} interval
 * @property {string} byDay
 * @property {string|Date} repeatEndsAt
 */

import { format } from 'date-fns'

export const getDefaultScheduleBlock = () => {
  return {
    id: null,
    start_date: new Date().toISOString(),
    start_time_at: '00:00',
    end_time_at: '23:59',
    frequency: null,
    interval: 1,
    by_day: [],
    repeat_ends_at: null,
  }
}

/**
 * convert DateFrequencyField Object to match ScheduleBlock Fields
 * @param {Object} dateFrequencyObject
 * @returns {ScheduleBlock}
 */
export const parseScheduleBlock = (dateFrequencyObject) => {
  const [startHours, startMinutes] = dateFrequencyObject.start_time_at.split(':')
  const [endHours, endMinutes] = dateFrequencyObject.end_time_at.split(':')
  const defaultDateTime = dateFrequencyObject.start_date + ' 00:00'

  const startDate = new Date(defaultDateTime)
  const endDate = new Date(defaultDateTime)

  startDate.setHours(startHours, startMinutes)
  endDate.setHours(endHours, endMinutes, 59)

  const repeatEndsAt = dateFrequencyObject.repeat_ends_at
    ? dateFrequencyObject.repeat_ends_at + ' 00:00'
    : null

  return {
    startDateAt: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
    endDateAt: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
    frequency: dateFrequencyObject.frequency,
    byDay: dateFrequencyObject.by_day.filter((item) => !!item),
    interval: dateFrequencyObject.interval,
    repeatEndsAt,
  }
}
