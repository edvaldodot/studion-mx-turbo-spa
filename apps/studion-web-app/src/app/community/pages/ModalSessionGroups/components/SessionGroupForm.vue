<script>
import { required } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'

export default {
  components: {
    Action,
    Autocomplete,
    Card,
    CardBody,
  },
  props: {
    sessionId: {
      type: Number,
      default: null,
    },
    refreshTable: {
      type: Function,
      default: () => {
        return ''
      },
    },
  },
  data() {
    return {
      groupsSelected: null,
      autocompleteLoading: false,
      autocompleteItems: [],
    }
  },
  validations: {
    groupsSelected: {
      required,
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setCurrent',
      'fetchGroups',
      'attemptAddSessionGroup',
    ]),
    fetchSessionGroupsList(value) {
      value = value.trim()
      if (value.length) {
        this.autocompleteLoading = true
        const requestData = {
          query: { name: value },
          limit: 20,
        }
        this.fetchGroups(requestData).then(({ data }) => {
          this.autocompleteLoading = false
          this.autocompleteItems = data ? data.data.map(({ name, id }) => ({ name, id })) : []
        })
      }
    },
    addGroup() {
      this.$v.groupsSelected.$touch()
      if (!this.$v.groupsSelected.$invalid) {
        this.setFetching(true)
        this.attemptAddSessionGroup({
          sessionId: this.sessionId,
          groupId: this.groupsSelected[0].id,
        })
          .then(() => {
            this.groupsSelected = null
            this.$v.groupsSelected.$reset()
            this.setFeedback({ message: this.$t('trails.groups:feedback.add.success') })
            this.refreshTable()
          })
          .catch(({ response }) => {
            const message = response.data.message
            let messageName = 'global.request:timeout.message'
            if (message === 'group_has_no_members') {
              messageName = 'session.groups:feedback.add.error.group.has.no.members'
            }
            if (message === 'group_already_enrolled') {
              messageName = 'session.groups:feedback.add.error.group.already.enrolled'
            }
            this.setFeedback({ message: this.$t(messageName) })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
  },
}
</script>

<template>
  <form @submit.prevent="addGroup">
    <Card rounded>
      <CardBody>
        <Autocomplete
          v-model="groupsSelected"
          dark
          async
          append-icon="search"
          option-property=":name"
          class="mt-1 text-color"
          :floating-label="false"
          :validation="$v.groupsSelected"
          :label="$t('trails.groups:autocomplete.label')"
          :is-custom-property="true"
          :loading="autocompleteLoading"
          :items="autocompleteItems"
          @search="fetchSessionGroupsList($event)"
        />

        <div class="d-flex justify-flex-end">
          <Action
            dark
            flat
            submit
            class="m-0"
            type="button"
            :text="$t('trails.groups:button.add')"
          />
        </div>
      </CardBody>
    </Card>
  </form>
</template>