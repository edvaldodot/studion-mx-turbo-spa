import { useI18n } from 'vue-i18n'

export function useStatusTag() {
  const { t } = useI18n()

  function getStatusClass(status: string | boolean): string {
    const statusClasses: Record<string, string> = {
      published: 'published',
      draft: 'draft',
      inactive: 'inactive',
      true: 'active',
      false: 'inactive',
    }
    return statusClasses[String(status)] || 'inactive'
  }

  function getStatusText(status: string | boolean, isFemale = false): string {
    const statusKey = String(status)
    const statusTexts: Record<
      string,
      { default: string; female: string }
    > = {
      published: {
        default: t('global:published'),
        female: t('global:status.type.published.female'),
      },
      draft: {
        default: t('global:status.type.draft'),
        female: t('global:status.type.draft'),
      },
      inactive: {
        default: t('global:inactive'),
        female: t('global:status.type.inactive.female'),
      },
      false: {
        default: t('global:inactive'),
        female: t('global:status.type.inactive.female'),
      },
      true: {
        default: t('global:active'),
        female: t('global:status.type.active.female'),
      },
    }

    return statusTexts[statusKey]?.[isFemale ? 'female' : 'default'] || statusKey
  }

  return {
    getStatusClass,
    getStatusText,
  }
}
