<script>
import {mapState, mapActions} from 'vuex'
import {required} from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import Modal from '@/components/general/Modal'

import _ from 'lodash'

export default {
  name: 'ModalEnrollUser',
  components: {
    Action,
    Autocomplete,
    Modal
  },
  data () {
    return {
      studentSelect: null,
      autocompleteItemsStudents: [],
      autocompleteLoading: false,
      student: {}
    }
  },
  validations: {
    student: {
      uuid: {
        required
      }
    }
  },
  computed: {
    ...mapState(['Sessions'])
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptEnrollment',
      'attemptSearchStudent'
    ]),
    backToEnrollments () {
      this.$router.push({name: 'community.sessions.enrollments', params: {id: this.$route.params.id}})
    },
    submitStudent () {
      this.$v.student.$touch()
      if (!this.$v.student.$invalid) {
        this.setFetching(true)
        let userUuid = this.student.uuid
        let sessionId = this.Sessions.current.id
        this.attemptEnrollment({userUuid, sessionId}).then(({data}) => {
          this.backToEnrollments()
          this.setFeedback({message: this.$t('community.sessions.add:modal.student.feedback.enroll.success')})
        }).catch(({response}) => {
          this.setFeedback({message: this.$t(`community.sessions.add:modal.student.feedback.enroll.error.${response.data.message.replace(/_/g, '.')}`), type: 'error'})
        }).finally(() => {
          this.setFetching(false)
        })
      }
    },
    getStudentList: _.debounce(function (value) {
      this.autocompleteLoading = true
      this.attemptSearchStudent({filter: value, sessionUuid: this.Sessions.current.uuid}).then(({data}) => {
        this.autocompleteLoading = false
        this.autocompleteItemsStudents = data ? data
          .map(({name, uuid, email}) => ({name: name, uuid: uuid, email: email})) : []
      })
    }, 2500),
    addStudent (student) {
      this.student.uuid = student ? student[0].uuid : null
    }
  },
  created () {
    if (!this.$route.params.id) {
      this.$router.go(-1)
    }
  }
}
</script>
<template>
  <modal :active="true" :cancel="false" is-page>
    <action :text="$t('global:back')" @click="backToEnrollments" class="btn-back text-color" icon="keyboard_backspace"
            icon-size="medium" type="button"></action>
    <div class="modal-form modal-add-student">
      <span class="modal-subtitle">{{ Sessions.current.name }}</span>
      <h2 class="modal-title text-color">{{ $t('community.sessions.add:modal.student.title') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('community.sessions.add:modal.student.description') }}</p>
      </div>
      <form @submit.prevent="submitStudent">
        <autocomplete
          :isCustomProperty=true
          :items="autocompleteItemsStudents"
          :label="$t('global:form.user')"
          :loading="autocompleteLoading"
          :validation="$v.student"
          @input="addStudent"
          @search="getStudentList($event)"
          appendIcon="search"
          async
          dark
          option-property=":name (:email)"
          v-model="studentSelect">
        </autocomplete>
        <div class="form-submit text-center">
          <action :text="$t('community.sessions.add:modal.student.save')" fixed-width large secondary submit
                  type="button"></action>
        </div>
      </form>
    </div>
  </modal>
</template>
