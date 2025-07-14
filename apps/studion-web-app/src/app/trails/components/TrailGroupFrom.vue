<script>
import { required } from 'vuelidate/lib/validators'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import Card from '@/components/general/Card'
import CardBody from '@/components/general/CardBody'
import Tooltip from '@/components/general/Tooltip'

export default {
  components: {
    Action,
    Autocomplete,
    Card,
    CardBody,
    Tooltip,
  },

  props: {
    trailId: {
      type: Number,
      required: true,
    },
    refreshTable: {
      type: Function,
      default: () => {
        return ''
      },
    },
    disabled: {
      type: Boolean,
      default: false,
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

  computed: {
    ...mapState({
      fetching: 'fetching',
      accessibility: 'accessibility',
      trail: (state) => state.Trails.current,
    }),
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'setCurrent', 'fetchGroups', 'addTrailGroup']),
    fetchTrailGroupsList(value) {
      value = value.trim()
      if (value.length) {
        this.autocompleteLoading = true
        const requestData = {
          query: { name: value },
          limit: 1000,
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
        this.addTrailGroup({
          trailId: this.trailId,
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

            if (message === 'group_already_exists_on_path') {
              messageName = 'trails.groups:feedback.add.error.group.already.exists.on.path'
            }

            if (message === 'path_ended') {
              messageName = 'classroom.list.trails:cant.enroll.by.date.group'
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
    <Card
      rounded
      dark
    >
      <CardBody class="bg-black-100">
        <Autocomplete
          v-model="groupsSelected"
          :floating-label="false"
          :disabled="disabled"
          :validation="$v.groupsSelected"
          :label="$t('trails.groups:autocomplete.label')"
          :is-custom-property="true"
          :loading="autocompleteLoading"
          :items="autocompleteItems"
          option-property=":name"
          append-icon="search"
          class="mt-1"
          async
          dark
          @search="fetchTrailGroupsList($event)"
        />

        <Tooltip
          :uppercase="false"
          :width="250"
          :align="'left'"
          medium-font
          shadow
        >
          <template #activator="{ on }">
            <div class="d-flex justify-flex-end">
              <Action
                :text="$t('trails.groups:button.add')"
                :disabled="disabled"
                flat
                submit
                class="m-0"
                type="button"
                @mouseenter.native="on.mouseenter"
                @mouseleave.native="on.mouseleave"
              />
            </div>
          </template>
          <span v-if="disabled">{{ $t('classroom.list.trails:cant.enroll.by.date.group') }}</span>
        </Tooltip>
      </CardBody>
    </Card>
  </form>
</template>
