import i18n from '@/support/i18n'
import * as pbi from 'powerbi-client'

/**
 * @typedef PowerBiData
 * @property {Object} powerbi
 * @property {Object} models
 */

export const reportTypes = [
  {
    text: i18n.t('reports:type.powerbi'),
    value: 'powerbi',
  },
  {
    text: i18n.t('reports:type.holistics'),
    value: 'holistics',
  },
  {
    text: i18n.t('reports:type.pentaho'),
    value: 'pentaho',
  },
]

export const deleteFields = (object, fields) => {
  fields.forEach((field) => {
    delete object[field]
  })
}

/**
 * create Power BI service and models
 * @returns {PowerBiData}
 */
export const getPowerBiData = () => {
  const powerbi = new pbi.service.Service(
    pbi.factories.hpmFactory,
    pbi.factories.wpmpFactory,
    pbi.factories.routerFactory
  )
  const models = pbi.models
  return { powerbi, models }
}

export const makePaginatedReportItems = () => [
  {
    label: i18n.t('reports:paginated.report'),
    value: true,
  },
]

export const makeOpenOnEditModeItems = () => [
  {
    label: i18n.t('reports:open.edit.mode'),
    value: true,
  },
]

export const makeAdminOnlyVisibleItems = () => [
  {
    label: i18n.t('reports:admin.only'),
    value: true,
  },
]

export const makeAllProfilesAllowedItems = () => [
  {
    label: i18n.t('reports:all.profiles.allowed'),
    value: true,
  },
]

export const makeActiveReportItems = () => [
  {
    label: i18n.t('reports:active'),
    value: true,
  },
]

export const makeIsHighlightReportItems = () => [
  {
    label: i18n.t('reports:is_highlighted'),
    value: true,
  },
]
