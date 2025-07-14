import config from '@/config'
const { KEYCLOAK_ENABLED } = config

export const settingsMixin = {
  computed: {
    tablinks () {
      const links = [
        {
          text: 'settings:tab.general',
          location: { name: 'settings.general' },
          disabled: !this.canRead('order_educational_resources')
        },
        {
          text: 'settings:tab.survey_nps',
          location: { name: 'settings.survey_nps' }
        },
        {
          text: 'settings:tab.auth',
          location: { name: 'settings.auth' }
        },
        {
          text: 'settings:tab.emails',
          location: { name: 'settings.notifications' },
          disabled: this.$isHiddenFeature('notifications')
        },
        {
          text: 'settings:tab.certificate',
          location: { name: 'settings.certificate' }
        },
        {
          text: 'settings:tab.dashboard',
          location: { name: 'settings.dashboard' }
        },
        {
          text: 'settings:tab.categories',
          location: { name: 'settings.categories' }
        },
        {
          text: 'settings:tab.branches',
          location: { name: 'settings.branches' },
          disabled: !(this.notEqualsProfile('student') && this.canRead('branches') && this.$isEnabledFeature('branching'))
        }
      ]

      if (KEYCLOAK_ENABLED) {
        const idx = links.findIndex(link => link.text === 'settings:tab.auth')
        links.splice(idx, 1)
      }

      return links
    }
  }
}
