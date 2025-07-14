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

const formatScheduleBlockDates = (scheduleBlock) => {
  const dateFormat = 'yyyy-MM-dd HH:mm:ss'
  const fullDates = {
    start_date_at: format(new Date(scheduleBlock.start_date_at), dateFormat),
    end_date_at: format(new Date(scheduleBlock.end_date_at), dateFormat),
    repeat_ends_at: scheduleBlock.repeat_ends_at ? format(new Date(scheduleBlock.repeat_ends_at), 'yyyy-MM-dd') : null
  }
  return fullDates
}

const toSnakeCase = (scheduleBlock) => {
  const {id, startDateAt, endDateAt, frequency, interval, byDay, repeatEndsAt, sessionId} = scheduleBlock
  return {
    session_id: sessionId,
    id,
    start_date_at: startDateAt,
    end_date_at: endDateAt,
    frequency,
    interval: interval ? interval : 1,
    repeat_ends_at: repeatEndsAt,
    by_day: byDay
  }
}

/**
 * Parse ScheduleBlocks to match with backend format
 * @param {Array[ScheduleBlock]} scheduleBlocks
 * @returns {Array}
 */
export const parseScheduleBlock = (scheduleBlocks) => {
  return scheduleBlocks.map(block => {
    const snakeCaseBlock = toSnakeCase(block)
    const fullDates = formatScheduleBlockDates(snakeCaseBlock)
    return {...snakeCaseBlock, ...fullDates}
  })
}

export const scheduleBlocksSort = (a, b) => {
  const aDate = new Date(a.endDateAt)
  const bDate = new Date(b.endDateAt)
  return aDate - bDate
}

export const checkDuplicates = (current, list) => {
  return list.some((existingBlock) => {
    return (
      new Date(existingBlock.startDateAt).getTime() === new Date(current.startDateAt).getTime() &&
      new Date(existingBlock.endDateAt).getTime() === new Date(current.endDateAt).getTime() &&
      existingBlock.frequency === current.frequency &&
      existingBlock.interval === current.interval &&
      new Date(existingBlock.repeatEndsAt).getTime() === new Date(current.repeatEndsAt).getTime()
    )
  })
}
