<script>
import { mapState } from 'vuex'
import { parseTools } from '@/support/utils/tools'
import { format, parseISO } from 'date-fns'

import configControlViewMixin from '@/mixins/configControlView'

import EnrollmentsDatatable from './EnrollmentsDatatable'
import Icon from '@/components/general/Icon'

export default {
  name: 'SessionCardContent',

  components: {
    EnrollmentsDatatable,
    Icon,
  },

  mixins: [configControlViewMixin],

  props: {
    certification: String,

    description: String,

    duration: String,

    endDate: String,

    startDate: String,

    technicalRequirements: String,

    workload: String,

    availableTools: {
      type: Array,
      default: () => []
    },

    reenrollmentEnabled: {
      type: Boolean,
      default: false
    },

    enrollmentsList: {
      type: Array,
      default: () => []
    },
    currentEnrollment: {
      type: Object,
      default: null
    },
  },

  computed: {
    ...mapState(['language']),
    formatedDescription () {
      const regexBr = /(\r\n|\n\r|\r|\n)/g
      return this.description ? this.description.replace(regexBr, '<br/>') : ''
    },
    showEnrollmentsTable () {
      return this.enrollmentsList.length > 0 && this.equalsProfile('student')
    },

    showWorkload() {
      return this.config_showWorkload && this.workload
    },

    showDuration() {
      return this.config_showDuration && this.duration
    },
  },

  methods: {
    splitDurationTime (date) {
      let charPattern = /\D/g
      let numberPattern = /\d+/g
      return {
        type: date.match(charPattern)[0],
        value: date.match(numberPattern)[0]
      }
    },

    getToolsAlias (alias) {
      if (alias in parseTools) alias = parseTools[alias]
      var re = /[A-Z]/g
      if (alias.match(re)) {
        return alias.replace(re, '.$&').toLowerCase()
      }
      return alias
    },

    /**
     * @returns {string}
     */
    getBrowserLanguage () {
      const navigator = window && window.navigator
      return navigator.language || 'pt-BR'
    },

    getConjunctionPhrase () {
      const language = this.language || this.getBrowserLanguage()

      const words = []

      if (this.startDate) {
        words.push(this.$t('global:form.start'))
      }

      if (this.endDate) {
        words.push(this.$t('global:form.closure'))
      }

      const formatter = new Intl.ListFormat(language, { style: 'long', type: 'conjunction' })
      return formatter.format(words)
    },

    formatDate (date) {
      if (!date) return
      return format(parseISO(date), 'dd/MM/yyyy HH:mm')
    },

    downloadPreviousCertificate (hash) {
      this.$emit('downloadPreviousCertificate', hash)
    },
  },
}
</script>

<template>
  <div>
    <div class="session-card-content separator">
      <div class="session-card-content-block" v-if="showWorkload || showDuration || certification">
        <div class="session-card-content-container">
          <div class="session-card--left-wrapper">
            <div class="session-card-content__info" v-if="showWorkload">
              <strong>{{ $t("global:solution.workload") }} </strong>
              <div>
                <icon name="clock" />
                <p>
                  {{ formatVisualTime(splitDurationTime(workload)) }}
                </p>
              </div>
            </div>

            <div class="session-card-content__info" v-if="showDuration">
              <strong>{{ $t("global:solution.duration") }}</strong>
              <div>
                <icon name="hourglass" />
                <p>
                  {{ getDurationText(duration) }}
                </p>
              </div>
            </div>

            <div class="session-card-content__info" v-if="certification">
              <strong>{{ $t("global:solution.certification") }}</strong>
              <div>
                <icon name="school-hat" />
                <p>{{ certification }}</p>
              </div>
            </div>
          </div>
          <div class="session-card--right-wrapper">
            <div class="session-card-content__info" v-if="currentEnrollment">
              <strong>{{ $t("global:solution.status.started") }}</strong>
              <div>
                <icon name="calendar" />
                <p>
                  {{ currentEnrollment.userFirstAccess ? formatDate(currentEnrollment.userFirstAccess) : '-' }}
                </p>
              </div>
            </div>
            <div class="session-card-content__info" v-if="currentEnrollment">
              <strong>
                {{
                  currentEnrollment.statusAlias === 'aprovado' ?
                    $t("mediation:scheduled.action.filter.sending_without_error")
                  :
                    $t("community.sessions.add:completion.expected.date")
                }}
                </strong>
              <div>
                <icon name="calendar-check" />
                <p>
                  {{
                    currentEnrollment.statusAlias === 'aprovado' ?
                      formatDate(currentEnrollment.statusUpdatedAt)
                    :
                      currentEnrollment.userFirstAccess ? formatDate(addTimeToDate(duration, currentEnrollment.userFirstAccess)) : '-'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="session-card--right-wrapper session-card-content-block flex" v-if="startDate || endDate">
        <div class="session-card-content__info mr-4" v-if="startDate">
          <strong>
            {{ $t('global:form.start')}}
            </strong>
          <div>
            <icon name="calendar" />
            <p>
              {{ formatDate(startDate) }}
            </p>
          </div>
        </div>
        <div class="session-card-content__info" v-if="endDate">
          <strong>
            {{ $t('global:form.closure')}}
            </strong>
          <div>
            <icon name="calendar-check" />
            <p>
              {{ formatDate(endDate) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="session-card-content">
      <div class="session-card-content-block" v-if="description">
        <h4 class="session-card-content-block-title">{{ $t("global:solution.description") }}</h4>
        <div class="session-card-content-block-description">
          <p v-html="formatedDescription"></p>
        </div>
      </div>

      <div class="session-card-content-block" v-if="technicalRequirements">
        <h4 class="session-card-content-block-title">{{ $t("global:solution.requirements") }}</h4>
        <div class="session-card-content-block-description">
          <p class="text-color">{{ technicalRequirements }}</p>
        </div>
      </div>

      <div class="session-card-content-block" v-if="availableTools">
        <h4 class="session-card-content-block-title">{{ $t("global:solution.tools") }}</h4>
        <div class="session-card-content-block-description">
          <ul>
            <li>{{ $t("solutions:tools.calendar") }}</li>
            <li v-for="(tool, index) in availableTools" :key="index">
              {{ $t(`solutions:tools.${getToolsAlias(tool.alias)}`) }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showEnrollmentsTable">
      <h4 class="session-card-content__enrollments-title">{{$t('classroom.list:session.previous.enrollments')}}</h4>

      <enrollments-datatable
        :enrollmentsList="enrollmentsList"
        @downloadCertificate="downloadPreviousCertificate"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "SessionCardContent.scss";
</style>