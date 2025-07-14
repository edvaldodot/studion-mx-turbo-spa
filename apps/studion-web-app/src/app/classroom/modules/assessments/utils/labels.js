import i18n from '@/support/i18n'

export function getAttemptTriesLabel(attempt, tries) {
  return i18n.t('global:attempt') + (tries ? ` ${attempt}/${tries}` : ` ${attempt}`)
}

export function getLabelAttemptOfTries(attempts, tries) {
  if (tries === null || tries === 0) return attempts

  return i18n.t('classroom.assessments.evaluation:attempts', {
    num1: attempts || 0,
    num2: tries,
  })
}
