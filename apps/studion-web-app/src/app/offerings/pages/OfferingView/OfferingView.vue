<script>
import { mapActions, mapState } from 'vuex'
import { isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns'
import countBy from 'lodash/countBy'
import keys from 'lodash/keys'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Rating from '@/components/general/Rating'
import SolutionsItem from '@/app/offerings/components/SolutionsItem'

import DataTableAvailableSessions from './components/DataTableAvailableSessions'
import EnrollSection from './components/EnrollSection'

export default {
  name: 'OfferingView',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    DataTableAvailableSessions,
    EnrollSection,
    SolutionsItem,
    Rating,
    EmptyMessage: () => import('@/components/general/EmptyMessage'),
    ModalConfirm: () => import('@/components/general/ModalConfirm'),
    ModalResponsiveEnrollSession: () => import('./components/ModalResponsiveEnrollSession'),
    ModalOfferRegistration: () => import('./components/ModalOfferRegistration'),
  },

  data() {
    return {
      id: null,
      title: null,
      image: '',
      type: '',
      description: '',
      audience: '',
      programContent: '',
      payment: {},
      period: {},
      config: [],
      tag: '',
      courses: [],
      sessionName: '',
      sessionStartTime: null,
      sessionEndTime: null,
      modalCoursesActive: false,
      modalMessageActive: false,
      messageType: 'error',
      currentOffering: null,
      hasUserEnrollments: false,
      hasUserEnrollmentsInProgress: false,
      hasAllUserEnrollmentsCanceled: false,
      redirectToSessionUuid: null,
      configSelected: null,
      certificateOptions: [
        {
          label: this.$t('solutions.create:form.certificate.option.1'),
          value: 2,
        },
        {
          label: this.$t('solutions.create:form.certificate.option.2'),
          value: 1,
        },
        {
          label: this.$t('solutions.create:form.certificate.option.3'),
          value: 0,
        },
      ],
      ratingAnalysis: null,
      userRating: null,
      isOpenModalConfirmEnrollmentCancel: false,
    }
  },

  computed: {
    ...mapState(['Account', 'accessibility', 'fetching']),
    offeringIsPaid() {
      return this.payment.paid
    },
    userHasSelectedConfig() {
      return this.configSelected !== null
    },
    offeringIsAvailable() {
      if (this.period && this.period.type) {
        return this.period.type === 'continuous'
          ? isAfter(new Date(), new Date(this.period.initialRaw))
          : isWithinInterval(new Date(), {
              start: new Date(this.period.initialRaw),
              end: new Date(this.period.finalRaw),
            })
      }

      return true
    },
    showProgramContent() {
      return this.courses.length > 0 && this.programContent && this.$isEnabledFeature('bidding')
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student')
    },
    getEmbed() {
      return this.equalsProfile('student')
        ? 'user_rating,rating_analysis,bidding_meta'
        : 'rating_analysis,bidding_meta'
    },
    showCancelEnrollmentButton() {
      return (
        this.equalsProfile('student') &&
        this.hasUserEnrollmentsInProgress &&
        this.$isEnabledFeature('bidding')
      )
    },
    showGoToClassroomButton() {
      if (this.notEqualsProfile('student')) return true

      if (this.$isEnabledFeature('bidding') && this.hasUserEnrollments) {
        return !this.hasAllUserEnrollmentsCanceled
      }

      return this.hasUserEnrollments
    },
    startDatePast() {
      if (!this.sessionStartTime) return false
      let today = new Date()
      let startDate = new Date(this.sessionStartTime)
      return startDate <= today
    },
    availableSession() {
      if (this.hasWriteAccess) return this.config

      return this.config.filter((session) => {
        if (!session.uuid || !session.vacancyAvailable) return false
        if (!session.enrollmentStartDate) return true

        const startDate = new Date(session.enrollmentStartDate)
        const endDate = session.enrollmentEndDate ? new Date(session.enrollmentEndDate) : null
        const dateNow = Date.now()

        return isAfter(dateNow, startDate) && (endDate === null || isBefore(dateNow, endDate))
      })
    },
  },

  created() {
    this.setFetching(true)
    this.attemptOfferingRetrieval({
      offeringId: this.$route.params.id,
      params: {
        embed: this.getEmbed,
      },
    })
      .then(({ data }) => {
        this.id = data.id
        this.title = data.title
        this.image = data.image
        this.type = data.meta.sessionType
        this.description = data.description
        this.programContent = data.meta.data.programContent || ''
        this.audience = data.audience
        this.period = {
          initial: this.formatDate(data.period.initial),
          initialRaw: data.period.initial,
          final: this.formatDate(data.period.final),
          finalRaw: data.period.final,
          type: data.period.type,
        }
        this.payment = data.paymentInfo
        this.ratingAnalysis = data._embedded && data._embedded.rating_analysis
        this.userRating = data._embedded && data._embedded.user_rating

        this.config = data.meta.configs.map((item) => {
          return {
            name: item.name,
            uuid: item.uuid,
            period: {
              initial: item.start_date ? item.start_date : null,
              final: item.end_date ? item.end_date : null,
            },
            enrollmentStartDate: item.enrollmentStartDate,
            vacancyAvailable: item.vacancy_available,
            enrollmentEndDate: item.enrollmentEndDate,
            type: data.meta.sessionType,
            courses: item.courses || [],
            published: data.published,
          }
        })

        if (data.meta.courses.length) {
          this.setFetching(true)
          this.attemptOfferingCoursesRetrieval({
            offeringId: this.id,
            params: {
              embed: `${this.getEmbed}${this.$isEnabledFeature('course_metas') ? ',meta' : ''}`,
            },
          })
            .then(({ data }) => {
              this.courses = data.data
                .map((item) => {
                  const embedded = item['_embedded'] || {}

                  const regexBr = /(\r\n|\n\r|\r|\n)/g

                  let dataItem = {
                    id: item['course_id'],
                    name: item['course_name'],
                    image: item['course_image'],
                    description: item['course_description']
                      ? item['course_description'].replace(regexBr, '<br/>')
                      : '',
                    technical_requirements: item['course_technical_requirements'],
                    certification:
                      item['course_certificate_type'] !== null
                        ? this.certificateOptions.find(
                            (option) => option.value === item['course_certificate_type']
                          ).label
                        : null,
                    available_tools: JSON.parse(item['course_available_tools']),
                    workload: {
                      type: item['course_workload_type'],
                      value: item['course_workload_value'],
                    },
                    duration: {
                      duration: item['course_duration'],
                      value: item['course_duration'].substring(
                        0,
                        item['course_duration'].length - 1
                      ),
                      type: item['course_duration'].slice(-1),
                    },
                    duration_type: item['course_duration'].slice(-1),
                    type: {
                      name: item['course_type_name'],
                      alias: item['course_type_alias'],
                    },
                    position: item['position'],
                    period: this.period,
                    ratingAnalysis: embedded['rating_analysis'],
                    userRating: embedded['user_rating'],
                    audience: embedded['bidding_meta'] && embedded['bidding_meta']['audience'],
                    programContent:
                      embedded['bidding_meta'] && embedded['bidding_meta']['program_content'],
                    metas: this.getMetas(embedded['meta']),
                    prerequisite: item['prerequisite'],
                  }

                  return dataItem
                })
                .sort((a, b) => a.position - b.position)

              if (this.equalsProfile('student')) {
                this.loadUserEnrollments()
              }

              this.tag =
                keys(countBy(this.courses, 'type')).length > 1
                  ? this.$t('solutions.type:blended')
                  : this.$t('solutions.type:' + this.courses[0].type.alias)
            })
            .finally(() => {
              this.setFetching(false)
            })
        }
      })
      .catch(() => {
        this.$router.push({ name: '404' })
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptOfferingRetrieval',
      'attemptOfferingCoursesRetrieval',
      'attemptOfferingEnrollment',
      'attemptOfferingUserEnrollments',
      'attemptCancelOfferingEnrollment',
    ]),
    checkEnroll() {
      if (this.availableSession.length > 1) {
        this.modalCoursesActive = true
      } else {
        this.enrollOnOffering(this.availableSession[0].uuid)
      }
    },
    enrollOnOffering(uuid) {
      this.modalCoursesActive = false
      this.setFetching(true)
      this.attemptOfferingEnrollment({ offeringId: this.id, configId: uuid })
        .then(({ data }) => {
          const firstKey = Object.keys(data)[0]
          const firstData = data[firstKey]
          this.sessionName = firstData.session_name
          this.sessionStartTime = firstData.start_time
            ? this.formatDate(firstData.start_time)
            : null
          this.sessionEndTime = firstData.end_time ? this.formatDate(firstData.end_time) : null
          if (firstData) {
            this.loadUserEnrollments().then(() => {
              this.modalMessageActive = true
              this.messageType = 'success-' + this.type
            })
          }
        })
        .catch(({ response }) => {
          if (response.data.message === 'no_vacancy_on_session') {
            return this.setFeedback({ message: 'offerings.view:error.no_vacancy_on_session' })
          }

          this.modalMessageActive = true
          this.messageType = 'error'
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    goToClassroom() {
      this.closeModalMessage()
      this.$nextTick(() => {
        if (this.redirectToSessionUuid !== null) {
          this.$router.push({
            name: 'classroom',
            params: { session_uuid: this.redirectToSessionUuid, offer_id: this.id },
          })
        } else {
          this.$router.push({ name: 'classroom.offerings.solutions', params: { id: this.id } })
        }
      })
    },
    closeModalCourses() {
      this.modalCoursesActive = false
      this.configSelected = null
    },
    closeModalMessage() {
      this.modalMessageActive = false
    },
    selectConfig(value) {
      this.configSelected = value
    },
    backOfferings() {
      this.closeModalMessage()
      this.$nextTick(() => {
        this.$router.push({ name: 'offerings.list' })
      })
    },
    formatDate(date) {
      return date ? this.$d(parseISO(date), 'short') : ''
    },
    loadUserEnrollments() {
      this.setFetching(true)
      return this.attemptOfferingUserEnrollments(this.$route.params.id)
        .then((response) => {
          this.hasUserEnrollments = response.data.length > 0
          this.hasUserEnrollmentsInProgress = response.data.some((enrollment) => {
            return enrollment.status_type_alias !== 'final'
          })
          this.hasAllUserEnrollmentsCanceled = response.data.every((enrollment) => {
            return enrollment.status_alias === 'desistente'
          })
          this.redirectToSessionUuid = response.data.length === 1 ? response.data[0].session : null
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    changeOfferRating(newRating) {
      this.ratingAnalysis = newRating.ratingAnalysis
      this.userRating = newRating.userRating
    },
    openModalConfirmEnrollmentCancel() {
      this.isOpenModalConfirmEnrollmentCancel = true
    },
    closeModalConfirmEnrollmentCancel() {
      this.isOpenModalConfirmEnrollmentCancel = false
    },
    async handleCancelUserEnrollment() {
      const result = await this.attemptCancelOfferingEnrollment(this.id)
      if (result) this.loadUserEnrollments()

      this.closeModalConfirmEnrollmentCancel()
    },
    getPrerequisite(item) {
      if (!item.prerequisite) return null

      const prerequisiteSolution = this.courses.find((course) => course.id === item.prerequisite)

      return this.$t('classroom.list:session.block.prerequisite', {
        solution: prerequisiteSolution.name,
      })
    },
    /**
     * Get all available fulfilled meta
     * @param {Object[]} metas
     */
    getMetas(metas) {
      if (!this.$isEnabledFeature('course_metas')) return null
      const auxMetaList = []

      metas.forEach((item) => {
        if (!item.value) {
          return
        }

        if (item.type === 'select' || item.type === 'multiple_select') {
          item.options = item.options.map((option) => {
            let propertyName = Object.keys(option.fields)[0]
            return {
              text: option.fields[propertyName],
              id: option.id,
            }
          })

          item.value = !Array.isArray(item.value)
            ? item.options.find((option) => option.id === item.value).text
            : item.value.map((value) => item.options.find((option) => option.id === value).text)
        }

        auxMetaList.push(this.deepClone(item))
      })

      return auxMetaList
    },
  },
}
</script>

<template>
  <div class="main-content offering-item">
    <ContentHeader
      :tag="tag"
      :title="title"
      :background="image"
      :back-text="$t('global:back')"
      :back-url="{ name: 'offerings.index' }"
      back
      fit-title
      background-blur
    >
      <ActionBar slot="actionbar" />
      <template slot="anything">
        <Rating
          :id="id"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
          resource-type="offering"
          dark
          show-quantity
          @rating-submited="changeOfferRating"
        />
      </template>
      <template
        v-if="availableSession.length"
        slot="anything"
      >
        <p
          v-if="type === 'open'"
          class="offer-header-info text-color"
        >
          {{ $t('offerings.view:header.info.open') }}
        </p>
        <p
          v-if="type === 'closed'"
          class="offer-header-info text-color"
        >
          {{ $t('offerings.view:header.info.closed') }}
        </p>
        <p
          v-if="type === 'individual'"
          class="offer-header-info text-color"
        >
          {{ $t('offerings.view:header.info.individual') }}
        </p>
        <p
          v-if="period.type === 'continuous'"
          class="offer-header-info text-color"
        >
          {{ $t('offerings.view:header.info.enroll.continuous', { 'start.date': period.initial }) }}
        </p>
        <p
          v-if="period.type !== 'continuous'"
          class="offer-header-info text-color"
        >
          {{
            $t('offerings.view:header.info.enroll.temporary', {
              'start.date': period.initial,
              'end.date': period.final,
            })
          }}
        </p>
      </template>
    </ContentHeader>

    <div class="mt-4">
      <div class="center">
        <div class="offer-content clearfix">
          <EnrollSection
            :payment="payment"
            :offering-is-available="offeringIsAvailable"
            :offering-is-paid="offeringIsPaid"
            :show-cancel-enrollment-button="showCancelEnrollmentButton"
            :show-go-to-classroom-button="showGoToClassroomButton"
            :available-session="availableSession"
            :audience="audience"
            @check:enroll="checkEnroll"
            @go:classroom="goToClassroom"
            @cancel:modal="openModalConfirmEnrollmentCancel"
          />

          <div
            v-if="courses.length > 0"
            class="offer-content-description"
          >
            <p class="text-color">{{ description }}</p>
          </div>
          <div
            v-if="showProgramContent"
            class="offer-content-programcontent"
          >
            <p class="offer-content-programcontent-title">
              {{ $t('offerings.view:offer.public.programContent') }}
            </p>
            <p v-html="programContent"></p>
          </div>
        </div>
        <div
          v-if="courses.length > 0"
          class="offer-solutions"
        >
          <h2 class="offer-solutions-title">{{ $t('offerings.view:offer.solution.title') }}</h2>
          <h3 class="offer-solutions-subtitle">
            {{ $t('offerings.view:offer.solution.subtitle') }}
          </h3>
          <div class="solutions-item-list">
            <SolutionsItem
              v-for="course in courses"
              :id="course.id"
              :key="course.id"
              :keep-open="courses.length == 1"
              :description="course.description"
              :certification="course.certification"
              :program-content="course.programContent"
              :available-tools="course.available_tools"
              :workload="course.workload"
              :duration="course.duration"
              :duration-type="course.duration_type"
              :name="course.name"
              :type="$t('solutions.type:' + course.type.alias)"
              :image="course.image"
              :technical-requirements="course.technical_requirements"
              :prerequisite-text="getPrerequisite(course)"
              :rating-analysis="course.ratingAnalysis"
              :user-rating="course.userRating"
              :audience="course.audience"
              :metas="course.metas"
            />
          </div>
        </div>
        <div
          v-else-if="!fetching"
          class="empty-offer-solutions"
        >
          <Action
            v-if="notEqualsProfile('student') && canWrite('offerings')"
            class="my-3"
            primary
            type="button"
            :text="$t('global:solution.btn.add')"
            :large="!$media.mobile"
            @click="$router.push({ name: 'offerings.solutions.edit', params: { id: id } })"
          />
          <EmptyMessage boxed>
            <h2>{{ $t('offerings.view.list:empty.message') }}</h2>
          </EmptyMessage>
        </div>
      </div>
      <div class="center">
        <div class="offer-solutions-sessions">
          <h2
            v-if="availableSession.length"
            class="offer-solutions-title"
          >
            {{ $t('offerings.view:offer.sessions.title') }}
          </h2>
          <div
            v-if="availableSession.length"
            class="sessions-item-list"
          >
            <DataTableAvailableSessions :items="availableSession" />
          </div>
          <div
            v-else-if="!fetching"
            class="empty-sessions"
          >
            <Action
              v-if="notEqualsProfile('student') && canWrite('offerings')"
              class="my-3"
              primary
              type="button"
              :text="$t('offerings.sessions.edit:form.submit')"
              :large="!$media.mobile"
              @click="$router.push({ name: 'offerings.sessions.edit', params: { id: id } })"
            />
            <EmptyMessage boxed>
              <h2>{{ $t('offerings.view.sessions:empty.message') }}</h2>
            </EmptyMessage>
          </div>
        </div>
      </div>
      <div class="center">
        <Rating
          :id="id"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
          resource-type="offering"
          inline
          show-quantity
          @rating-submited="changeOfferRating"
        />
      </div>
    </div>

    <ModalResponsiveEnrollSession
      :active="modalCoursesActive"
      :sessions="availableSession"
      :tag="tag"
      :title="title"
      @close="closeModalCourses"
      @enroll="enrollOnOffering"
    />

    <ModalOfferRegistration
      :show="modalMessageActive"
      :tag="tag"
      :title="title"
      :message-type="messageType"
      :session-name="sessionName"
      :session-start-time="sessionStartTime"
      :session-end-time="sessionEndTime"
      :start-date-past="false"
      @back:offerings="backOfferings"
      @go:classroom="goToClassroom"
    />

    <ModalConfirm
      :active="isOpenModalConfirmEnrollmentCancel"
      :title="$t('offerings.view:modal.confirm.enrollment.cancel.title')"
      @confirm="handleCancelUserEnrollment"
      @close="closeModalConfirmEnrollmentCancel"
    >
      <slot name="description">
        <p class="text-color">{{ $t('offerings.view:modal.confirm.enrollment.cancel.description') }}</p>
      </slot>
    </ModalConfirm>

    <RouterView />
  </div>
</template>

<style lang="scss">
@import '~@/app/offerings/styles.scss';
</style>
