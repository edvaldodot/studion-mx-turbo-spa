import i18n from '@/support/i18n'

/**
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
export const sortCriteria = (a, b) => {
  return a.criteria === 'user.ignoreRules()' ? -1 : b.criteria === 'user.ignoreRules()' ? 1 : 0
}

export const mapAccessOptions = isCurrentCourseHybrid => ({ id, alias, criteria }) => {
  const normalizedAlias = alias.replace(/_/g, '.')
  let label = ''

  if (normalizedAlias === 'if.session.ended.allow.just.approved.status') {
    const status = isCurrentCourseHybrid
      ? i18n.t('global:solution.status.realizado')
      : i18n.t('global:solution.status.aprovado')
    label = i18n.t(`solutions.create.requirements:${normalizedAlias}`, { status: (status || '').toLowerCase() })
  } else {
    label = i18n.t(`solutions.create.requirements:${normalizedAlias}`)
  }

  return {
    value: id,
    label,
    criteria: criteria,
    disabled: false,
    unique: criteria === 'user.ignoreRules()',
    alias: alias
  }
}

export const mapEnrollOption = ({ id, alias, criteria }) => ({
  value: id,
  label: i18n.t(`solutions.create.requirements:${alias.replace(/_/g, '.')}`),
  criteria: criteria,
  disabled: false,
  unique: criteria === 'user.ignoreRules()',
  alias: alias
})

export const mapCertificateOptions = ({ id, alias, criteria }) => ({
  value: id,
  label: i18n.t(`solutions.create.requirements:${alias.replace(/_/g, '.')}`),
  criteria: criteria,
  disabled: false,
  unique: criteria === 'user.ignoreRules()',
  alias: alias
})
