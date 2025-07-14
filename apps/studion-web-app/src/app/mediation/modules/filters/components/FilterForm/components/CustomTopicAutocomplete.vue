<script>
import cloneDeep from 'lodash/cloneDeep'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import Datatable from '@/components/general/Datatable'
import EmptyMessage from '@/components/general/EmptyMessage'
import FormSection from '@/components/general/FormSection'
import SelectField from '@/components/general/SelectField'
import { mapActions } from 'vuex'

const TOPIC_KEYS = {
  name: null,
  id: null,
  uuid: null
}

export default {
  name: 'CustomTopicAutocomplete',

  components: {
    Action,
    Autocomplete,
    Datatable,
    EmptyMessage,
    FormSection,
    SelectField
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    isEditing: {
      type: Boolean,
      default: false
    },

    validation: {
      type: Object,
      required: true
    },

    value: {
      type: Object,
      default: () => {}
    },

    optionalParams: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      topicQuery: null,
      topic: {},
      autocomplete: {
        items: [],
        loading: false
      }
    }
  },

  methods: {
    ...mapActions(['setFeedback', 'attemptScormTopicsRetrieval']),

    /**
     * This function defines loading state of autocomplete
     * and set items options based on filter action service.
     * @param {string} queryName
     */
    getTopicItems (queryName) {
      if (!queryName || !queryName.length) {
        this.autocomplete.items = []
        return
      }
      this.autocomplete.loading = true

      this.attemptScormTopicsRetrieval(this.optionalParams)
        .then(({ data }) => {
          const topics = (data.meta && data.meta.topics) || []
          this.autocomplete.items = topics
        })
        .finally(() => {
          this.autocomplete.loading = false
        })
    },

    selectTopic (data) {
      if (!data || (this.topic && this.topic.id)) return
      const [topic] = data
      this.topic = cloneDeep(topic)
    },

    addTopic () {
      if (!(this.topic && this.topic.id)) return

      const existTopic = this.value.topic.find(topic => topic.id === this.topic.id)
      if (existTopic) {
        this.setFeedback({
          message: this.$t('mediation.filter:form.topic.feedback:already.exists'),
          type: 'error'
        })
      } else {
        const selectedTopic = cloneDeep(this.topic)
        this.value.topic.push(selectedTopic)
      }

      this.topic = cloneDeep(TOPIC_KEYS)
      this.topicQuery = null
    },

    removeTopic (index) {
      this.value.topic.splice(index, 1)
    }
  }
}
</script>

<template>
  <form-section>
    <form-section
      :title="$t('mediation.filter:form.topic.section.title')"
      dark
    >
      <template v-if="!isEditing">
        <autocomplete
          async
          v-model="topicQuery"
          :validation="validation.topic"
          :label="$t('mediation.filter:form.topic')"
          :items="autocomplete.items"
          :loading="autocomplete.loading"
          option-property="title"
          appendIcon="search"
          @search="getTopicItems"
          @input.capture="selectTopic"
          :disabled="disabled"
          dark
        />

        <action
          type="button"
          :text="$t('mediation.filter:form.topic.add')"
          @click="addTopic"
          :disabled="disabled"
          flat
        />
      </template>
    </form-section>

    <datatable
      v-if="this.value.topic.length"
      :items="this.value.topic"
      :light="true"
      dark
    >
      <template slot="thead" v-if="!$media.mobile && !isEditing">
        <tr>
          <th class="th">
            {{ $t("mediation.filter:form.topic.datatable.header") }}
          </th>
        </tr>
      </template>

      <template slot="tbody" slot-scope="{ item, index }">
        <tr class="tr-colspan tr-colspan-small" v-if="$media.mobile">
          <td class="td" colspan="2">
            <span class="td-text" :style="{ width: 'calc(100% - 45px)' }">
              {{ item.title }}
            </span>
            <action
              v-if="!isEditing"
              type="button"
              class="btn-remove"
              icon="close"
              @click="removeTopic(index)"
            />
          </td>
        </tr>

        <tr v-else>
          <td class="td">
            <span class="td-text bolder">{{ item.title }}</span>
          </td>

          <td class="td" width="40">
            <action
              v-if="!isEditing"
              type="button"
              class="btn-remove"
              icon="close"
              @click="removeTopic(index)"
            />
          </td>
        </tr>
      </template>
    </datatable>

    <empty-message v-else>
      <p v-html="$t('mediation.filter:form.topic.empty.message')"></p>
    </empty-message>
  </form-section>
</template>
