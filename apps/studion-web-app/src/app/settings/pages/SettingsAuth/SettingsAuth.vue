<script>
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'

export default {
  name: 'settingsAuth',
  mixins: [settingsMixin],
  components: {
    Action,
    ActionBar,
    Checkbox,
    ContentHeader,
    Datatable,
    Icon,
  },
  data () {
    return {
      providers: [],
      register: [
        {
          name: 'settings.auth:register',
          alias: 'allow_register',
          active: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    hasWriteAccess () {
      return this.notEqualsProfile('student') && this.canWrite('settings')
    },
    hasReadAccess () {
      return this.notEqualsProfile('student') && this.canRead('settings')
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptInstanceSettingsRetrieval',
      'attemptUpdateInstanceSettings'
    ]),
    save () {
      this.setFetching(true)
      let formData = {
        providers: {}
      }
      this.register.forEach(function (item) {
        formData[item.alias] = item.active | 0
      })
      this.providers.forEach(function (item) {
        formData.providers[item.alias] = item.active | 0
      })
      this.attemptUpdateInstanceSettings(formData)
        .then((response) => {
          this.setFeedback({ message: this.$t('settings.auth:feedback.save.success') })
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },
  created () {
    if (!this.hasReadAccess) {
      this.$router.push({name: 'dashboard'})
    }
    this.setFetching(true)
    this.attemptInstanceSettingsRetrieval()
      .then((response) => {
        this.register.forEach(function (value) {
          value.active = response.data[value.alias]
        })
        this.providers = response.data.providers.map(item => {
          return {
            name: item.name,
            alias: item.alias,
            active: item.enabled
          }
        })
      }).finally(() => {
        this.setFetching(false)
      })
  }
}
</script>

<template>
  <div class="main-content  settings">
    <content-header :title="$t('settings:header.title')" :description="$t('settings:header.description')" class="header-admin">
      <action-bar slot="actionbar"></action-bar>
    </content-header>
    <form @submit.prevent="save" class="config-form">
      <div class="form-section">
        <h2 class="config-form-title">{{ $t('settings.auth:external.title') }}</h2>
        <p class="text-color">{{ $t('settings.auth:external.description') }}</p>
        <datatable :items="providers" :dark="accessibility">
          <template slot="tbody" slot-scope="props">
            <tr class="tr-simple">
              <td class="td">
                <span class="td-text">{{ props.item.name }}</span>
              </td>
              <td class="td" width="35">
                <checkbox :disabled="!hasWriteAccess" :items="[{value: true}]" v-model="props.item.active" switch-type :dark="accessibility"></checkbox>
              </td>
            </tr>
          </template>
        </datatable>
      </div>
      <div class="form-section">
        <h2 class="config-form-title">{{ $t('settings.auth:register.title') }}</h2>
        <p class="text-color">{{ $t('settings.auth:register.description') }}</p>
        <datatable :items="register" :dark="accessibility">
          <template slot="tbody" slot-scope="props">
            <tr class="tr-simple">
              <td class="td">
                <span class="td-text">{{ $t(props.item.name) }}</span>
              </td>
              <td class="td" width="35">
                <checkbox :disabled="!hasWriteAccess" :items="[{value: true}]" v-model="props.item.active" switch-type :dark="accessibility"></checkbox>
              </td>
            </tr>
          </template>
        </datatable>
      </div>
      <div class="form-submit text-center">
        <action v-if="hasWriteAccess" :text="$t('global:form.save')" type="button" primary large submit fixed-width></action>
      </div>
    </form>
  </div>
</template>

<style lang="scss">@import "~@/app/settings/styles.scss";</style>
