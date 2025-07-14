<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import { genericModalConfirmMixin } from '@/mixins/genericModalConfirmMixin'

import Action from '@/components/general/Action'
import ActionBar from '@/components/general/ActionBar'
import ContentHeader from '@/components/general/ContentHeader'
import Pagination from '@/components/general/Pagination'

import pageMixin from '../../mixins/pageMixin'
import SolutionFormMetadata from './components/SolutionFormMetadata'

const Modal = () => import('@/components/general/Modal')
const ModalConfirm = () => import('@/components/general/ModalConfirm')

export default {
  name: 'SolutionMetadata',

  components: {
    Action,
    ActionBar,
    ContentHeader,
    Modal,
    ModalConfirm,
    Pagination,
    SolutionFormMetadata,
  },
  mixins: [
    formScrollValidationMixin,
    genericModalConfirmMixin,
    pageMixin
  ],

  data() {
    return {
      formData: {},
      metadataList: [],
      modalConfirm: false,
      modalLeave: false,
    }
  },

  validations() {
    const defaultValidation = {
      formData: {},
    }

    this.metadataList.forEach(item => {
      let rule = {}
      rule[item.alias] = {}

      if (item.required) {
        rule[item.alias] = {
          required,
        }
      }

      defaultValidation.formData = Object.assign(rule, defaultValidation.formData)
    })

    return defaultValidation
  },

  computed: {
    ...mapState(['accessibility', 'Courses', 'isSavingBlocked']),

    isEditing() {
      return !!this.$route.params.id
    },
    getBackRoute() {
      return {
        name: 'solutions.update',
        params: {
          id: this.$route.params.id,
        },
      }
    },
  },

  mounted() {
    this.$emit('change-theme-footer', { dark: false })
    this.$emit('fixed-header', true)
  },

  created() {
    const courseId = this.$route.params.id
    if (!courseId) return

    this.setFetching(true)
    this.attemptGetCourseMetadata(courseId)
      .then(({ data }) => this.createMetadataList(data))
      .finally(() => {
        this.setFetching(false)
      })
  },

  destroyed() {
    this.$emit('fixed-header', false)
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'setIsSavingBlocked',
      'attemptGetCourseMetadata',
      'attemptSaveCourseMetadata',
    ]),

    submit(next, toPage = null) {
      if (!this.canWrite('courses')) {
        return this.canReadAction(next)
      }

      this.$v.formData.$touch()
      if (this.$v.formData.$invalid) {
        return
      } else {
        this.setIsSavingBlocked(false)
      }

      this.setFetching(true)
      const body = this.createBodyMetadata()

      this.attemptSaveCourseMetadata({
        courseId: this.$route.params.id,
        data: body,
      })
        .then(() => {
          if (toPage) {
            this.setFeedback({ message: this.$t('solutions.create:feedback.saved') })
            return this.$_goToPage(toPage)
          } else if (this.modalLeave) {
            return this.$router.push({ name: this.$route.meta.backLink })
          }

          this.setIsSavingBlocked(false)

          this.$router.push({
            name: 'solutions.create.tools',
            params: { id: this.$route.params.id },
          })
        })
        .catch(() => {
          this.setIsSavingBlocked(true)
          this.setFeedback({ message: this.$t('solutions.update:feedback.error'), type: 'error' })
        })
        .finally(() => this.setFetching(false))
    },

    canReadAction(next) {
      if (!next) return

      if (this.modalLeave) {
        this.$router.push({ name: this.$route.meta.backLink })
        return
      }

      this.$router.push({ name: 'solutions.create.tools', params: { id: this.$route.params.id } })
    },

    openModalConfirm() {
      if (!this.canWrite('courses')) {
        return this.leave()
      }

      this.modalConfirm = true
    },

    closeModalConfirm() {
      this.modalConfirm = false
    },

    leave() {
      this.modalConfirm = false
      this.$nextTick(() => {
        this.$router.push({ name: this.$route.meta.backLink })
      })
    },

    save() {
      this.modalLeave = true
      this.modalConfirm = false
      this.submit(true)
    },

    /**
     * Create body to send on API request.
     * @returns {Object}
     */
    createBodyMetadata() {
      let body = {
        values: {},
      }

      this.metadataList.map(item => {
        body.values[item.alias] = this.formData[item.alias]
      })

      return body
    },

    /**
     * Setup metadataLista and formData.
     * @param {Object[]} metas
     */
    createMetadataList(metas) {
      this.metadataList = metas.map(item => {
        let value = item.value
        if (typeof value === 'number' && value === 0) {
          value = null
        }

        this.$set(this.formData, item.alias, value)

        if (item.type === 'select' || item.type === 'multiple_select') {
          item.options = item.options.map(option => {
            let propertyName = Object.keys(option.fields)[0]
            return {
              text: option.fields[propertyName],
              value: option.id,
            }
          })
        }

        return item
      })
    },
  },
}
</script>

<template>
  <div class="main-content  solutions-create">
    <content-header
      :title="isEditing ? formData.name : $t('solutions.create:header.title')"
      light-theme
      fixed
    >
      <action
        slot="back"
        type="button"
        class="btn-back text-color"
        icon="keyboard_backspace"
        :text="$t('global:back.solutions')"
        @click="openModalConfirm"
      />

      <action-bar
        slot="actionbar"
        profile
      />

      <template slot="buttons">
        <action
          v-if="notEqualsProfile('student') && canWrite('courses')"
          :dark="accessibility"
          :text="$t('global:form.save')"
          type="button"
          flat
          @click="submit(false)"
        />
      </template>
    </content-header>

    <div class="">
      <div class="center">
        <div class="solutions-create-header">
          <h2 class="solutions-create-title">
            {{ $t('global:form.step', { num: 2 }) }}
          </h2>
          <p class="solutions-create-description">
            {{ $t('solutions.create:metadata:header.description') }}
          </p>
        </div>

        <solution-form-metadata
          :metadata-list="metadataList"
          :meta-form-data="formData"
          :meta-validation="$v.formData"
          :disabled="!canWrite('courses')"
          @submit="submit"
        />

        <Pagination
          v-if="pageCount"
          :active-first-last="false"
          :prev-page="getBackRoute"
          :active-page="2"
          :page-count="pageCount"
          :dark="accessibility"
          :float="$media.mobile"
          custom-routing
          disable-items-per-page
          disable-manual-page
          disable-scroll
          block-layout
          show-all-pages
          @next-page="submit(true)"
          @previous-page="submit(false, getBackRoute)"
          @go-to-page="($e) => submit(true, $e)"
        />
      </div>
    </div>

    <modal :active="modalConfirm" :cancel="false">
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeModalConfirm"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('solutions.create:modal.confirm.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p class="text-color">{{ $t('solutions.create:modal.confirm.message') }}</p>
          </div>
        </div>

        <div class="modal-confirm-footer">
          <action
            v-if="isEditing"
            type="button"
            :dark="accessibility"
            :text="$t('global:save.leave')"
            flat
            @click="save"
          />

          <action
            type="button"
            :dark="accessibility"
            :text="$t('global:leave')"
            flat
            @click="leave"
          />

          <action
            type="button"
            :dark="accessibility"
            :text="$t('global:cancel')"
            flat
            @click="closeModalConfirm"
          />
        </div>
      </div>
    </modal>

    <modal-confirm
      :active="genericConfirmModalData.isActiveModal"
      :title="genericConfirmModalTitle"
      :cancelBtnText="$t('global:not.now')"
      :confirmBtnText="$t('global:yes')"
      @confirm="confirmDataChange"
      @close="cancelDataChange"
    >
      <slot name="description">
        <p v-html="genericConfirmModalDescription"></p>
      </slot>
    </modal-confirm>
  </div>
</template>

<style lang="scss">
@import '~@/app/solutions/styles.scss';
</style>
