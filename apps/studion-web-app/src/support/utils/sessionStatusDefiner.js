import { isAfter, isWithinInterval, parseISO } from 'date-fns'

export const getSessionStatus = (sessionType, startDate, effectiveEndTime) => {
  if (sessionType === 'open' && isAfter(new Date(), parseISO(startDate))) {
    return 'inprogress'
  }
  if (sessionType === 'individual') {
    return 'inprogress'
  }
  if (sessionType === 'closed' && isWithinInterval(new Date(), { start: new Date(startDate), end: new Date(effectiveEndTime) })) {
    return 'inprogress'
  }
  if (sessionType === 'closed' && isAfter(new Date(), parseISO(effectiveEndTime))) {
    return 'closed'
  }
  if ((sessionType === 'closed' || sessionType === 'open') && isAfter(parseISO(startDate), new Date())) {
    return 'waiting'
  }
}
