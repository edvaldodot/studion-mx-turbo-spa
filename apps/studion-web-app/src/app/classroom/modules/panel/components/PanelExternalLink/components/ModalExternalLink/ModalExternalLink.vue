<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'

import Action from '@/components/general/Action'
import Button from '@/components/general/Button'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import MetadataFields from '../MetadataFields/MetadataFields.vue'
import Modal from '@/components/general/Modal/Modal.vue'
import RadioIconSelector from '@/components/general/RadioIconSelector'

import { required, requiredIf, minLength, maxLength, url } from 'vuelidate/lib/validators'

export default defineComponent({
  name: 'ModalExternalLink',

  components: {
    Action,
    Button,
    Checkbox,
    InputField,
    MetadataFields,
    Modal,
    RadioIconSelector,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.previousRoute = from
    })
  },

  data() {
    return {
      fetching: false,
      data: {
        name: '',
        description: '',
        url: '',
        linked: false,
        icon: null,
        linkContents: [
          {
            name: '',
            type: '',
            value: '',
          },
        ],
      },
      icons: [
        { name: 'open_in_new', value: 'open_in_new' },
        { name: 'quick_reference_all', value: 'quick_reference_all' },
        { name: 'toolbar', value: 'toolbar' },
        { name: 'account_tree', value: 'account_tree' },
        { name: 'star', value: 'star' },
        { name: 'sticky_note_2', value: 'sticky_note_2' },
        { name: 'subtitles', value: 'subtitles' },
        { name: 'summarize', value: 'summarize' },
        { name: 'dataset', value: 'dataset' },
        { name: 'send', value: 'send' },
      ],
      previousRoute: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),

    sessionUuid() {
      return this.$route.params.session_uuid
    },

    externalLinkId() {
      return this.$route.params.id || null
    },

    idTool() {
      return this.Classroom.data.externalLink.id
    },
  },

  watch: {
    'data.linked'(newValue) {
      if (newValue) {
        this.ensureAtLeastOneMetadataField()
      }
    },
  },

  validations() {
    return {
      data: {
        name: { required, minLength: minLength(3), maxLength: maxLength(200) },
        icon: { required },
        url: { required, url },
        linkContents: {
          $each: {
            name: {
              required: requiredIf(function () {
                return this.data.linked
              }),
              minLength: minLength(3),
            },
            type: {
              required: requiredIf(function () {
                return this.data.linked
              }),
            },
            value: {
              required: requiredIf(function () {
                return this.data.linked
              }),
            },
          },
        },
      },
    }
  },

  beforeDestroy() {
    this.metadataRefs = []
  },

  created() {
    if (this.externalLinkId) {
      this.fetchExternalLink()
    }
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptCreateExternalLink',
      'attemptEditExternalLink',
      'attemptGetExternalLink',
    ]),

    close() {
      if (this.previousRoute && this.previousRoute.name === 'classroom.panel.external.link') {
        this.$router.push(this.previousRoute.fullPath)
      } else {
        this.$router.push({ name: 'classroom.panel.dashboard' })
      }
    },

    testLink() {
      if (!this.$v.data.url.$invalid) {
        window.open(this.data.url, '_blank')
      }
    },

    addMetadataFields() {
      this.data.linkContents.push({
        name: '',
        type: '',
        value: '',
      })
    },

    ensureAtLeastOneMetadataField() {
      if (this.data.linked && this.data.linkContents.length === 0) {
        this.addMetadataFields()
      }
    },

    updateMetadataField(index, newValue) {
      this.data.linkContents[index] = { ...newValue }
    },

    removeMetadataFields(index) {
      this.data.linkContents.splice(index, 1)
    },

    async fetchExternalLink() {
      this.setFetching(true)
      try {
        const response = await this.attemptGetExternalLink({
          idTool: this.idTool,
          externalLinkId: this.externalLinkId,
        })

        const link = response

        this.data = {
          name: link.name || '',
          description: link.description || '',
          url: link.url || '',
          linked: link.linkContents && link.linkContents.length > 0,
          icon: link.icon || null,
          linkContents: (link.linkContents || []).map((field, index) => ({
            id: index + 1,
            name: field.name || '',
            type: field.type || '',
            value: field.value || field.meta.id,
          })),
        }
      } catch (error) {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      } finally {
        this.setFetching(false)
      }
    },

    async save() {
      this.$v.$touch()

      if (this.$v.$invalid) return

      if (this.data.url && !this.data.url.endsWith('/')) {
        this.data.url += '/'
      }

      const metadata = this.data.linkContents.map((item) => item)
      const payload = { ...this.data, linkContents: metadata }

      if (!this.data.linked) {
        delete payload.linkContents
      }

      payload.externalLink = { id: this.Classroom.data.externalLink.id }

      if (this.externalLinkId) {
        await this.updateExternalLink(payload)
      } else {
        await this.createExternalLink(payload)
      }

      this.close()
    },

    async createExternalLink(payload) {
      this.setFetching(true)
      try {
        await this.attemptCreateExternalLink({
          sessionUuid: this.sessionUuid,
          payload,
        })
        this.$emit('created', payload)
        this.setFeedback({
          message: this.$t('tool.external.link.success'),
        })
      } catch {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      } finally {
        this.setFetching(false)
      }
    },

    async updateExternalLink(payload) {
      try {
        payload.id = this.externalLinkId
        await this.attemptEditExternalLink(payload)

        this.$emit('updated', payload)
        this.setFeedback({
          message: this.$t('tool.external.link.updated.success'),
        })
      } catch {
        this.setFeedback({
          message: this.$t('global:error'),
        })
      }
    },
  },
})
</script>

<template>
  <div>
    <Modal
      class="modal-external-link"
      active
      is-page
      @close="close"
    >
      <form class="form wrapper-modal-external-link">
        <div class="first-session">
          <span class="span-text-external-link">{{ $t('tool.external.link') }}</span>
          <div class="header-modal-external-link">
            <h1>{{ $t('tool.external.link.create') }}</h1>
            <Action
              class="btn-salve-external-link"
              :text="$t('global:save')"
              type="button"
              secondary
              submit
              @click.prevent="save"
            />
          </div>
          <p>{{ $t('tool.external.link.title') }}</p>

          <span class="span-text-external-link pt-5 pb-3">
            {{ $t('tool.external.link.title.2') }}
          </span>

          <div class="display-flex-external-link">
            <InputField
              v-model="data.name"
              class="input-meta-data-fields"
              :label="$t('global:form.title')"
              :placeholder="$t('tool.external.link.type.placeholder.input.2')"
              :counter="40"
              :validation="$v.data.name"
              required
              dark
            />
            <InputField
              v-model="data.description"
              class="input-meta-data-fields"
              :label="$t('global:solution.description')"
              :placeholder="$t('tool.external.link.type.placeholder.input.3')"
              :counter="40"
              dark
            />
          </div>

          <RadioIconSelector
            v-model="data.icon"
            class="pt-2"
            :icons="icons"
            :validation="$v.data.icon"
            :label="$t('tool.external.link.icon')"
            required
          />

          <div class="display-flex-baseline-external-link pt-4">
            <InputField
              v-model="data.url"
              class="input-link-meta-data-fields"
              :label="$t('global:url')"
              :placeholder="$t('tool.external.link.type.placeholder.input.4')"
              :validation="$v.data.url"
              required
              dark
            />
            <Button
              class="pt-6"
              :inner-prepend-icon="'open_in_new'"
              :disabled="!data.url || $v.data.url.$invalid || data.linked"
              variant="text"
              @click.prevent="testLink"
            >
              {{ $t('tool.external.link.test') }}
            </Button>
          </div>
        </div>

        <div class="last-session">
          <span class="span-text-external-link">{{ $t('tool.external.link.variables') }}</span>
          <div class="display-flex-no-gap-external-link pt-3">
            <Checkbox
              v-model="data.linked"
              :items="[{ value: true }]"
              switch-type
              dark
            />
            <p>{{ $t('tool.external.link.title.3') }}</p>
          </div>
          <p class="font-italic black-500">
            {{ $t('tool.external.link.title.4') }}
          </p>

          <div v-if="data.linked">
            <div
              v-for="(metadataFields, index) in data.linkContents"
              :key="metadataFields.id"
              class="display-flex-external-link pt-3"
            >
              <MetadataFields
                :data="metadataFields"
                :validation="$v.data.linkContents.$each[index]"
                :can-delete="data.linkContents.length > 1"
                @update:data="(newValue) => updateMetadataField(index, newValue)"
                @remove="removeMetadataFields(index)"
              />
            </div>

            <Button
              class="btn-add-variable-external-link"
              :inner-prepend-icon="'add'"
              variant="text"
              type="button"
              @click="addMetadataFields"
            >
              {{ $t('tool.external.link.add.new.variables') }}
            </Button>
          </div>

          <div class="pt-3">
            <Action
              v-if="data.linked"
              class="btn-salve-external-link"
              :text="$t('global:save')"
              type="button"
              secondary
              submit
              @click.prevent="save"
            />
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style lang="scss">
@import 'ModalExternalLink.scss';
</style>
