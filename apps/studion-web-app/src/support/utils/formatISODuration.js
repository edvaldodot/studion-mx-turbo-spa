import { formatDuration } from 'date-fns'
import { enUS, es, pt, ptBR, zhCN } from 'date-fns/locale'
import Duration from 'luxon/src/duration'

const localesArr = [[ 'en', enUS ], [ 'es', es ], [ 'pt', pt ], [ 'pt-br', ptBR ], [ 'zh-CN', zhCN ]]
const mapLocales = new Map(localesArr)

const options = {
  locale: mapLocales.get('pt-br')
}

export function durationToString (durationObject) {
  return formatDuration(durationObject, options)
}

export default function (durationISO) {
  let durationObject = Duration.fromISO(durationISO).toObject()

  return durationToString(durationObject)
}
