<script>
import { mapState, mapActions } from 'vuex'

import config from '@/config'

import Icon from '../Icon'
import Upload from '../Upload'
import SelectField from '../SelectField'
import Loading from '../Loading'
import Accordion from '../Accordion'
import AccordionItem from '../AccordionItem'
import AnnounceKit from '@/components/shared/AnnounceKit'

const { PORTAL_CONFIGS } = config

export default {
  name: 'TheProfile',

  components: {
    Icon,
    Upload,
    Loading,
    SelectField,
    Accordion,
    AccordionItem,
    AnnounceKit,
  },

  props: {
    classes: {
      type: String,
      default: '',
    },
    bigSize: {
      type: Boolean,
      default: false,
    },
    disableMenu: {
      type: Boolean,
      default: false,
    },
    profileVerticalMenu: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formData: {
        image: null,
      },
      isOpen: false,
      profilesOptions: [],
      profileSelect: null,
      changingImage: false,
      loading: false,
      portalConfigs: PORTAL_CONFIGS,
    }
  },

  computed: {
    ...mapState(['Account', 'Settings', 'accessibilityFontSize']),
    name() {
      return this.Account.user.data && this.Account.user.data.name
        ? this.Account.user.data.name
        : ''
    },
    profileImage() {
      return this.Account.user.profile_image
    },

    isUserInfoReadonly() {
      if (
        this.Settings.allow_change_profile_image ||
        this.Settings.allow_change_profile_image === undefined
      )
        return false

      return true
    },

    canIncreaseFont() {
      return this.accessibilityFontSize < 2
    },

    canDecreaseFont() {
      return this.accessibilityFontSize > 0
    },

    logoutRoute() {
      return {
        name: 'auth.logout',
        params: { isStudent: this.equalsProfile('student') },
      }
    },
    classProfileInVerticalMenu() {
      return {
        'text-7xl mt-3 text-primary': this.profileVerticalMenu && this.bigSize,
        'text-color': !this.profileVerticalMenu && !this.bigSize,
      }
    },
  },

  watch: {
    profileImage() {
      this.formData.image = this.profileImage
    },
  },

  mounted() {
    this.formData.image = this.profileImage
    this.profileSelect = this.Account.user.currentProfileId
    this.profilesOptions = this.Account.user.profiles.map((item) => {
      return {
        value: item.id,
        text: item.alias === 'agent' ? item.name : this.$t(`global:${item.alias}`),
      }
    })
  },

  methods: {
    ...mapActions([
      'attemptSaveUserPhoto',
      'attemptUserAccountRetrieval',
      'setFetching',
      'setAccessibility',
      'setFontsize',
      'attemptValidateExit',
      'setActiveFacialRecognition',
      'setFacialRecognitionNext',
    ]),
    toggleMenu() {
      if (this.disableMenu) return
      this.isOpen = !this.isOpen
    },
    openModal() {
      this.changingImage = true
    },
    closeMenu() {
      if (!this.changingImage) {
        this.isOpen = false
      }
    },
    changeImage(image) {
      this.changingImage = false
      this.loading = true
      this.attemptSaveUserPhoto(image).finally(() => {
        this.loading = false
      })
    },
    changeProfile(profileId) {
      if (this.Account.user.currentProfileId !== profileId) {
        this.$router.push({
          name: 'auth.change.profile',
          params: { profileId },
        })
      }
    },

    increaseFont() {
      this.canIncreaseFont && this.setFontsize(this.accessibilityFontSize + 1)
    },

    decreaseFont() {
      this.canDecreaseFont && this.setFontsize(this.accessibilityFontSize - 1)
    },

    /**
     * Redirects them to the logout page.
     *
     * @return {void}
     */
    logout() {
      this.$router.push(this.logoutRoute)
    },

    /**
     * Handles the logout process.
     *
     * @return {void}
     */
    handleLogout() {
      if (
        !this.$isEnabledFeature('biometrics') ||
        !this.isUserInClassroom ||
        !this.equalsProfile('student')
      ) {
        return this.logout()
      }

      this.validateBiometrics()
    },

    /**
     * Validates biometrics and performs the necessary actions based on the result.
     *
     * @return {void} A Promise that resolves when the validation is complete.
     */
    validateBiometrics() {
      this.setFetching(true)

      this.attemptValidateExit({
        uuid: this.$route.params.session_uuid,
        configType: 'logout',
      })
        .then(({ data: allowExit }) => {
          if (allowExit) return this.logout()
        })
        .catch(() => {
          this.setFacialRecognitionNext(this.logoutRoute)
          return this.setActiveFacialRecognition(true)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <div
    v-click-outside="closeMenu"
    class="profile"
    :class="{ 'is-open': isOpen, 'big-size': bigSize }"
  >
    <a
      class="flex profile-link"
      :class="[classes, { 'is-disabled': disableMenu }]"
      href="#"
      @click.prevent="toggleMenu"
    >
      <img
        v-if="profileImage"
        :src="profileImage"
        :alt="name"
        class="profile-link-image"
      />

      <Icon
        v-else
        name="account_circle"
        class="profile-link-icon text-4xl mx-auto text-white"
        :class="classProfileInVerticalMenu"
        pack="material"
      />
    </a>

    <Transition :name="$media.mobile ? 'slideLeft' : 'fadeInUp'">
      <div
        v-if="isOpen"
        class="profile-content"
      >
        <div class="profile-content-info">
          <div
            class="profile-content-image"
            :class="{ 'is-loading': loading, 'image-disabled': isUserInfoReadonly }"
          >
            <Loading
              v-if="loading"
              dark
            />

            <Upload
              ref="upload"
              v-model="formData.image"
              :disabled="isUserInfoReadonly"
              :cropper="true"
              :height="90"
              :width="90"
              icon="add_a_photo"
              @input="changeImage"
              @open="openModal"
            >
              <Icon
                slot="image"
                class="text-7xl mx-auto mt-2 text-black-600"
                name="account_circle"
                pack="material"
              />

              <template slot="change">
                <div class="uploader-label-change-container">
                  <Icon
                    slot="change"
                    class="uploader-label-change-container-icon text-white"
                    name="add_a_photo"
                    pack="material"
                  />
                </div>
              </template>
            </Upload>
          </div>
          <p
            class="profile-content-name"
            v-html="$t('global:profile.greetings', { name: name })"
          ></p>

          <div
            v-if="profilesOptions.length > 1"
            class="profile-content-select"
          >
            <Icon
              name="account-convert"
              wrapper
            />

            <SelectField
              v-model="profileSelect"
              :label="$t('global:profile.change.profile.label')"
              :items="profilesOptions"
              :allow-clear="false"
              @input="changeProfile($event, $data)"
            />
          </div>
        </div>

        <div class="profile-content-list">
          <RouterLink
            :to="
              portalConfigs && portalConfigs.PROFILE_URL && equalsProfile('student')
                ? { name: 'portal.profile' }
                : '/profile'
            "
            class="profile-content-link"
          >
            <Icon
              name="person"
              wrapper
            />

            <span class="text">{{ $t('global:profile.menu.1') }}</span>
          </RouterLink>

          <div
            v-if="$media.mobile"
            class="profile-accordion-content-link"
          >
            <Accordion design="reset">
              <AccordionItem>
                <template slot="header">
                  <div class="profile-content-link">
                    <Icon
                      name="accessibility"
                      wrapper
                    />

                    <span class="text">{{ 'Acessibilidade' }}</span>
                  </div>
                </template>

                <template slot="content">
                  <div
                    class="accordian-inner"
                    :class="{ disabled: !canIncreaseFont }"
                    @click="increaseFont()"
                  >
                    <Icon
                      name="format_size"
                      size="small"
                    />

                    <span class="text">{{ $t('global:accessibility.increase.font') }}</span>
                  </div>

                  <div
                    class="accordian-inner"
                    :class="{ disabled: !canDecreaseFont }"
                    @click="decreaseFont()"
                  >
                    <Icon
                      name="text_fields"
                      size="small"
                    />

                    <span class="text">{{ $t('global:accessibility.decrease.font') }}</span>
                  </div>
                </template>
              </AccordionItem>
            </Accordion>
          </div>

          <AnnounceKit
            v-if="$media.mobile"
            show-span
            class="profile-content-link announcekit"
          />

          <a
            class="profile-content-link logout"
            href="#"
            @click.prevent="handleLogout"
          >
            <Icon
              name="logout"
              wrapper
            />

            <span class="text">{{ $t('global:profile.menu.4') }}</span>
          </a>
        </div>

        <a
          class="profile-close"
          href="#"
          @click.prevent="toggleMenu"
        >
          <Icon
            name="close"
            wrapper
          />
        </a>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
@import 'Profile.scss';
</style>
