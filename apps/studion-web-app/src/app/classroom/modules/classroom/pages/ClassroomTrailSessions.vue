<script>
import { mapActions, mapState } from 'vuex'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { certificateMixin } from '@/mixins/certificateMixin'
import sharedDataMixin from './sharedDataMixin'
import EmptyMessage from '@/components/general/EmptyMessage'
import Pagination from '@/components/general/Pagination'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'
import TrailSessionCard from '../components/ClassroomCard/TrailSessionCard'

const Rating = () => import('@/components/general/Rating')

export default {
  name: 'ClassroomTrailSessions',
  components: {
    EmptyMessage,
    Pagination,
    TrailSessionCard,
    Rating,
    ContentHeader,
    ActionBar,
  },
  mixins: [paginateMixin, sharedDataMixin, certificateMixin],
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.fromRoute = from.name
    })
  },
  props: {
    trailId: Number,
  },
  data() {
    return {
      fromRoute: '',
      ratingAnalysis: null,
      userRating: null,
      description: null,
      trail: null,
    }
  },
  computed: {
    ...mapState({
      Classroom: (state) => state.Classroom,
      accessibility: (state) => state.accessibility,
      userId: (state) => state.Account.user.id,
      currentTrailRating: (state) => state.Trails.currentTrailRating,
      trailSolutions: (state) => state.Trails.current.solutions,
    }),
    getTrailSolutionsEmbed() {
      return this.equalsProfile('student')
        ? 'user_rating,rating_analysis,progress'
        : 'rating_analysis,progress'
    },
    getFilter() {
      return {
        ...this.filterActiveItems,
        enrollments_status_type_alias: this.currentEnrollmentStatus,
        trail_id: this.trailId,
      }
    },
    getTrailEmbed() {
      return this.equalsProfile('student') ? 'user_rating,rating_analysis' : 'rating_analysis'
    },
    headerProps() {
      return this.trail !== null ? this.trail.props : {}
    },
    headerTitle() {
      return this.trail !== null ? this.trail.title : ''
    },
  },
  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
    currentTrailRating(newValue) {
      this.ratingAnalysis = newValue.ratingAnalysis
      this.userRating = newValue.userRating
    },
  },
  created() {
    this.setFetching(true)
    this.attemptTrailRetrieval({ trailId: this.trailId, params: { embed: this.getTrailEmbed } })
      .then(({ data }) => {
        const regexBr = /(\r\n|\n\r|\r|\n)/g
        this.description = data.description ? data.description.replace(regexBr, '<br/>') : ''
        this.setCurrentRating({
          ratingAnalysis: data._embedded.rating_analysis,
          userRating: data._embedded.user_rating,
        })

        this.trail = {
          title: data.name,
          description: '',
          backUrl:
            this.fromRoute === 'classroom.lessons.course' ? { name: 'classroom.trails' } : null,
          props: {
            background: data.image,
            backgroundBlur: true,
            back: true,
            id: data.id,
          },
        }
        this.$emit('changeHeader', {
          title: data.name,
          description: '',
          backUrl:
            this.fromRoute === 'classroom.lessons.course' ? { name: 'classroom.trails' } : null,
          props: {
            background: data.image,
            backgroundBlur: true,
            back: true,
            id: data.id,
          },
        })
        this.pgtrInitializePagination('trailSessionsResource', null, {
          filter: { trail_id: this.trailId },
          embed: this.getTrailSolutionsEmbed,
        })
      })
      .finally(() => {
        this.setFetching(false)
      })
  },
  destroyed() {
    this.$emit('changeHeader', null)
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptTrailRetrieval',
      'attemptMyselfDownloadCertificate',
      'setCurrentTrailRating',
    ]),
    downloadCertificate(certificateHash) {
      this.$downloadCertificate(this.attemptMyselfDownloadCertificate, certificateHash)
    },
    showTagAllFilters(value) {
      this.tagAllFilters = value
    },
    filterStatus(index) {
      this.activeTab = index
      this.currentEnrollmentStatus = index > 0 ? this.enrollmentStatus[index] : ''
    },
    setCurrentRating(newRating) {
      this.setCurrentTrailRating(newRating)
    },
  },
}
</script>

<template>
  <div>
    <ContentHeader
      class="header-admin"
      :title="headerTitle"
      v-bind="{ ...headerProps }"
      :small="false"
    >
      <ActionBar slot="actionbar" />
      <template slot="anything">
        <rating
          :id="trailId"
          show-quantity
          resource-type="trail"
          :rating-analysis="ratingAnalysis"
          :user-rating="userRating"
          @rating-submited="setCurrentTrailRating"
        />
      </template>
    </ContentHeader>
    <div class="main-content classroom h-full">
      <!-- search -->
      <empty-message v-if="trailSolutions.length === 0 && pgtrIsSearching">
        <h2>{{ $t('global:search.empty.title') }}</h2>
        <p class="text-color">{{ $t('global:search.empty.message') }}</p>
      </empty-message>

      <!-- Filters -->
      <empty-message v-if="trailSolutions.length === 0 && pgtrIsSearching && pgtrIsFiltering">
        <h2>{{ $t('classroom.list:filter.empty.title') }}</h2>
      </empty-message>

      <div class="old-center">
        <p
          class="trail-description"
          v-html="description"
        ></p>
        <h2 class="trail-solutions-title">{{ $t('classroom.list:trail.solutions.title') }}</h2>
        <h3 class="trail-solutions-subtitle">
          {{ $t('classroom.list:trail.solutions.subtitle') }}
        </h3>
        <TrailSessionCard
          v-for="session in trailSolutions"
          :id="session.id"
          :key="session.id"
          :to="{
            name: getClassroomRedirect(session),
            params: {
              session_uuid: session.session_uuid,
              trail_id: trailId,
              prerequisite: session.pathCoursePrerequisite
                ? session.pathCoursePrerequisite.course_name
                : null,
            },
          }"
          :image="session.course_image"
          :name="session.course_name"
          :duration="session.course_duration"
          :workload="session.course_workload"
          :prerequisite="
            session.pathCoursePrerequisite ? session.pathCoursePrerequisite.course_name : null
          "
          :allow-access="session.session_is_granted || notEqualsProfile('student')"
          :blocked-message="getBlockMessage(session)"
          :enrollment-status="session.status_alias"
          :certificate-hash="session.certificate_hash"
          :certificate-issued-at="session.certificate_issued_at"
          :rating-analysis="session._embedded.rating_analysis || null"
          :user-rating="session._embedded.user_rating || null"
          :course-id="session.course_id"
          :downloaded="!!session.certificateDownloadedAt"
          :progress="equalsProfile('student') ? session._embedded.progress : null"
          @downloadCertificate="downloadCertificate"
        />

        <pagination
          :activePage="pgtrParams.page"
          :pageCount="pgtrLastPage"
          @next-page="pgtrParams.page++"
          @previous-page="pgtrParams.page--"
          @first-page="pgtrParams.page = 1"
          @last-page="pgtrParams.page = pgtrLastPage"
          @go-to-page="pgtrParams.page = $event"
          @change-items-per-page="pgtrParams.limit = $event"
        />
      </div>
    </div>
  </div>
</template>
