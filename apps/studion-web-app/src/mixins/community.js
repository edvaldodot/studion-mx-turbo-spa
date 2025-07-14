export const communityMixin = {
  methods: {
    getTabs () {
      return [
        {
          text: 'community:tab.link.5',
          location: {name: 'community.sessions'},
          disabled: !(this.notEqualsProfile('student') && this.canRead('sessions'))
        },
        {
          text: 'community:tab.link.1',
          location: {name: 'community.users'},
          disabled: !(this.notEqualsProfile('student') && this.canRead('users'))
        },
        {
          text: 'community:tab.link.2',
          location: {name: 'community.profiles'},
          disabled: !(this.notEqualsProfile('student') && this.canRead('profiles'))
        },
        {
          text: 'community:tab.link.3',
          location: {name: 'community.groups'},
          disabled: !(this.notEqualsProfile('student') && this.canRead('groups')) || this.$isHiddenFeature('groups')
        },
        {
          text: 'community:tab.link.4',
          location: {name: 'community.metadata'},
          disabled: !(this.notEqualsProfile('student') && this.canRead('metadata'))
        }
      ]
    }
  }
}
