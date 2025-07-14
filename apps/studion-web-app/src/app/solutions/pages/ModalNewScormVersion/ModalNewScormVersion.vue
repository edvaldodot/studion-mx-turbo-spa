<script>
import { mapActions, mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import _ from 'lodash'

import Action from '@/components/general/Action'
import Datatable from '@/components/general/Datatable'
import FileField from '@/components/general/FileField'
import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'

export default {
  components: {
    Action,
    Datatable,
    FileField,
    Modal,
    SelectField,
  },

  data() {
    return {
      modalActive: true,
      topic: null,
      file: null,
      registration_restart_scorm: null,
      actionsType: ['never', 'when_not_complete', 'assign_latest_version'],
    }
  },

  validations: {
    file: { required },
    registration_restart_scorm: { required },
  },

  computed: {
    ...mapGetters(['isFetching']),

    actions() {
      const mappedActions = this.actionsType.map((action) => {
        return {
          text: this.$t(`solutions.create:modal.add.scorm.version:select.action.${action}`),
          value: action,
        }
      })

      return mappedActions
    },
  },

  async created() {
    try {
      this.setFetching(true)
      this.topic = await this.attemptTopicRetrieval(this.$route.params.topicId)
      this.openModal()
    } catch (error) {
      this.setFeedback({ message: this.$t('global:error'), type: 'error' })
      this.closeModal()
    } finally {
      this.setFetching(false)
    }
  },

  methods: {
    ...mapActions([
      'attemptAddNewScormVersion',
      'attemptTopicRetrieval',
      'setFeedback',
      'setFetching',
    ]),

    closeModal() {
      this.$router.push({ name: this.$route.meta.modalCloseLink.name })
    },

    openModal() {
      this.modalActive = true
    },

    lastVersion(versions) {
      return _.last(versions)
    },

    async submitNewVersion() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const data = {
          asset_file: this.file[0],
          associated: {
            associated_id: this.$route.params.topicId,
            associated_name: 'topic',
          },
          assetId: this.topic.data.assets[0].id,
          registration_restart_scorm: this.registration_restart_scorm,
        }

        try {
          this.setFetching(true)
          await this.attemptAddNewScormVersion(data)
          this.setFeedback({ message: this.$t('solutions.create:modal.add.scorm.version:success') })
          this.$emit('saved-scorm-version')
          this.closeModal()
        } catch ({ response }) {
          const errorMessage = response.data.message
          if (errorMessage === 'file_incorrect') {
            return this.setFeedback({
              message: this.$t(`global:error.${errorMessage}`),
              type: 'error',
            })
          }
          this.setFeedback({ message: this.$t('global:error'), type: 'error' })
        } finally {
          this.setFetching(false)
        }
      }
    },
  },
}
</script>

<template>
  <Modal
    class="modal-scorm-version"
    :active="modalActive"
    is-page
  >
    <div class="modal-form mb-10">
      <span class="modal-subtitle">{{ $t('solutions.create.classes:modal.subtitle') }}</span>
      <h2 class="modal-title text-color">{{ $t('solutions.create:modal.add.scorm.version:title') }}</h2>
      <div class="modal-description text-color text-opacity-70">
        <p class="text-color">{{ $t('solutions.create:modal.add.scorm.version:description') }}</p>
      </div>
    </div>
    <form
      class="centered-form mb-10"
      @submit.prevent="submitNewVersion"
    >
      <FileField
        v-model="file"
        dark
        :accept="'.zip'"
        :label="$t('global:form.attach.file')"
        :validation="$v.file"
      />
      <SelectField
        v-model="registration_restart_scorm"
        :label="$t('solutions.create:modal.add.scorm.version:select.action')"
        :items="actions"
        :validation="$v.registration_restart_scorm"
        dark
      />
      <div class="form-submit text-center">
        <Action
          secondary
          large
          fixed-width
          submit
          type="button"
          :text="$t('solutions.create:modal.add.scorm.version:save')"
        />
      </div>
    </form>

    <div
      v-if="topic && topic.data.assets[0].meta.versions"
      class="scorm-version-list scorm-version-list__current"
    >
      <h3 class="datatable-title">
        {{ $t('solutions.create:modal.add.scorm.version:current.version') }}
      </h3>

      <Datatable
        :items="[lastVersion(topic.data.assets[0].meta.versions)]"
        dark
      >
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th
              class="th"
              width="120"
            >
              {{ $t('solutions.create:modal.add.scorm.version:number') }}
            </th>
            <th class="th">{{ $t('solutions.create:modal.add.scorm.version:upload.date') }}</th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="{ item }"
        >
          <tr>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('solutions.create:modal.add.scorm.version:number') }}</span
              >
              <span class="td-text">{{ $t('global:version') + ' ' + (item.version + 1) }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('solutions.create:modal.add.scorm.version:upload.date') }}</span
              >
              <span class="td-text">{{ $d(new Date(item.updated), 'long') }}</span>
            </td>
          </tr>
        </template>
      </Datatable>
    </div>

    <div
      v-if="topic && topic.data.assets[0].meta.versions"
      class="scorm-version-list"
    >
      <h3 class="datatable-title">
        {{ $t('solutions.create:modal.add.scorm.version:old.versions') }}
      </h3>

      <Datatable
        :items="topic.data.assets[0].meta.versions.slice(0, -1)"
        dark
      >
        <template
          v-if="!$media.mobile"
          slot="thead"
        >
          <tr>
            <th
              class="th"
              width="120"
            >
              {{ $t('solutions.create:modal.add.scorm.version:number') }}
            </th>
            <th class="th">{{ $t('solutions.create:modal.add.scorm.version:upload.date') }}</th>
          </tr>
        </template>
        <template
          slot="tbody"
          slot-scope="{ item }"
        >
          <tr>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('solutions.create:modal.add.scorm.version:number') }}</span
              >
              <span class="td-text">{{ $t('global:version') + ' ' + (item.version + 1) }}</span>
            </td>
            <td class="td">
              <span
                v-if="$media.mobile"
                class="td-text-header"
                >{{ $t('solutions.create:modal.add.scorm.version:upload.date') }}</span
              >
              <span class="td-text">{{ $d(new Date(item.updated), 'long') }}</span>
            </td>
          </tr>
        </template>
      </Datatable>
    </div>
  </Modal>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
@import './ModalNewScormVersion.scss';
</style>
