<script>
import { mapActions, mapState } from 'vuex'
import { settingsMixin } from '@/mixins/settings'

import Accordion from '@/components/general/Accordion'
import AccordionItem from '@/components/general/AccordionItem'
import ActionBar from '@/components/general/ActionBar'
import Checkbox from '@/components/general/Checkbox'
import ContentHeader from '@/components/general/ContentHeader'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'

export default {
  name: 'settingsGamification',
  mixins: [settingsMixin],
  components: {
    Accordion,
    AccordionItem,
    ActionBar,
    Checkbox,
    ContentHeader,
    Datatable,
    Icon,
  },
  data () {
    return {
      itemGeneral: [
        {
          action: 'settings.gamification:action.general.1',
          points: 50,
          interval: 'settings.gamification:interval.once',
          active: true
        },
        {
          action: 'settings.gamification:action.general.2',
          points: 10,
          interval: 'settings.gamification:interval.hour',
          active: true
        },
        {
          action: 'settings.gamification:action.general.3',
          points: 5,
          interval: 'settings.gamification:interval.once',
          active: true
        },
        {
          action: 'settings.gamification:action.general.4',
          points: 5,
          interval: 'settings.gamification:interval.always',
          active: true
        },
        {
          action: 'settings.gamification:action.general.5',
          points: 5,
          interval: 'settings.gamification:interval.hour',
          active: true
        }
      ],
      itemRanking: [
        {
          action: 'settings.gamification:action.ranking.1',
          active: true
        },
        {
          action: 'settings.gamification:action.ranking.2',
          active: true
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
      'setFetching'
    ])
  },
  created () {
    if (!this.hasReadAccess) {
      this.$router.push({name: 'dashboard'})
    }
  }
}
</script>

<template>
  <div class="main-content  settings">

    <content-header :title="$t('settings:header.title')" :description="$t('settings:header.description')" class="header-admin">
      <action-bar slot="actionbar"></action-bar>
    </content-header>

    <div class="center">
      <div class="config-form">
        <h2 class="config-form-title">Ranking</h2>
        <form>
          <datatable :items="itemRanking" :dark="accessibility">
            <template slot="tbody" slot-scope="props">
              <tr class="tr-simple">
                <td class="td">
                  <span class="td-text">{{ $t(props.item.action) }}</span>
                </td>
                <td class="td" width="35">
                  <checkbox :disabled="!hasWriteAccess" :items="[{value: true}]" v-model="props.item.active" switch-type :dark="accessibility"></checkbox>
                </td>
              </tr>
            </template>
          </datatable>
        </form>
      </div>
      <accordion multiples card :headers="[{ text: $t('settings.gamification:accordion.title') }]" :dark="accessibility">
        <accordion-item :title="$t('settings.gamification:general')">
          <template slot="content">
            <datatable :items="itemGeneral" light :dark="accessibility">
              <template slot="thead" v-if="!$media.mobile">
                <tr>
                  <th class="th">{{ $t('settings.gamification:datatable.header.1') }}</th>
                  <th class="th">{{ $t('settings.gamification:datatable.header.2') }}</th>
                  <th class="th">{{ $t('settings.gamification:datatable.header.3') }}</th>
                  <th class="th"></th>
                </tr>
              </template>
              <template slot="tbody" slot-scope="props">
                <tr v-if="$media.mobile" class="tr-colspan tr-colspan-small">
                  <td class="td" colspan="2">
                    <span class="td-text bolder">{{ $t(props.item.action) }}</span>
                  </td>
                  <td class="td" width="40">
                    <checkbox :disabled="!hasWriteAccess" :items="[{value: true}]" v-model="props.item.active" switch-type :dark="accessibility"></checkbox>
                  </td>
                </tr>
                <tr>
                  <td class="td" v-if="!$media.mobile">
                    <span class="td-text">{{ $t(props.item.action) }}</span>
                  </td>
                  <td class="td">
                    <span class="td-text-header" v-if="$media.mobile">{{ $t('settings.gamification:datatable.header.2') }}</span>
                    <span class="td-text">{{ $tc('settings.gamification:points', props.item.points, {'num': props.item.points}) }}</span>
                  </td>
                  <td class="td">
                    <span class="td-text-header" v-if="$media.mobile">{{ $t('settings.gamification:datatable.header.3') }}</span>
                    <span class="td-text">{{ $t(props.item.interval) }}</span>
                  </td>
                  <td class="td" v-if="$media.mobile"></td>
                  <td class="td" v-if="!$media.mobile">
                    <checkbox :disabled="!hasWriteAccess" :items="[{value: true}]" v-model="props.item.active" switch-type :dark="accessibility"></checkbox>
                  </td>
                </tr>
              </template>
            </datatable>
          </template>
        </accordion-item>
      </accordion>
    </div>
  </div>
</template>

<style lang="scss">@import "~@/app/settings/styles.scss";</style>
