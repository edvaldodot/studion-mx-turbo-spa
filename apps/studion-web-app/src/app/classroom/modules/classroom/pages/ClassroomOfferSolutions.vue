<script>
import { mapState, mapActions } from 'vuex'
import { certificateMixin } from '@/mixins/certificateMixin'
import SessionList from '../components/SessionList'
import sharedDataMixin from './sharedDataMixin'
import ContentHeader from '@/components/general/ContentHeader'
import ActionBar from '@/components/general/ActionBar'

export default {
  name: 'ClassroomOfferSolutions',

  components: {
    SessionList,
    ContentHeader,
    ActionBar,
  },

  mixins: [certificateMixin, sharedDataMixin],

  props: {
    id: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      solutionList: [],
      headerProps: null,
    }
  },

  computed: {
    ...mapState({
      Offerings: (state) => state.Classroom.offerings,
      User: (state) => state.Account.user,
    }),
  },

  created() {
    this.setupOffering()
    if (this.equalsProfile('student')) this.setupStudent()
  },

  destroyed() {
    this.$emit('changeHeader', null)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptOfferingUserEnrollmentsEmbed',
      'attemptOfferingRetrieval',
    ]),

    /**
     * @description Call user enrollment action
     */
    setupStudent() {
      this.setFetching(true)
      this.attemptOfferingUserEnrollmentsEmbed({
        offeringId: this.id,
        params: {
          embed: 'user_rating,rating_analysis,progress',
        },
      })
        .then(({ data }) => {
          this.solutionList = data.sort((a, b) => a.position - b.position)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @description Setup offering header, get offering if isn't on state
     */
    setupOffering() {
      let currentOffering = this.Offerings.find((offering) => offering.id === this.id)
      if (currentOffering) return this.changeHeader(currentOffering)

      this.setFetching(true)
      return this.attemptOfferingRetrieval({ offeringId: this.id })
        .then(({ data }) => {
          this.changeHeader(data)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    /**
     * @description Set offering data in header
     */
    changeHeader(data) {
      this.headerProps = {
        title: data.title,
        backUrl: { name: 'classroom.offerings' },
        props: {
          background: data.image,
          backgroundBlur: true,
          back: true,
        },
      }
    },
  },
}
</script>

<template>
  <div>
    <ContentHeader
      class="header-admin"
      :title="headerProps.title"
      v-bind="{ ...headerProps.props }"
      :back-url="headerProps.backUrl"
      :small="false"
    >
      <ActionBar slot="actionbar" />
    </ContentHeader>
    <div class="classroom-offering-sessions old-center">
      <SessionList
        :default-filter="{ offering_id: id, teams_profile_id: User.currentProfileId }"
        from-offer-solutions
      />
    </div>
  </div>
</template>
