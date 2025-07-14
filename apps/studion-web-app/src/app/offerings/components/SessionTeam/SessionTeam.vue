<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import FormSection from '@/components/general/FormSection'
import SelectField from '@/components/general/SelectField'

import DatatableTeam from '@/components/shared/DatatableTeam'
import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'

export default {
  name: 'SessionTeam',

  props: {
    team: {
      type: Array,
      default: () => [],
    },

    teamValidation: {
      type: Object,
      default: () => {},
    },
  },

  components: {
    Action,
    Autocomplete,
    FormSection,
    SelectField,
    DatatableTeam,
  },

  data() {
    return {
      member: {
        profile_id: null,
        name: null,
        user_id: null,
        uuid: null,
      },
      profiles: [],
      autocompleteUser: null,
      autocompleteResults: [],
      autocompleteLoading: false,
    }
  },

  validations: {
    member: {
      profile_id: {
        required,
      },
      name: {
        required,
      },
    },
  },

  computed: {
    ...mapState(['accessibility', 'offerings']),
    hasPrimaryTeamMember() {
      return this.team.find((member) => member.position === SESSION_TEAM_OPTIONS[0].value)
    },
  },

  methods: {
    ...mapActions([
      'setFetching',
      'attemptProfilesByUser',
      'attemptListUsersNonStudentByName',
      'setFeedback',
    ]),

    getProfileName(value) {
      this.member.profile_name = this.profiles.filter((elem) => {
        return elem.value === value
      })[0].text
    },

    getUsersList(value) {
      if (value.length) {
        this.autocompleteLoading = true
        this.attemptListUsersNonStudentByName({
          userName: value,
          branchIds: this.offerings.current.branch ? [this.offerings.current.branch.id] : null,
        }).then(({ data }) => {
          this.autocompleteLoading = false
          this.autocompleteResults = data
            ? data.map(({ name, applicationUserId, uuid }) => ({
                name: name,
                id: applicationUserId,
                uuid: uuid,
              }))
            : []
        })
      }
    },

    selectUser() {
      if (this.autocompleteUser) {
        this.member.name = this.autocompleteUser[0].name
        this.member.user_id = this.autocompleteUser[0].id
        this.member.uuid = this.autocompleteUser[0].uuid
        this.getProfiles()
      } else {
        this.member.name = null
        this.member.user_id = null
        this.member.uuid = null
      }
    },

    getProfiles() {
      this.profiles = []
      this.setFetching(true)
      this.attemptProfilesByUser(this.member.uuid)
        .then(({ data }) => {
          this.profiles = data
            .filter(({ alias }) => alias !== 'student')
            .map(({ name, id }) => ({ text: name, value: id }))
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    addMember() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      let user = this.team.find((item) => item.user_id === this.member.user_id)
      if (user) {
        this.setFeedback({
          message: this.$t('offerings.sessions.edit:responsable.already.list'),
          type: 'error',
        })
      } else {
        const memberToAdd = this.deepClone(this.member)
        memberToAdd.position = SESSION_TEAM_OPTIONS[2].value

        if (!this.hasPrimaryTeamMember) {
          memberToAdd.position = SESSION_TEAM_OPTIONS[0].value
          this.team.unshift(memberToAdd)
        } else {
          this.team.push(memberToAdd)
        }

        this.teamValidation.$touch()
      }

      this.reset()
    },

    removeMember(index) {
      this.team.splice(index, 1)
      this.teamValidation.$touch()
    },

    resetMemberValidation() {
      this.$v.member.$reset()
    },

    reset() {
      this.$v.$reset()
      this.member.profile_id = null
      this.member.profile_name = null
      this.member.name = null
      this.member.user_id = null
      this.member.uuid = null
      this.autocompleteUser = null
      this.autocompleteResults = []
    },
  },
}
</script>

<template>
  <div class="session-team">
    <form-section :title="$t('offerings.sessions.edit:form.section.agent.title')">
      <div class="form-group">
        <Autocomplete
          v-model="autocompleteUser"
          append-icon="search"
          :validation="$v.member.name"
          :label="$t('global:form.name')"
          :items="autocompleteResults"
          :loading="autocompleteLoading"
          :dark="accessibility"
          async
          option-property="name"
          @search="getUsersList($event)"
          @input="selectUser"
        />
        <select-field
          v-model="member.profile_id"
          :label="$tc('global:form.profile', 1)"
          :items="profiles"
          :validation="$v.member.profile_id"
          :dark="accessibility"
          @input="getProfileName"
        />
        <Action
          slot="button"
          class="session-team__button-submit-responsible"
          type="button"
          icon-size="small"
          icon="add"
          :text="$t('offerings.sessions.edit:session.team.submit')"
          :dark="accessibility"
          primary
          @click="addMember"
        />
      </div>
    </form-section>

    <DatatableTeam
      :dark="accessibility"
      :team="team"
      :validation="teamValidation"
      @remove="removeMember"
      @switch="resetMemberValidation"
    />
  </div>
</template>

<style lang="scss">
@import 'SessionTeam.scss';
</style>
